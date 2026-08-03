import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Request, Response } from 'express';
import {
  resetAuthDependencies,
  setAuthDependencies,
} from '../auth/authDependencies.js';
import { ensureTrainer } from '../domain/authorization.js';
import { ForbiddenError, UnauthorizedError } from '../domain/errors.js';
import { readExpressUserContext } from '../http/expressUserContext.js';
import { handleGetMe } from '../routes/meRoutes.js';

const TRAINEE_UID = 'firebase-uid-trainee';
const TRAINER_UID = 'firebase-uid-trainer';
const VALID_TRAINEE_TOKEN = 'valid-trainee-token';
const VALID_TRAINER_TOKEN = 'valid-trainer-token';
const EXPIRED_TOKEN = 'expired-token';
const INVALID_TOKEN = 'invalid-token';

function createRequest(headers: Record<string, string>): Request {
  return {
    header(name: string): string | undefined {
      return headers[name.toLowerCase()];
    },
  } as Request;
}

async function invokeGetMe(
  headers: Record<string, string>,
): Promise<{ statusCode: number; body: unknown }> {
  let statusCode = 200;
  let body: unknown;
  const response = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(payload: unknown) {
      body = payload;
      return this;
    },
  } as Response;

  await handleGetMe(createRequest(headers), response);
  return { statusCode, body };
}

describe('F-10 auth (AUTH_MODE=firebase)', () => {
  const previousAuthMode = process.env.AUTH_MODE;

  beforeEach(() => {
    process.env.AUTH_MODE = 'firebase';
    setAuthDependencies({
      async verifyIdToken(idToken: string) {
        if (idToken === VALID_TRAINEE_TOKEN) {
          return { uid: TRAINEE_UID };
        }
        if (idToken === VALID_TRAINER_TOKEN) {
          return { uid: TRAINER_UID };
        }
        if (idToken === EXPIRED_TOKEN || idToken === INVALID_TOKEN) {
          throw new Error('invalid token');
        }
        throw new Error('unknown token');
      },
      async findAppUser(uid: string) {
        if (uid === TRAINEE_UID) {
          return { role: 'trainee' };
        }
        if (uid === TRAINER_UID) {
          return { role: 'trainer' };
        }
        return null;
      },
    });
  });

  afterEach(() => {
    resetAuthDependencies();
    if (previousAuthMode === undefined) {
      delete process.env.AUTH_MODE;
    } else {
      process.env.AUTH_MODE = previousAuthMode;
    }
  });

  it('U-A01: 有効トークン + 登録済ユーザーで UserContext を解決する', async () => {
    const context = await readExpressUserContext(
      createRequest({ authorization: `Bearer ${VALID_TRAINEE_TOKEN}` }),
    );
    expect(context).toEqual({ userId: TRAINEE_UID, role: 'trainee' });
  });

  it('U-A02: トレーナーロールを解決する', async () => {
    const context = await readExpressUserContext(
      createRequest({ authorization: `Bearer ${VALID_TRAINER_TOKEN}` }),
    );
    expect(context).toEqual({ userId: TRAINER_UID, role: 'trainer' });
  });

  it('U-A03: トークンなしは 401', async () => {
    await expect(
      readExpressUserContext(createRequest({})),
    ).rejects.toBeInstanceOf(UnauthorizedError);
    const result = await invokeGetMe({});
    expect(result.statusCode).toBe(401);
  });

  it('U-A04: users 未登録は 403', async () => {
    setAuthDependencies({
      async verifyIdToken() {
        return { uid: 'unregistered-uid' };
      },
      async findAppUser() {
        return null;
      },
    });

    await expect(
      readExpressUserContext(
        createRequest({ authorization: 'Bearer any-valid-looking' }),
      ),
    ).rejects.toBeInstanceOf(ForbiddenError);

    const result = await invokeGetMe({
      authorization: 'Bearer any-valid-looking',
    });
    expect(result.statusCode).toBe(403);
  });

  it('U-A05: 不正トークンは 401', async () => {
    await expect(
      readExpressUserContext(
        createRequest({ authorization: `Bearer ${INVALID_TOKEN}` }),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('U-A06: X-User-* のみは 401（ヘッダーは採用しない）', async () => {
    await expect(
      readExpressUserContext(
        createRequest({
          'x-user-id': 'trainee-1',
          'x-user-role': 'trainee',
        }),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('U-A07: 期限切れトークンは 401', async () => {
    await expect(
      readExpressUserContext(
        createRequest({ authorization: `Bearer ${EXPIRED_TOKEN}` }),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('U-A08 / U-A10: userId は Firebase UID（クライアント指定不可）', async () => {
    const context = await readExpressUserContext(
      createRequest({
        authorization: `Bearer ${VALID_TRAINEE_TOKEN}`,
        'x-user-id': 'spoofed-id',
        'x-user-role': 'trainer',
      }),
    );
    expect(context.userId).toBe(TRAINEE_UID);
    expect(context.role).toBe('trainee');
  });

  it('U-A09: ロール不一致操作は Forbidden', async () => {
    const context = await readExpressUserContext(
      createRequest({ authorization: `Bearer ${VALID_TRAINEE_TOKEN}` }),
    );
    expect(() => ensureTrainer(context)).toThrow(ForbiddenError);
  });

  it('U-A11: role は users 単一ソース（偽ヘッダー無視）', async () => {
    const context = await readExpressUserContext(
      createRequest({
        authorization: `Bearer ${VALID_TRAINEE_TOKEN}`,
        'x-user-role': 'trainer',
      }),
    );
    expect(context.role).toBe('trainee');
  });

  it('U-A12: /api/me は認証必須（ヘルスは別経路）', async () => {
    const ok = await invokeGetMe({
      authorization: `Bearer ${VALID_TRAINEE_TOKEN}`,
    });
    expect(ok.statusCode).toBe(200);
    expect(ok.body).toEqual({ userId: TRAINEE_UID, role: 'trainee' });
  });

  it('I-A01b: users 登録内容がコンテキストに反映される', async () => {
    setAuthDependencies({
      async verifyIdToken() {
        return { uid: 'uid-new' };
      },
      async findAppUser(uid: string) {
        if (uid === 'uid-new') {
          return { role: 'trainer' };
        }
        return null;
      },
    });

    const context = await readExpressUserContext(
      createRequest({ authorization: 'Bearer seeded-token' }),
    );
    expect(context).toEqual({ userId: 'uid-new', role: 'trainer' });
  });
});

describe('F-10 auth (AUTH_MODE=mock)', () => {
  const previousAuthMode = process.env.AUTH_MODE;

  beforeEach(() => {
    process.env.AUTH_MODE = 'mock';
    resetAuthDependencies();
  });

  afterEach(() => {
    if (previousAuthMode === undefined) {
      delete process.env.AUTH_MODE;
    } else {
      process.env.AUTH_MODE = previousAuthMode;
    }
  });

  it('U-A13: モックヘッダーで認可できる', async () => {
    const context = await readExpressUserContext(
      createRequest({
        'x-user-id': 'trainee-1',
        'x-user-role': 'trainee',
      }),
    );
    expect(context).toEqual({ userId: 'trainee-1', role: 'trainee' });
  });

  it('U-A14: モックでヘッダー欠落は 401', async () => {
    await expect(
      readExpressUserContext(createRequest({})),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });
});
