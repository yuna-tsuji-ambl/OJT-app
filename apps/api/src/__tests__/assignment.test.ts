import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect, beforeEach } from 'vitest';
import { QUEST_STATUS } from '@ojt-app/shared';
import {
  approveAssignment,
  createAssignment,
  deleteAssignment,
  getAssignmentList,
  getAssignmentManageList,
  getPendingAssignmentList,
  requestClearAssignment,
  updateAssignment,
} from '../assignment.js';
import {
  ForbiddenError,
  InvalidAssignmentStatusError,
} from '../domain/errors.js';
import { createPersistence } from '../repositories/createPersistence.js';
import {
  CREATE_ASSIGNMENT_INPUT,
  TRAINEE_USER_ID,
  TRAINER_USER_ID,
  createInMemoryAssignmentRepositoryForTests,
  questToAssignment,
  SHEET_QUEST_TYPESCRIPT,
} from './questTestFixtures.js';

const apiSrcDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

describe('U-A01 SheetRepository 依存の除去', () => {
  it('questFacade と assignmentFacade が SheetRepository を参照しない', () => {
    const questFacadeSource = readFileSync(
      path.join(apiSrcDir, 'api', 'questFacade.ts'),
      'utf8',
    );
    const assignmentFacadeSource = readFileSync(
      path.join(apiSrcDir, 'api', 'assignmentFacade.ts'),
      'utf8',
    );

    expect(questFacadeSource).not.toContain('SheetRepository');
    expect(assignmentFacadeSource).not.toContain('SheetRepository');
  });
});

describe('U-A02 createPersistence の戻り値', () => {
  it('createPersistence_assignmentRepositoryのみを返す', async () => {
    const persistence = await createPersistence();

    expect(persistence).toHaveProperty('assignmentRepository');
    expect(persistence).not.toHaveProperty('sheetRepository');
    expect(persistence).not.toHaveProperty('questStore');
  });
});

describe('U-A03 新卒向け課題一覧取得', () => {
  let repository = createInMemoryAssignmentRepositoryForTests();

  beforeEach(() => {
    repository = createInMemoryAssignmentRepositoryForTests([
      questToAssignment(SHEET_QUEST_TYPESCRIPT),
      {
        ...questToAssignment(SHEET_QUEST_TYPESCRIPT),
        id: 'quest-2',
        title: 'React入門',
        achievementLevel: 'Lv2',
      },
    ]);
  });

  it('findByTraineeId_担当新卒の課題のみ返る', async () => {
    const assignments = await repository.findByTraineeId(TRAINEE_USER_ID);

    expect(assignments).toHaveLength(2);
    expect(assignments[0]).toEqual(
      expect.objectContaining({
        majorItem: '開発基礎',
        title: 'TypeScript基礎',
        achievementLevel: 'Lv1',
        status: QUEST_STATUS.NOT_CLEARED,
      }),
    );
  });
});

describe('U-A04 課題作成（トレーナー）', () => {
  it('createAssignment_必須項目送信で課題が作成される', async () => {
    const repository = createInMemoryAssignmentRepositoryForTests();
    const created = await createAssignment(
      TRAINER_USER_ID,
      'trainer',
      CREATE_ASSIGNMENT_INPUT,
      repository,
    );

    expect(created.createdBy).toBe(TRAINER_USER_ID);
    expect(created.status).toBe(QUEST_STATUS.NOT_CLEARED);
    expect(created.title).toBe(CREATE_ASSIGNMENT_INPUT.title);

    const stored = await repository.findById(created.id);
    expect(stored).toEqual(created);
  });
});

describe('U-A06 課題更新（トレーナー）', () => {
  it('updateAssignment_タイトルと説明を更新できる', async () => {
    const repository = createInMemoryAssignmentRepositoryForTests();
    const created = await createAssignment(
      TRAINER_USER_ID,
      'trainer',
      CREATE_ASSIGNMENT_INPUT,
      repository,
    );

    const updated = await updateAssignment(
      created.id,
      TRAINER_USER_ID,
      'trainer',
      {
        title: '更新後タイトル',
        description: '更新後説明',
        dueDate: '2026-12-31',
      },
      repository,
    );

    expect(updated.title).toBe('更新後タイトル');
    expect(updated.description).toBe('更新後説明');
    expect(updated.dueDate).toBe('2026-12-31');
    expect(updated.updatedAt).toBeTruthy();
  });
});

describe('U-A07 課題削除（トレーナー）', () => {
  it('deleteAssignment_課題が削除される', async () => {
    const repository = createInMemoryAssignmentRepositoryForTests();
    const created = await createAssignment(
      TRAINER_USER_ID,
      'trainer',
      CREATE_ASSIGNMENT_INPUT,
      repository,
    );

    await deleteAssignment(created.id, TRAINER_USER_ID, 'trainer', repository);

    expect(await repository.findById(created.id)).toBeNull();
  });
});

