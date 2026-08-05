import { sortThreadChatMessagesChronologically } from './messageThreadList.js';
import type { ThreadChatMessage } from './messageTypes.js';

export function selectMissedThreadChatMessages(
  messages: ThreadChatMessage[],
  lastSeenMessageId: string,
): ThreadChatMessage[] {
  const sortedMessages = sortThreadChatMessagesChronologically(messages);
  const lastSeenIndex = sortedMessages.findIndex(
    (message) => message.id === lastSeenMessageId,
  );

  if (lastSeenIndex === -1) {
    return [];
  }

  return sortedMessages.slice(lastSeenIndex + 1);
}
