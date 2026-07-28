import {
  buildReplyTemplateContentById,
  REPLY_TEMPLATE_TT2_ID,
  REPLY_TEMPLATE_TT2_LABEL,
  REPLY_TEMPLATE_TT4_ID,
} from '@ojt-app/shared';
import { UnknownReplyTemplateError } from './errors.js';
import { createContentResolver } from './resolveContentById.js';

export { REPLY_TEMPLATE_TT2_ID, REPLY_TEMPLATE_TT4_ID };

export const REPLY_TEMPLATE_TT2_CONTENT = REPLY_TEMPLATE_TT2_LABEL;
export const REPLY_TEMPLATE_TT4_CONTENT =
  buildReplyTemplateContentById()[REPLY_TEMPLATE_TT4_ID] ?? '';

export const resolveReplyTemplateContent = createContentResolver(
  buildReplyTemplateContentById(),
  (templateId) => new UnknownReplyTemplateError(templateId),
);
