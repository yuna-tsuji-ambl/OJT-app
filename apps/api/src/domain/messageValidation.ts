import {
  MessageContentRequiredError,
  MessageTemplateRequiredError,
} from './errors.js';
import type {
  SendTraineeTemplateMessageInput,
  SendTraineeTemplateReplyInput,
  SendTraineeTextMessageInput,
  SendTraineeTextReplyInput,
  SendTrainerTextMessageInput,
} from './messageTypes.js';

type RequiredFieldErrorFactory = () => Error;

function validateRequiredNonBlankString(
  value: string,
  createError: RequiredFieldErrorFactory,
): void {
  if (value.trim() === '') {
    throw createError();
  }
}

export function validateMessageContent(content: string): void {
  validateRequiredNonBlankString(
    content,
    () => new MessageContentRequiredError(),
  );
}

export function validateMessageTemplateId(templateId: string): void {
  validateRequiredNonBlankString(
    templateId,
    () => new MessageTemplateRequiredError(),
  );
}

export function validateTraineeTextMessageInput(
  input: SendTraineeTextMessageInput,
): void {
  validateMessageContent(input.content);
}

export function validateTraineeTextReplyInput(
  input: SendTraineeTextReplyInput,
): void {
  validateMessageContent(input.content);
}

export function validateTraineeTemplateMessageInput(
  input: SendTraineeTemplateMessageInput,
): void {
  validateMessageTemplateId(input.templateId);
}

export function validateTraineeTemplateReplyInput(
  input: SendTraineeTemplateReplyInput,
): void {
  validateMessageTemplateId(input.templateId);
}

export function validateTrainerTextMessageInput(
  input: SendTrainerTextMessageInput,
): void {
  validateMessageContent(input.content);
}
