import {
  formatReportPeriodKeyLabel,
  type ReportResponse,
} from '../domain/reportForm';
import { ReportBodyContent } from './ReportBodyContent';
import { ReportCommentsSection } from './ReportCommentsSection';

interface ReportDetailViewProps {
  readonly report: ReportResponse;
  readonly canEditComments?: boolean;
  readonly editingCommentId?: string | null;
  readonly onStartEditComment?: (commentId: string) => void;
  readonly onUpdateComment?: (
    commentId: string,
    content: string,
  ) => Promise<void>;
}

/** 報告詳細の本文・コメント領域（U-R36 / P-R01 / P-R02） */
export function ReportDetailView({
  report,
  canEditComments = false,
  editingCommentId = null,
  onStartEditComment,
  onUpdateComment,
}: ReportDetailViewProps) {
  const periodLabel = formatReportPeriodKeyLabel(report.periodKey);

  return (
    <section aria-label={report.periodKey}>
      <h2>{periodLabel}</h2>
      <ReportBodyContent report={report} />
      <ReportCommentsSection
        comments={report.comments}
        canEditComments={canEditComments}
        editingCommentId={editingCommentId}
        onStartEditComment={onStartEditComment}
        onUpdateComment={onUpdateComment}
      />
    </section>
  );
}
