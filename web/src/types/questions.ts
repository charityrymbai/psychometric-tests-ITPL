// Question and option related types
import { BaseEntity } from './common';

export interface QuestionOption {
  text: string;
  tag_id: number | null;
  isCorrect?: boolean; // For score-based questions
}

export interface Question extends BaseEntity {
  text: string;
  sectionId: string;
  options: QuestionOption[];
  correct_option?: number | null; // Index of correct option for score-based
  type: 'single_choice' | 'multiple_choice' | 'tag_based';
  timeLimit?: number; // in seconds
  explanation?: string;
  order?: number;
}

export interface QuestionResponse {
  questionId: string;
  selectedOptionIndex: number;
  selectedOptionIndices?: number[]; // For multiple choice
  timeSpent: number;
  timestamp: string;
}

// Form types for question management
export interface QuestionFormData {
  text: string;
  options: QuestionOption[];
  correct_option: number | null;
  type: Question['type'];
  explanation?: string;
}

export interface QuestionFilters {
  sectionId?: string;
  type?: Question['type'];
  hasCorrectAnswer?: boolean;
}

export interface QuestionStats {
  totalQuestions: number;
  answeredCorrectly: number;
  averageTimeSpent: number;
  difficultyLevel?: 'easy' | 'medium' | 'hard';
}
