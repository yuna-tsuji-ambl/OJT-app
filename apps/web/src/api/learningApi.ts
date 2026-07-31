import type { AuthUser } from '../auth/types';
import type {
  CreateLearningInput,
  LearningPostResponse,
} from '../domain/learningForm';
import { fetchWithAuth } from './authHeaders';

const LEARNINGS_API_PATH = '/api/learnings';

export interface ListLearningsParams {
  readonly authorId?: string;
  readonly from?: string;
  readonly to?: string;
}

function buildLearningsListApiPath(params?: ListLearningsParams): string {
  if (!params) {
    return LEARNINGS_API_PATH;
  }

  const query = new URLSearchParams();
  if (params.authorId !== undefined) {
    query.set('authorId', params.authorId);
  }
  if (params.from !== undefined) {
    query.set('from', params.from);
  }
  if (params.to !== undefined) {
    query.set('to', params.to);
  }

  const queryString = query.toString();
  return queryString.length > 0
    ? `${LEARNINGS_API_PATH}?${queryString}`
    : LEARNINGS_API_PATH;
}

async function parseLearningError(
  response: Response,
  fallbackMessage: string,
): Promise<never> {
  const body: unknown = await response.json().catch(() => null);
  const apiError =
    typeof body === 'object' &&
    body !== null &&
    'error' in body &&
    typeof body.error === 'string'
      ? body.error
      : fallbackMessage;
  throw new Error(apiError);
}

/** 学びタイムラインを取得する（GET /api/learnings） */
export async function fetchLearnings(
  user: AuthUser,
  params?: ListLearningsParams,
): Promise<readonly LearningPostResponse[]> {
  const response = await fetchWithAuth(buildLearningsListApiPath(params), user);

  if (!response.ok) {
    return parseLearningError(response, 'Failed to fetch learnings');
  }

  return response.json() as Promise<readonly LearningPostResponse[]>;
}

/** 学びを投稿する（POST /api/learnings） */
export async function createLearningPost(
  input: CreateLearningInput,
  user: AuthUser,
): Promise<LearningPostResponse> {
  const response = await fetchWithAuth(LEARNINGS_API_PATH, user, {
    method: 'POST',
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    return parseLearningError(response, 'Failed to create learning post');
  }

  return response.json() as Promise<LearningPostResponse>;
}
