export const MESSAGE_UPDATE_TYPE = {
  MESSAGE_CREATED: 'message.created',
} as const;

export const MESSAGE_UPDATE_POLL_INTERVAL_MS = 5000;

export type MessageUpdateType =
  (typeof MESSAGE_UPDATE_TYPE)[keyof typeof MESSAGE_UPDATE_TYPE];
