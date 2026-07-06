import { useEffect, useState } from 'react';
import { fetchTrainerStatus, updateTrainerStatus } from '../api/statusApi';
import { useAuth } from '../auth/AuthContext';
import { TrainerStatusRadioGroup } from '../components/TrainerStatusRadioGroup';
import type { TrainerStatusType } from '../domain/statusConstants';

export function TrainerStatusSettingsPage() {
  const { user } = useAuth();
  const [currentStatus, setCurrentStatus] = useState<TrainerStatusType | ''>('');

  useEffect(() => {
    if (!user) {
      return;
    }

    void fetchTrainerStatus(user.userId, user).then((record) => {
      setCurrentStatus(record.status);
    });
  }, [user]);

  if (!user) {
    return null;
  }

  const authUser = user;

  function handleStatusChange(status: TrainerStatusType): void {
    setCurrentStatus(status);
    void updateTrainerStatus(status, authUser).then((record) => {
      setCurrentStatus(record.status);
    });
  }

  return (
    <section className="page-section" aria-labelledby="status-settings-heading">
      <h1 id="status-settings-heading">ステータス設定</h1>
      <TrainerStatusRadioGroup
        currentStatus={currentStatus}
        onStatusChange={handleStatusChange}
      />
    </section>
  );
}
