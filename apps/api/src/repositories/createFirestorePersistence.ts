import { getFirestore } from '../firestore/client.js';
import { toFirestoreStartupError } from '../firestore/firestoreErrors.js';
import { seedFirestoreDefaults } from '../firestore/seed.js';
import type { AssignmentRepository } from './assignmentRepository.js';
import type { ChatMessageStore } from './chatMessageStore.js';
import type { ConditionRecordStore } from './conditionRecordStore.js';
import { FirestoreAssignmentRepository } from './firestore/firestoreAssignmentRepository.js';
import { FirestoreChatMessageStore } from './firestore/firestoreChatMessageStore.js';
import { FirestoreConditionRecordStore } from './firestore/firestoreConditionRecordStore.js';
import { FirestoreTrainerStatusStore } from './firestore/firestoreTrainerStatusStore.js';
import type { TrainerStatusStore } from './trainerStatusStore.js';

export interface AppPersistence {
  conditionRecordStore: ConditionRecordStore;
  assignmentRepository: AssignmentRepository;
  trainerStatusStore: TrainerStatusStore;
  chatMessageStore: ChatMessageStore;
}

export async function createFirestorePersistence(): Promise<AppPersistence> {
  try {
    const db = getFirestore();
    await seedFirestoreDefaults(db);

    return {
      conditionRecordStore: new FirestoreConditionRecordStore(db),
      assignmentRepository: new FirestoreAssignmentRepository(db),
      trainerStatusStore: new FirestoreTrainerStatusStore(db),
      chatMessageStore: new FirestoreChatMessageStore(db),
    };
  } catch (error) {
    throw toFirestoreStartupError(error);
  }
}
