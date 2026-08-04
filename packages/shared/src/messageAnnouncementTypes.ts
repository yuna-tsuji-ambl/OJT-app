import type { UserRole } from './types.js';

export interface MessageAnnouncement {
  id: string;
  threadId: string;
  messageId: string;
  announcedByUserId: string;
  announcedByRole: UserRole;
  /** 対象メッセージの送信者 userId（一覧の表示名解決用） */
  senderId?: string;
  /** 対象メッセージの本文（一覧表示用） */
  content?: string;
  /** 対象メッセージの送信時刻（ISO 8601。並び替え用） */
  messageCreatedAt?: string;
  /** ペア共有メモ（空文字は未設定扱い） */
  memo?: string;
  /** アナウンス追加時刻（ISO 8601） */
  createdAt: string;
}
