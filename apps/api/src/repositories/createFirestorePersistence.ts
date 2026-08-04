import { getFirestore } from '../firestore/client.js';
import { toFirestoreStartupError } from '../firestore/firestoreErrors.js';
import { seedFirestoreDefaults } from '../firestore/seed.js';
import type { AssignmentRepository } from './assignmentRepository.js';
import type { ChatMessageStore } from './chatMessageStore.js';
import type { ConditionRecordStore } from './conditionRecordStore.js';
import { FirestoreAssignmentRepository } from './firestore/firestoreAssignmentRepository.js';
import { FirestoreChatMessageStore } from './firestore/firestoreChatMessageStore.js';
import { FirestoreConditionRecordStore } from './firestore/firestoreConditionRecordStore.js';
import { FirestoreGoalRepository } from './firestore/firestoreGoalRepository.js';
import { FirestoreLearningRepository } from './firestore/firestoreLearningRepository.js';
import { FirestoreMessageAnnouncementRepository } from './firestore/firestoreMessageAnnouncementRepository.js';
import { FirestoreMessageBookmarkRepository } from './firestore/firestoreMessageBookmarkRepository.js';
import { FirestoreReportRepository } from './firestore/firestoreReportRepository.js';
import { FirestoreTrainerStatusStore } from './firestore/firestoreTrainerStatusStore.js';
import { createFirestoreMessagePersistence } from './createFirestoreMessagePersistence.js';
import type { MessageAnnouncementRepository } from './messageAnnouncementRepository.js';
import type { MessageBookmarkRepository } from './messageBookmarkRepository.js';
import type { MessageThreadStore } from './messageThreadStore.js';
import type { GoalRepository } from './goalRepository.js';
import type { LearningRepository } from './learningRepository.js';
import type { ReportRepository } from './reportRepository.js';
import type { ThreadChatMessageStore } from './threadChatMessageStore.js';
import type { TrainerStatusStore } from './trainerStatusStore.js';

export interface AppPersistence {
  conditionRecordStore: ConditionRecordStore;
  assignmentRepository: AssignmentRepository;
  goalRepository: GoalRepository;
  learningRepository: LearningRepository;
  reportRepository: ReportRepository;
  messageBookmarkRepository: MessageBookmarkRepository;
  messageAnnouncementRepository: MessageAnnouncementRepository;
  trainerStatusStore: TrainerStatusStore;
  chatMessageStore: ChatMessageStore;
  threadStore: MessageThreadStore;
  threadChatMessageStore: ThreadChatMessageStore;
}

export async function createFirestorePersistence(): Promise<AppPersistence> {
  try {
    const db = getFirestore();
    await seedFirestoreDefaults(db);
    const messagePersistence = createFirestoreMessagePersistence(db);

    return {
      conditionRecordStore: new FirestoreConditionRecordStore(db),
      assignmentRepository: new FirestoreAssignmentRepository(db),
      goalRepository: new FirestoreGoalRepository(db),
      learningRepository: new FirestoreLearningRepository(db),
      reportRepository: new FirestoreReportRepository(db),
      messageBookmarkRepository: new FirestoreMessageBookmarkRepository(db),
      messageAnnouncementRepository: new FirestoreMessageAnnouncementRepository(
        db,
      ),
      trainerStatusStore: new FirestoreTrainerStatusStore(db),
      chatMessageStore: new FirestoreChatMessageStore(db),
      threadStore: messagePersistence.threadStore,
      threadChatMessageStore: messagePersistence.messageStore,
    };
  } catch (error) {
    throw toFirestoreStartupError(error);
  }
}
