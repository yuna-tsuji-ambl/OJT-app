import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  return (
    <section aria-labelledby="login-heading">
      <h1 id="login-heading">ログイン</h1>
      <button
        type="button"
        onClick={() => {
          login('trainee');
          navigate('/condition/weekly');
        }}
      >
        新卒としてログイン
      </button>
      <button
        type="button"
        onClick={() => {
          login('trainer');
          navigate('/dashboard');
        }}
      >
        トレーナーとしてログイン
      </button>
    </section>
  );
}
