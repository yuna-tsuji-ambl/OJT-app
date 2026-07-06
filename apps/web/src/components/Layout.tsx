import { Link, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div>
      <header>
        <nav aria-label="メインナビゲーション">
          {user.role === 'trainee' && (
            <Link to="/condition/weekly">週次入力</Link>
          )}
          {user.role === 'trainer' && (
            <Link to="/dashboard">ダッシュボード</Link>
          )}
        </nav>
        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/login');
          }}
        >
          ログアウト
        </button>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
