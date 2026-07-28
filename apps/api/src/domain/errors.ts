export class QuestNotFoundError extends Error {
  constructor(questId: string) {
    super(`Quest not found: ${questId}`);
    this.name = 'QuestNotFoundError';
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class TrainerStatusNotFoundError extends Error {
  constructor(trainerId: string) {
    super(`Trainer status not found: ${trainerId}`);
    this.name = 'TrainerStatusNotFoundError';
  }
}

export class ConditionRecordNotFoundError extends Error {
  constructor(traineeId: string) {
    super(`Condition record not found: ${traineeId}`);
    this.name = 'ConditionRecordNotFoundError';
  }
}

export class ConditionInvalidValueError extends Error {
  constructor() {
    super('Condition value must be between 1 and 5');
    this.name = 'ConditionInvalidValueError';
  }
}

export class QuestTitleRequiredError extends Error {
  constructor(questId: string) {
    super(`Quest title is required: ${questId}`);
    this.name = 'QuestTitleRequiredError';
  }
}

export class QuestCommentRequiredError extends Error {
  constructor(questId: string) {
    super(`Quest comment is required: ${questId}`);
    this.name = 'QuestCommentRequiredError';
  }
}

export class QuestAchievementLevelFormatError extends Error {
  constructor(questId: string) {
    super(`Quest achievement level must be in Lv format: ${questId}`);
    this.name = 'QuestAchievementLevelFormatError';
  }
}

export class AssignmentNotFoundError extends Error {
  constructor(assignmentId: string) {
    super(`Assignment not found: ${assignmentId}`);
    this.name = 'AssignmentNotFoundError';
  }
}

export class InvalidAssignmentStatusError extends Error {
  constructor(assignmentId: string, currentStatus: string, nextStatus: string) {
    super(
      `Invalid assignment status transition for ${assignmentId}: ${currentStatus} -> ${nextStatus}`,
    );
    this.name = 'InvalidAssignmentStatusError';
  }
}

export class UnknownQuestionTemplateError extends Error {
  constructor(templateId: string) {
    super(`Unknown question template: ${templateId}`);
    this.name = 'UnknownQuestionTemplateError';
  }
}

export class UnknownReplyTemplateError extends Error {
  constructor(templateId: string) {
    super(`Unknown reply template: ${templateId}`);
    this.name = 'UnknownReplyTemplateError';
  }
}

export class MessageThreadNotFoundError extends Error {
  constructor(threadId: string) {
    super(`Message thread not found: ${threadId}`);
    this.name = 'MessageThreadNotFoundError';
  }
}

export class UnknownStampError extends Error {
  constructor(stampId: string) {
    super(`Unknown stamp: ${stampId}`);
    this.name = 'UnknownStampError';
  }
}

export class MessageContentRequiredError extends Error {
  constructor() {
    super('Message content is required');
    this.name = 'MessageContentRequiredError';
  }
}

export class MessageTemplateRequiredError extends Error {
  constructor() {
    super('Message template is required');
    this.name = 'MessageTemplateRequiredError';
  }
}

export class LegacyQuickReplyNotSupportedError extends Error {
  constructor() {
    super('Legacy quick reply is not supported');
    this.name = 'LegacyQuickReplyNotSupportedError';
  }
}
