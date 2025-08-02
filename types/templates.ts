// Template and rendering related types
import { SectionResult, TestResult } from './reports';

export interface TestSection {
  id: string;
  name: string;
  sectionType: string;
  questions: any[];
  tags?: any[];
}

export interface TestResultsData {
  testId: string;
  testTitle: string;
  groupName: string;
  sections: TestSection[];
  completedAt: string;
  totalScore: number;
  totalQuestions: number;
  timeSpent: number;
}

export interface TemplateData {
  testTitle: string;
  groupName: string;
  overallPercentage: number;
  totalScore: number;
  totalQuestions: number;
  timeSpent: string;
  sectionsCount: number;
  completedAt: string;
  templateVersion: number;
  generatedDate: string;
  sections: ProcessedSection[];
}

export interface ProcessedSection {
  sectionName: string;
  sectionType: 'score' | 'tags';
  sectionTypeDisplay: string;
  isScoreSection: boolean;
  isTagSection: boolean;
  score?: number;
  totalQuestions?: number;
  percentage?: number;
  incorrect?: number;
  scoreClass?: string;
  progressClass?: string;
  badgeClass?: string;
  badgeLabel?: string;
  tags?: ProcessedTag[];
}

export interface ProcessedTag {
  tagName: string;
  tagCount: number;
  color: string;
  percentage?: number;
}

export interface TemplateOptions {
  version?: number;
  includeAnalysis?: boolean;
  includeRecommendations?: boolean;
  customStyles?: string;
  logoUrl?: string;
}

export interface TemplateRenderer {
  render(data: TemplateData, options?: TemplateOptions): string;
  getAvailableTemplates(): string[];
  validateData(data: any): boolean;
}
