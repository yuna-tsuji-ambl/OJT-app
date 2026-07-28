import { useCallback } from 'react';
import { fetchChatMessages } from '../api/legacyChatApi';
import type { AuthUser } from '../auth/types';
import type { ChatMessage } from '../domain/statusTypes';
import {
  DEFAULT_TRAINEE_ID,
  DEFAULT_TRAINER_ID,
} from '../domain/participantConstants';
import { useAuthParticipantResource } from './useAuthParticipantResource';

export function useConversationMessages(user: AuthUser | null) {
  const fetchMessages = useCallback(
    (authUser: AuthUser) =>
      fetchChatMessages(DEFAULT_TRAINER_ID, DEFAULT_TRAINEE_ID, authUser),
    [],
  );

  const { data: messages, reload: reloadMessages } = useAuthParticipantResource<
    ChatMessage[]
  >(user, fetchMessages, []);

  return { messages, reloadMessages };
}
