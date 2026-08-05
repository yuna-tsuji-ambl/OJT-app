export type MessageBookmarkTargetType = 'thread' | 'message';

export interface MessageBookmark {
  id: string;
  ownerUserId: string;
  targetType: MessageBookmarkTargetType;
  threadId: string;
  messageId?: string;
  /** メッセージ BM の送信者 userId（一覧の表示名解決用） */
  senderId?: string;
  /** メッセージ BM の本文（一覧表示用。thread BM では通常未設定） */
  content?: string;
  /** 対象メッセージの送信時刻（ISO 8601。並び替え用） */
  messageCreatedAt?: string;
  /** 個人メモ（メッセージ BM 一覧用。空文字は未設定扱い） */
  memo?: string;
  /** ブックマーク追加時刻（ISO 8601） */
  createdAt: string;
}
