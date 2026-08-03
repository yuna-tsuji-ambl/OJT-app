import type { Request } from 'express';
import { ForbiddenError, UnauthorizedError } from '../domain/errors.js';
import { toUserContext } from '../domain/userContext.js';
import type { UserContext, UserRole } from '../domain/types.js';
import { getAuthDependencies } from '../auth/authDependencies.js';
import { resolveAuthMode } from '../auth/authMode.js';

function parseRole(value: string | undefined): UserRole | null {
  if (value === 'trainee' || value === 'trainer') {
    return value;
  }

  return null;
}

function readBearerToken(request: Request): string | null {
  const authorization = request.header('authorization');
  if (!authorization) {
    return null;
  }

  const match = /^Bearer\s+(.+)$/i.exec(authorization.trim());
  return match?.[1]?.trim() || null;
}

async function readFirebaseUserContext(request: Request): Promise<UserContext> {
  const idToken = readBearerToken(request);
  if (!idToken) {
    throw new UnauthorizedError();
  }

  let uid: string;
  try {
    const verified = await getAuthDependencies().verifyIdToken(idToken);
    uid = verified.uid;
  } catch {
    throw new UnauthorizedError();
  }

  const appUser = await getAuthDependencies().findAppUser(uid);
  if (!appUser) {
    throw new ForbiddenError('App user not registered');
  }

  return toUserContext(uid, appUser.role);
}

function readMockUserContext(request: Request): UserContext {
  const userId = request.header('x-user-id');
  const role = parseRole(request.header('x-user-role') ?? undefined);

  if (!userId || !role) {
    throw new UnauthorizedError();
  }

  return toUserContext(userId, role);
}

export async function readExpressUserContext(
  request: Request,
): Promise<UserContext> {
  if (resolveAuthMode() === 'firebase') {
    return readFirebaseUserContext(request);
  }

  return readMockUserContext(request);
}
