import { ensureTrainee, ensureTrainer } from '../domain/authorization.js';
import { buildQuickQuestion, buildQuickReply } from '../domain/chatMessage.js';
import { ForbiddenError } from '../domain/errors.js';
import type {
  ChatMessage,
  ChatMessageResult,
  QuickQuestionResult,
  QuickReplyResult,
} from '../domain/chatTypes.js';
import { TRAINER_STATUS } from '../domain/statusConstants.js';
import type { TrainerStatusType } from '../domain/statusConstants.js';
import type { TrainerStatusRecord } from '../domain/statusTypes.js';
import { createTrainerStatusRecord } from '../domain/trainerStatus.js';
import type { UserContext } from '../domain/types.js';
import type { ChatMessageStore } from '../repositories/chatMessageStore.js';
import type { TrainerStatusStore } from '../repositories/trainerStatusStore.js';

/** 未登録時はシードと同じ「集中モード」を返す（表示用。永続化はしない） */
function resolveTrainerStatusRecord(
  trainerId: string,
  record: TrainerStatusRecord | null,
): TrainerStatusRecord {
  if (record) {
    return record;
  }
  return createTrainerStatusRecord(trainerId, TRAINER_STATUS.FOCUS_MODE);
}

async function loadTrainerStatus(
  trainerId: string,
  trainerStatusStore: TrainerStatusStore,
): Promise<TrainerStatusRecord> {
  const record = await trainerStatusStore.getByUserId(trainerId);
  return resolveTrainerStatusRecord(trainerId, record);
}

async function loadTrainerStatusForViewer(
  trainerId: string,
  context: UserContext,
  trainerStatusStore: TrainerStatusStore,
): Promise<TrainerStatusRecord> {
  const isTraineeViewer = context.role === 'trainee';
  const isOwnTrainerStatus =
    context.role === 'trainer' && context.userId === trainerId;

  if (!isTraineeViewer && !isOwnTrainerStatus) {
    throw new ForbiddenError();
  }

  return loadTrainerStatus(trainerId, trainerStatusStore);
}

async function persistTrainerStatus(
  userId: string,
  status: TrainerStatusType,
  trainerStatusStore: TrainerStatusStore,
): Promise<TrainerStatusRecord> {
  await trainerStatusStore.update(userId, status);
  return createTrainerStatusRecord(userId, status);
}

async function updateTrainerStatusForTrainer(
  status: TrainerStatusType,
  context: UserContext,
  trainerStatusStore: TrainerStatusStore,
): Promise<TrainerStatusRecord> {
  ensureTrainer(context);
  return persistTrainerStatus(context.userId, status, trainerStatusStore);
}

async function appendChatMessage(
  message: ChatMessage,
  chatMessageStore: ChatMessageStore,
): Promise<void> {
  await chatMessageStore.append(message);
}

async function deliverChatMessage<T extends ChatMessageResult>(
  result: T,
  chatMessageStore: ChatMessageStore,
): Promise<T> {
  await appendChatMessage(result.message, chatMessageStore);
  return result;
}

async function sendQuickQuestionForTrainee(
  templateMessage: string,
  trainerId: string,
  context: UserContext,
  chatMessageStore: ChatMessageStore,
): Promise<QuickQuestionResult> {
  ensureTrainee(context);

  const result = buildQuickQuestion(context.userId, trainerId, templateMessage);

  return deliverChatMessage(result, chatMessageStore);
}

async function sendQuickReplyForTrainer(
  replyStamp: string,
  traineeId: string,
  context: UserContext,
  chatMessageStore: ChatMessageStore,
): Promise<QuickReplyResult> {
  ensureTrainer(context);

  const result = buildQuickReply(context.userId, traineeId, replyStamp);

  return deliverChatMessage(result, chatMessageStore);
}

async function listConversationMessages(
  trainerId: string,
  traineeId: string,
  context: UserContext,
  chatMessageStore: ChatMessageStore,
): Promise<ChatMessage[]> {
  const isParticipant =
    context.userId === trainerId || context.userId === traineeId;

  if (!isParticipant) {
    throw new ForbiddenError();
  }

  return chatMessageStore.listBetween(traineeId, trainerId);
}

export class StatusService {
  async updateTrainerStatus(
    status: TrainerStatusType,
    context: UserContext,
    trainerStatusStore: TrainerStatusStore,
  ): Promise<TrainerStatusRecord> {
    return updateTrainerStatusForTrainer(status, context, trainerStatusStore);
  }

  async getTrainerStatus(
    trainerId: string,
    context: UserContext,
    trainerStatusStore: TrainerStatusStore,
  ): Promise<TrainerStatusRecord> {
    return loadTrainerStatusForViewer(trainerId, context, trainerStatusStore);
  }

  async sendQuickQuestion(
    templateMessage: string,
    trainerId: string,
    context: UserContext,
    chatMessageStore: ChatMessageStore,
  ): Promise<QuickQuestionResult> {
    return sendQuickQuestionForTrainee(
      templateMessage,
      trainerId,
      context,
      chatMessageStore,
    );
  }

  async sendQuickReply(
    replyStamp: string,
    traineeId: string,
    context: UserContext,
    chatMessageStore: ChatMessageStore,
  ): Promise<QuickReplyResult> {
    return sendQuickReplyForTrainer(
      replyStamp,
      traineeId,
      context,
      chatMessageStore,
    );
  }

  async listChatMessages(
    trainerId: string,
    traineeId: string,
    context: UserContext,
    chatMessageStore: ChatMessageStore,
  ): Promise<ChatMessage[]> {
    return listConversationMessages(
      trainerId,
      traineeId,
      context,
      chatMessageStore,
    );
  }
}
