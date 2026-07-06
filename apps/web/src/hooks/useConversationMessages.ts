import { useCallback, useEffect, useState } from 'react';
import { fetchChatMessages } from '../api/statusApi';
import type { AuthUser } from '../auth/types';
import type { ChatMessage } from '../domain/statusTypes';
import { DEFAULT_TRAINEE_ID, DEFAULT_TRAINER_ID } from '../domain/statusConstants';

export function useConversationMessages(user: AuthUser | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const reloadMessages = useCallback(async (authUser: AuthUser) => {
    const nextMessages = await fetchChatMessages(
      DEFAULT_TRAINER_ID,
      DEFAULT_TRAINEE_ID,
      authUser,
    );
    setMessages(nextMessages);
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    void reloadMessages(user);
  }, [reloadMessages, user]);

  return { messages, reloadMessages };
}
