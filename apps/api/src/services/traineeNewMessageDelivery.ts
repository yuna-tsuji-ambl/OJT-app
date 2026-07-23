import {
  buildTraineeTemplateMessage,
  buildTraineeTextMessage,
} from '../domain/buildTraineeMessage.js';
import { ensureTraineeCanSendMessage } from '../domain/messageAssignment.js';
import type {
  SendMessageResult,
  SendTraineeTemplateMessageInput,
  SendTraineeTextMessageInput,
  ThreadMessageBuilder,
} from '../domain/messageTypes.js';
import {
  validateTraineeTemplateMessageInput,
  validateTraineeTextMessageInput,
} from '../domain/messageValidation.js';
import { sendTraineeNewThreadMessage } from './messageDelivery.js';
import type { MessagePersistenceContext } from './messagePersistenceStores.js';

function deliverTraineeNewMessage(
  trainerId: string,
  operation: MessagePersistenceContext,
  buildMessage: ThreadMessageBuilder,
): Promise<SendMessageResult> {
  ensureTraineeCanSendMessage(operation.context, trainerId);

  return sendTraineeNewThreadMessage(
    trainerId,
    operation.context.userId,
    operation.stores,
    buildMessage,
  );
}

export function sendTraineeTemplateNewMessage(
  input: SendTraineeTemplateMessageInput,
  operation: MessagePersistenceContext,
): Promise<SendMessageResult> {
  validateTraineeTemplateMessageInput(input);

  return deliverTraineeNewMessage(
    input.trainerId,
    operation,
    (threadId, senderId, receiverId) =>
      buildTraineeTemplateMessage(
        threadId,
        senderId,
        receiverId,
        input.templateId,
      ),
  );
}

export function sendTraineeTextNewMessage(
  input: SendTraineeTextMessageInput,
  operation: MessagePersistenceContext,
): Promise<SendMessageResult> {
  validateTraineeTextMessageInput(input);

  return deliverTraineeNewMessage(
    input.trainerId,
    operation,
    (threadId, senderId, receiverId) =>
      buildTraineeTextMessage(threadId, senderId, receiverId, input.content),
  );
}
