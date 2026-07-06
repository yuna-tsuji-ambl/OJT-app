export type { TrainerStatusRecord } from './domain/statusTypes.js';
export type { TrainerStatusType } from './domain/statusConstants.js';
export { TRAINER_STATUS } from './domain/statusConstants.js';
export type {
  ChatMessage,
  ChatMessageResult,
  QuickQuestionResult,
  QuickReplyResult,
} from './domain/chatTypes.js';
export type { ChatMessageType } from './domain/chatConstants.js';
export { CHAT_MESSAGE_TYPE } from './domain/chatConstants.js';
export type { ChatMessageStore } from './repositories/chatMessageStore.js';
export type { TrainerStatusStore } from './repositories/trainerStatusStore.js';
export { StatusService } from './services/statusService.js';

export {
  getTrainerStatus,
  sendQuickQuestion,
  sendQuickReply,
  updateTrainerStatus,
} from './api/statusFacade.js';
