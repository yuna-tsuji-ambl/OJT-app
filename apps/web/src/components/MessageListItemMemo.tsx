import { useEffect, useState } from 'react';
import { MESSAGE_MEMO_MAX_LENGTH } from '../domain/messageMemo';

interface MessageListItemMemoProps {
  value: string;
  onSave: (memo: string) => void | Promise<void>;
  label?: string;
  placeholder?: string;
  maxLength?: number;
}

/** 一覧行内のメモ入力。blur 時に保存（変更がなければ送らない） */
export function MessageListItemMemo({
  value,
  onSave,
  label = 'メモ',
  placeholder = 'メモを入力…',
  maxLength = MESSAGE_MEMO_MAX_LENGTH,
}: MessageListItemMemoProps) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  return (
    <label
      className="message-list-item-memo"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <span className="message-list-item-memo__label">{label}</span>
      <textarea
        className="message-list-item-memo__input"
        value={draft}
        maxLength={maxLength}
        rows={2}
        placeholder={placeholder}
        aria-label={label}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => {
          if (draft === value) {
            return;
          }
          void onSave(draft);
        }}
      />
    </label>
  );
}
