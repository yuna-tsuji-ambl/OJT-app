import type { ReactNode } from 'react';
import { useAuth } from '../auth/AuthContext';

interface ReportPageShellProps {
  title: string;
  headingId: string;
  children?: ReactNode;
}

/** 報告書画面の共通シェル（認証ガード + 見出し） */
export function ReportPageShell({
  title,
  headingId,
  children,
}: ReportPageShellProps) {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <section className="page-section" aria-labelledby={headingId}>
      <h1 id={headingId}>{title}</h1>
      {children}
    </section>
  );
}
