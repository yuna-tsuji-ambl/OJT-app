import type { TrainerStatusType } from '../domain/statusConstants';

interface TrainerStatusPanelProps {
  status: TrainerStatusType;
}

export function TrainerStatusPanel({ status }: TrainerStatusPanelProps) {
  return (
    <section role="region" aria-label="先輩のステータス">
      <p>{status}</p>
    </section>
  );
}
