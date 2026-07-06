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
