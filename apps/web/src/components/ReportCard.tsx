import { Link } from 'react-router-dom';
import {
  formatReportPeriodKeyLabel,
  getReportEditButtonAriaLabel,
  REPORT_EDIT_BUTTON_LABEL,
  type ReportResponse,
} from '../domain/reportForm';
import { ReportBodyContent } from './ReportBodyContent';

interface ReportCardProps {
  report: ReportResponse;
  /** 指定時は見出しを詳細画面へのリンクにする（U-R36） */
  detailTo?: string;
  /** 指定時は「編集」ボタンを表示し、左フォームへ読み込む（一覧からの編集） */
  onEdit?: (report: ReportResponse) => void;
}

/** 報告サマリー表示（U-R32 / U-R33 / U-R35） */
export function ReportCard({ report, detailTo, onEdit }: ReportCardProps) {
  const periodLabel = formatReportPeriodKeyLabel(report.periodKey);

  return (
    <article aria-label={report.periodKey}>
      <h2>
        {detailTo ? (
          <Link to={detailTo} aria-label={report.periodKey}>
            {periodLabel}
          </Link>
        ) : (
          periodLabel
        )}
      </h2>
      <ReportBodyContent report={report} />
      {onEdit ? (
        <button
          type="button"
          className="btn btn-secondary"
          aria-label={getReportEditButtonAriaLabel(report.periodKey)}
          onClick={() => onEdit(report)}
        >
          {REPORT_EDIT_BUTTON_LABEL}
        </button>
      ) : null}
    </article>
  );
}
