import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { Request } from 'express';
import { readExpressUserContext } from '../http/expressUserContext.js';
import { handleGetMe } from '../routes/meRoutes.js';
import {
  ensureAuthEmulatorEnv,
  isAuthEmulatorReachable,
} from './authEmulatorEnv.js';
import {
  bootstrapFirebaseAuthForEmulator,
  clearEmulatorUsersCollection,
  createEmulatorAuthUser,
  resetFirebaseAdminApps,
} from './authEmulatorHelpers.js';

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
  };

  await handleGetMe(createRequest(headers), response as never);
  return { statusCode, body };
}

const emulatorAvailable = await isAuthEmulatorReachable();

describe.skipIf(!emulatorAvailable)('F-10 Auth Emulator 結合 (I-A01)', () => {
  beforeAll(async () => {
    ensureAuthEmulatorEnv();
    await bootstrapFirebaseAuthForEmulator();
  });

  beforeEach(async () => {
    ensureAuthEmulatorEnv();
    await clearEmulatorUsersCollection();
  });

  afterAll(async () => {
    await resetFirebaseAdminApps();
  });

  it('I-A01: Emulator ログイン → users 登録 → 保護 API が認可される', async () => {
    const email = `trainee-${Date.now()}@example.com`;
    const { uid, idToken } = await createEmulatorAuthUser({
      email,
      password: 'password123',
      role: 'trainee',
      displayName: 'Emulator Trainee',
    });

    const context = await readExpressUserContext(
      createRequest({ authorization: `Bearer ${idToken}` }),
    );
    expect(context).toEqual({ userId: uid, role: 'trainee' });

    const me = await invokeGetMe({
      authorization: `Bearer ${idToken}`,
    });
    expect(me.statusCode).toBe(200);
    expect(me.body).toEqual({ userId: uid, role: 'trainee' });
  });

  it('I-A01: トークン有効でも users 未登録なら 403', async () => {
    const email = `orphan-${Date.now()}@example.com`;
    const { uid, idToken } = await createEmulatorAuthUser({
      email,
      password: 'password123',
      role: 'trainee',
    });

    const { getFirestore } = await import('firebase-admin/firestore');
    const { FIRESTORE_COLLECTIONS } =
      await import('../firestore/collections.js');
    await getFirestore()
      .collection(FIRESTORE_COLLECTIONS.USERS)
      .doc(uid)
      .delete();

    const me = await invokeGetMe({
      authorization: `Bearer ${idToken}`,
    });
    expect(me.statusCode).toBe(403);
  });
});

describe.runIf(!emulatorAvailable)(
  'F-10 Auth Emulator 結合 (スキップ案内)',
  () => {
    it('Auth Emulator が未起動のため I-A01 をスキップ（npm run emulators:auth）', () => {
      expect(emulatorAvailable).toBe(false);
    });
  },
);
