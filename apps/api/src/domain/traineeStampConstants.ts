import { UnknownStampError } from './errors.js';
import { createContentResolver } from './resolveContentById.js';

export const TRAINEE_STAMPS = [
  { id: 'STS1', label: '🙇 ありがとうございます' },
  { id: 'STS2', label: '✅ 承知いたしました' },
  { id: 'STS3', label: '🙏 よろしくお願いいたします' },
  { id: 'STS4', label: '⏰ 後ほど確認いたします' },
  { id: 'STS5', label: '❓ 詳しく教えていただけますか' },
] as const;

export const TRAINEE_STAMP_STS1_ID = TRAINEE_STAMPS[0].id;
export const TRAINEE_STAMP_STS2_ID = TRAINEE_STAMPS[1].id;
export const TRAINEE_STAMP_STS3_ID = TRAINEE_STAMPS[2].id;
export const TRAINEE_STAMP_STS4_ID = TRAINEE_STAMPS[3].id;
export const TRAINEE_STAMP_STS5_ID = TRAINEE_STAMPS[4].id;

export const TRAINEE_STAMP_STS1_CONTENT = TRAINEE_STAMPS[0].label;
export const TRAINEE_STAMP_STS2_CONTENT = TRAINEE_STAMPS[1].label;
export const TRAINEE_STAMP_STS3_CONTENT = TRAINEE_STAMPS[2].label;
export const TRAINEE_STAMP_STS4_CONTENT = TRAINEE_STAMPS[3].label;
export const TRAINEE_STAMP_STS5_CONTENT = TRAINEE_STAMPS[4].label;

const traineeStampContentById = Object.fromEntries(
  TRAINEE_STAMPS.map((stamp) => [stamp.id, stamp.label]),
);

export const resolveTraineeStampContent = createContentResolver(
  traineeStampContentById,
  (stampId) => new UnknownStampError(stampId),
);
