import type { MessageThread, ThreadChatMessage } from './messageTypes.js';
import type { UserRole } from './types.js';
import type { MessageUpdateType } from './messageRealtimeConstants.js';

export interface MessageCreatedUpdateEvent {
  type: MessageUpdateType;
  thread: MessageThread;
  message: ThreadChatMessage;
}

export type MessageUpdateEvent = MessageCreatedUpdateEvent;

export type MessageUpdateListener = (event: MessageUpdateEvent) => void;

export type Unsubscribe = () => void;

export interface MessageRealtimeHub {
  subscribe(
    trainerId: string,
    traineeId: string,
    listenerUserId: string,
    listenerRole: UserRole,
    listener: MessageUpdateListener,
  ): Unsubscribe;
  publish(
    trainerId: string,
    traineeId: string,
    event: MessageUpdateEvent,
  ): void;
}
