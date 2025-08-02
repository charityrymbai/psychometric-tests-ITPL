import fs from 'fs/promises';
import path from 'path';
import { TestResult, SectionResult, TagResult } from '../zod/reports.js';
import type { TemplateData, ProcessedSection, ProcessedTag } from '../types/templates.js';

// Re-export for backward compatibility
export type { TemplateData, ProcessedSection, ProcessedTag };

export class TemplateRenderer {
  private static getTemplatesPath(): string {
    return path.join(process.cwd(), 'templates');
  }

  private static async getAvailableVersions(): Promise<number[]> {
    try {
      const templatesPath = this.getTemplatesPath();
      const files = await fs.readdir(templatesPath);
      const versions = files
        .filter(file => file.startsWith('version-') && file.endsWith('.html'))
        .map(file => {
          const match = file.match(/version-(\d+)\.html/);
          return match ? parseInt(match[1], 10) : null;
        })
        .filter(version => version !== null)
        .sort((a, b) => a! - b!);
      
      return versions as number[];
    } catch (error) {
      console.error('Error reading templates directory:', error);
      return [0]; // Default to version 0
    }
  }

  private static async loadTemplate(version: number): Promise<string> {
    try {
      const templatesPath = this.getTemplatesPath();
      const templatePath = path.join(templatesPath, `version-${version}.html`);
      
      try {
        const template = await fs.readFile(templatePath, 'utf-8');
        return template;
      } catch (error) {
        // If specific version not found, try to use version 0 as fallback
        if (version !== 0) {
          console.warn(`Template version ${version} not found, falling back to version 0`);
          const fallbackPath = path.join(templatesPath, 'version-0.html');
          const template = await fs.readFile(fallbackPath, 'utf-8');
          return template;
        }
        throw error;
      }
    } catch (error) {
      console.error(`Error loading template version ${version}:`, error);
      throw new Error(`Template version ${version} not found`);
    }
  }

  private static formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  private static formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private static getScoreClass(percentage: number): string {
    if (percentage >= 80) return 'score-excellent';
    if (percentage >= 60) return 'score-good';
    return 'score-needs-improvement';
  }

  private static getProgressClass(percentage: number): string {
    if (percentage >= 80) return 'progress-excellent';
    if (percentage >= 60) return 'progress-good';
    return 'progress-needs-improvement';
  }

  private static getBadgeInfo(percentage: number): { class: string; label: string } {
    if (percentage >= 80) return { class: 'badge-excellent', label: 'Excellent' };
    if (percentage >= 60) return { class: 'badge-good', label: 'Good' };
    return { class: 'badge-needs-improvement', label: 'Needs Improvement' };
  }

  private static processData(testResult: TestResult): TemplateData {
    const overallPercentage = Math.round((testResult.totalScore / testResult.totalQuestions) * 100);
    
    const processedSections: ProcessedSection[] = testResult.sections.map((section: SectionResult) => {
      const isScoreSection = section.sectionType === 'score';
      const isTagSection = section.sectionType === 'tags';
      
      let processedSection: ProcessedSection = {
        sectionName: section.sectionName,
        sectionType: section.sectionType,
        sectionTypeDisplay: isScoreSection ? 'Score-based Assessment' : 'Tag-based Assessment',
        isScoreSection,
        isTagSection,
      };

      if (isScoreSection && section.score !== undefined && section.totalQuestions !== undefined && section.percentage !== undefined) {
        const badgeInfo = this.getBadgeInfo(section.percentage);
        processedSection = {
          ...processedSection,
          score: section.score,
          totalQuestions: section.totalQuestions,
          percentage: section.percentage,
          incorrect: section.totalQuestions - section.score,
          scoreClass: this.getScoreClass(section.percentage),
          progressClass: this.getProgressClass(section.percentage),
          badgeClass: badgeInfo.class,
          badgeLabel: badgeInfo.label,
        };
      }

      if (isTagSection && section.tags) {
        processedSection.tags = section.tags.map((tag: TagResult) => ({
          tagName: tag.tagName,
          tagCount: tag.tagCount,
          color: tag.color,
        }));
      }

      return processedSection;
    });

    return {
      testTitle: testResult.testTitle,
      groupName: testResult.groupName,
      overallPercentage,
      totalScore: testResult.totalScore,
      totalQuestions: testResult.totalQuestions,
      timeSpent: this.formatTime(testResult.timeSpent),
      sectionsCount: testResult.sections.length,
      completedAt: this.formatDate(testResult.completedAt),
      templateVersion: testResult.templateVersion,
      generatedDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      sections: processedSections,
    };
  }

