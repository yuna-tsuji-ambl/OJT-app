import { matchesConversationListener } from '../domain/messageRealtimeMatching.js';
import type { UserRole } from '../domain/types.js';
import type {
  MessageRealtimeHub,
  MessageUpdateEvent,
  MessageUpdateListener,
  Unsubscribe,
} from '../domain/messageRealtimeTypes.js';

interface MessageRealtimeSubscription {
  trainerId: string;
  traineeId: string;
  listenerUserId: string;
  listenerRole: UserRole;
  listener: MessageUpdateListener;
}

export function createMessageRealtimeHub(): MessageRealtimeHub {
  const subscriptions: MessageRealtimeSubscription[] = [];

  return {
    subscribe(
      trainerId: string,
      traineeId: string,
      listenerUserId: string,
      listenerRole: UserRole,
      listener: MessageUpdateListener,
    ): Unsubscribe {
      const subscription: MessageRealtimeSubscription = {
        trainerId,
        traineeId,
        listenerUserId,
        listenerRole,
        listener,
      };

      subscriptions.push(subscription);

      return () => {
        const index = subscriptions.indexOf(subscription);

        if (index >= 0) {
          subscriptions.splice(index, 1);
        }
      };
    },

    publish(
      trainerId: string,
      traineeId: string,
      event: MessageUpdateEvent,
    ): void {
      for (const subscription of subscriptions) {
        if (!matchesConversationListener(subscription, trainerId, traineeId)) {
          continue;
        }

        subscription.listener(event);
      }
    },
  };
}
