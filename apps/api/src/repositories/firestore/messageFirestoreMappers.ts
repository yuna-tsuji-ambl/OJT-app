import type {
  MessageThread,
  ThreadChatMessage,
} from '../../domain/messageTypes.js';

export type MessageThreadDocument = Omit<MessageThread, 'id'>;
export type ThreadChatMessageDocument = Omit<
  ThreadChatMessage,
  'id' | 'templateId'
> & {
  templateId?: string;
};

function includeDefinedField<K extends string, V>(
  key: K,
  value: V | undefined,
): Partial<Record<K, V>> {
  if (value === undefined) {
    return {};
  }

  return { [key]: value } as Partial<Record<K, V>>;
}

export function toMessageThreadDocument(
  thread: MessageThread,
): MessageThreadDocument {
  return {
    traineeId: thread.traineeId,
    trainerId: thread.trainerId,
    createdAt: thread.createdAt,
    updatedAt: thread.updatedAt,
  };
}

export function toMessageThread(
  id: string,
  data: MessageThreadDocument,
): MessageThread {
  return {
    id,
    traineeId: data.traineeId,
    trainerId: data.trainerId,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export function toThreadChatMessageDocument(
  message: ThreadChatMessage,
): ThreadChatMessageDocument {
  return {
    threadId: message.threadId,
    senderId: message.senderId,
    receiverId: message.receiverId,
    content: message.content,
    type: message.type,
    createdAt: message.createdAt,
    ...includeDefinedField('templateId', message.templateId),
  };
}

export function toThreadChatMessage(
  id: string,
  data: ThreadChatMessageDocument,
): ThreadChatMessage {
  return {
    id,
    threadId: data.threadId,
    senderId: data.senderId,
    receiverId: data.receiverId,
    content: data.content,
    type: data.type,
    templateId: data.templateId,
    createdAt: data.createdAt,
  };
}
