import type { Request } from 'express';
import { toUserContext } from '../domain/userContext.js';
import type { UserContext, UserRole } from '../domain/types.js';

function parseRole(value: string | undefined): UserRole | null {
  if (value === 'trainee' || value === 'trainer') {
    return value;
  }

  return null;
}

export function readExpressUserContext(request: Request): UserContext {
  const userId = request.header('x-user-id');
  const role = parseRole(request.header('x-user-role') ?? undefined);

  if (!userId || !role) {
    throw new Error('Unauthorized');
  }

  return toUserContext(userId, role);
}
