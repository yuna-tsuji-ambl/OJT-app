import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { QUEST_STATUS } from '@ojt-app/shared';
import {
  approveAssignment,
  getAssignmentList,
  requestClearAssignment,
} from '../assignment.js';
import { SEED_ASSIGNMENTS } from '../domain/assignmentConstants.js';
import { resetFirestoreForTests } from '../firestore/client.js';
import { FirestoreAssignmentRepository } from '../repositories/firestore/firestoreAssignmentRepository.js';
import { getFirestore } from '../firestore/client.js';
import { seedFirestoreDefaults } from '../firestore/seed.js';
import {
  CREATE_ASSIGNMENT_INPUT,
  TRAINEE_USER_ID,
  TRAINER_USER_ID,
} from './questTestFixtures.js';

const describeFirestore = process.env.FIRESTORE_EMULATOR_HOST
  ? describe
  : describe.skip;

describeFirestore('Firestore AssignmentRepository', () => {
  let repository: FirestoreAssignmentRepository;

  beforeEach(async () => {
    process.env.GCP_PROJECT_ID = process.env.GCP_PROJECT_ID ?? 'ojt-app-dev';
    resetFirestoreForTests();
    const db = getFirestore();
    await seedFirestoreDefaults(db);
    repository = new FirestoreAssignmentRepository(db);
  });

  afterEach(() => {
    resetFirestoreForTests();
  });

  it('I-A01 Firestore 永続化の作成・読取', async () => {
    const created = await repository.create(
      CREATE_ASSIGNMENT_INPUT,
      TRAINER_USER_ID,
    );
    const assignments = await repository.findByTraineeId(TRAINEE_USER_ID);

    expect(assignments.some((assignment) => assignment.id === created.id)).toBe(
      true,
    );
    expect(
      assignments.find((assignment) => assignment.id === created.id),
    ).toEqual(
      expect.objectContaining({ title: CREATE_ASSIGNMENT_INPUT.title }),
    );
  });

  it('I-A02 申請から承認までの一連フロー', async () => {
    const created = await repository.create(
      CREATE_ASSIGNMENT_INPUT,
      TRAINER_USER_ID,
    );

    await requestClearAssignment(
      created.id,
      TRAINEE_USER_ID,
      'trainee',
      repository,
    );
    let stored = await repository.findById(created.id);
    expect(stored?.status).toBe(QUEST_STATUS.PENDING);

    await approveAssignment(created.id, TRAINER_USER_ID, 'trainer', repository);
    stored = await repository.findById(created.id);
    expect(stored?.status).toBe(QUEST_STATUS.CLEARED);
  });

  it('I-A03 再起動後もデータが残る', async () => {
    const created = await repository.create(
      CREATE_ASSIGNMENT_INPUT,
      TRAINER_USER_ID,
    );
    await requestClearAssignment(
      created.id,
      TRAINEE_USER_ID,
      'trainee',
      repository,
    );
    await approveAssignment(created.id, TRAINER_USER_ID, 'trainer', repository);

    resetFirestoreForTests();
    const reloadedRepository = new FirestoreAssignmentRepository(
      getFirestore(),
    );
    const stored = await reloadedRepository.findById(created.id);

    expect(stored?.status).toBe(QUEST_STATUS.CLEARED);
  });

  it('I-A04 課題削除の永続化反映', async () => {
    const created = await repository.create(
      CREATE_ASSIGNMENT_INPUT,
      TRAINER_USER_ID,
    );

    await repository.delete(created.id);
    const assignments = await getAssignmentList(
      TRAINEE_USER_ID,
      'trainee',
      repository,
    );

    expect(assignments.some((assignment) => assignment.id === created.id)).toBe(
      false,
    );
  });

  it('I-A05 シードデータとの共存', async () => {
    const created = await repository.create(
      CREATE_ASSIGNMENT_INPUT,
      TRAINER_USER_ID,
    );
    const assignments = await repository.findByTraineeId(TRAINEE_USER_ID);

    expect(assignments.length).toBe(SEED_ASSIGNMENTS.length + 1);
    expect(assignments.some((assignment) => assignment.id === created.id)).toBe(
      true,
    );
  });
});
