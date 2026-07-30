import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Firestore } from '@google-cloud/firestore';
import type { GoalRepository } from '../repositories/goalRepository.js';
import {
  GOAL_INITIAL_PROGRESS,
  GOAL_INITIAL_STATUS,
  GOAL_STATUS_IN_PROGRESS,
  I_G01_POST_BODY,
  I_G02_PROGRESS,
  OTHER_TRAINEE_HEADERS,
  OTHER_TRAINEE_USER_ID,
  TRAINEE_HEADERS,
  TRAINEE_USER_ID,
  TRAINER_HEADERS,
  U_G01_END_DATE,
  U_G01_POST_BODY,
  U_G01_START_DATE,
  U_G01_TITLE,
  U_G02_GOAL_A,
  U_G02_GOAL_B,
  U_G04_PROGRESS,
  U_G05_UPDATED_END_DATE,
  U_G05_UPDATED_START_DATE,
  U_G05_UPDATED_TITLE,
  U_G07_EMPTY_TITLE_POST_BODY,
  U_G08_INVALID_RANGE_POST_BODY,
  U_G09_INVALID_DATE_POST_BODY,
  U_G10_INVALID_STATUS_PUT_BODY,
  U_G11_POST_BODY,
  U_G16_PROGRESS,
  U_G17_PROGRESS,
  U_G18_PROGRESS,
  U_G19_PROGRESS,
  U_G20_POST_BODY,
  U_G20_SAME_DAY,
  U_G21_POST_BODY,
  U_G21_TITLE,
  U_G22_POST_BODY,
  UNAUTHENTICATED_HEADERS,
  deleteGoal,
  getGoals,
  postGoal,
  putGoal,
} from './goalTestFixtures.js';
import {
  clearGoalsCollection,
  createGoalFirestoreTestContext,
  expectApiResponseMatchesStoredGoal,
  expectForbiddenOrEmptyGoalList,
  expectGoalPersistedInFirestore,
  findGoalsInFirestore,
  readGoalDocumentById,
  resetGoalFirestoreTestContext,
} from './goalFirestoreTestHelpers.js';

function setupGoalFirestoreTests() {
  let db: Firestore;
  let repository: GoalRepository;

  beforeEach(async () => {
    ({ db, repository } = createGoalFirestoreTestContext());
    await clearGoalsCollection(db);
  });

  afterEach(() => {
    resetGoalFirestoreTestContext();
  });

  return {
    getDb: () => db,
    getRepository: () => repository,
  };
}

async function createGoalViaApi(
  repository: GoalRepository,
  body: unknown,
  headers = TRAINER_HEADERS,
) {
  const response = await postGoal(body, repository, headers);
  expect([200, 201]).toContain(response.statusCode);
  return response.body as {
    id: string;
    progress: number;
    status: string;
    updatedAt: string;
  };
}

describe('U-G01 目標の新規作成（トレーナー）', () => {
  const testContext = setupGoalFirestoreTests();

  it('postGoal_トレーナーが目標を作成_HTTP201かつFirestoreに保存される', async () => {
    const response = await postGoal(
      U_G01_POST_BODY,
      testContext.getRepository(),
      TRAINER_HEADERS,
    );

    expect([200, 201]).toContain(response.statusCode);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        traineeId: TRAINEE_USER_ID,
        title: U_G01_TITLE,
        startDate: U_G01_START_DATE,
        endDate: U_G01_END_DATE,
        progress: GOAL_INITIAL_PROGRESS,
        status: GOAL_INITIAL_STATUS,
      }),
    );

    const goalId = (response.body as { id: string }).id;
    const stored = await readGoalDocumentById(testContext.getDb(), goalId);
    expect(stored).toBeDefined();
    expectGoalPersistedInFirestore(stored!, {
      traineeId: TRAINEE_USER_ID,
      title: U_G01_TITLE,
      startDate: U_G01_START_DATE,
      endDate: U_G01_END_DATE,
      progress: GOAL_INITIAL_PROGRESS,
      status: GOAL_INITIAL_STATUS,
    });
  });
});

