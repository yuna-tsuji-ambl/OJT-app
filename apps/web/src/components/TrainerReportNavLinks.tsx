import { TRAINER_REPORT_NAV_LINKS } from '../domain/reportForm';
import { ReportNavLinks } from './ReportNavLinks';

/** トレーナーダッシュボード向け報告書導線（§6.2） */
export function TrainerReportNavLinks() {
  return <ReportNavLinks links={TRAINER_REPORT_NAV_LINKS} />;
}
