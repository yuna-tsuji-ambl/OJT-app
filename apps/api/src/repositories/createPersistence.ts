import { createInMemoryQuestPersistence } from './createInMemoryQuestPersistence.js';
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

  const { questStore, sheetRepository } = createInMemoryQuestPersistence();
  const { trainerStatusStore, chatMessageStore } =
    createInMemoryStatusPersistence();

  return {
    conditionRecordStore: new InMemoryConditionRecordStore(),
    questStore,
    sheetRepository,
    trainerStatusStore,
    chatMessageStore,
  };
}
