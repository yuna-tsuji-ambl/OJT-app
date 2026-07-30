import {
  DAILY_REPORT_FORM_FIELDS,
  type DailyReportFormValues,
} from '../domain/reportForm';
import { ReportCardContent } from './ReportCardContent';

interface DailyReportCardContentProps {
  content: DailyReportFormValues;
}

/** 日次報告カード内の本文 */
export function DailyReportCardContent({
  content,
}: DailyReportCardContentProps) {
  return (
    <ReportCardContent fields={DAILY_REPORT_FORM_FIELDS} content={content} />
  );
}
