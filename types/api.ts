// API related types and endpoints
import { ApiResponse, PaginatedResponse } from './common';
import { Group } from './assessment';
import { Question } from './questions';
import { TestResult, ReportSummary } from './reports';

// API endpoint types
export interface ApiEndpoints {
  // Groups
  getGroups: () => Promise<ApiResponse<Group[]>>;
  getGroup: (id: string) => Promise<ApiResponse<Group>>;
  createGroup: (data: any) => Promise<ApiResponse<Group>>;
  updateGroup: (id: string, data: any) => Promise<ApiResponse<Group>>;
  deleteGroup: (id: string) => Promise<ApiResponse<void>>;

  // Sections
  getSections: (groupId: string) => Promise<ApiResponse<any[]>>;
  createSection: (data: any) => Promise<ApiResponse<any>>;
  updateSection: (id: string, data: any) => Promise<ApiResponse<any>>;
  deleteSection: (id: string) => Promise<ApiResponse<void>>;

  // Questions
  getQuestions: (sectionId: string) => Promise<ApiResponse<Question[]>>;
  createQuestion: (data: any) => Promise<ApiResponse<Question>>;
  updateQuestion: (id: string, data: any) => Promise<ApiResponse<Question>>;
  deleteQuestion: (id: string) => Promise<ApiResponse<void>>;

  // Reports
  getReports: () => Promise<PaginatedResponse<ReportSummary>>;
  getReport: (id: string) => Promise<ApiResponse<TestResult>>;
  createReport: (data: any) => Promise<ApiResponse<any>>;
  deleteReport: (id: string) => Promise<ApiResponse<void>>;

  // Templates
  generateReport: (data: TestResult) => Promise<ApiResponse<string>>;
  getTemplates: () => Promise<ApiResponse<string[]>>;
}

// HTTP request/response types
export interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
}

export interface ErrorResponse {
  error: string;
  message?: string;
  statusCode: number;
  timestamp: string;
  path: string;
}

// API client configuration
export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}

// Webhook types
export interface WebhookPayload {
  event: string;
  data: any;
  timestamp: string;
  signature?: string;
}

export interface WebhookHandler {
  event: string;
  handler: (payload: WebhookPayload) => Promise<void>;
}
