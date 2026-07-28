import type { UserRole } from './types.js';

interface ConversationListener {
  trainerId: string;
  traineeId: string;
  listenerUserId: string;
  listenerRole: UserRole;
}

export function matchesConversationListener(
  listener: ConversationListener,
  trainerId: string,
  traineeId: string,
): boolean {
  if (listener.trainerId !== trainerId || listener.traineeId !== traineeId) {
    return false;
  }

  if (listener.listenerRole === 'trainer') {
    return listener.listenerUserId === trainerId;
  }

  if (listener.listenerRole === 'trainee') {
    return listener.listenerUserId === traineeId;
  }

  return false;
}
