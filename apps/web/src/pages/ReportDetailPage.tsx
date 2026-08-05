import { useParams } from 'react-router-dom';
import { ReportCommentForm } from '../components/ReportCommentForm';
import { ReportDetailView } from '../components/ReportDetailView';
import { ReportPageShell } from '../components/ReportPageShell';
import {
  REPORT_DETAIL_HEADING_ID,
  REPORT_DETAIL_PAGE_TITLE,
} from '../domain/reportForm';
import { useReportById } from '../hooks/useReportById';
import { useReportCommentEditing } from '../hooks/useReportCommentEditing';
import { useReportCommentSubmit } from '../hooks/useReportCommentSubmit';

/** 報告詳細（一覧からの選択 / GET /api/reports/:id · U-R36 / P-R01 / P-R02） */
export function ReportDetailPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const { report, reload } = useReportById(reportId);
  const { canManageComments, submitComment, updateComment } =
    useReportCommentSubmit({
      reportId: report?.id,
      reload,
    });
  const { editingCommentId, startEditComment, submitEditedComment, isEditing } =
    useReportCommentEditing({ updateComment });

  return (
    <ReportPageShell
      title={REPORT_DETAIL_PAGE_TITLE}
      headingId={REPORT_DETAIL_HEADING_ID}
    >
      {report ? (
        <ReportDetailView
          report={report}
          canEditComments={canManageComments}
          editingCommentId={editingCommentId}
          onStartEditComment={startEditComment}
          onUpdateComment={submitEditedComment}
        />
      ) : null}
      {canManageComments && !isEditing ? (
        <ReportCommentForm onSubmit={submitComment} />
      ) : null}
    </ReportPageShell>
  );
}
