import type { ReactNode } from 'react';
import type { ReportPersistFeedback } from '../domain/reportForm';
import { ReportPersistFeedbackView } from './ReportPersistFeedback';
import { ReportPageShell } from './ReportPageShell';

interface TraineeOwnedReportPageLayoutProps {
  title: string;
  headingId: string;
  form: ReactNode;
  actions: ReactNode;
  pastList: ReactNode;
  persistFeedback: ReportPersistFeedback;
}

/** 新卒向け所有報告画面の共通レイアウト（フォーム・フィードバック・操作・過去一覧） */
export function TraineeOwnedReportPageLayout({
  title,
  headingId,
  form,
  actions,
  pastList,
  persistFeedback,
}: TraineeOwnedReportPageLayoutProps) {
  return (
    <ReportPageShell title={title} headingId={headingId}>
      {form}
      <ReportPersistFeedbackView feedback={persistFeedback} />
      {actions}
      {pastList}
    </ReportPageShell>
  );
}