describe('U-G02 目標一覧の取得（トレーナー）', () => {
  const testContext = setupGoalFirestoreTests();

  it('getGoals_トレーナーが担当新卒の目標一覧を取得_HTTP200', async () => {
    await postGoal(U_G02_GOAL_A, testContext.getRepository(), TRAINER_HEADERS);
    await postGoal(U_G02_GOAL_B, testContext.getRepository(), TRAINER_HEADERS);

    const response = await getGoals(
      { traineeId: TRAINEE_USER_ID },
      testContext.getRepository(),
      TRAINER_HEADERS,
    );

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(2);
    for (const goal of response.body as Array<Record<string, unknown>>) {
      expect(goal).toEqual(
        expect.objectContaining({
          title: expect.any(String),
          startDate: expect.any(String),
          endDate: expect.any(String),
          progress: expect.any(Number),
          status: expect.any(String),
        }),
      );
    }
  });
});

describe('U-G03 目標一覧の取得（新卒）', () => {
  const testContext = setupGoalFirestoreTests();

  it('getGoals_新卒が自身の目標一覧を取得_HTTP200', async () => {
    await postGoal(
      U_G01_POST_BODY,
      testContext.getRepository(),
      TRAINER_HEADERS,
    );

    const response = await getGoals(
      {},
      testContext.getRepository(),
      TRAINEE_HEADERS,
    );

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(1);
    expect((response.body as Array<{ traineeId: string }>)[0]?.traineeId).toBe(
      TRAINEE_USER_ID,
    );
  });
});

describe('U-G04 進捗・ステータス更新（新卒）', () => {
  const testContext = setupGoalFirestoreTests();

  it('putGoal_新卒が進捗とステータスを更新_HTTP200', async () => {
    const created = await createGoalViaApi(
      testContext.getRepository(),
      U_G01_POST_BODY,
    );
    const beforeUpdatedAt = created.updatedAt;

    const response = await putGoal(
      created.id,
      { progress: U_G04_PROGRESS, status: GOAL_STATUS_IN_PROGRESS },
      testContext.getRepository(),
      TRAINEE_HEADERS,
    );

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        progress: U_G04_PROGRESS,
        status: GOAL_STATUS_IN_PROGRESS,
      }),
    );
    expect((response.body as { updatedAt: string }).updatedAt).not.toBe(
      beforeUpdatedAt,
    );
  });
});

describe('U-G05 目標更新（トレーナー）', () => {
  const testContext = setupGoalFirestoreTests();

  it('putGoal_トレーナーがタイトルと期間を更新_HTTP200', async () => {
    const created = await createGoalViaApi(
      testContext.getRepository(),
      U_G01_POST_BODY,
    );

    const response = await putGoal(
      created.id,
      {
        title: U_G05_UPDATED_TITLE,
        startDate: U_G05_UPDATED_START_DATE,
        endDate: U_G05_UPDATED_END_DATE,
      },
      testContext.getRepository(),
      TRAINER_HEADERS,
    );

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        title: U_G05_UPDATED_TITLE,
        startDate: U_G05_UPDATED_START_DATE,
        endDate: U_G05_UPDATED_END_DATE,
      }),
    );

    const listResponse = await getGoals(
      { traineeId: TRAINEE_USER_ID },
      testContext.getRepository(),
      TRAINER_HEADERS,
    );
    expect(listResponse.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: created.id,
          title: U_G05_UPDATED_TITLE,
        }),
      ]),
    );
  });
});

describe('U-G06 目標削除（トレーナー）', () => {
  const testContext = setupGoalFirestoreTests();

  it('deleteGoal_トレーナーが目標を削除_HTTP204かつ一覧から消える', async () => {
    const created = await createGoalViaApi(
      testContext.getRepository(),
      U_G01_POST_BODY,
    );

    const deleteResponse = await deleteGoal(
      created.id,
      testContext.getRepository(),
      TRAINER_HEADERS,
    );

    expect([200, 204]).toContain(deleteResponse.statusCode);

    const listResponse = await getGoals(
      { traineeId: TRAINEE_USER_ID },
      testContext.getRepository(),
      TRAINER_HEADERS,
    );
    expect(listResponse.body).toEqual([]);
  });
});

describe('U-G07 必須項目欠落（作成時）', () => {
  const testContext = setupGoalFirestoreTests();

  it('postGoal_タイトル空はHTTP400', async () => {
    const response = await postGoal(
      U_G07_EMPTY_TITLE_POST_BODY,
      testContext.getRepository(),
      TRAINER_HEADERS,
    );

    expect(response.statusCode).toBe(400);
    const goals = await findGoalsInFirestore(
      testContext.getDb(),
      TRAINEE_USER_ID,
    );
    expect(goals).toHaveLength(0);
  });
});

