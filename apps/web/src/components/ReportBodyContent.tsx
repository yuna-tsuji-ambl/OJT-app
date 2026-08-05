import { REPORT_TYPE_DAILY, type ReportResponse } from '../domain/reportForm';
import { DailyReportCardContent } from './DailyReportCardContent';
import { WeeklyReportCardContent } from './WeeklyReportCardContent';

interface ReportBodyContentProps {
  report: ReportResponse;
}

/** 報告種別（日次/週次）に応じた本文表示 */
export function ReportBodyContent({ report }: ReportBodyContentProps) {
  if (report.type === REPORT_TYPE_DAILY) {
    return <DailyReportCardContent content={report.content} />;
  }

  return <WeeklyReportCardContent content={report.content} />;
}
