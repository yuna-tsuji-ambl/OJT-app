import {
  buildQuestionTemplateContentById,
  QUESTION_TEMPLATE_TQ1_ID,
  QUESTION_TEMPLATE_TQ1_LABEL,
  QUESTION_TEMPLATE_TQ2_ID,
  QUESTION_TEMPLATE_TQ2_LABEL,
  QUESTION_TEMPLATE_TQ3_ID,
  QUESTION_TEMPLATE_TQ3_LABEL,
  QUESTION_TEMPLATE_TQ4_ID,
  QUESTION_TEMPLATE_TQ4_LABEL,
  QUESTION_TEMPLATE_TQ5_ID,
  QUESTION_TEMPLATE_TQ5_LABEL,
  THREAD_MESSAGE_TYPE,
} from '@ojt-app/shared';
import { UnknownQuestionTemplateError } from './errors.js';
import { createContentResolver } from './resolveContentById.js';

export {
  QUESTION_TEMPLATE_TQ1_ID,
  QUESTION_TEMPLATE_TQ2_ID,
  QUESTION_TEMPLATE_TQ3_ID,
  QUESTION_TEMPLATE_TQ4_ID,
  QUESTION_TEMPLATE_TQ5_ID,
  THREAD_MESSAGE_TYPE,
};

export type { ThreadMessageType } from '@ojt-app/shared';

export const QUESTION_TEMPLATE_TQ1_CONTENT = QUESTION_TEMPLATE_TQ1_LABEL;
export const QUESTION_TEMPLATE_TQ2_CONTENT = QUESTION_TEMPLATE_TQ2_LABEL;
export const QUESTION_TEMPLATE_TQ3_CONTENT = QUESTION_TEMPLATE_TQ3_LABEL;
export const QUESTION_TEMPLATE_TQ4_CONTENT = QUESTION_TEMPLATE_TQ4_LABEL;
export const QUESTION_TEMPLATE_TQ5_CONTENT = QUESTION_TEMPLATE_TQ5_LABEL;

export const resolveQuestionTemplateContent = createContentResolver(
  buildQuestionTemplateContentById(),
  (templateId) => new UnknownQuestionTemplateError(templateId),
);
