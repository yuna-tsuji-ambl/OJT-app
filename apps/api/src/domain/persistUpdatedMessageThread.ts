import type { MessageThread } from './messageTypes.js';
import { touchMessageThreadActivity } from './touchMessageThreadActivity.js';
import type { MessageThreadStore } from '../repositories/messageThreadStore.js';

export async function persistUpdatedMessageThread(
  threadStore: MessageThreadStore,
  thread: MessageThread,
  activityAt: string,
): Promise<MessageThread> {
  return threadStore.update(touchMessageThreadActivity(thread, activityAt));
}
