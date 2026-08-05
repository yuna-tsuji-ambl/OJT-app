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

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
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

export class MessageBookmarkNotFoundError extends Error {
  constructor(bookmarkId: string) {
    super(`Message bookmark not found: ${bookmarkId}`);
    this.name = 'MessageBookmarkNotFoundError';
  }
}

export class MessageBookmarkInvalidInputError extends Error {
  constructor(message = 'Invalid message bookmark input') {
    super(message);
    this.name = 'MessageBookmarkInvalidInputError';
  }
}

export class MessageBookmarkTargetNotFoundError extends Error {
  constructor(targetId: string) {
    super(`Message bookmark target not found: ${targetId}`);
    this.name = 'MessageBookmarkTargetNotFoundError';
  }
}

export const INVALID_MESSAGE_BOOKMARK_INPUT_MESSAGE =
  'Invalid message bookmark input' as const;

export class MessageAnnouncementNotFoundError extends Error {
  constructor(announcementId: string) {
    super(`Message announcement not found: ${announcementId}`);
    this.name = 'MessageAnnouncementNotFoundError';
  }
}

export class MessageAnnouncementInvalidInputError extends Error {
  constructor(message = 'Invalid message announcement input') {
    super(message);
    this.name = 'MessageAnnouncementInvalidInputError';
  }
}

export class MessageAnnouncementTargetNotFoundError extends Error {
  constructor(targetId: string) {
    super(`Message announcement target not found: ${targetId}`);
    this.name = 'MessageAnnouncementTargetNotFoundError';
  }
}

export const INVALID_MESSAGE_ANNOUNCEMENT_INPUT_MESSAGE =
  'Invalid message announcement input' as const;

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

export const INVALID_REPORT_INPUT_MESSAGE = 'Invalid report input' as const;

export class ReportInvalidInputError extends Error {
  constructor(message: string = INVALID_REPORT_INPUT_MESSAGE) {
    super(message);
    this.name = 'ReportInvalidInputError';
  }
}

export class ReportNotFoundError extends Error {
  constructor(periodKey: string) {
    super(`Report not found: ${periodKey}`);
    this.name = 'ReportNotFoundError';
  }
}

export const INVALID_GOAL_INPUT_MESSAGE = 'Invalid goal input' as const;

export class GoalInvalidInputError extends Error {
  constructor(message: string = INVALID_GOAL_INPUT_MESSAGE) {
    super(message);
    this.name = 'GoalInvalidInputError';
  }
}

export class GoalNotFoundError extends Error {
  constructor(goalId: string) {
    super(`Goal not found: ${goalId}`);
    this.name = 'GoalNotFoundError';
  }
}

export const INVALID_LEARNING_INPUT_MESSAGE = 'Invalid learning input' as const;

export class LearningInvalidInputError extends Error {
  constructor(message: string = INVALID_LEARNING_INPUT_MESSAGE) {
    super(message);
    this.name = 'LearningInvalidInputError';
  }
}