  private static simpleTemplateReplace(template: string, data: TemplateData): string {
    let result = template;

    // Replace simple variables
    result = result.replace(/\{\{testTitle\}\}/g, data.testTitle);
    result = result.replace(/\{\{groupName\}\}/g, data.groupName);
    result = result.replace(/\{\{overallPercentage\}\}/g, data.overallPercentage.toString());
    result = result.replace(/\{\{totalScore\}\}/g, data.totalScore.toString());
    result = result.replace(/\{\{totalQuestions\}\}/g, data.totalQuestions.toString());
    result = result.replace(/\{\{timeSpent\}\}/g, data.timeSpent);
    result = result.replace(/\{\{sectionsCount\}\}/g, data.sectionsCount.toString());
    result = result.replace(/\{\{completedAt\}\}/g, data.completedAt);
    result = result.replace(/\{\{templateVersion\}\}/g, data.templateVersion.toString());
    result = result.replace(/\{\{generatedDate\}\}/g, data.generatedDate);

    // Handle sections loop
    const sectionRegex = /\{\{#sections\}\}([\s\S]*?)\{\{\/sections\}\}/g;
    result = result.replace(sectionRegex, (match, sectionTemplate) => {
      return data.sections.map(section => {
        let sectionHtml = sectionTemplate;

        // Replace section variables
        sectionHtml = sectionHtml.replace(/\{\{sectionName\}\}/g, section.sectionName);
        sectionHtml = sectionHtml.replace(/\{\{sectionTypeDisplay\}\}/g, section.sectionTypeDisplay);

        // Handle conditional sections
        const scoreConditionRegex = /\{\{#isScoreSection\}\}([\s\S]*?)\{\{\/isScoreSection\}\}/g;
        const tagConditionRegex = /\{\{#isTagSection\}\}([\s\S]*?)\{\{\/isTagSection\}\}/g;

        if (section.isScoreSection) {
          sectionHtml = sectionHtml.replace(scoreConditionRegex, (_: string, content: string) => {
            let scoreContent = content;
            scoreContent = scoreContent.replace(/\{\{score\}\}/g, section.score?.toString() || '0');
            scoreContent = scoreContent.replace(/\{\{totalQuestions\}\}/g, section.totalQuestions?.toString() || '0');
            scoreContent = scoreContent.replace(/\{\{percentage\}\}/g, section.percentage?.toString() || '0');
            scoreContent = scoreContent.replace(/\{\{incorrect\}\}/g, section.incorrect?.toString() || '0');
            scoreContent = scoreContent.replace(/\{\{scoreClass\}\}/g, section.scoreClass || '');
            scoreContent = scoreContent.replace(/\{\{progressClass\}\}/g, section.progressClass || '');
            scoreContent = scoreContent.replace(/\{\{badgeClass\}\}/g, section.badgeClass || '');
            scoreContent = scoreContent.replace(/\{\{badgeLabel\}\}/g, section.badgeLabel || '');
            return scoreContent;
          });
          sectionHtml = sectionHtml.replace(tagConditionRegex, '');
        } else {
          sectionHtml = sectionHtml.replace(scoreConditionRegex, '');
          sectionHtml = sectionHtml.replace(tagConditionRegex, (_: string, content: string) => {
            const tagLoopRegex = /\{\{#tags\}\}([\s\S]*?)\{\{\/tags\}\}/g;
            return content.replace(tagLoopRegex, (__: string, tagTemplate: string) => {
              return (section.tags || []).map(tag => {
                let tagHtml = tagTemplate;
                tagHtml = tagHtml.replace(/\{\{tagName\}\}/g, tag.tagName);
                tagHtml = tagHtml.replace(/\{\{tagCount\}\}/g, tag.tagCount.toString());
                tagHtml = tagHtml.replace(/\{\{color\}\}/g, tag.color);
                return tagHtml;
              }).join('');
            });
          });
        }

        return sectionHtml;
      }).join('');
    });

    return result;
  }

  public static async renderTemplate(version: number, testResult: TestResult): Promise<string> {
    try {
      const template = await this.loadTemplate(version);
      const processedData = this.processData(testResult);
      const renderedHtml = this.simpleTemplateReplace(template, processedData);
      
      return renderedHtml;
    } catch (error) {
      console.error('Error rendering template:', error);
      throw new Error(`Failed to render template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public static async getLatestVersion(): Promise<number> {
    const versions = await this.getAvailableVersions();
    return versions.length > 0 ? Math.max(...versions) : 0;
  }

  public static async getAllVersions(): Promise<number[]> {
    return await this.getAvailableVersions();
  }
}
