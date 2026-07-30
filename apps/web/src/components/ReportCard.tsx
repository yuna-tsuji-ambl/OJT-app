import { Link } from 'react-router-dom';
import type { ReportResponse } from '../domain/reportForm';
import { ReportBodyContent } from './ReportBodyContent';

interface ReportCardProps {
  report: ReportResponse;
  /** 指定時は見出しを詳細画面へのリンクにする（U-R36） */
  detailTo?: string;
}

/** 報告サマリー表示（U-R32 / U-R33 / U-R35） */
export function ReportCard({ report, detailTo }: ReportCardProps) {
  return (
    <article aria-label={report.periodKey}>
      <h2>
        {detailTo ? (
          <Link to={detailTo}>{report.periodKey}</Link>
        ) : (
          report.periodKey
        )}
      </h2>
      <ReportBodyContent report={report} />
    </article>
  );
}
