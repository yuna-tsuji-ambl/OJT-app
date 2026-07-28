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
