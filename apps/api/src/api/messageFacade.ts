import type {
  MessageRealtimeHub,
  MessageUpdateListener,
} from '../domain/messageRealtimeTypes.js';
import type {
  MessageThreadListItem,
  ThreadChatMessage,
  SendTemplateMessageResult,
  SendTextMessageResult,
  SendTraineeTemplateMessageInput,
  SendTraineeTextMessageInput,
  SendTraineeTextReplyInput,
  SendTraineeStampReplyInput,
  SendTraineeStampReplyResult,
  SendTrainerLegacyFlatReplyInput,
  SendTrainerTemplateReplyInput,
  SendTrainerTemplateReplyResult,
  SendTrainerTemplateMessageInput,
  SendTrainerTemplateMessageResult,
  SendTrainerTextReplyInput,
  SendTrainerTextReplyResult,
  SendTrainerStampReplyInput,
  SendTrainerStampReplyResult,
  SyncMissedMessageUpdatesInput,
} from '../domain/messageTypes.js';
import type { UserRole } from '../domain/types.js';
import { toUserContext } from '../domain/userContext.js';
import type { MessageThreadStore } from '../repositories/messageThreadStore.js';
import type { ThreadChatMessageStore } from '../repositories/threadChatMessageStore.js';
import { MessageService } from '../services/messageService.js';

const messageService = new MessageService();

export async function sendTraineeTemplateMessage(
  input: SendTraineeTemplateMessageInput,
  userId: string,
  role: UserRole,
  threadStore: MessageThreadStore,
  messageStore: ThreadChatMessageStore,
  realtimeHub?: MessageRealtimeHub,
): Promise<SendTemplateMessageResult> {
  return messageService.sendTraineeTemplateMessage(
    input,
    toUserContext(userId, role),
    threadStore,
    messageStore,
    realtimeHub,
  );
}

export async function sendTraineeTextMessage(
  input: SendTraineeTextMessageInput,
  userId: string,
  role: UserRole,
  threadStore: MessageThreadStore,
  messageStore: ThreadChatMessageStore,
): Promise<SendTextMessageResult> {
  return messageService.sendTraineeTextMessage(
    input,
    toUserContext(userId, role),
    threadStore,
    messageStore,
  );
}

export async function sendTraineeTextReply(
  input: SendTraineeTextReplyInput,
  userId: string,
  role: UserRole,
  threadStore: MessageThreadStore,
  messageStore: ThreadChatMessageStore,
): Promise<SendTextMessageResult> {
  return messageService.sendTraineeTextReply(
    input,
    toUserContext(userId, role),
    threadStore,
    messageStore,
  );
}

export async function sendTraineeStampReply(
  input: SendTraineeStampReplyInput,
  userId: string,
  role: UserRole,
  threadStore: MessageThreadStore,
  messageStore: ThreadChatMessageStore,
): Promise<SendTraineeStampReplyResult> {
  return messageService.sendTraineeStampReply(
    input,
    toUserContext(userId, role),
    threadStore,
    messageStore,
  );
}

export async function sendTrainerLegacyFlatReply(
  input: SendTrainerLegacyFlatReplyInput,
  userId: string,
  role: UserRole,
): Promise<never> {
  return messageService.sendTrainerLegacyFlatReply(
    input,
    toUserContext(userId, role),
  );
}

export async function listMessageThreads(
  trainerId: string,
  traineeId: string,
  userId: string,
  role: UserRole,
  threadStore: MessageThreadStore,
  messageStore: ThreadChatMessageStore,
): Promise<MessageThreadListItem[]> {
  return messageService.listMessageThreads(
    trainerId,
    traineeId,
    toUserContext(userId, role),
    threadStore,
    messageStore,
  );
}

export async function sendTrainerTemplateMessage(
  input: SendTrainerTemplateMessageInput,
  userId: string,
  role: UserRole,
  threadStore: MessageThreadStore,
  messageStore: ThreadChatMessageStore,
): Promise<SendTrainerTemplateMessageResult> {
  return messageService.sendTrainerTemplateMessage(
    input,
    toUserContext(userId, role),
    threadStore,
    messageStore,
  );
}

export async function sendTrainerTemplateReply(
  input: SendTrainerTemplateReplyInput,
  userId: string,
  role: UserRole,
  threadStore: MessageThreadStore,
  messageStore: ThreadChatMessageStore,
): Promise<SendTrainerTemplateReplyResult> {
  return messageService.sendTrainerTemplateReply(
    input,
    toUserContext(userId, role),
    threadStore,
    messageStore,
  );
}

export async function sendTrainerTextReply(
  input: SendTrainerTextReplyInput,
  userId: string,
  role: UserRole,
  threadStore: MessageThreadStore,
  messageStore: ThreadChatMessageStore,
): Promise<SendTrainerTextReplyResult> {
  return messageService.sendTrainerTextReply(
    input,
    toUserContext(userId, role),
    threadStore,
    messageStore,
  );
}

export async function sendTrainerStampReply(
  input: SendTrainerStampReplyInput,
  userId: string,
  role: UserRole,
  threadStore: MessageThreadStore,
  messageStore: ThreadChatMessageStore,
  realtimeHub?: MessageRealtimeHub,
): Promise<SendTrainerStampReplyResult> {
  return messageService.sendTrainerStampReply(
    input,
    toUserContext(userId, role),
    threadStore,
    messageStore,
    realtimeHub,
  );
}

export async function listThreadChatMessages(
  trainerId: string,
  traineeId: string,
  threadId: string,
  userId: string,
  role: UserRole,
  threadStore: MessageThreadStore,
  messageStore: ThreadChatMessageStore,
): Promise<ThreadChatMessage[]> {
  return messageService.listThreadChatMessages(
    trainerId,
    traineeId,
    threadId,
    toUserContext(userId, role),
    threadStore,
    messageStore,
  );
}

export async function syncMissedMessageUpdates(
  input: SyncMissedMessageUpdatesInput,
  userId: string,
  role: UserRole,
  threadStore: MessageThreadStore,
  messageStore: ThreadChatMessageStore,
  onMessageUpdate: MessageUpdateListener,
): Promise<void> {
  return messageService.syncMissedMessageUpdates(
    input,
    toUserContext(userId, role),
    threadStore,
    messageStore,
    onMessageUpdate,
  );
}
