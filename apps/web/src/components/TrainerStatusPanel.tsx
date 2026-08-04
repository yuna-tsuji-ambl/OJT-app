import {
  TRAINER_STATUS,
  type TrainerStatusType,
} from '../domain/statusConstants';

interface TrainerStatusPanelProps {
  status: TrainerStatusType;
}

function statusToneClass(status: TrainerStatusType): string {
  if (status === TRAINER_STATUS.QUEST_OK) {
    return 'trainer-status-panel--ok';
  }

  return 'trainer-status-panel--focus';
}

export function TrainerStatusPanel({ status }: TrainerStatusPanelProps) {
  return (
    <section
      className={`trainer-status-panel ${statusToneClass(status)}`}
      role="region"
      aria-label="先輩のステータス"
    >
      <span className="trainer-status-panel__dot" aria-hidden="true" />
      <p className="trainer-status-panel__text">
        <span className="trainer-status-panel__label">トレーナー：</span>
        <span className="trainer-status-panel__value">{status}</span>
      </p>
    </section>
  );
}
