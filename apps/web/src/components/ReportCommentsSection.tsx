import {
  REPORT_COMMENT_SECTION_LABEL,
  REPORT_COMMENTS_HEADING_ID,
  type ReportCommentResponse,
} from '../domain/reportForm';
import { ReportCommentListItem } from './ReportCommentListItem';

const EMPTY_REPORT_COMMENTS: readonly ReportCommentResponse[] = [];

interface ReportCommentsSectionProps {
  readonly comments?: readonly ReportCommentResponse[];
  readonly canEditComments?: boolean;
  readonly editingCommentId?: string | null;
  readonly onStartEditComment?: (commentId: string) => void;
  readonly onUpdateComment?: (
    commentId: string,
    content: string,
  ) => Promise<void>;
}

/** 報告詳細のトレーナーコメント一覧（UC-R05 / P-R01 / P-R02） */
export function ReportCommentsSection({
  comments = EMPTY_REPORT_COMMENTS,
  canEditComments = false,
  editingCommentId = null,
  onStartEditComment,
  onUpdateComment,
}: ReportCommentsSectionProps) {
  return (
    <section
      className="report-comments"
      aria-labelledby={REPORT_COMMENTS_HEADING_ID}
    >
      <h3 id={REPORT_COMMENTS_HEADING_ID}>{REPORT_COMMENT_SECTION_LABEL}</h3>
      {comments.length === 0 ? null : (
        <ul>
          {comments.map((comment) => (
            <ReportCommentListItem
              key={comment.id}
              comment={comment}
              canEdit={canEditComments}
              isEditing={editingCommentId === comment.id}
              onStartEdit={onStartEditComment}
              onUpdate={onUpdateComment}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
