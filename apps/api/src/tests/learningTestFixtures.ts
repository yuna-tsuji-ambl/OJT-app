import {
  LEARNING_BODY_MAX_LENGTH,
  LEARNING_LINKS_MAX_COUNT,
  LEARNING_TITLE_MAX_LENGTH,
} from '../learnings/learningConstants.js';
import type { LearningRepository } from '../repositories/learningRepository.js';
import { invokeLearningRoute } from './learningRouteTestHelpers.js';

export const TRAINEE_USER_ID = 'trainee-1';
export const TRAINER_USER_ID = 'trainer-1';
export const OTHER_TRAINEE_USER_ID = 'trainee-2';

export const U_L01_TITLE = 'TypeScript の型推論を学んだ';
export const U_L01_BODY = 'interface と type alias の使い分けを理解した';
export const U_L01_LINKS = [
  { url: 'https://www.typescriptlang.org/docs/', label: 'TypeScript 公式' },
];

export const U_L01_POST_BODY = {
  title: U_L01_TITLE,
  body: U_L01_BODY,
  links: U_L01_LINKS,
};

export const U_L04_LINKS = [
  { url: 'https://example.com/article', label: '参考記事' },
  { url: 'https://developer.mozilla.org/' },
];

export const U_L04_POST_BODY = {
  title: 'リンク付き投稿',
  body: '参考 URL を添付した学び',
  links: U_L04_LINKS,
};

export const U_L05_POST_BODY = {
  title: 'リンクなし投稿',
  body: 'リンクは空配列',
  links: [] as Array<{ url: string; label?: string }>,
};

export const U_L06_POST_BODY_A = {
  title: '著者Aの投稿',
  body: 'trainee-1 の学び',
  date: '2026-07-01',
};

export const U_L06_POST_BODY_B = {
  title: '著者Bの投稿',
  body: 'trainee-2 の学び',
  date: '2026-07-02',
};

export const U_L07_DATE_EARLY = '2026-06-01';
export const U_L07_DATE_MIDDLE = '2026-06-15';
export const U_L07_DATE_LATE = '2026-07-01';
export const U_L07_FROM = '2026-06-10';
export const U_L07_TO = '2026-06-20';

export const U_L07_POST_EARLY = {
  title: '期間外（早い）',
  body: 'from より前',
  date: U_L07_DATE_EARLY,
};

export const U_L07_POST_MIDDLE = {
  title: '期間内',
  body: 'from/to の間',
  date: U_L07_DATE_MIDDLE,
};

export const U_L07_POST_LATE = {
  title: '期間外（遅い）',
  body: 'to より後',
  date: U_L07_DATE_LATE,
};

export const U_L08_MISSING_TITLE_POST_BODY = {
  title: '',
  body: U_L01_BODY,
};

export const U_L09_MISSING_BODY_POST_BODY = {
  title: U_L01_TITLE,
  body: '',
};

export const U_L10_INVALID_URL_POST_BODY = {
  title: U_L01_TITLE,
  body: U_L01_BODY,
  links: [{ url: 'ftp://example.com/file' }],
};

export const U_L13_INVALID_DATE_POST_BODY = {
  title: U_L01_TITLE,
  body: U_L01_BODY,
  date: '2026-13-40',
};

export const U_L14_TITLE = 'a'.repeat(LEARNING_TITLE_MAX_LENGTH);
export const U_L14_POST_BODY = {
  title: U_L14_TITLE,
  body: U_L01_BODY,
};

export const U_L15_TITLE = 'a'.repeat(LEARNING_TITLE_MAX_LENGTH + 1);
export const U_L15_POST_BODY = {
  title: U_L15_TITLE,
  body: U_L01_BODY,
};

export const U_L16_BODY = 'a'.repeat(LEARNING_BODY_MAX_LENGTH);
export const U_L16_POST_BODY = {
  title: U_L01_TITLE,
  body: U_L16_BODY,
};

export const U_L17_BODY = 'a'.repeat(LEARNING_BODY_MAX_LENGTH + 1);
export const U_L17_POST_BODY = {
  title: U_L01_TITLE,
  body: U_L17_BODY,
};

export function createValidLinks(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    url: `https://example.com/link-${index + 1}`,
    label: `Link ${index + 1}`,
  }));
}

export const U_L18_POST_BODY = {
  title: U_L01_TITLE,
  body: U_L01_BODY,
  links: createValidLinks(LEARNING_LINKS_MAX_COUNT),
};

export const U_L19_POST_BODY = {
  title: U_L01_TITLE,
  body: U_L01_BODY,
  links: createValidLinks(LEARNING_LINKS_MAX_COUNT + 1),
};

export const U_L20_SAME_DATE = '2026-08-15';
export const U_L20_FIRST_POST_BODY = {
  title: '同日投稿1',
  body: '最初の投稿',
  date: U_L20_SAME_DATE,
};
export const U_L20_SECOND_POST_BODY = {
  title: '同日投稿2',
  body: '2件目の投稿',
  date: U_L20_SAME_DATE,
};

export const I_L01_POST_BODY = U_L01_POST_BODY;

export type LearningAuthHeaders = {
  'x-user-id': string;
  'x-user-role': string;
};

export function createTraineeHeaders(userId: string): LearningAuthHeaders {
  return {
    'x-user-id': userId,
    'x-user-role': 'trainee',
  };
}

export function createTrainerHeaders(userId: string): LearningAuthHeaders {
  return {
    'x-user-id': userId,
    'x-user-role': 'trainer',
  };
}

export const TRAINEE_HEADERS = createTraineeHeaders(TRAINEE_USER_ID);
export const OTHER_TRAINEE_HEADERS = createTraineeHeaders(
  OTHER_TRAINEE_USER_ID,
);
export const TRAINER_HEADERS = createTrainerHeaders(TRAINER_USER_ID);
export const UNAUTHENTICATED_HEADERS = {} as Record<string, string>;

export async function getLearnings(
  query: Record<string, string>,
  learningRepository: LearningRepository,
  headers: Record<string, string> = TRAINEE_HEADERS,
): Promise<{ statusCode: number; body: unknown }> {
  return invokeLearningRoute(learningRepository, {
    method: 'get',
    path: '/learnings',
    query,
    headers,
  });
}

export async function postLearning(
  body: unknown,
  learningRepository: LearningRepository,
  headers: Record<string, string> = TRAINEE_HEADERS,
): Promise<{ statusCode: number; body: unknown }> {
  return invokeLearningRoute(learningRepository, {
    method: 'post',
    path: '/learnings',
    body,
    headers,
  });
}

export {
  LEARNING_BODY_MAX_LENGTH,
  LEARNING_LINKS_MAX_COUNT,
  LEARNING_TITLE_MAX_LENGTH,
};
