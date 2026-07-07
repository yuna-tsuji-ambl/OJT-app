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

export type UserRole = 'trainee' | 'trainer';

export interface UserContext {
  userId: string;
  role: UserRole;
}
