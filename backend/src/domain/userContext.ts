import type { UserContext, UserRole } from './types.js';

export function toUserContext(userId: string, role: UserRole): UserContext {
  return { userId, role };
}