describe('U-A08 課題管理一覧（トレーナー）', () => {
  it('getAssignmentManageList_登録済み課題一覧が返る', async () => {
    const repository = createInMemoryAssignmentRepositoryForTests();
    await createAssignment(
      TRAINER_USER_ID,
      'trainer',
      CREATE_ASSIGNMENT_INPUT,
      repository,
    );

    const assignments = await getAssignmentManageList(
      TRAINER_USER_ID,
      'trainer',
      repository,
    );

    expect(assignments).toHaveLength(1);
    expect(assignments[0]?.title).toBe(CREATE_ASSIGNMENT_INPUT.title);
  });
});

describe('U-A09 クリア申請（新卒）', () => {
  it('requestClearAssignment_未クリア課題が申請中になる', async () => {
    const repository = createInMemoryAssignmentRepositoryForTests();
    const created = await createAssignment(
      TRAINER_USER_ID,
      'trainer',
      CREATE_ASSIGNMENT_INPUT,
      repository,
    );

    const result = await requestClearAssignment(
      created.id,
      TRAINEE_USER_ID,
      'trainee',
      repository,
    );

    expect(result.status).toBe(QUEST_STATUS.PENDING);
    const stored = await repository.findById(created.id);
    expect(stored?.status).toBe(QUEST_STATUS.PENDING);
  });
});

describe('U-A10 申請一覧（トレーナー）', () => {
  it('getPendingAssignmentList_申請中課題のみ返る', async () => {
    const repository = createInMemoryAssignmentRepositoryForTests();
    const created = await createAssignment(
      TRAINER_USER_ID,
      'trainer',
      CREATE_ASSIGNMENT_INPUT,
      repository,
    );
    await requestClearAssignment(
      created.id,
      TRAINEE_USER_ID,
      'trainee',
      repository,
    );

    const pending = await getPendingAssignmentList(
      TRAINER_USER_ID,
      'trainer',
      repository,
    );

    expect(pending).toHaveLength(1);
    expect(pending[0]?.status).toBe(QUEST_STATUS.PENDING);
  });
});

describe('U-A11 承認（トレーナー）', () => {
  it('approveAssignment_申請中課題がクリアになる', async () => {
    const repository = createInMemoryAssignmentRepositoryForTests();
    const created = await createAssignment(
      TRAINER_USER_ID,
      'trainer',
      CREATE_ASSIGNMENT_INPUT,
      repository,
    );
    await requestClearAssignment(
      created.id,
      TRAINEE_USER_ID,
      'trainee',
      repository,
    );

    const result = await approveAssignment(
      created.id,
      TRAINER_USER_ID,
      'trainer',
      repository,
    );

    expect(result.status).toBe(QUEST_STATUS.CLEARED);
    const stored = await repository.findById(created.id);
    expect(stored?.status).toBe(QUEST_STATUS.CLEARED);
  });
});

describe('U-A12 他新卒の課題を取得できない', () => {
  it('requestClearAssignment_他新卒の課題は404', async () => {
    const repository = createInMemoryAssignmentRepositoryForTests();
    const created = await createAssignment(
      TRAINER_USER_ID,
      'trainer',
      CREATE_ASSIGNMENT_INPUT,
      repository,
    );

    await expect(
      requestClearAssignment(created.id, 'trainee-2', 'trainee', repository),
    ).rejects.toBeInstanceOf(Error);
  });

  it('getAssignmentList_他新卒向け課題は含まれない', async () => {
    const repository = createInMemoryAssignmentRepositoryForTests([
      questToAssignment(SHEET_QUEST_TYPESCRIPT, TRAINEE_USER_ID),
    ]);

    const assignments = await getAssignmentList(
      'trainee-2',
      'trainee',
      repository,
    );

    expect(assignments).toHaveLength(0);
  });
});

describe('U-A13 新卒が課題 CRUD できない', () => {
  it('createAssignment_新卒は403', async () => {
    const repository = createInMemoryAssignmentRepositoryForTests();

    await expect(
      createAssignment(
        TRAINEE_USER_ID,
        'trainee',
        CREATE_ASSIGNMENT_INPUT,
        repository,
      ),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });
});

describe('U-A14 存在しない課題への申請', () => {
  it('requestClearAssignment_存在しないIDは404', async () => {
    const repository = createInMemoryAssignmentRepositoryForTests();

    await expect(
      requestClearAssignment(
        'missing-id',
        TRAINEE_USER_ID,
        'trainee',
        repository,
      ),
    ).rejects.toBeInstanceOf(Error);
  });
});

describe('U-A15 未申請課題の承認拒否', () => {
  it('approveAssignment_未クリア課題は409相当エラー', async () => {
    const repository = createInMemoryAssignmentRepositoryForTests();
    const created = await createAssignment(
      TRAINER_USER_ID,
      'trainer',
      CREATE_ASSIGNMENT_INPUT,
      repository,
    );

    await expect(
      approveAssignment(created.id, TRAINER_USER_ID, 'trainer', repository),
    ).rejects.toBeInstanceOf(InvalidAssignmentStatusError);
  });
});