describe('U-G08 終了日が開始日より前', () => {
  const testContext = setupGoalFirestoreTests();

  it('postGoal_不正な期間はHTTP400', async () => {
    const response = await postGoal(
      U_G08_INVALID_RANGE_POST_BODY,
      testContext.getRepository(),
      TRAINER_HEADERS,
    );

    expect(response.statusCode).toBe(400);
    const goals = await findGoalsInFirestore(
      testContext.getDb(),
      TRAINEE_USER_ID,
    );
    expect(goals).toHaveLength(0);
  });
});

describe('U-G09 日付形式の不正', () => {
  const testContext = setupGoalFirestoreTests();

  it('postGoal_不正日付はHTTP400', async () => {
    const response = await postGoal(
      U_G09_INVALID_DATE_POST_BODY,
      testContext.getRepository(),
      TRAINER_HEADERS,
    );

    expect(response.statusCode).toBe(400);
  });
});

describe('U-G10 不正な status 値', () => {
  const testContext = setupGoalFirestoreTests();

  it('putGoal_未定義statusはHTTP400', async () => {
    const created = await createGoalViaApi(
      testContext.getRepository(),
      U_G01_POST_BODY,
    );

    const response = await putGoal(
      created.id,
      U_G10_INVALID_STATUS_PUT_BODY,
      testContext.getRepository(),
      TRAINEE_HEADERS,
    );

    expect(response.statusCode).toBe(400);
  });
});

describe('U-G11 新卒による目標作成', () => {
  const testContext = setupGoalFirestoreTests();

  it('postGoal_新卒が目標を作成しトレーナーでも同一目標を取得できる', async () => {
    const createResponse = await postGoal(
      U_G11_POST_BODY,
      testContext.getRepository(),
      TRAINEE_HEADERS,
    );

    expect([200, 201]).toContain(createResponse.statusCode);
    const created = createResponse.body as { id: string; traineeId: string };

    const trainerList = await getGoals(
      { traineeId: TRAINEE_USER_ID },
      testContext.getRepository(),
      TRAINER_HEADERS,
    );

    expect(trainerList.statusCode).toBe(200);
    expect(trainerList.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: created.id,
          traineeId: TRAINEE_USER_ID,
        }),
      ]),
    );
  });
});

describe('U-G12 新卒による目標削除', () => {
  const testContext = setupGoalFirestoreTests();

  it('deleteGoal_新卒はHTTP403', async () => {
    const created = await createGoalViaApi(
      testContext.getRepository(),
      U_G01_POST_BODY,
      TRAINEE_HEADERS,
    );

    const response = await deleteGoal(
      created.id,
      testContext.getRepository(),
      TRAINEE_HEADERS,
    );

    expect(response.statusCode).toBe(403);

    const stored = await readGoalDocumentById(testContext.getDb(), created.id);
    expect(stored).toBeDefined();
  });
});

describe('U-G13 未認証アクセス', () => {
  const testContext = setupGoalFirestoreTests();

  it('getGoals_未認証はHTTP401', async () => {
    const response = await getGoals(
      {},
      testContext.getRepository(),
      UNAUTHENTICATED_HEADERS,
    );

    expect(response.statusCode).toBe(401);
  });
});

describe('U-G14 他者目標の更新（新卒）', () => {
  const testContext = setupGoalFirestoreTests();

  it('putGoal_他者目標の更新はHTTP403または404', async () => {
    const otherGoal = await createGoalViaApi(
      testContext.getRepository(),
      {
        ...U_G01_POST_BODY,
        traineeId: OTHER_TRAINEE_USER_ID,
      },
      OTHER_TRAINEE_HEADERS,
    );

    const response = await putGoal(
      otherGoal.id,
      { progress: 50 },
      testContext.getRepository(),
      TRAINEE_HEADERS,
    );

    expect([403, 404]).toContain(response.statusCode);
  });
});

