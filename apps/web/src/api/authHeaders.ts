import type { AuthUser } from '../auth/types';
import { resolveWebAuthMode } from '../auth/authMode';

export function createAuthHeaders(user: AuthUser): HeadersInit {
  if (resolveWebAuthMode() === 'firebase') {
    if (!user.idToken) {
      throw new Error('idToken is required when VITE_AUTH_MODE=firebase');
    }

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user.idToken}`,
    };
  }

  return {
    'Content-Type': 'application/json',
    'X-User-Id': user.userId,
    'X-User-Role': user.role,
  };
}

export async function fetchWithAuth(
  url: string,
  user: AuthUser,
  init: RequestInit = {},
): Promise<Response> {
  return fetch(url, {
    ...init,
    headers: {
      ...createAuthHeaders(user),
      ...init.headers,
    },
  });
}
