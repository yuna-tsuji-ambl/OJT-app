import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { createAuthHeaders } from '../api/authHeaders';
import { AuthProvider, useAuth } from '../auth/AuthContext';
import { LoginPage } from '../pages/LoginPage';
import { clearAuthSession, setTraineeSession } from './reportAuthTestHelpers';

function AuthProbe() {
  const { user, authMode } = useAuth();
  return (
    <div>
      <span data-testid="auth-mode">{authMode}</span>
      <span data-testid="user-id">{user?.userId ?? 'none'}</span>
    </div>
  );
}

describe('F-10 web auth', () => {
  afterEach(() => {
    clearAuthSession();
    vi.unstubAllEnvs();
  });

  it('U-A15: firebase モードでは Bearer を付与する', () => {
    vi.stubEnv('VITE_AUTH_MODE', 'firebase');
    const headers = createAuthHeaders({
      userId: 'uid-1',
      role: 'trainee',
      idToken: 'test-id-token',
    }) as Record<string, string>;

    expect(headers.Authorization).toBe('Bearer test-id-token');
    expect(headers['X-User-Id']).toBeUndefined();
  });

  it('U-A16: ログアウトでセッションが消える', async () => {
    vi.stubEnv('VITE_AUTH_MODE', 'mock');
    setTraineeSession();

    function LogoutProbe() {
      const { user, logout } = useAuth();
      return (
        <div>
          <span data-testid="user-id">{user?.userId ?? 'none'}</span>
          <button type="button" onClick={() => void logout()}>
            ログアウト
          </button>
        </div>
      );
    }

    render(
      <MemoryRouter>
        <AuthProvider>
          <LogoutProbe />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('user-id').textContent).toBe('trainee-1');
    await act(async () => {
      screen.getByRole('button', { name: 'ログアウト' }).click();
    });
    await waitFor(() => {
      expect(screen.getByTestId('user-id').textContent).toBe('none');
    });
    expect(sessionStorage.getItem('ojt-auth-user')).toBeNull();
  });

  it('U-A17: 未ログイン相当ではセッションがない', () => {
    vi.stubEnv('VITE_AUTH_MODE', 'mock');
    clearAuthSession();
    render(
      <MemoryRouter>
        <AuthProvider>
          <AuthProbe />
        </AuthProvider>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('user-id').textContent).toBe('none');
  });

  it('U-A18: mock モードで従来のロール選択ログイン UI がある', () => {
    vi.stubEnv('VITE_AUTH_MODE', 'mock');
    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('button', { name: '新卒としてログイン' }),
    ).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'トレーナーとしてログイン' }),
    ).toBeTruthy();

    const headers = createAuthHeaders({
      userId: 'trainee-1',
      role: 'trainee',
    }) as Record<string, string>;
    expect(headers['X-User-Id']).toBe('trainee-1');
    expect(headers['X-User-Role']).toBe('trainee');
  });
});
