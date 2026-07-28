import type { Firestore } from '@google-cloud/firestore';
import type { MessageThreadStore } from './messageThreadStore.js';
import type { ThreadChatMessageStore } from './threadChatMessageStore.js';
import { FirestoreMessageThreadStore } from './firestore/firestoreMessageThreadStore.js';
import { FirestoreThreadChatMessageStore } from './firestore/firestoreThreadChatMessageStore.js';

export interface FirestoreMessagePersistence {
  threadStore: MessageThreadStore;
  messageStore: ThreadChatMessageStore;
}

export function createFirestoreMessagePersistence(
  db: Firestore,
): FirestoreMessagePersistence {
  return {
    threadStore: new FirestoreMessageThreadStore(db),
    messageStore: new FirestoreThreadChatMessageStore(db),
  };
}
