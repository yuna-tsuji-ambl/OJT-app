import type { MessageThread } from './messageTypes.js';

export function touchMessageThreadActivity(
  thread: MessageThread,
  activityAt: string,
): MessageThread {
  return {
    ...thread,
    updatedAt: activityAt,
  };
}
