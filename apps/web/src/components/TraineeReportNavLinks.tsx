import { TRAINEE_REPORT_NAV_LINKS } from '../domain/reportForm';
import { ReportNavLinks } from './ReportNavLinks';

/** 新卒ホーム向け報告書導線（§6.2） */
export function TraineeReportNavLinks() {
  return <ReportNavLinks links={TRAINEE_REPORT_NAV_LINKS} />;
}
