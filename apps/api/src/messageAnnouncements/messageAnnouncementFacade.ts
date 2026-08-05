import type { MessageAnnouncement } from '@ojt-app/shared';
import type { UserContext } from '../domain/types.js';
import {
  cascadeDeleteAnnouncementsForMessage,
  cascadeDeleteAnnouncementsForThread,
  createMessageAnnouncementCommand,
  deleteMessageAnnouncementCommand,
  listMessageAnnouncementsCommand,
  updateMessageAnnouncementMemoCommand,
  type CreateMessageAnnouncementInput,
  type MessageAnnouncementDeps,
  type UpdateMessageAnnouncementMemoInput,
} from './messageAnnouncementCommands.js';

export function listMessageAnnouncements(
  context: UserContext,
  deps: MessageAnnouncementDeps,
): Promise<MessageAnnouncement[]> {
  return listMessageAnnouncementsCommand(context, deps);
}

export function createMessageAnnouncement(
  input: CreateMessageAnnouncementInput,
  context: UserContext,
  deps: MessageAnnouncementDeps,
): Promise<MessageAnnouncement> {
  return createMessageAnnouncementCommand(input, context, deps);
}

export function deleteMessageAnnouncement(
  announcementId: string,
  context: UserContext,
  deps: MessageAnnouncementDeps,
): Promise<void> {
  return deleteMessageAnnouncementCommand(announcementId, context, deps);
}

export function updateMessageAnnouncementMemo(
  announcementId: string,
  input: UpdateMessageAnnouncementMemoInput,
  context: UserContext,
  deps: MessageAnnouncementDeps,
): Promise<MessageAnnouncement> {
  return updateMessageAnnouncementMemoCommand(
    announcementId,
    input,
    context,
    deps,
  );
}

export {
  cascadeDeleteAnnouncementsForMessage,
  cascadeDeleteAnnouncementsForThread,
};
