import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
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
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/trainees/:traineeId" element={<TraineeDetailPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
