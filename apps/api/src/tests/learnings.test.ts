import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Firestore } from '@google-cloud/firestore';
import type { LearningRepository } from '../repositories/learningRepository.js';
import {
  I_L01_POST_BODY,
  OTHER_TRAINEE_HEADERS,
  TRAINEE_HEADERS,
  TRAINEE_USER_ID,
  TRAINER_HEADERS,
  U_L01_BODY,
  U_L01_LINKS,
  U_L01_POST_BODY,
  U_L01_TITLE,
  U_L04_LINKS,
  U_L04_POST_BODY,
  U_L05_POST_BODY,
  U_L06_POST_BODY_A,
  U_L06_POST_BODY_B,
  U_L07_FROM,
  U_L07_POST_EARLY,
  U_L07_POST_LATE,
  U_L07_POST_MIDDLE,
  U_L07_TO,
  U_L08_MISSING_TITLE_POST_BODY,
  U_L09_MISSING_BODY_POST_BODY,
  U_L10_INVALID_URL_POST_BODY,
  U_L13_INVALID_DATE_POST_BODY,
  U_L14_POST_BODY,
  U_L14_TITLE,
  U_L15_POST_BODY,
  U_L16_BODY,
  U_L16_POST_BODY,
  U_L17_POST_BODY,
  U_L18_POST_BODY,
  U_L19_POST_BODY,
  U_L20_FIRST_POST_BODY,
  U_L20_SAME_DATE,
  U_L20_SECOND_POST_BODY,
  UNAUTHENTICATED_HEADERS,
  getLearnings,
  postLearning,
} from './learningTestFixtures.js';
import {
  clearLearningPostsCollection,
  createLearningFirestoreTestContext,
  expectApiResponseMatchesStoredLearningPost,
  expectLearningPostPersistedInFirestore,
  expectLearningsSortedByDateDesc,
  findLearningPostsInFirestore,
  readLearningPostDocumentById,
  resetLearningFirestoreTestContext,
} from './learningFirestoreTestHelpers.js';

function setupLearningFirestoreTests() {
  let db: Firestore;
  let repository: LearningRepository;

  beforeEach(async () => {
    ({ db, repository } = createLearningFirestoreTestContext());
    await clearLearningPostsCollection(db);
  });

  afterEach(() => {
    resetLearningFirestoreTestContext();
  });

  return {
    getDb: () => db,
    getRepository: () => repository,
  };
}

async function createLearningViaApi(
  repository: LearningRepository,
  body: unknown,
  headers = TRAINEE_HEADERS,
) {
  const response = await postLearning(body, repository, headers);
  expect(response.statusCode).toBe(201);
  return response.body as {
    id: string;
    authorId: string;
    createdAt: string;
    updatedAt: string;
  };
}

describe('U-L01 新卒による学び投稿', () => {
  const testContext = setupLearningFirestoreTests();

  it('postLearning_新卒が学びを投稿_HTTP201かつFirestoreに保存される', async () => {
    const response = await postLearning(
      U_L01_POST_BODY,
      testContext.getRepository(),
      TRAINEE_HEADERS,
    );

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        authorId: TRAINEE_USER_ID,
        title: U_L01_TITLE,
        body: U_L01_BODY,
        links: U_L01_LINKS,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }),
    );

    const learningPostId = (response.body as { id: string }).id;
    const stored = await readLearningPostDocumentById(
      testContext.getDb(),
      learningPostId,
    );
    expect(stored).toBeDefined();
    expectLearningPostPersistedInFirestore(stored!, {
      authorId: TRAINEE_USER_ID,
      title: U_L01_TITLE,
      body: U_L01_BODY,
      links: U_L01_LINKS,
    });
  });
});

