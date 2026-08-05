const AUTH_STORAGE_KEY = 'ojt-auth-user';

export type TestAuthRole = 'trainee' | 'trainer';

function setAuthSession(userId: string, role: TestAuthRole): void {
  sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ userId, role }));
}

export function setTraineeSession(): void {
  setAuthSession('trainee-1', 'trainee');
}

export function setTrainerSession(): void {
  setAuthSession('trainer-1', 'trainer');
}

export function clearAuthSession(): void {
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
}
