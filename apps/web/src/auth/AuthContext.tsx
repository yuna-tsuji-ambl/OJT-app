import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import type { AuthUser, UserRole } from './types';
import { resolveWebAuthMode } from './authMode';
import { getFirebaseAuth } from './firebaseClient';

interface AuthContextValue {
  user: AuthUser | null;
  authMode: 'mock' | 'firebase';
  login: (role: UserRole) => void;
  loginWithEmailPassword: (
    email: string,
    password: string,
  ) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const USER_IDS: Record<UserRole, string> = {
  trainee: 'trainee-1',
  trainer: 'trainer-1',
};

const AUTH_STORAGE_KEY = 'ojt-auth-user';

function readStoredUser(): AuthUser | null {
  const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as AuthUser;
  } catch {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

async function fetchMe(idToken: string): Promise<AuthUser> {
  const response = await fetch('/api/me', {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      response.status === 403
        ? 'App user not registered'
        : 'Failed to resolve app user',
    );
  }

  const body = (await response.json()) as { userId: string; role: UserRole };
  return { userId: body.userId, role: body.role, idToken };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const authMode = resolveWebAuthMode();
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());

  const login = useCallback((role: UserRole) => {
    if (resolveWebAuthMode() === 'firebase') {
      throw new Error(
        'Use loginWithEmailPassword when VITE_AUTH_MODE=firebase',
      );
    }

    const authUser = { userId: USER_IDS[role], role };
    setUser(authUser);
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
  }, []);

  const loginWithEmailPassword = useCallback(
    async (email: string, password: string): Promise<AuthUser> => {
      const credential = await signInWithEmailAndPassword(
        getFirebaseAuth(),
        email,
        password,
      );
      const idToken = await credential.user.getIdToken();
      const authUser = await fetchMe(idToken);
      setUser(authUser);
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
      return authUser;
    },
    [],
  );

  const logout = useCallback(async () => {
    if (resolveWebAuthMode() === 'firebase') {
      await signOut(getFirebaseAuth());
    }
    setUser(null);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({
      user,
      authMode,
      login,
      loginWithEmailPassword,
      logout,
    }),
    [authMode, login, loginWithEmailPassword, logout, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
