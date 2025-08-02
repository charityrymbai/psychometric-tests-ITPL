// Report and results related types

export interface TagResult {
  tagName: string;
  tagCount: number;
  color: string;
}

export interface SectionResult {
  sectionId: string;
  sectionName: string;
  sectionType: 'score' | 'tags';
  score?: number;
  totalQuestions?: number;
  percentage?: number;
  tags?: TagResult[];
}

export interface TestResult {
  testId: string;
  testTitle: string;
  groupId: string;
  groupName: string;
  sections: SectionResult[];
  totalScore: number;
  totalQuestions: number;
  timeSpent: number;
  completedAt: string;
  templateVersion: number;
  isSingleOptionCorrect?: boolean;
}

export interface CreateReportRequest {
  data: TestResult;
  version: number;
}

export interface ReportSummary {
  reportId: string;
  testTitle: string;
  groupName: string;
  completedAt: string;
  totalScore: number;
  percentage: number;
  status: 'completed' | 'partial' | 'failed';
}

export interface DetailedReport extends TestResult {
  reportId: string;
  createdAt: string;
  analysis?: ReportAnalysis;
}

export interface ReportAnalysis {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  comparisons?: {
    averageScore: number;
    percentile: number;
  };
}

export interface ReportFilters {
  dateFrom?: string;
  dateTo?: string;
  groupId?: string;
  minScore?: number;
  maxScore?: number;
  status?: ReportSummary['status'];
}
