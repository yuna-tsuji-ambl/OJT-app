import { DailyReportDraftSaveButton } from './DailyReportDraftSaveButton';
import { ReportSubmitButton } from './ReportSubmitButton';

interface DailyReportActionsProps {
  onSaveDraft: () => void | Promise<void>;
  onSubmit: () => void | Promise<void>;
}

/** 日次報告の保存・提出アクション群 */
export function DailyReportActions({
  onSaveDraft,
  onSubmit,
}: DailyReportActionsProps) {
  return (
    <>
      <DailyReportDraftSaveButton onSave={onSaveDraft} />
      <ReportSubmitButton onSubmit={onSubmit} />
    </>
  );
}
