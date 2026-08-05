import { getFirestore, resetFirestoreForTests } from '../firestore/client.js';
import {
  createFirestoreMessagePersistence,
  type FirestoreMessagePersistence,
} from './createFirestoreMessagePersistence.js';

export function reconnectFirestoreMessagePersistence(): FirestoreMessagePersistence {
  resetFirestoreForTests();

  return createFirestoreMessagePersistence(getFirestore());
}