describe('U-G15 担当外新卒の一覧取得（トレーナー）', () => {
  const testContext = setupGoalFirestoreTests();

  it('getGoals_担当外新卒はHTTP403または空一覧', async () => {
    const response = await getGoals(
      { traineeId: OTHER_TRAINEE_USER_ID },
      testContext.getRepository(),
      TRAINER_HEADERS,
    );

    expectForbiddenOrEmptyGoalList(response);
  });
});

describe('U-G16 進捗率 0%', () => {
  const testContext = setupGoalFirestoreTests();

  it('putGoal_progress0はHTTP200', async () => {
    const created = await createGoalViaApi(
      testContext.getRepository(),
      U_G01_POST_BODY,
    );

    const response = await putGoal(
      created.id,
      { progress: U_G16_PROGRESS },
      testContext.getRepository(),
      TRAINEE_HEADERS,
    );

    expect(response.statusCode).toBe(200);
    expect((response.body as { progress: number }).progress).toBe(0);
  });
});

describe('U-G17 進捗率 100%', () => {
  const testContext = setupGoalFirestoreTests();

  it('putGoal_progress100はHTTP200', async () => {
    const created = await createGoalViaApi(
      testContext.getRepository(),
      U_G01_POST_BODY,
    );

    const response = await putGoal(
      created.id,
      { progress: U_G17_PROGRESS },
      testContext.getRepository(),
      TRAINEE_HEADERS,
    );

    expect(response.statusCode).toBe(200);
    expect((response.body as { progress: number }).progress).toBe(100);
  });
});

describe('U-G18 進捗率 -1（下限外）', () => {
  const testContext = setupGoalFirestoreTests();

  it('putGoal_progress-1はHTTP400', async () => {
    const created = await createGoalViaApi(
      testContext.getRepository(),
      U_G01_POST_BODY,
    );

    const response = await putGoal(
      created.id,
      { progress: U_G18_PROGRESS },
      testContext.getRepository(),
      TRAINEE_HEADERS,
    );

    expect(response.statusCode).toBe(400);
  });
});

describe('U-G19 進捗率 101（上限外）', () => {
  const testContext = setupGoalFirestoreTests();

  it('putGoal_progress101はHTTP400', async () => {
    const created = await createGoalViaApi(
      testContext.getRepository(),
      U_G01_POST_BODY,
    );

    const response = await putGoal(
      created.id,
      { progress: U_G19_PROGRESS },
      testContext.getRepository(),
      TRAINEE_HEADERS,
    );

    expect(response.statusCode).toBe(400);
  });
});

describe('U-G20 開始日と終了日が同一日', () => {
  const testContext = setupGoalFirestoreTests();

  it('postGoal_同一日目標はHTTP201で保存される', async () => {
    const response = await postGoal(
      U_G20_POST_BODY,
      testContext.getRepository(),
      TRAINER_HEADERS,
    );

    expect([200, 201]).toContain(response.statusCode);
    expect(response.body).toEqual(
      expect.objectContaining({
        startDate: U_G20_SAME_DAY,
        endDate: U_G20_SAME_DAY,
      }),
    );
  });
});

describe('U-G21 タイトル最大長ちょうど', () => {
  const testContext = setupGoalFirestoreTests();

  it('postGoal_タイトル最大長はHTTP201', async () => {
    const response = await postGoal(
      U_G21_POST_BODY,
      testContext.getRepository(),
      TRAINER_HEADERS,
    );

    expect([200, 201]).toContain(response.statusCode);
    expect((response.body as { title: string }).title).toBe(U_G21_TITLE);
  });
});

describe('U-G22 タイトル最大長超過', () => {
  const testContext = setupGoalFirestoreTests();

  it('postGoal_タイトル最大長超過はHTTP400', async () => {
    const response = await postGoal(
      U_G22_POST_BODY,
      testContext.getRepository(),
      TRAINER_HEADERS,
    );

    expect(response.statusCode).toBe(400);
  });
});

describe('I-G01 Firestore 永続化の往復', () => {
  const testContext = setupGoalFirestoreTests();

  it('postGoal_Firestoreに期待どおり保存される', async () => {
    const response = await postGoal(
      I_G01_POST_BODY,
      testContext.getRepository(),
      TRAINER_HEADERS,
    );

    expect([200, 201]).toContain(response.statusCode);
    const goalId = (response.body as { id: string }).id;
    const stored = await readGoalDocumentById(testContext.getDb(), goalId);

    expect(stored).toEqual(
      expect.objectContaining({
        traineeId: TRAINEE_USER_ID,
        title: U_G01_TITLE,
        startDate: U_G01_START_DATE,
        endDate: U_G01_END_DATE,
        progress: GOAL_INITIAL_PROGRESS,
        status: GOAL_INITIAL_STATUS,
      }),
    );
  });
});

