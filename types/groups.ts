// Group management types
import { BaseEntity } from './common';
import { Section } from './assessment';

export interface GroupFormData {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface GroupWithSections extends BaseEntity {
  name: string;
  description?: string;
  sections: Section[];
  isActive: boolean;
  sectionCount: number;
  questionCount: number;
}

export interface GroupFilters {
  isActive?: boolean;
  hasSection?: boolean;
  search?: string;
}

export interface GroupStats {
  totalGroups: number;
  activeGroups: number;
  totalSections: number;
  totalQuestions: number;
}
