import { REPORT_SUBMIT_BUTTON_LABEL } from '../domain/reportForm';
import { ReportActionButton } from './ReportActionButton';

interface ReportSubmitButtonProps {
  onSubmit: () => void | Promise<unknown>;
}

/** 報告書の提出ボタン（日次・週次共通） */
export function ReportSubmitButton({ onSubmit }: ReportSubmitButtonProps) {
  return (
    <ReportActionButton
      label={REPORT_SUBMIT_BUTTON_LABEL}
      className="btn btn-primary"
      onAction={onSubmit}
    />
  );
}
