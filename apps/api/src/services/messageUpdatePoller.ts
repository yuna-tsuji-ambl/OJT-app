import type {
  CreateMessageUpdatePollerOptions,
  MessageUpdatePoller,
} from '../domain/messageUpdatePollerTypes.js';

export function createMessageUpdatePoller(
  options: CreateMessageUpdatePollerOptions,
): MessageUpdatePoller {
  let intervalId: ReturnType<typeof setInterval> | undefined;

  return {
    start(): void {
      if (intervalId !== undefined) {
        return;
      }

      intervalId = setInterval(() => {
        void options.poll();
      }, options.intervalMs);
    },

    stop(): void {
      if (intervalId === undefined) {
        return;
      }

      clearInterval(intervalId);
      intervalId = undefined;
    },
  };
}
