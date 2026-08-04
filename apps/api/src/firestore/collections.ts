export const FIRESTORE_COLLECTIONS = {
  QUESTS: 'quests',
  ASSIGNMENTS: 'assignments',
  CONDITION_RECORDS: 'conditionRecords',
  TRAINER_STATUSES: 'trainerStatuses',
  CHAT_MESSAGES: 'chatMessages',
  CHAT_THREADS: 'chat_threads',
  THREAD_CHAT_MESSAGES: 'chat_messages',
  REPORTS: 'reports',
  GOALS: 'goals',
  LEARNING_POSTS: 'learningPosts',
  MESSAGE_BOOKMARKS: 'messageBookmarks',
  MESSAGE_ANNOUNCEMENTS: 'messageAnnouncements',
} as const;

export const MESSAGE_FIRESTORE_COLLECTIONS = [
  FIRESTORE_COLLECTIONS.CHAT_THREADS,
  FIRESTORE_COLLECTIONS.THREAD_CHAT_MESSAGES,
] as const;