describe('U-L02 タイムライン取得（新卒）', () => {
  const testContext = setupLearningFirestoreTests();

  it('getLearnings_新卒がタイムラインを取得_HTTP200かつdate降順', async () => {
    await postLearning(
      { ...U_L01_POST_BODY, date: '2026-07-02' },
      testContext.getRepository(),
      TRAINEE_HEADERS,
    );
    await postLearning(
      { ...U_L01_POST_BODY, title: '古い投稿', date: '2026-07-01' },
      testContext.getRepository(),
      TRAINEE_HEADERS,
    );

    const response = await getLearnings(
      {},
      testContext.getRepository(),
      TRAINEE_HEADERS,
    );

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect((response.body as unknown[]).length).toBeGreaterThanOrEqual(1);
    expectLearningsSortedByDateDesc(
      response.body as Array<{ date: string; createdAt: string }>,
    );
  });
});

describe('U-L03 タイムライン取得（トレーナー）', () => {
  const testContext = setupLearningFirestoreTests();

  it('getLearnings_トレーナーがタイムラインを取得_HTTP200', async () => {
    await postLearning(
      U_L01_POST_BODY,
      testContext.getRepository(),
      TRAINEE_HEADERS,
    );

    const response = await getLearnings(
      {},
      testContext.getRepository(),
      TRAINER_HEADERS,
    );

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect((response.body as unknown[]).length).toBeGreaterThanOrEqual(1);
  });
});

describe('U-L04 リンク付き投稿', () => {
  const testContext = setupLearningFirestoreTests();

  it('postLearning_有効URL付きリンクを保存_HTTP201', async () => {
    const response = await postLearning(
      U_L04_POST_BODY,
      testContext.getRepository(),
      TRAINEE_HEADERS,
    );

    expect(response.statusCode).toBe(201);
    expect((response.body as { links: unknown[] }).links).toEqual(U_L04_LINKS);
  });
});

describe('U-L05 リンクなし投稿', () => {
  const testContext = setupLearningFirestoreTests();

  it('postLearning_links空配列はHTTP201', async () => {
    const response = await postLearning(
      U_L05_POST_BODY,
      testContext.getRepository(),
      TRAINEE_HEADERS,
    );

    expect(response.statusCode).toBe(201);
    expect((response.body as { links: unknown[] }).links).toEqual([]);
  });

  it('postLearning_links省略はHTTP201で空配列', async () => {
    const response = await postLearning(
      { title: U_L01_TITLE, body: U_L01_BODY },
      testContext.getRepository(),
      TRAINEE_HEADERS,
    );

    expect(response.statusCode).toBe(201);
    expect((response.body as { links: unknown[] }).links).toEqual([]);
  });
});

describe('U-L06 authorId フィルタ', () => {
  const testContext = setupLearningFirestoreTests();

  it('getLearnings_authorId指定で当該著者のみ取得', async () => {
    await postLearning(
      U_L06_POST_BODY_A,
      testContext.getRepository(),
      TRAINEE_HEADERS,
    );
    await postLearning(
      U_L06_POST_BODY_B,
      testContext.getRepository(),
      OTHER_TRAINEE_HEADERS,
    );

    const response = await getLearnings(
      { authorId: TRAINEE_USER_ID },
      testContext.getRepository(),
      TRAINER_HEADERS,
    );

    expect(response.statusCode).toBe(200);
    const posts = response.body as Array<{ authorId: string }>;
    expect(posts.length).toBe(1);
    expect(posts[0]?.authorId).toBe(TRAINEE_USER_ID);
  });
});

describe('U-L07 期間フィルタ from/to', () => {
  const testContext = setupLearningFirestoreTests();

  it('getLearnings_from/toで期間内のみ取得', async () => {
    await postLearning(
      U_L07_POST_EARLY,
      testContext.getRepository(),
      TRAINEE_HEADERS,
    );
    await postLearning(
      U_L07_POST_MIDDLE,
      testContext.getRepository(),
      TRAINEE_HEADERS,
    );
    await postLearning(
      U_L07_POST_LATE,
      testContext.getRepository(),
      TRAINEE_HEADERS,
    );

    const response = await getLearnings(
      { from: U_L07_FROM, to: U_L07_TO },
      testContext.getRepository(),
      TRAINEE_HEADERS,
    );

    expect(response.statusCode).toBe(200);
    const posts = response.body as Array<{ title: string; date: string }>;
    expect(posts).toHaveLength(1);
    expect(posts[0]?.title).toBe(U_L07_POST_MIDDLE.title);
    expect(posts[0]?.date).toBe(U_L07_POST_MIDDLE.date);
  });
});

