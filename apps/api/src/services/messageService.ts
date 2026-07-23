import {
  ensureConversationParticipant,
  ensureTrainer,
} from '../domain/authorization.js';
import { buildTrainerTemplateMessage } from '../domain/buildTrainerMessage.js';
import {
  sendTraineeTemplateNewMessage,
  sendTraineeTextNewMessage,
} from './traineeNewMessageDelivery.js';
import {
  sendTraineeStampReplyInRoom,
  sendTraineeTextReplyInRoom,
} from './traineeThreadReplyDelivery.js';
import { rejectTrainerLegacyFlatReply } from './trainerLegacyFlatReplyRejection.js';
import {
  sendTrainerStampReplyInRoom,
  sendTrainerTemplateReplyInRoom,
  sendTrainerTextReplyInRoom,
} from './trainerThreadReplyDelivery.js';
import {
  dispatchMissedMessageCreatedUpdates,
  notifyMessageCreated,
} from '../domain/messageRealtimePublish.js';
import type {
  MessageRealtimeHub,
  MessageUpdateListener,
} from '../domain/messageRealtimeTypes.js';
import type {
  MessageThreadListItem,
  ThreadChatMessage,
  SendTraineeTemplateMessageInput,
  SendTraineeTextMessageInput,
  SendTraineeTextReplyInput,
  SendTraineeStampReplyInput,
  SendTrainerLegacyFlatReplyInput,
  SendTrainerTemplateReplyInput,
  SendTrainerTemplateMessageInput,
  SendTrainerTextReplyInput,
  SendTrainerStampReplyInput,
  SendMessageResult,
  SendTemplateMessageResult,
  SendTextMessageResult,
  SendTraineeTextReplyResult,
  SendTraineeStampReplyResult,
  SendTrainerTemplateReplyResult,
  SendTrainerTemplateMessageResult,
  SendTrainerTextReplyResult,
  SendTrainerStampReplyResult,
  SyncMissedMessageUpdatesInput,
  ThreadMessageBuilder,
} from '../domain/messageTypes.js';
import type { UserContext } from '../domain/types.js';
import type { MessageThreadStore } from '../repositories/messageThreadStore.js';
import type { ThreadChatMessageStore } from '../repositories/threadChatMessageStore.js';
import {
  listMissedThreadChatMessagesForThread,
  sendTrainerNewThreadMessage,
} from './messageDelivery.js';
import {
  createMessagePersistenceContext,
  createMessagePersistenceStores,
  type MessagePersistenceStores,
} from './messagePersistenceStores.js';
import { listThreadChatMessagesForRoom } from './messageThreadDetailQuery.js';
import { listMessageThreadsForHome } from './messageThreadListQuery.js';

export class MessageService {
  async sendTraineeTemplateMessage(
    input: SendTraineeTemplateMessageInput,
    context: UserContext,
    threadStore: MessageThreadStore,
    messageStore: ThreadChatMessageStore,
    realtimeHub?: MessageRealtimeHub,
  ): Promise<SendTemplateMessageResult> {
    const operation = createMessagePersistenceContext(
      context,
      threadStore,
      messageStore,
    );

    return this.deliverAndNotify(
      () => sendTraineeTemplateNewMessage(input, operation),
      realtimeHub,
    );
  }

  async sendTraineeTextMessage(
    input: SendTraineeTextMessageInput,
    context: UserContext,
    threadStore: MessageThreadStore,
    messageStore: ThreadChatMessageStore,
  ): Promise<SendTextMessageResult> {
    return sendTraineeTextNewMessage(
      input,
      createMessagePersistenceContext(context, threadStore, messageStore),
    );
  }

  async sendTraineeTextReply(
    input: SendTraineeTextReplyInput,
    context: UserContext,
    threadStore: MessageThreadStore,
    messageStore: ThreadChatMessageStore,
  ): Promise<SendTraineeTextReplyResult> {
    return sendTraineeTextReplyInRoom(
      input,
      createMessagePersistenceContext(context, threadStore, messageStore),
    );
  }

  async sendTraineeStampReply(
    input: SendTraineeStampReplyInput,
    context: UserContext,
    threadStore: MessageThreadStore,
    messageStore: ThreadChatMessageStore,
  ): Promise<SendTraineeStampReplyResult> {
    return sendTraineeStampReplyInRoom(
      input,
      createMessagePersistenceContext(context, threadStore, messageStore),
    );
  }

  async sendTrainerLegacyFlatReply(
    input: SendTrainerLegacyFlatReplyInput,
    context: UserContext,
  ): Promise<never> {
    return rejectTrainerLegacyFlatReply(input, context);
  }

