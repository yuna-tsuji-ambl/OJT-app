import type { ReportPersistFeedback } from '../domain/reportForm';

interface ReportPersistFeedbackProps {
  feedback: ReportPersistFeedback;
}

/** 報告書の永続化結果フィードバック（成功: status / 失敗: alert） */
export function ReportPersistFeedbackView({
  feedback,
}: ReportPersistFeedbackProps) {
  if (!feedback) {
    return null;
  }

  if (feedback.type === 'success') {
    return (
      <div role="status" aria-label={feedback.message}>
        {feedback.message}
      </div>
    );
  }

  return <div role="alert">{feedback.message}</div>;
}
