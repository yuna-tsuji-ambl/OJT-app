import { getFirestore } from '../firestore/client.js';
import { toFirestoreStartupError } from '../firestore/firestoreErrors.js';
import { seedFirestoreDefaults } from '../firestore/seed.js';
import type { ChatMessageStore } from './chatMessageStore.js';
import type { ConditionRecordStore } from './conditionRecordStore.js';
import { FirestoreChatMessageStore } from './firestore/firestoreChatMessageStore.js';
import { FirestoreConditionRecordStore } from './firestore/firestoreConditionRecordStore.js';
import { FirestoreQuestRepository } from './firestore/firestoreQuestRepository.js';
import { FirestoreTrainerStatusStore } from './firestore/firestoreTrainerStatusStore.js';
import type { QuestStore } from './questStore.js';
import type { SheetRepository } from './sheetRepository.js';
import type { TrainerStatusStore } from './trainerStatusStore.js';

export interface AppPersistence {
  conditionRecordStore: ConditionRecordStore;
  questStore: QuestStore;
  sheetRepository: SheetRepository;
  trainerStatusStore: TrainerStatusStore;
  chatMessageStore: ChatMessageStore;
}

export async function createFirestorePersistence(): Promise<AppPersistence> {
  try {
    const db = getFirestore();
    await seedFirestoreDefaults(db);

    const questRepository = new FirestoreQuestRepository(db);

    return {
      conditionRecordStore: new FirestoreConditionRecordStore(db),
      questStore: questRepository,
      sheetRepository: questRepository,
      trainerStatusStore: new FirestoreTrainerStatusStore(db),
      chatMessageStore: new FirestoreChatMessageStore(db),
    };
  } catch (error) {
    throw toFirestoreStartupError(error);
  }
}
