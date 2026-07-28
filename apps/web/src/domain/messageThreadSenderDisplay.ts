import type { UserRole } from '@ojt-app/shared';

export const MESSAGE_SENDER_SELF_LABEL = 'あなた' as const;

export const MESSAGE_SENDER_TRAINER_LABEL = 'トレーナー' as const;

export const MESSAGE_SENDER_TRAINEE_LABEL = '新卒' as const;

export const MESSAGE_THREAD_HISTORY_ITEM_CLASS = 'message-thread-history-item';

export type MessageSenderRole = 'self' | 'other';

export interface MessageViewerContext {
  userId: string;
  role: UserRole;
}

export interface MessageSenderDisplay {
  role: MessageSenderRole;
  label: string;
}

export function resolveMessageSenderRole(
  messageSenderId: string,
  viewerUserId: string,
): MessageSenderRole {
  return messageSenderId === viewerUserId ? 'self' : 'other';
}

export function resolveMessageSenderLabel(
  messageSenderId: string,
  viewer: MessageViewerContext,
): string {
  if (messageSenderId === viewer.userId) {
    return MESSAGE_SENDER_SELF_LABEL;
  }

  return viewer.role === 'trainee'
    ? MESSAGE_SENDER_TRAINER_LABEL
    : MESSAGE_SENDER_TRAINEE_LABEL;
}

export function resolveMessageSenderDisplay(
  messageSenderId: string,
  viewer: MessageViewerContext,
): MessageSenderDisplay {
  return {
    role: resolveMessageSenderRole(messageSenderId, viewer.userId),
    label: resolveMessageSenderLabel(messageSenderId, viewer),
  };
}

export function buildMessageBubbleAriaLabel(
  senderLabel: string,
  content: string,
): string {
  return `${senderLabel}: ${content}`;
}

export function buildMessageThreadHistoryItemClassName(
  role: MessageSenderRole,
): string {
  return `${MESSAGE_THREAD_HISTORY_ITEM_CLASS} ${MESSAGE_THREAD_HISTORY_ITEM_CLASS}--${role}`;
}
