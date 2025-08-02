// Assessment and test related types
import { BaseEntity } from './common';
import { Question } from './questions';

export interface Tag {
  id: number;
  label: string;
  description: string;
  color?: string;
}

export interface SectionTag extends Tag {
  // Additional section-specific tag properties if needed
}

export interface Section extends BaseEntity {
  name: string;
  description?: string;
  questions?: Question[] | number; // Can be array of questions or count
  isSingleOptionCorrect?: boolean;
  groupId?: string;
  tags?: SectionTag[];
  sectionType?: 'score' | 'tags';
}

export interface Group extends BaseEntity {
  name: string;
  description?: string;
  sections: Section[];
  isActive?: boolean;
}

export interface Assessment extends BaseEntity {
  title: string;
  description?: string;
  groups: Group[];
  timeLimit?: number; // in minutes
  isActive?: boolean;
  settings?: AssessmentSettings;
}

export interface AssessmentSettings {
  randomizeQuestions?: boolean;
  randomizeOptions?: boolean;
  showResults?: boolean;
  allowRetake?: boolean;
  passingScore?: number;
}

// User assessment session types
export interface AssessmentSession extends BaseEntity {
  assessmentId: string;
  userId?: string;
  startedAt: string;
  completedAt?: string;
  currentSectionId?: string;
  currentQuestionIndex?: number;
  timeSpent: number; // in seconds
  answers: SessionAnswer[];
  status: 'started' | 'in_progress' | 'completed' | 'abandoned';
}

export interface SessionAnswer {
  questionId: string;
  sectionId: string;
  selectedOptionIndex: number;
  timeSpent: number; // time spent on this question in seconds
  answeredAt: string;
}
