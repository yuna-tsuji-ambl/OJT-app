import { expect, vi, type Mock } from 'vitest';
import type {
  MessageThreadId,
  ReloadMessageThreadHistory,
  SetMessageThreadSelection,
  UserContext,
} from '@ojt-app/shared';
import type {
  MessageThread,
  MessageThreadListItem,
  MessageThreadStore,
  ThreadChatMessage,
} from '../message.js';

export const U_M19_THREAD_A = 'thread-a' satisfies MessageThreadId;
export const U_M21_THREAD_B = 'thread-b' satisfies MessageThreadId;
export const U_M19_REALISTIC_THREAD_ID =
  'thread-r-m17-0' satisfies MessageThreadId;

export const U_M23_TRAINEE_USER = {
  userId: 'trainee-1',
  role: 'trainee',
} as const satisfies UserContext;

export const U_M23_TRAINER_USER = {
  userId: 'trainer-1',
  role: 'trainer',
} as const satisfies UserContext;

export const U_M23_THREAD_SELECTION_CASES = [
  {
    label: '新卒コンテキスト',
    authUser: U_M23_TRAINEE_USER,
    threadId: U_M19_THREAD_A,
  },
  {
    label: 'トレーナーコンテキスト',
    authUser: U_M23_TRAINER_USER,
    threadId: U_M21_THREAD_B,
  },
  {
    label: '実在threadId形式',
    authUser: U_M23_TRAINEE_USER,
    threadId: U_M19_REALISTIC_THREAD_ID,
  },
] as const;

export const U_M24_INLINE_DESELECT_CASES = [
  {
    label: '新卒コンテキスト',
    authUser: U_M23_TRAINEE_USER,
    selectedThreadId: U_M19_THREAD_A,
    clickedThreadId: U_M19_THREAD_A,
  },
  {
    label: 'トレーナーコンテキスト',
    authUser: U_M23_TRAINER_USER,
    selectedThreadId: U_M21_THREAD_B,
    clickedThreadId: U_M21_THREAD_B,
  },
  {
    label: '実在threadId形式',
    authUser: U_M23_TRAINEE_USER,
    selectedThreadId: U_M19_REALISTIC_THREAD_ID,
    clickedThreadId: U_M19_REALISTIC_THREAD_ID,
  },
] as const;

export function createMessageThreadSelectionMocks(): {
  setSelectedThreadId: Mock<SetMessageThreadSelection>;
  reloadThreadHistory: Mock<ReloadMessageThreadHistory>;
} {
  return {
    setSelectedThreadId: vi.fn<SetMessageThreadSelection>(),
    reloadThreadHistory: vi
      .fn<ReloadMessageThreadHistory>()
      .mockResolvedValue([]),
  };
}

export const R_M17_THREAD_LIST_BASE_TIME = '2026-07-24T00:00:00.000Z';

export function buildR_M17_THREAD_ID(index: number): MessageThreadId {
  return `thread-r-m17-${index}` satisfies MessageThreadId;
}

export function createR_M17_THREAD_LIST_ITEM(
  index: number,
  traineeId: string,
  trainerId: string,
): MessageThreadListItem {
  const threadId = buildR_M17_THREAD_ID(index);
  const timestamp = new Date(
    new Date(R_M17_THREAD_LIST_BASE_TIME).getTime() + index * 1000,
  ).toISOString();

  return {
    thread: {
      id: threadId,
      traineeId,
      trainerId,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    firstMessage: {
      id: `msg-r-m17-${index}`,
      threadId,
      senderId: traineeId,
      receiverId: trainerId,
      content: `preview-${index}`,
      type: 'text',
      createdAt: timestamp,
    },
  };
}

export function createR_M17_THREAD_LIST(
  count: number,
  traineeId: string,
  trainerId: string,
): MessageThreadListItem[] {
  return Array.from({ length: count }, (_, index) =>
    createR_M17_THREAD_LIST_ITEM(index, traineeId, trainerId),
  );
}

export const MOCK_MESSAGE_THREAD: MessageThread = {
  id: 'thread-1',
  traineeId: 'trainee-1',
  trainerId: 'trainer-1',
  createdAt: '2026-07-22T03:00:00.000Z',
  updatedAt: '2026-07-22T03:00:00.000Z',
};

export function createMockMessageThreadStore(
  overrides: Partial<MessageThreadStore> = {},
  baseThread: MessageThread = MOCK_MESSAGE_THREAD,
): MessageThreadStore {
  let storedThread: MessageThread = { ...baseThread };

  const store: MessageThreadStore = {
    create: vi.fn().mockImplementation(async () => {
      storedThread = { ...baseThread };
      return storedThread;
    }),
    update: vi.fn().mockImplementation(async (thread: MessageThread) => {
      storedThread = { ...thread };
      return storedThread;
    }),
    listByParticipants: vi.fn().mockResolvedValue([]),
    getById: vi
      .fn()
      .mockImplementation(async (threadId: string) =>
        threadId === storedThread.id ? { ...storedThread } : null,
      ),
  };

  return { ...store, ...overrides };
}

export function expectThreadWithLatestActivity(
  thread: MessageThread,
  message: ThreadChatMessage,
  baseThread: MessageThread = MOCK_MESSAGE_THREAD,
): void {
  expect(thread).toEqual({
    ...baseThread,
    updatedAt: message.createdAt,
  });
}
