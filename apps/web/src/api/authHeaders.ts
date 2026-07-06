import type { AuthUser } from '../auth/types';

export function createAuthHeaders(user: AuthUser): HeadersInit {
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
