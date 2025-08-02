import fs from 'fs'
import path from 'path'

export interface TestResultsData {
  testTitle: string
  sections: Array<{
    sectionName: string
    sectionType: string
    isScoreSection?: boolean
    isTagSection?: boolean
    score?: number
    total?: number
    percentage?: number
    tags?: Array<{
      name: string
      count: number
    }>
  }>
  generatedDate: string
}

export class TemplateManager {
  private static templatesPath = path.join(process.cwd(), 'templates')

  /**
   * Get available template versions
   */
  static getAvailableVersions(): number[] {
    try {
      if (!fs.existsSync(this.templatesPath)) {
        return [0] // Default version
      }

      const files = fs.readdirSync(this.templatesPath)
      const versions = files
        .filter(file => file.startsWith('version-') && file.endsWith('.html'))
        .map(file => {
          const match = file.match(/version-(\d+)\.html/)
          return match ? parseInt(match[1]) : null
        })
        .filter(version => version !== null)
        .sort((a, b) => a! - b!)

      return versions.length > 0 ? versions as number[] : [0]
    } catch (error) {
      console.error('Error reading template versions:', error)
      return [0]
    }
  }

  /**
   * Get the latest template version
   */
  static getLatestVersion(): number {
    const versions = this.getAvailableVersions()
    return Math.max(...versions)
  }

  /**
   * Load template content by version
   */
  static async loadTemplate(version: number): Promise<string> {
    const templatePath = path.join(this.templatesPath, `version-${version}.html`)
    
    try {
      if (fs.existsSync(templatePath)) {
        return fs.readFileSync(templatePath, 'utf-8')
      } else {
        // Return default template if specific version doesn't exist
        return this.getDefaultTemplate(version)
      }
    } catch (error) {
      console.error(`Error loading template version ${version}:`, error)
      return this.getDefaultTemplate(version)
    }
  }

  /**
   * Render template with data
   */
  static async renderTemplate(version: number, data: TestResultsData): Promise<string> {
    const template = await this.loadTemplate(version)
    return this.processTemplate(template, data)
  }

  /**
   * Process template with data substitution
   */
  private static processTemplate(template: string, data: TestResultsData): string {
    let html = template

    // Replace basic variables
    html = html.replace(/\{\{testTitle\}\}/g, this.escapeHtml(data.testTitle))
    html = html.replace(/\{\{generatedDate\}\}/g, this.escapeHtml(data.generatedDate))

    // Generate sections HTML
    let sectionsHtml = ''
    data.sections.forEach((section, index) => {
      if (section.isScoreSection) {
        sectionsHtml += this.renderScoreSection(section, index)
      } else if (section.isTagSection) {
        sectionsHtml += this.renderTagSection(section, index)
      }
    })

    html = html.replace(/\{\{sections\}\}/g, sectionsHtml)
    html = html.replace(/\{\{\{sectionsJson\}\}\}/g, JSON.stringify(data.sections))

    return html
  }

  /**
   * Render score-based section
   */
  private static renderScoreSection(section: any, index: number): string {
    return `
      <div class="test-section">
        <div class="section-header">
          <div class="section-title">${this.escapeHtml(section.sectionName)}</div>
          <div class="section-type">${this.escapeHtml(section.sectionType)}</div>
        </div>
        <div class="section-content">
          <div class="score-section">
            <div class="score-info">
              <div class="score-display">${section.score}/${section.total}</div>
              <div class="score-details">${section.percentage}% Correct</div>
              <div class="percentage-bar">
                <div class="percentage-fill" style="width: ${section.percentage}%"></div>
              </div>
            </div>
            <div class="chart-container">
              <canvas id="chart-${index}" width="300" height="300"></canvas>
            </div>
          </div>
        </div>
      </div>
    `
  }

  /**
   * Render tag-based section
   */
  private static renderTagSection(section: any, index: number): string {
    const tagsHtml = section.tags?.map((tag: any) => `
      <div class="tag-item">
        <span class="tag-name">${this.escapeHtml(tag.name)}</span>
        <span class="tag-count">${tag.count}</span>
      </div>
    `).join('') || ''
    
    return `
      <div class="test-section">
        <div class="section-header">
          <div class="section-title">${this.escapeHtml(section.sectionName)}</div>
          <div class="section-type">${this.escapeHtml(section.sectionType)}</div>
        </div>
        <div class="section-content">
          <div class="tags-section">
            <div class="tags-list">
              <h3 style="margin-top: 0; color: #374151;">Tag Distribution</h3>
              ${tagsHtml}
            </div>
            <div class="pie-chart-container">
              <canvas id="pie-${index}" width="300" height="300"></canvas>
            </div>
          </div>
        </div>
      </div>
    `
  }

  /**
   * Create a new template version
   */
  static async createNewTemplate(content: string): Promise<number> {
    const latestVersion = this.getLatestVersion()
    const newVersion = latestVersion + 1
    const templatePath = path.join(this.templatesPath, `version-${newVersion}.html`)

    try {
      // Ensure templates directory exists
      if (!fs.existsSync(this.templatesPath)) {
        fs.mkdirSync(this.templatesPath, { recursive: true })
      }

      fs.writeFileSync(templatePath, content, 'utf-8')
      return newVersion
    } catch (error) {
      console.error('Error creating new template:', error)
      throw new Error('Failed to create new template')
    }
  }

  /**
   * Get default template if specific version doesn't exist
   */
  private static getDefaultTemplate(version: number): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{testTitle}} - Test Results</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 2rem; }
        .content { padding: 30px; }
        .test-section { margin-bottom: 30px; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
        .section-header { background: #f8f9fa; padding: 15px; border-bottom: 1px solid #e0e0e0; }
        .section-title { font-size: 1.25rem; font-weight: bold; margin: 0; }
        .section-type { color: #666; font-size: 0.9rem; }
        .section-content { padding: 20px; }
        .footer { background: #f8f9fa; padding: 15px; text-align: center; color: #666; border-top: 1px solid #e0e0e0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{testTitle}}</h1>
            <p>Test Results Report</p>
        </div>
        <div class="content">
            {{sections}}
        </div>
        <div class="footer">
            <p>Generated on {{generatedDate}} | Template Version ${version}</p>
        </div>
    </div>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const sections = {{{sectionsJson}}};
            // Basic chart initialization would go here
        });
    </script>
</body>
</html>
    `
  }

  /**
   * Escape HTML to prevent XSS
   */
  private static escapeHtml(text: string): string {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }
}

// Types are already exported above as part of the interface declaration
