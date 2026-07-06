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
