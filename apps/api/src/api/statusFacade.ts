import type {
  ChatMessage,
  QuickQuestionResult,
  QuickReplyResult,
} from '../domain/chatTypes.js';
import type { TrainerStatusType } from '../domain/statusConstants.js';
import type { TrainerStatusRecord } from '../domain/statusTypes.js';
import type { UserRole } from '../domain/types.js';
import { toUserContext } from '../domain/userContext.js';
import type { ChatMessageStore } from '../repositories/chatMessageStore.js';
import type { TrainerStatusStore } from '../repositories/trainerStatusStore.js';
import { StatusService } from '../services/statusService.js';

const statusService = new StatusService();

export async function getTrainerStatus(
  trainerId: string,
  userId: string,
  role: UserRole,
  trainerStatusStore: TrainerStatusStore,
): Promise<TrainerStatusRecord> {
  return statusService.getTrainerStatus(
    trainerId,
    toUserContext(userId, role),
    trainerStatusStore,
  );
}

export async function sendQuickQuestion(
  templateMessage: string,
  trainerId: string,
  userId: string,
  role: UserRole,
  chatMessageStore: ChatMessageStore,
): Promise<QuickQuestionResult> {
  return statusService.sendQuickQuestion(
    templateMessage,
    trainerId,
    toUserContext(userId, role),
    chatMessageStore,
  );
}

export async function sendQuickReply(
  replyStamp: string,
  traineeId: string,
  userId: string,
  role: UserRole,
  chatMessageStore: ChatMessageStore,
): Promise<QuickReplyResult> {
  return statusService.sendQuickReply(
    replyStamp,
    traineeId,
    toUserContext(userId, role),
    chatMessageStore,
  );
}

export async function updateTrainerStatus(
  status: TrainerStatusType,
  userId: string,
  role: UserRole,
  trainerStatusStore: TrainerStatusStore,
): Promise<TrainerStatusRecord> {
  return statusService.updateTrainerStatus(
    status,
    toUserContext(userId, role),
    trainerStatusStore,
  );
}

export async function listChatMessages(
  trainerId: string,
  traineeId: string,
  userId: string,
  role: UserRole,
  chatMessageStore: ChatMessageStore,
): Promise<ChatMessage[]> {
  return statusService.listChatMessages(
    trainerId,
    traineeId,
    toUserContext(userId, role),
    chatMessageStore,
  );
}
