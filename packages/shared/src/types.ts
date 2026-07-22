export type QuestStatus = '未クリア' | '申請中' | 'クリア';

export interface CreateQuestInput {
  majorItem: string;
  minorItem: string;
  achievementLevel: string;
}

export interface Quest {
  id: string;
  majorItem: string;
  minorItem: string;
  achievementLevel: string;
  status?: QuestStatus;
}

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

export type UserRole = 'trainee' | 'trainer';

export interface UserContext {
  userId: string;
  role: UserRole;
}