  async sendTrainerTemplateMessage(
    input: SendTrainerTemplateMessageInput,
    context: UserContext,
    threadStore: MessageThreadStore,
    messageStore: ThreadChatMessageStore,
  ): Promise<SendTrainerTemplateMessageResult> {
    const { traineeId, templateId } = input;

    return this.deliverTrainerNewThreadMessage(
      traineeId,
      context,
      createMessagePersistenceStores(threadStore, messageStore),
      (threadId, senderId, receiverId) =>
        buildTrainerTemplateMessage(threadId, senderId, receiverId, templateId),
    );
  }

  async sendTrainerTemplateReply(
    input: SendTrainerTemplateReplyInput,
    context: UserContext,
    threadStore: MessageThreadStore,
    messageStore: ThreadChatMessageStore,
  ): Promise<SendTrainerTemplateReplyResult> {
    return sendTrainerTemplateReplyInRoom(
      input,
      createMessagePersistenceContext(context, threadStore, messageStore),
    );
  }

  async sendTrainerTextReply(
    input: SendTrainerTextReplyInput,
    context: UserContext,
    threadStore: MessageThreadStore,
    messageStore: ThreadChatMessageStore,
  ): Promise<SendTrainerTextReplyResult> {
    return sendTrainerTextReplyInRoom(
      input,
      createMessagePersistenceContext(context, threadStore, messageStore),
    );
  }

  async sendTrainerStampReply(
    input: SendTrainerStampReplyInput,
    context: UserContext,
    threadStore: MessageThreadStore,
    messageStore: ThreadChatMessageStore,
    realtimeHub?: MessageRealtimeHub,
  ): Promise<SendTrainerStampReplyResult> {
    const operation = createMessagePersistenceContext(
      context,
      threadStore,
      messageStore,
    );

    return this.deliverAndNotify(
      () => sendTrainerStampReplyInRoom(input, operation),
      realtimeHub,
    );
  }

  async listMessageThreads(
    trainerId: string,
    traineeId: string,
    context: UserContext,
    threadStore: MessageThreadStore,
    messageStore: ThreadChatMessageStore,
  ): Promise<MessageThreadListItem[]> {
    return listMessageThreadsForHome(
      trainerId,
      traineeId,
      createMessagePersistenceContext(context, threadStore, messageStore),
    );
  }

  async listThreadChatMessages(
    trainerId: string,
    traineeId: string,
    threadId: string,
    context: UserContext,
    threadStore: MessageThreadStore,
    messageStore: ThreadChatMessageStore,
  ): Promise<ThreadChatMessage[]> {
    return listThreadChatMessagesForRoom(
      trainerId,
      traineeId,
      threadId,
      createMessagePersistenceContext(context, threadStore, messageStore),
    );
  }

  async syncMissedMessageUpdates(
    input: SyncMissedMessageUpdatesInput,
    context: UserContext,
    threadStore: MessageThreadStore,
    messageStore: ThreadChatMessageStore,
    onMessageUpdate: MessageUpdateListener,
  ): Promise<void> {
    const { trainerId, traineeId, threadId, lastSeenMessageId } = input;
    const stores = createMessagePersistenceStores(threadStore, messageStore);

    await this.withConversationAccess(
      trainerId,
      traineeId,
      context,
      async () => {
        const { thread, messages } =
          await listMissedThreadChatMessagesForThread(
            trainerId,
            traineeId,
            threadId,
            lastSeenMessageId,
            stores,
          );

        dispatchMissedMessageCreatedUpdates(onMessageUpdate, thread, messages);
      },
    );
  }

  private withConversationAccess<T>(
    trainerId: string,
    traineeId: string,
    context: UserContext,
    action: () => Promise<T>,
  ): Promise<T> {
    ensureConversationParticipant(context, trainerId, traineeId);
    return action();
  }

  private async deliverAndNotify(
    deliver: () => Promise<SendMessageResult>,
    realtimeHub: MessageRealtimeHub | undefined,
  ): Promise<SendMessageResult> {
    const result = await deliver();

    notifyMessageCreated(realtimeHub, result);

    return result;
  }

  private async deliverTrainerNewThreadMessage(
    traineeId: string,
    context: UserContext,
    stores: MessagePersistenceStores,
    buildMessage: ThreadMessageBuilder,
  ): Promise<SendMessageResult> {
    ensureTrainer(context);

    return sendTrainerNewThreadMessage(
      traineeId,
      context.userId,
      stores,
      buildMessage,
    );
  }
}
