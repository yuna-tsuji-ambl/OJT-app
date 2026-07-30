import type { Firestore } from '@google-cloud/firestore';
import type { Goal } from '../../goals/goalTypes.js';
import { FIRESTORE_COLLECTIONS } from '../../firestore/collections.js';
import type { GoalRepository } from '../goalRepository.js';
import { fromGoalDocument, toGoalDocument } from './goalFirestoreMappers.js';

export class FirestoreGoalRepository implements GoalRepository {
  constructor(private readonly db: Firestore) {}

  private goalsCollection() {
    return this.db.collection(FIRESTORE_COLLECTIONS.GOALS);
  }

  async findByTraineeId(traineeId: string): Promise<Goal[]> {
    const snapshot = await this.goalsCollection()
      .where('traineeId', '==', traineeId)
      .get();

    return snapshot.docs.map((document) => fromGoalDocument(document.data()));
  }

  async findById(goalId: string): Promise<Goal | null> {
    const snapshot = await this.goalsCollection().doc(goalId).get();

    if (!snapshot.exists) {
      return null;
    }

    return fromGoalDocument(snapshot.data());
  }

  async save(goal: Goal): Promise<Goal> {
    const document = toGoalDocument(goal);
    await this.goalsCollection().doc(goal.id).set(document);
    return fromGoalDocument(document);
  }

  async delete(goalId: string): Promise<void> {
    await this.goalsCollection().doc(goalId).delete();
  }
}
