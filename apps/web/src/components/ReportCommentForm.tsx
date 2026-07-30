import {
  REPORT_COMMENT_FIELD_ID,
  REPORT_COMMENT_FIELD_LABEL,
  REPORT_COMMENT_SUBMIT_BUTTON_LABEL,
} from '../domain/reportForm';
import { ReportCommentTextForm } from './ReportCommentTextForm';

interface ReportCommentFormProps {
  readonly onSubmit: (content: string) => Promise<void>;
}

/** トレーナー向け報告コメント入力（UC-R05 / P-R01） */
export function ReportCommentForm({ onSubmit }: ReportCommentFormProps) {
  return (
    <ReportCommentTextForm
      fieldId={REPORT_COMMENT_FIELD_ID}
      fieldLabel={REPORT_COMMENT_FIELD_LABEL}
      submitButtonLabel={REPORT_COMMENT_SUBMIT_BUTTON_LABEL}
      clearOnSuccess
      formClassName="report-comment-form"
      onSubmit={onSubmit}
    />
  );
}
