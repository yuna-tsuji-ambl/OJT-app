import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { QuestListPage } from './pages/QuestListPage';
import { TraineeHomePage } from './pages/TraineeHomePage';
import { TrainerMessagesPage } from './pages/TrainerMessagesPage';
import { TrainerStatusSettingsPage } from './pages/TrainerStatusSettingsPage';
import { TraineeDetailPage } from './pages/TraineeDetailPage';
import { WeeklyConditionPage } from './pages/WeeklyConditionPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<Layout />}>
            <Route path="/condition/weekly" element={<WeeklyConditionPage />} />
            <Route path="/home" element={<TraineeHomePage />} />
            <Route path="/quests" element={<QuestListPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
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
