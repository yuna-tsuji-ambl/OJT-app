import { useAuth } from '../auth/AuthContext';
import { isTraineeRole } from '../auth/roles';
import { ReportListPage } from './ReportListPage';
import { TraineeReportPage } from './TraineeReportPage';

/** `/reports` のロール別表示（新卒: 入力 / トレーナー: 一覧） */
export function ReportsRoutePage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  if (isTraineeRole(user.role)) {
    return <TraineeReportPage />;
  }

  return <ReportListPage />;
}
