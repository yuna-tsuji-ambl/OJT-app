import { DAILY_REPORT_DRAFT_SAVE_BUTTON_LABEL } from '../domain/reportForm';
import { ReportActionButton } from './ReportActionButton';

interface DailyReportDraftSaveButtonProps {
  onSave: () => void | Promise<void>;
}

/** 日次報告の下書き保存ボタン（U-R30） */
export function DailyReportDraftSaveButton({
  onSave,
}: DailyReportDraftSaveButtonProps) {
  return (
    <ReportActionButton
      label={DAILY_REPORT_DRAFT_SAVE_BUTTON_LABEL}
      className="btn btn-secondary"
      onAction={onSave}
    />
  );
}
