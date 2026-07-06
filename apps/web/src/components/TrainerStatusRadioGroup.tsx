import type { TrainerStatusType } from '../domain/statusConstants';
import { TRAINER_STATUSES } from '../domain/statusConstants';

interface TrainerStatusRadioGroupProps {
  currentStatus: TrainerStatusType | '';
  onStatusChange: (status: TrainerStatusType) => void;
}

export function TrainerStatusRadioGroup({
  currentStatus,
  onStatusChange,
}: TrainerStatusRadioGroupProps) {
  return (
    <>
      <fieldset>
        <legend>ステータス</legend>
        {TRAINER_STATUSES.map((status) => (
          <input
            key={status}
            type="radio"
            name="trainer-status"
            value={status}
            aria-label={status}
            checked={currentStatus === status}
            onChange={() => onStatusChange(status)}
          />
        ))}
      </fieldset>
      {currentStatus ? <p>{currentStatus}</p> : null}
    </>
  );
}
