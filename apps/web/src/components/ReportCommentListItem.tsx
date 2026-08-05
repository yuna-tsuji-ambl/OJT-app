import {
  REPORT_COMMENT_EDIT_BUTTON_LABEL,
  type ReportCommentResponse,
} from '../domain/reportForm';
import { ReportCommentEditForm } from './ReportCommentEditForm';

interface ReportCommentListItemProps {
  readonly comment: ReportCommentResponse;
  readonly canEdit: boolean;
  readonly isEditing: boolean;
  readonly onStartEdit?: (commentId: string) => void;
  readonly onUpdate?: (commentId: string, content: string) => Promise<void>;
}

/** コメント 1 件の表示 / 編集切替（UC-R05） */
export function ReportCommentListItem({
  comment,
  canEdit,
  isEditing,
  onStartEdit,
  onUpdate,
}: ReportCommentListItemProps) {
  if (isEditing && onUpdate) {
    return (
      <li>
        <ReportCommentEditForm
          initialContent={comment.content}
          onSubmit={(content) => onUpdate(comment.id, content)}
        />
      </li>
    );
  }

  return (
    <li>
      {comment.content}
      {canEdit && onStartEdit ? (
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => onStartEdit(comment.id)}
        >
          {REPORT_COMMENT_EDIT_BUTTON_LABEL}
        </button>
      ) : null}
    </li>
  );
}
