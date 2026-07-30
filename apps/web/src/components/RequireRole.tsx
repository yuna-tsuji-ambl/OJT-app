import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { isTraineeRole, isTrainerRole } from '../auth/roles';
import type { UserRole } from '../auth/types';
import { TRAINEE_HOME_PATH, TRAINER_DASHBOARD_PATH } from '../domain/appPaths';

interface RequireRoleProps {
  allowed: (role: UserRole) => boolean;
  fallbackPath: string;
  children: ReactNode;
}

/** ロール認可の共通ガード */
export function RequireRole({
  allowed,
  fallbackPath,
  children,
}: RequireRoleProps) {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  if (!allowed(user.role)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
}

/** 新卒専用画面のロールガード（U-R38） */
export function RequireTraineeRole({ children }: { children: ReactNode }) {
  return (
    <RequireRole allowed={isTraineeRole} fallbackPath={TRAINER_DASHBOARD_PATH}>
      {children}
    </RequireRole>
  );
}

/** トレーナー専用画面のロールガード（U-R37） */
export function RequireTrainerRole({ children }: { children: ReactNode }) {
  return (
    <RequireRole allowed={isTrainerRole} fallbackPath={TRAINEE_HOME_PATH}>
      {children}
    </RequireRole>
  );
}
