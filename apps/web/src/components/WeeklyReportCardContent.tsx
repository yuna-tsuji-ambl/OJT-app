import {
  WEEKLY_REPORT_FORM_FIELDS,
  type WeeklyReportFormValues,
} from '../domain/reportForm';
import { ReportCardContent } from './ReportCardContent';

interface WeeklyReportCardContentProps {
  content: WeeklyReportFormValues;
}

/** 週次報告カード内の本文 */
export function WeeklyReportCardContent({
  content,
}: WeeklyReportCardContentProps) {
  return (
    <ReportCardContent fields={WEEKLY_REPORT_FORM_FIELDS} content={content} />
  );
}
