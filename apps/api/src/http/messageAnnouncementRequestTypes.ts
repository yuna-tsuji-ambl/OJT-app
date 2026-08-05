import type {
  CreateMessageAnnouncementInput,
  UpdateMessageAnnouncementMemoInput,
} from '../messageAnnouncements/messageAnnouncementCommands.js';
import { parseUpdateMemoBody } from './memoRequestTypes.js';

export function parseCreateMessageAnnouncementBody(
  body: unknown,
): CreateMessageAnnouncementInput | null {
  if (typeof body !== 'object' || body === null) {
    return null;
  }

  if (!('threadId' in body) || !('messageId' in body)) {
    return null;
  }

  const threadId = body.threadId;
  const messageId = body.messageId;

  if (
    typeof threadId !== 'string' ||
    threadId.length === 0 ||
    typeof messageId !== 'string' ||
    messageId.length === 0
  ) {
    return null;
  }

  return { threadId, messageId };
}

export function parseUpdateMessageAnnouncementMemoBody(
  body: unknown,
): UpdateMessageAnnouncementMemoInput | null {
  return parseUpdateMemoBody(body);
}
