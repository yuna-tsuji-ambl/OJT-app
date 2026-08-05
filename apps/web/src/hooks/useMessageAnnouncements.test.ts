import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MessageAnnouncement } from '@ojt-app/shared';
import type { AuthUser } from '../auth/types';
import { useMessageAnnouncements } from './useMessageAnnouncements';

const fetchMessageAnnouncements = vi.fn();
const createMessageAnnouncement = vi.fn();
const deleteMessageAnnouncement = vi.fn();
const updateMessageAnnouncementMemo = vi.fn();

vi.mock('../api/messageAnnouncementApi', () => ({
  fetchMessageAnnouncements: (...args: unknown[]) =>
    fetchMessageAnnouncements(...args),
  createMessageAnnouncement: (...args: unknown[]) =>
    createMessageAnnouncement(...args),
  deleteMessageAnnouncement: (...args: unknown[]) =>
    deleteMessageAnnouncement(...args),
  updateMessageAnnouncementMemo: (...args: unknown[]) =>
    updateMessageAnnouncementMemo(...args),
}));

const TRAINEE_USER: AuthUser = {
  userId: 'trainee-1',
  role: 'trainee',
};

function sampleAnnouncement(
  messageId: string,
  overrides: Partial<MessageAnnouncement> = {},
): MessageAnnouncement {
  return {
    id: messageId,
    threadId: 'thread-a',
    messageId,
    announcedByUserId: TRAINEE_USER.userId,
    announcedByRole: 'trainee',
    createdAt: '2026-08-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('useMessageAnnouncements', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchMessageAnnouncements.mockResolvedValue([]);
    createMessageAnnouncement.mockResolvedValue(sampleAnnouncement('msg-1'));
    deleteMessageAnnouncement.mockResolvedValue(undefined);
  });

  it('U-AN03: メッセージアナウンスを追加・解除する', async () => {
    const { result } = renderHook(() => useMessageAnnouncements(TRAINEE_USER));

    await waitFor(() => {
      expect(fetchMessageAnnouncements).toHaveBeenCalledWith(TRAINEE_USER);
    });

    fetchMessageAnnouncements.mockResolvedValue([sampleAnnouncement('msg-1')]);

    await act(async () => {
      await result.current.toggleMessageAnnouncement('thread-a', 'msg-1');
    });

    expect(createMessageAnnouncement).toHaveBeenCalledWith(TRAINEE_USER, {
      threadId: 'thread-a',
      messageId: 'msg-1',
    });
    expect(result.current.announcedMessageIds.has('msg-1')).toBe(true);

    fetchMessageAnnouncements.mockResolvedValue([]);

    await act(async () => {
      await result.current.toggleMessageAnnouncement('thread-a', 'msg-1');
    });

    expect(deleteMessageAnnouncement).toHaveBeenCalledWith(
      TRAINEE_USER,
      'msg-1',
    );
    expect(result.current.announcedMessageIds.has('msg-1')).toBe(false);
  });

  it('U-AN04: アナウンスの共有メモを更新する', async () => {
    fetchMessageAnnouncements.mockResolvedValue([sampleAnnouncement('msg-1')]);
    updateMessageAnnouncementMemo.mockResolvedValue(
      sampleAnnouncement('msg-1', { memo: '共有メモ' }),
    );

    const { result } = renderHook(() => useMessageAnnouncements(TRAINEE_USER));

    await waitFor(() => {
      expect(result.current.announcements).toHaveLength(1);
    });

    fetchMessageAnnouncements.mockResolvedValue([
      sampleAnnouncement('msg-1', { memo: '共有メモ' }),
    ]);

    await act(async () => {
      await result.current.updateAnnouncementMemo('msg-1', '共有メモ');
    });

    expect(updateMessageAnnouncementMemo).toHaveBeenCalledWith(
      TRAINEE_USER,
      'msg-1',
      '共有メモ',
    );
    expect(result.current.announcements[0]?.memo).toBe('共有メモ');
  });
});
