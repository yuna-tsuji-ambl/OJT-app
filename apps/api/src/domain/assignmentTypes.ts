import type { QuestStatus } from './types.js';

export interface Assignment {
  id: string;
  traineeId: string;
  createdBy: string;
  majorItem: string;
  title: string;
  description: string;
  achievementLevel: string;
  dueDate?: string;
  status: QuestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssignmentInput {
  traineeId: string;
  majorItem: string;
  title: string;
  description: string;
  achievementLevel: string;
  dueDate?: string;
}

export interface UpdateAssignmentInput {
  majorItem?: string;
  title?: string;
  description?: string;
  achievementLevel?: string;
  dueDate?: string;
}
