import { useEffect, useState } from 'react';

interface ApiHealth {
  status: string;
  service: string;
}

export default function App() {
  const [apiHealth, setApiHealth] = useState<ApiHealth | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }
        return res.json() as Promise<ApiHealth>;
      })
      .then(setApiHealth)
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
      });
  }, []);

  return (
    <main className="container">
      <h1>OJT App</h1>
      <p>フロントエンドとバックエンドの最小構成です。</p>
      <section className="status-card">
        <h2>API 接続状態</h2>
        {apiHealth && (
          <p>
            {apiHealth.service}: <strong>{apiHealth.status}</strong>
          </p>
        )}
        {error && <p className="error">{error}</p>}
      </section>
    </main>
  );
}
