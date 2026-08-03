import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function LoginPage() {
  const { authMode, login, loginWithEmailPassword } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (authMode === 'firebase') {
    const onSubmit = async (event: FormEvent) => {
      event.preventDefault();
      setError(null);
      setSubmitting(true);
      try {
        const authUser = await loginWithEmailPassword(email, password);
        navigate(authUser.role === 'trainer' ? '/dashboard' : '/home');
      } catch {
        setError(
          'ログインに失敗しました。メールとパスワードを確認してください。',
        );
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="landing-page">
        <header className="landing-header">
          <div className="landing-logo" aria-hidden="true">
            OJT
          </div>
          <h1 id="login-heading" className="landing-login-label">
            ログイン
          </h1>
        </header>

        <section className="landing-hero" aria-labelledby="login-heading">
          <p className="landing-hero-title">研修を、もっと身近に。</p>
          <p className="landing-hero-subtitle">
            メールアドレスとパスワードでログインしてください。
          </p>
          <form
            className="landing-cta"
            onSubmit={(event) => void onSubmit(event)}
          >
            <label className="visually-hidden" htmlFor="login-email">
              メールアドレス
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              placeholder="メールアドレス"
            />
            <label className="visually-hidden" htmlFor="login-password">
              パスワード
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              placeholder="パスワード"
            />
            {error ? <p role="alert">{error}</p> : null}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              ログイン
            </button>
          </form>
        </section>
      </div>
    );
  }

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
