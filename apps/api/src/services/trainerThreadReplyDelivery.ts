import {
  buildTrainerStampMessage,
  buildTrainerTemplateMessage,
  buildTrainerTextMessage,
} from '../domain/buildTrainerMessage.js';
import type {
  SendMessageResult,
  SendTrainerStampReplyInput,
  SendTrainerTemplateReplyInput,
  SendTrainerTextReplyInput,
} from '../domain/messageTypes.js';
import type { MessagePersistenceContext } from './messagePersistenceStores.js';
import { deliverThreadReply } from './threadReplyDelivery.js';

export function sendTrainerTemplateReplyInRoom(
  input: SendTrainerTemplateReplyInput,
  operation: MessagePersistenceContext,
): Promise<SendMessageResult> {
  const { threadId, templateId } = input;

  return deliverThreadReply(
    threadId,
    operation,
    'trainer',
    (id, senderId, receiverId) =>
      buildTrainerTemplateMessage(id, senderId, receiverId, templateId),
  );
}

export function sendTrainerTextReplyInRoom(
  input: SendTrainerTextReplyInput,
  operation: MessagePersistenceContext,
): Promise<SendMessageResult> {
  const { threadId, content } = input;

  return deliverThreadReply(
    threadId,
    operation,
    'trainer',
    (id, senderId, receiverId) =>
      buildTrainerTextMessage(id, senderId, receiverId, content),
  );
}

export function sendTrainerStampReplyInRoom(
  input: SendTrainerStampReplyInput,
  operation: MessagePersistenceContext,
): Promise<SendMessageResult> {
  const { threadId, stampId } = input;

  return deliverThreadReply(
    threadId,
    operation,
    'trainer',
    (id, senderId, receiverId) =>
      buildTrainerStampMessage(id, senderId, receiverId, stampId),
  );
}
