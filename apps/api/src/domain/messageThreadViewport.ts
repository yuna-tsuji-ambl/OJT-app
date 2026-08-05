import type { ThreadChatMessage } from './messageTypes.js';

function findLatestThreadChatMessage(
  messages: ThreadChatMessage[],
): ThreadChatMessage | null {
  if (messages.length === 0) {
    return null;
  }

  return messages.reduce((latest, current) => {
    const latestTime = new Date(latest.createdAt).getTime();
    const currentTime = new Date(current.createdAt).getTime();

    return currentTime >= latestTime ? current : latest;
  });
}

export function selectThreadViewportAnchorMessage(
  messages: ThreadChatMessage[],
): ThreadChatMessage | null {
  return findLatestThreadChatMessage(messages);
}

export function isThreadHistoryViewportAnchored(
  messages: ThreadChatMessage[],
): boolean {
  const anchor = findLatestThreadChatMessage(messages);
  const lastMessage = messages.at(-1);

  if (!anchor || !lastMessage) {
    return false;
  }

  return anchor.id === lastMessage.id;
}