describe('I-G02 更新 API と Firestore の整合', () => {
  const testContext = setupGoalFirestoreTests();

  it('putGoal_後のGETとFirestoreが一致する', async () => {
    const created = await createGoalViaApi(
      testContext.getRepository(),
      U_G01_POST_BODY,
    );

    await putGoal(
      created.id,
      { progress: I_G02_PROGRESS, status: GOAL_STATUS_IN_PROGRESS },
      testContext.getRepository(),
      TRAINEE_HEADERS,
    );

    const listResponse = await getGoals(
      { traineeId: TRAINEE_USER_ID },
      testContext.getRepository(),
      TRAINER_HEADERS,
    );
    const apiGoal = (listResponse.body as Array<{ id: string }>).find(
      (goal) => goal.id === created.id,
    );
    const stored = await readGoalDocumentById(testContext.getDb(), created.id);

    expectApiResponseMatchesStoredGoal(apiGoal, stored!);
  });
});

describe('I-G03 削除後の一覧整合', () => {
  const testContext = setupGoalFirestoreTests();

  it('deleteGoal_後の一覧に含まれない', async () => {
    const created = await createGoalViaApi(
      testContext.getRepository(),
      U_G01_POST_BODY,
    );

    await deleteGoal(created.id, testContext.getRepository(), TRAINER_HEADERS);

    const listResponse = await getGoals(
      { traineeId: TRAINEE_USER_ID },
      testContext.getRepository(),
      TRAINER_HEADERS,
    );

    expect(listResponse.body).toEqual([]);
  });
});

describe('I-G04 新卒更新値のトレーナー閲覧（API）', () => {
  const testContext = setupGoalFirestoreTests();

  it('getGoals_トレーナーが新卒の更新値を取得できる', async () => {
    const created = await createGoalViaApi(
      testContext.getRepository(),
      U_G01_POST_BODY,
    );

    await putGoal(
      created.id,
      { progress: U_G04_PROGRESS, status: GOAL_STATUS_IN_PROGRESS },
      testContext.getRepository(),
      TRAINEE_HEADERS,
    );

    const response = await getGoals(
      { traineeId: TRAINEE_USER_ID },
      testContext.getRepository(),
      TRAINER_HEADERS,
    );

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: created.id,
          progress: U_G04_PROGRESS,
          status: GOAL_STATUS_IN_PROGRESS,
        }),
      ]),
    );
  });
});

describe('I-G05 新卒作成の連動（トレーナー取得）', () => {
  const testContext = setupGoalFirestoreTests();

  it('getGoals_新卒作成目標がトレーナー一覧に含まれる', async () => {
    const createResponse = await postGoal(
      U_G11_POST_BODY,
      testContext.getRepository(),
      TRAINEE_HEADERS,
    );
    const created = createResponse.body as { id: string; title: string };

    const response = await getGoals(
      { traineeId: TRAINEE_USER_ID },
      testContext.getRepository(),
      TRAINER_HEADERS,
    );

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: created.id,
          title: created.title,
        }),
      ]),
    );
  });
});

describe('I-G06 トレーナー変更の連動（新卒取得）', () => {
  const testContext = setupGoalFirestoreTests();

  it('getGoals_新卒がトレーナーの変更を取得できる', async () => {
    const created = await createGoalViaApi(
      testContext.getRepository(),
      U_G01_POST_BODY,
    );

    await putGoal(
      created.id,
      {
        title: U_G05_UPDATED_TITLE,
        startDate: U_G05_UPDATED_START_DATE,
        endDate: U_G05_UPDATED_END_DATE,
      },
      testContext.getRepository(),
      TRAINER_HEADERS,
    );

    const response = await getGoals(
      {},
      testContext.getRepository(),
      TRAINEE_HEADERS,
    );

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: created.id,
          title: U_G05_UPDATED_TITLE,
          startDate: U_G05_UPDATED_START_DATE,
          endDate: U_G05_UPDATED_END_DATE,
        }),
      ]),
    );
  });
});
