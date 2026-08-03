import {
  buildStampContentById,
  STAMP_ST1_ID,
  STAMP_ST1_LABEL,
  STAMPS,
} from '@ojt-app/shared';
import { UnknownStampError } from './errors.js';
import { createContentResolver } from './resolveContentById.js';

export { STAMP_ST1_ID };

export const STAMP_ST2_ID = STAMPS[1].id;
export const STAMP_ST3_ID = STAMPS[2].id;
export const STAMP_ST4_ID = STAMPS[3].id;
export const STAMP_ST5_ID = STAMPS[4].id;
export const STAMP_ST6_ID = STAMPS[5].id;
export const STAMP_ST7_ID = STAMPS[6].id;
export const STAMP_ST8_ID = STAMPS[7].id;
export const STAMP_ST9_ID = STAMPS[8].id;
export const STAMP_ST10_ID = STAMPS[9].id;

export const STAMP_ST1_CONTENT = STAMP_ST1_LABEL;
export const STAMP_ST2_CONTENT = STAMPS[1].label;
export const STAMP_ST3_CONTENT = STAMPS[2].label;
export const STAMP_ST4_CONTENT = STAMPS[3].label;
export const STAMP_ST5_CONTENT = STAMPS[4].label;
export const STAMP_ST6_CONTENT = STAMPS[5].label;
export const STAMP_ST7_CONTENT = STAMPS[6].label;
export const STAMP_ST8_CONTENT = STAMPS[7].label;
export const STAMP_ST9_CONTENT = STAMPS[8].label;
export const STAMP_ST10_CONTENT = STAMPS[9].label;

export const resolveStampContent = createContentResolver(
  buildStampContentById(),
  (stampId) => new UnknownStampError(stampId),
);
