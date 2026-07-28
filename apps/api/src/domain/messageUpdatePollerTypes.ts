export type MessageUpdatePollFn = () => void | Promise<void>;

export interface CreateMessageUpdatePollerOptions {
  intervalMs: number;
  poll: MessageUpdatePollFn;
}

export interface MessageUpdatePoller {
  start(): void;
  stop(): void;
}