describe('U-L08 必須欠落（title）', () => {
  const testContext = setupLearningFirestoreTests();

  it('postLearning_title空はHTTP400', async () => {
    const response = await postLearning(
      U_L08_MISSING_TITLE_POST_BODY,
      testContext.getRepository(),
      TRAINEE_HEADERS,
    );

    expect(response.statusCode).toBe(400);
    const posts = await findLearningPostsInFirestore(testContext.getDb());
    expect(posts).toHaveLength(0);
  });
});

describe('U-L09 必須欠落（body）', () => {
  const testContext = setupLearningFirestoreTests();

  it('postLearning_body空はHTTP400', async () => {
    const response = await postLearning(
      U_L09_MISSING_BODY_POST_BODY,
      testContext.getRepository(),
      TRAINEE_HEADERS,
    );

    expect(response.statusCode).toBe(400);
    const posts = await findLearningPostsInFirestore(testContext.getDb());
    expect(posts).toHaveLength(0);
  });
});

describe('U-L10 不正 URL', () => {
  const testContext = setupLearningFirestoreTests();

  it('postLearning_http(s)以外のURLはHTTP400', async () => {
    const response = await postLearning(
      U_L10_INVALID_URL_POST_BODY,
      testContext.getRepository(),
      TRAINEE_HEADERS,
    );

    expect(response.statusCode).toBe(400);
  });
});

describe('U-L11 トレーナーによる投稿', () => {
  const testContext = setupLearningFirestoreTests();

  it('postLearning_トレーナーはHTTP403', async () => {
    const response = await postLearning(
      U_L01_POST_BODY,
      testContext.getRepository(),
      TRAINER_HEADERS,
    );

    expect(response.statusCode).toBe(403);
  });
});

describe('U-L12 未認証', () => {
  const testContext = setupLearningFirestoreTests();

  it('getLearnings_未認証はHTTP401', async () => {
    const response = await getLearnings(
      {},
      testContext.getRepository(),
      UNAUTHENTICATED_HEADERS,
    );

    expect(response.statusCode).toBe(401);
  });

  it('postLearning_未認証はHTTP401', async () => {
    const response = await postLearning(
      U_L01_POST_BODY,
      testContext.getRepository(),
      UNAUTHENTICATED_HEADERS,
    );

    expect(response.statusCode).toBe(401);
  });
});

describe('U-L13 不正な日付形式', () => {
  const testContext = setupLearningFirestoreTests();

  it('postLearning_不正日付はHTTP400', async () => {
    const response = await postLearning(
      U_L13_INVALID_DATE_POST_BODY,
      testContext.getRepository(),
      TRAINEE_HEADERS,
    );

    expect(response.statusCode).toBe(400);
  });
});

describe('U-L14 title 最大長ちょうど', () => {
  const testContext = setupLearningFirestoreTests();

  it('postLearning_title100文字はHTTP201', async () => {
    const response = await postLearning(
      U_L14_POST_BODY,
      testContext.getRepository(),
      TRAINEE_HEADERS,
    );

    expect(response.statusCode).toBe(201);
    expect((response.body as { title: string }).title).toBe(U_L14_TITLE);
  });
});

describe('U-L15 title 最大長超過', () => {
  const testContext = setupLearningFirestoreTests();

  it('postLearning_title101文字はHTTP400', async () => {
    const response = await postLearning(
      U_L15_POST_BODY,
      testContext.getRepository(),
      TRAINEE_HEADERS,
    );

    expect(response.statusCode).toBe(400);
  });
});

describe('U-L16 body 最大長ちょうど', () => {
  const testContext = setupLearningFirestoreTests();

  it('postLearning_body2000文字はHTTP201', async () => {
    const response = await postLearning(
      U_L16_POST_BODY,
      testContext.getRepository(),
      TRAINEE_HEADERS,
    );

    expect(response.statusCode).toBe(201);
    expect((response.body as { body: string }).body).toBe(U_L16_BODY);
  });
});

