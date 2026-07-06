import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-logo" aria-hidden="true">
          OJT
        </div>
        <div className="landing-header-actions">
          <label className="visually-hidden" htmlFor="language-select">
            言語
          </label>
          <select
            id="language-select"
            className="landing-lang"
            defaultValue="ja"
          >
            <option value="ja">日本語</option>
          </select>
          <h1 id="login-heading" className="landing-login-label">
            ログイン
          </h1>
        </div>
      </header>

      <section className="landing-hero" aria-labelledby="login-heading">
        <p className="landing-hero-title">研修を、もっと身近に。</p>
        <p className="landing-hero-subtitle">
          コンディション記録・クエスト管理・ステータス連携をひとつに。
        </p>
        <p className="landing-hero-description">
          ロールを選んでログインし、OJT研修をすぐに始めましょう。
        </p>
        <div className="landing-cta">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              login('trainee');
              navigate('/home');
            }}
          >
            新卒としてログイン
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              login('trainer');
              navigate('/dashboard');
            }}
          >
            トレーナーとしてログイン
          </button>
        </div>
      </section>
    </div>
  );
}
