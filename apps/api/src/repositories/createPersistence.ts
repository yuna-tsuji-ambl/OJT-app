import { createInMemoryAssignmentRepository } from './createInMemoryAssignmentPersistence.js';
import { createInMemoryMessagePersistence } from './createInMemoryMessagePersistence.js';
import { createInMemoryGoalRepository } from './createInMemoryGoalPersistence.js';
import { createInMemoryLearningRepository } from './createInMemoryLearningPersistence.js';
import { createInMemoryMessageAnnouncementRepository } from './inMemoryMessageAnnouncementRepository.js';
import { createInMemoryMessageBookmarkRepository } from './inMemoryMessageBookmarkRepository.js';
import { createInMemoryReportRepository } from './createInMemoryReportPersistence.js';
import { createInMemoryStatusPersistence } from './createInMemoryStatusPersistence.js';
import { createFirestorePersistence } from './createFirestorePersistence.js';
import { InMemoryConditionRecordStore } from './inMemoryConditionRecordStore.js';
import type { AppPersistence } from './createFirestorePersistence.js';

export type DbProvider = 'memory' | 'firestore';

export function resolveDbProvider(): DbProvider {
  return process.env.DB_PROVIDER === 'firestore' ? 'firestore' : 'memory';
}

export async function createPersistence(): Promise<AppPersistence> {
  if (resolveDbProvider() === 'firestore') {
    return createFirestorePersistence();
  }

  const { trainerStatusStore, chatMessageStore } =
    createInMemoryStatusPersistence();
  const { threadStore, messageStore: threadChatMessageStore } =
    createInMemoryMessagePersistence();

  return {
    conditionRecordStore: new InMemoryConditionRecordStore(),
    assignmentRepository: createInMemoryAssignmentRepository(),
    goalRepository: createInMemoryGoalRepository(),
    learningRepository: createInMemoryLearningRepository(),
    reportRepository: createInMemoryReportRepository(),
    messageBookmarkRepository: createInMemoryMessageBookmarkRepository(),
    messageAnnouncementRepository:
      createInMemoryMessageAnnouncementRepository(),
    trainerStatusStore,
    chatMessageStore,
    threadStore,
    threadChatMessageStore,
  };
}
