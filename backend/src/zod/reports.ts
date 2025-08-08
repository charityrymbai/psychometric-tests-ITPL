import { z } from 'zod';

// Define the schema for TagResult
export const TagResultSchema = z.object({
  tagName: z.string(),
  tagCount: z.number(),
  color: z.string(),
});

// Define the schema for SectionResult
export const SectionResultSchema = z.object({
  sectionId: z.string(),
  sectionName: z.string(),
  sectionType: z.enum(['score', 'tags']),
  score: z.number().optional(),
  totalQuestions: z.number().optional(),
  percentage: z.number().optional(),
  tags: z.array(TagResultSchema).optional(),
});

// Define the schema for TestResult
export const TestResultSchema = z.object({
  testId: z.string(),
  testTitle: z.string(),
  groupId: z.string(),
  groupName: z.string(),
  sections: z.array(SectionResultSchema),
  totalScore: z.number(),
  totalQuestions: z.number(),
  timeSpent: z.number(),
  completedAt: z.string(),
  templateVersion: z.number(),
  isSingleOptionCorrect: z.boolean().optional(),
});

// Define the schema for CreateReportRequest
export const CreateReportSchema = z.object({
  data: TestResultSchema,
  version: z.number(),
  user_id: z.number(),
});

// Export types
export type TagResult = z.infer<typeof TagResultSchema>;
export type SectionResult = z.infer<typeof SectionResultSchema>;
export type TestResult = z.infer<typeof TestResultSchema>;
export type CreateReportRequest = z.infer<typeof CreateReportSchema>;
