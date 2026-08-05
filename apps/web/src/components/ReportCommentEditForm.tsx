import {
  REPORT_COMMENT_EDIT_FIELD_ID,
  REPORT_COMMENT_EDIT_FIELD_LABEL,
  REPORT_COMMENT_UPDATE_BUTTON_LABEL,
} from '../domain/reportForm';
import { ReportCommentTextForm } from './ReportCommentTextForm';

interface ReportCommentEditFormProps {
  readonly initialContent: string;
  readonly onSubmit: (content: string) => Promise<void>;
}

/** トレーナー向け報告コメント編集（UC-R05 / P-R02） */
export function ReportCommentEditForm({
  initialContent,
  onSubmit,
}: ReportCommentEditFormProps) {
  return (
    <ReportCommentTextForm
      fieldId={REPORT_COMMENT_EDIT_FIELD_ID}
      fieldLabel={REPORT_COMMENT_EDIT_FIELD_LABEL}
      submitButtonLabel={REPORT_COMMENT_UPDATE_BUTTON_LABEL}
      initialContent={initialContent}
      formClassName="report-comment-edit-form"
      onSubmit={onSubmit}
    />
  );
}
