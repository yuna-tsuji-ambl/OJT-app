export {
  ForbiddenError,
  LegacyQuickReplyNotSupportedError,
  MessageContentRequiredError,
  MessageTemplateRequiredError,
  MessageThreadNotFoundError,
} from './domain/errors.js';
export {
  QUESTION_TEMPLATE_TQ1_CONTENT,
  QUESTION_TEMPLATE_TQ1_ID,
  QUESTION_TEMPLATE_TQ2_CONTENT,
  QUESTION_TEMPLATE_TQ2_ID,
  QUESTION_TEMPLATE_TQ3_CONTENT,
  QUESTION_TEMPLATE_TQ3_ID,
  QUESTION_TEMPLATE_TQ4_CONTENT,
  QUESTION_TEMPLATE_TQ4_ID,
  QUESTION_TEMPLATE_TQ5_CONTENT,
  QUESTION_TEMPLATE_TQ5_ID,
} from './domain/messageConstants.js';
export { LEGACY_QUICK_REPLY_CONTENT } from './domain/legacyMessageConstants.js';
export { MESSAGE_UPDATE_POLL_INTERVAL_MS } from './domain/messageRealtimeConstants.js';
export {
  REPLY_TEMPLATE_TT2_CONTENT,
  REPLY_TEMPLATE_TT2_ID,
  REPLY_TEMPLATE_TT4_CONTENT,
  REPLY_TEMPLATE_TT4_ID,
} from './domain/replyTemplateConstants.js';
export {
  STAMP_ST1_CONTENT,
  STAMP_ST1_ID,
  STAMP_ST2_CONTENT,
  STAMP_ST2_ID,
  STAMP_ST3_CONTENT,
  STAMP_ST3_ID,
  STAMP_ST4_CONTENT,
  STAMP_ST4_ID,
  STAMP_ST5_CONTENT,
  STAMP_ST5_ID,
} from './domain/stampConstants.js';
export {
  TRAINEE_STAMP_STS1_CONTENT,
  TRAINEE_STAMP_STS1_ID,
  TRAINEE_STAMP_STS2_CONTENT,
  TRAINEE_STAMP_STS2_ID,
  TRAINEE_STAMP_STS3_CONTENT,
  TRAINEE_STAMP_STS3_ID,
  TRAINEE_STAMP_STS4_CONTENT,
  TRAINEE_STAMP_STS4_ID,
  TRAINEE_STAMP_STS5_CONTENT,
  TRAINEE_STAMP_STS5_ID,
} from './domain/traineeStampConstants.js';
export type {
  MessageRealtimeHub,
  MessageUpdateEvent,
} from './domain/messageRealtimeTypes.js';
export type {
  CreateMessageUpdatePollerOptions,
  MessageUpdatePoller,
} from './domain/messageUpdatePollerTypes.js';
export type {
  MessageThread,
  MessageThreadListItem,
  SendTemplateMessageResult,
  SendTextMessageResult,
  SendTrainerStampReplyResult,
  SendTrainerTemplateMessageResult,
  SendTrainerTemplateReplyResult,
  SendTrainerTextReplyResult,
  SendTraineeStampReplyResult,
  ThreadChatMessage,
} from './domain/messageTypes.js';
export type { MessageThreadStore } from './repositories/messageThreadStore.js';
export type { ThreadChatMessageStore } from './repositories/threadChatMessageStore.js';
export { FirestoreMessageThreadStore } from './repositories/firestore/firestoreMessageThreadStore.js';
export { FirestoreThreadChatMessageStore } from './repositories/firestore/firestoreThreadChatMessageStore.js';
export { createFirestoreMessagePersistence } from './repositories/createFirestoreMessagePersistence.js';
export type { FirestoreMessagePersistence } from './repositories/createFirestoreMessagePersistence.js';
export { FIRESTORE_COLLECTIONS } from './firestore/collections.js';
export { createMessageRealtimeHub } from './services/inMemoryMessageRealtimeHub.js';
export { createMessageUpdatePoller } from './services/messageUpdatePoller.js';
export {
  listMessageThreads,
  listThreadChatMessages,
  sendTrainerLegacyFlatReply,
  sendTrainerStampReply,
  sendTrainerTemplateMessage,
  sendTrainerTemplateReply,
  sendTrainerTextReply,
  sendTraineeStampReply,
  sendTraineeTemplateMessage,
  sendTraineeTextMessage,
  sendTraineeTextReply,
  syncMissedMessageUpdates,
} from './api/messageFacade.js';