describe('U-L17 body 最大長超過', () => {
  const testContext = setupLearningFirestoreTests();

  it('postLearning_body2001文字はHTTP400', async () => {
    const response = await postLearning(
      U_L17_POST_BODY,
      testContext.getRepository(),
      TRAINEE_HEADERS,
    );

    expect(response.statusCode).toBe(400);
  });
});

describe('U-L18 links 最大件数ちょうど', () => {
  const testContext = setupLearningFirestoreTests();

  it('postLearning_links10件はHTTP201', async () => {
    const response = await postLearning(
      U_L18_POST_BODY,
      testContext.getRepository(),
      TRAINEE_HEADERS,
    );

    expect(response.statusCode).toBe(201);
    expect((response.body as { links: unknown[] }).links).toHaveLength(10);
  });
});

describe('U-L19 links 最大件数超過', () => {
  const testContext = setupLearningFirestoreTests();

  it('postLearning_links11件はHTTP400', async () => {
    const response = await postLearning(
      U_L19_POST_BODY,
      testContext.getRepository(),
      TRAINEE_HEADERS,
    );

    expect(response.statusCode).toBe(400);
  });
});

describe('U-L20 同一日の複数投稿', () => {
  const testContext = setupLearningFirestoreTests();

  it('postLearning_同日に2件投稿でき両方取得できる', async () => {
    await postLearning(
      U_L20_FIRST_POST_BODY,
      testContext.getRepository(),
      TRAINEE_HEADERS,
    );

    const secondResponse = await postLearning(
      U_L20_SECOND_POST_BODY,
      testContext.getRepository(),
      TRAINEE_HEADERS,
    );

    expect(secondResponse.statusCode).toBe(201);

    const listResponse = await getLearnings(
      {},
      testContext.getRepository(),
      TRAINEE_HEADERS,
    );

    const sameDayPosts = (listResponse.body as Array<{ date: string }>).filter(
      (post) => post.date === U_L20_SAME_DATE,
    );
    expect(sameDayPosts).toHaveLength(2);
  });
});

describe('I-L01 Firestore 永続化の往復', () => {
  const testContext = setupLearningFirestoreTests();

  it('postLearning_Firestoreに期待どおり保存される', async () => {
    const response = await postLearning(
      I_L01_POST_BODY,
      testContext.getRepository(),
      TRAINEE_HEADERS,
    );

    expect(response.statusCode).toBe(201);
    const learningPostId = (response.body as { id: string }).id;
    const stored = await readLearningPostDocumentById(
      testContext.getDb(),
      learningPostId,
    );

    expect(stored).toEqual(
      expect.objectContaining({
        authorId: TRAINEE_USER_ID,
        title: U_L01_TITLE,
        body: U_L01_BODY,
        links: U_L01_LINKS,
      }),
    );
  });
});

describe('I-L02 一覧と Firestore の整合', () => {
  const testContext = setupLearningFirestoreTests();

  it('getLearnings_Firestore上の件数・順序と一致する', async () => {
    await createLearningViaApi(testContext.getRepository(), {
      ...U_L01_POST_BODY,
      date: '2026-07-01',
    });
    const second = await createLearningViaApi(testContext.getRepository(), {
      ...U_L01_POST_BODY,
      title: '新しい投稿',
      date: '2026-07-02',
    });

    const listResponse = await getLearnings(
      {},
      testContext.getRepository(),
      TRAINER_HEADERS,
    );
    const firestorePosts = await findLearningPostsInFirestore(
      testContext.getDb(),
    );

    expect((listResponse.body as unknown[]).length).toBe(firestorePosts.length);
    expectLearningsSortedByDateDesc(
      listResponse.body as Array<{ date: string; createdAt: string }>,
    );

    const apiPost = (listResponse.body as Array<{ id: string }>).find(
      (post) => post.id === second.id,
    );
    const stored = await readLearningPostDocumentById(
      testContext.getDb(),
      second.id,
    );

    expectApiResponseMatchesStoredLearningPost(apiPost, stored!);
  });
});
