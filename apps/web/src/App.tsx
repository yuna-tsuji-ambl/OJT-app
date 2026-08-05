import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { Layout } from './components/Layout';
import { AssignmentListPage } from './pages/AssignmentListPage';
import { AssignmentManagePage } from './pages/AssignmentManagePage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import {
  DAILY_REPORT_LIST_PATH,
  DAILY_REPORT_PATH,
  REPORT_DETAIL_ROUTE_PATH,
  REPORT_PAGE_PATH,
  WEEKLY_REPORT_LIST_PATH,
  WEEKLY_REPORT_PATH,
} from './domain/reportForm';
import { DailyReportListPage } from './pages/DailyReportListPage';
import { ReportDetailPage } from './pages/ReportDetailPage';
import { ReportsRoutePage } from './pages/ReportsRoutePage';
import { TraineeHomePage } from './pages/TraineeHomePage';
import { TrainerConditionPage } from './pages/TrainerConditionPage';
import { TrainerMessagesPage } from './pages/TrainerMessagesPage';
import { TrainerStatusSettingsPage } from './pages/TrainerStatusSettingsPage';
import { TraineeDetailPage } from './pages/TraineeDetailPage';
import { WeeklyConditionPage } from './pages/WeeklyConditionPage';
import { WeeklyReportListPage } from './pages/WeeklyReportListPage';
import { GOAL_GANTT_PATH, GOAL_MANAGE_PATH } from './domain/goalForm';
import {
  LEARNING_CREATE_PATH,
  LEARNING_FEED_PATH,
} from './domain/learningForm';
import { GoalGanttPage } from './pages/GoalGanttPage';
import { GoalManagePage } from './pages/GoalManagePage';
import { LearningCreatePage } from './pages/LearningCreatePage';
import { LearningFeedPage } from './pages/LearningFeedPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<Layout />}>
            <Route path="/condition/weekly" element={<WeeklyConditionPage />} />
            <Route path="/home" element={<TraineeHomePage />} />
            <Route
              path={DAILY_REPORT_PATH}
              element={<Navigate to={REPORT_PAGE_PATH} replace />}
            />
            <Route
              path={WEEKLY_REPORT_PATH}
              element={<Navigate to={REPORT_PAGE_PATH} replace />}
            />
            <Route
              path={DAILY_REPORT_LIST_PATH}
              element={<DailyReportListPage />}
            />
            <Route
              path={WEEKLY_REPORT_LIST_PATH}
              element={<WeeklyReportListPage />}
            />
            <Route
              path={REPORT_DETAIL_ROUTE_PATH}
              element={<ReportDetailPage />}
            />
            <Route path={REPORT_PAGE_PATH} element={<ReportsRoutePage />} />
            <Route path={GOAL_GANTT_PATH} element={<GoalGanttPage />} />
            <Route path={GOAL_MANAGE_PATH} element={<GoalManagePage />} />
            <Route path={LEARNING_FEED_PATH} element={<LearningFeedPage />} />
            <Route
              path={LEARNING_CREATE_PATH}
              element={<LearningCreatePage />}
            />
            <Route path="/assignments" element={<AssignmentListPage />} />
            <Route
              path="/assignments/manage"
              element={<AssignmentManagePage />}
            />
            <Route
              path="/quests"
              element={<Navigate to="/assignments" replace />}
            />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/condition" element={<TrainerConditionPage />} />
            <Route
              path="/status/settings"
              element={<TrainerStatusSettingsPage />}
            />
            <Route path="/messages" element={<TrainerMessagesPage />} />
            <Route
              path="/trainees/:traineeId"
              element={<TraineeDetailPage />}
            />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
