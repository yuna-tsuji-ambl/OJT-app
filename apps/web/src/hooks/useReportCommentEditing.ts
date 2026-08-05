import { useCallback, useState } from 'react';

interface UseReportCommentEditingOptions {
  readonly updateComment: (commentId: string, content: string) => Promise<void>;
}

/** 報告詳細のコメント編集 UI 状態（P-R02） */
export function useReportCommentEditing({
  updateComment,
}: UseReportCommentEditingOptions): {
  readonly editingCommentId: string | null;
  readonly startEditComment: (commentId: string) => void;
  readonly submitEditedComment: (
    commentId: string,
    content: string,
  ) => Promise<void>;
  readonly isEditing: boolean;
} {
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);

  const startEditComment = useCallback((commentId: string) => {
    setEditingCommentId(commentId);
  }, []);

  const submitEditedComment = useCallback(
    async (commentId: string, content: string): Promise<void> => {
      await updateComment(commentId, content);
      setEditingCommentId(null);
    },
    [updateComment],
  );

  return {
    editingCommentId,
    startEditComment,
    submitEditedComment,
    isEditing: editingCommentId !== null,
  };
}
