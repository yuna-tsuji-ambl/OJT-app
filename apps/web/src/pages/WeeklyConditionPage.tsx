import { useState } from 'react';
import { submitConditionRecord } from '../api/conditionApi';
import { useAuth } from '../auth/AuthContext';
import { ConditionSlider } from '../components/ConditionSlider';

const DEFAULT_VALUE = 3;

export function WeeklyConditionPage() {
  const { user } = useAuth();
  const [workload, setWorkload] = useState(DEFAULT_VALUE);
  const [comprehension, setComprehension] = useState(DEFAULT_VALUE);
  const [mental, setMental] = useState(DEFAULT_VALUE);
  const [message, setMessage] = useState('');

  if (!user) {
    return null;
  }

  const authUser = user;

  async function handleSubmit(): Promise<void> {
    const result = await submitConditionRecord(
      { workload, comprehension, mental },
      authUser,
    );
    setMessage(result.message);
  }

  return (
    <section
      className="page-section"
      aria-labelledby="weekly-condition-heading"
    >
      <h1 id="weekly-condition-heading">週次コンディション入力</h1>
      <ConditionSlider label="業務量" value={workload} onChange={setWorkload} />
      <ConditionSlider
        label="理解度"
        value={comprehension}
        onChange={setComprehension}
      />
      <ConditionSlider label="メンタル" value={mental} onChange={setMental} />
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => void handleSubmit()}
      >
        記録する
      </button>
      {message ? <p>{message}</p> : null}
    </section>
  );
}
