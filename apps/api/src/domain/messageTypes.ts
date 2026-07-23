import type {
  MessageThread,
  MessageThreadListItem,
  ThreadChatMessage,
  ThreadMessageType,
} from '@ojt-app/shared';

export type {
  MessageThread,
  MessageThreadListItem,
  ThreadChatMessage,
  ThreadMessageType,
};

export interface CreateMessageThreadInput {
  traineeId: string;
  trainerId: string;
}

export interface SendTraineeTemplateMessageInput {
  templateId: string;
  trainerId: string;
}

export interface SendTraineeTextMessageInput {
  content: string;
  trainerId: string;
}

export interface SendTraineeTextReplyInput {
  threadId: string;
  content: string;
  trainerId: string;
}

export interface SendTraineeStampReplyInput {
  threadId: string;
  stampId: string;
}

export interface SendTrainerLegacyFlatReplyInput {
  traineeId: string;
  content: string;
}

export interface SendTrainerTemplateReplyInput {
  threadId: string;
  templateId: string;
}

export interface SendTrainerTemplateMessageInput {
  templateId: string;
  traineeId: string;
}

export interface SendTrainerTextReplyInput {
  threadId: string;
  content: string;
}

export interface SendTrainerStampReplyInput {
  threadId: string;
  stampId: string;
}

export interface SyncMissedMessageUpdatesInput {
  trainerId: string;
  traineeId: string;
  threadId: string;
  lastSeenMessageId: string;
}

export interface SendMessageResult {
  thread: MessageThread;
  message: ThreadChatMessage;
}

export type SendTemplateMessageResult = SendMessageResult;
export type SendTextMessageResult = SendMessageResult;
export type SendTraineeTextReplyResult = SendMessageResult;
export type SendTraineeStampReplyResult = SendMessageResult;
export type SendTrainerTemplateReplyResult = SendMessageResult;
export type SendTrainerTemplateMessageResult = SendMessageResult;
export type SendTrainerTextReplyResult = SendMessageResult;
export type SendTrainerStampReplyResult = SendMessageResult;

export type ThreadMessageBuilder = (
  threadId: string,
  senderId: string,
  receiverId: string,
) => ThreadChatMessage;
