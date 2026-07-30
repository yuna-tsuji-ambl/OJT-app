import { Link, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {
  REPORT_HEADER_NAV_LABEL,
  REPORT_PAGE_PATH,
} from '../domain/reportForm';

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-logo">OJT</div>
        <nav className="app-nav" aria-label="メインナビゲーション">
          {user.role === 'trainee' && (
            <>
              <Link to="/home">ホーム</Link>
              <Link to={REPORT_PAGE_PATH}>{REPORT_HEADER_NAV_LABEL}</Link>
              <Link to="/condition/weekly">週次入力</Link>
              <Link to="/assignments">課題一覧</Link>
            </>
          )}
          {user.role === 'trainer' && (
            <>
              <Link to="/dashboard">ダッシュボード</Link>
              <Link to={REPORT_PAGE_PATH}>{REPORT_HEADER_NAV_LABEL}</Link>
              <Link to="/assignments/manage">課題管理</Link>
              <Link to="/condition">コンディション</Link>
              <Link to="/status/settings">ステータス設定</Link>
              <Link to="/messages">メッセージ</Link>
            </>
          )}
        </nav>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            logout();
            navigate('/login');
          }}
        >
          ログアウト
        </button>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
