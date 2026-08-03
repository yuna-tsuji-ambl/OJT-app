import {
  buildTraineeStampMessage,
  buildTraineeTemplateMessage,
  buildTraineeTextMessage,
} from '../domain/buildTraineeMessage.js';
import { ensureTraineeCanSendMessage } from '../domain/messageAssignment.js';
import {
  validateTraineeTemplateReplyInput,
  validateTraineeTextReplyInput,
} from '../domain/messageValidation.js';
import type {
  SendMessageResult,
  SendTraineeStampReplyInput,
  SendTraineeTemplateReplyInput,
  SendTraineeTextReplyInput,
  ThreadMessageBuilder,
} from '../domain/messageTypes.js';
import type { MessagePersistenceContext } from './messagePersistenceStores.js';
import { deliverThreadReply } from './threadReplyDelivery.js';

function deliverTraineeThreadMessage(
  threadId: string,
  operation: MessagePersistenceContext,
  buildMessage: ThreadMessageBuilder,
): Promise<SendMessageResult> {
  return deliverThreadReply(threadId, operation, 'trainee', buildMessage);
}

export function sendTraineeTemplateReplyInRoom(
  input: SendTraineeTemplateReplyInput,
  operation: MessagePersistenceContext,
): Promise<SendMessageResult> {
  validateTraineeTemplateReplyInput(input);
  ensureTraineeCanSendMessage(operation.context, input.trainerId);

  const { threadId, templateId } = input;

  return deliverTraineeThreadMessage(
    threadId,
    operation,
    (id, senderId, receiverId) =>
      buildTraineeTemplateMessage(id, senderId, receiverId, templateId),
  );
}

export function sendTraineeTextReplyInRoom(
  input: SendTraineeTextReplyInput,
  operation: MessagePersistenceContext,
): Promise<SendMessageResult> {
  validateTraineeTextReplyInput(input);
  ensureTraineeCanSendMessage(operation.context, input.trainerId);

  const { threadId, content } = input;

  return deliverTraineeThreadMessage(
    threadId,
    operation,
    (id, senderId, receiverId) =>
      buildTraineeTextMessage(id, senderId, receiverId, content),
  );
}

export function sendTraineeStampReplyInRoom(
  input: SendTraineeStampReplyInput,
  operation: MessagePersistenceContext,
): Promise<SendMessageResult> {
  const { threadId, stampId } = input;

  return deliverTraineeThreadMessage(
    threadId,
    operation,
    (id, senderId, receiverId) =>
      buildTraineeStampMessage(id, senderId, receiverId, stampId),
  );
}
