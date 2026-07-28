import type { Firestore } from '@google-cloud/firestore';
import { normalizeAchievementLevel } from '../../domain/achievementLevel.js';
import { createAssignmentFromInput } from '../../domain/createAssignment.js';
import { QUEST_STATUS } from '../../domain/constants.js';
import {
  AssignmentNotFoundError,
  InvalidAssignmentStatusError,
} from '../../domain/errors.js';
import type {
  Assignment,
  CreateAssignmentInput,
  UpdateAssignmentInput,
} from '../../domain/assignmentTypes.js';
import type { QuestStatus } from '../../domain/types.js';
import { FIRESTORE_COLLECTIONS } from '../../firestore/collections.js';
import type { AssignmentRepository } from '../assignmentRepository.js';

export class FirestoreAssignmentRepository implements AssignmentRepository {
  constructor(private readonly db: Firestore) {}

  private assignmentsCollection() {
    return this.db.collection(FIRESTORE_COLLECTIONS.ASSIGNMENTS);
  }

  async findByTraineeId(traineeId: string): Promise<Assignment[]> {
    const snapshot = await this.assignmentsCollection()
      .where('traineeId', '==', traineeId)
      .get();

    return snapshot.docs.map((document) => document.data() as Assignment);
  }

  async findById(id: string): Promise<Assignment | null> {
    const document = await this.assignmentsCollection().doc(id).get();
    return document.exists ? (document.data() as Assignment) : null;
  }

  async listByTrainer(trainerId: string): Promise<Assignment[]> {
    const snapshot = await this.assignmentsCollection()
      .where('createdBy', '==', trainerId)
      .get();

    return snapshot.docs.map((document) => document.data() as Assignment);
  }

  async listPending(): Promise<Assignment[]> {
    const snapshot = await this.assignmentsCollection()
      .where('status', '==', QUEST_STATUS.PENDING)
      .get();

    return snapshot.docs.map((document) => document.data() as Assignment);
  }

  async create(
    input: CreateAssignmentInput,
    createdBy: string,
  ): Promise<Assignment> {
    const assignment = createAssignmentFromInput(input, createdBy);
    await this.assignmentsCollection().doc(assignment.id).set(assignment);
    return assignment;
  }

  async update(id: string, input: UpdateAssignmentInput): Promise<Assignment> {
    const current = await this.findById(id);

    if (!current) {
      throw new AssignmentNotFoundError(id);
    }

    const updated: Assignment = {
      ...current,
      majorItem: input.majorItem ?? current.majorItem,
      title: input.title ?? current.title,
      description: input.description ?? current.description,
      achievementLevel: input.achievementLevel
        ? normalizeAchievementLevel(input.achievementLevel)
        : current.achievementLevel,
      dueDate: input.dueDate === undefined ? current.dueDate : input.dueDate,
      updatedAt: new Date().toISOString(),
    };

    await this.assignmentsCollection().doc(id).set(updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const reference = this.assignmentsCollection().doc(id);
    const document = await reference.get();

    if (!document.exists) {
      throw new AssignmentNotFoundError(id);
    }

    await reference.delete();
  }

  async updateStatus(id: string, status: QuestStatus): Promise<Assignment> {
    const current = await this.findById(id);

    if (!current) {
      throw new AssignmentNotFoundError(id);
    }

    if (
      status === QUEST_STATUS.PENDING &&
      current.status !== QUEST_STATUS.NOT_CLEARED
    ) {
      throw new InvalidAssignmentStatusError(id, current.status, status);
    }

    if (
      status === QUEST_STATUS.CLEARED &&
      current.status !== QUEST_STATUS.PENDING
    ) {
      throw new InvalidAssignmentStatusError(id, current.status, status);
    }

    const updated: Assignment = {
      ...current,
      status,
      updatedAt: new Date().toISOString(),
    };

    await this.assignmentsCollection().doc(id).set(updated);
    return updated;
  }
}
