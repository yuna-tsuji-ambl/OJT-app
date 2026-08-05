import { useCallback } from 'react';
import { postReportComment, putReportComment } from '../api/reportApi';
import { useAuth } from '../auth/AuthContext';
import { isTrainerRole } from '../auth/roles';
import type { AuthUser } from '../auth/types';

interface UseReportCommentSubmitOptions {
  readonly reportId: string | undefined;
  readonly reload: (authUser: AuthUser) => Promise<unknown>;
}

interface TrainerCommentContext {
  readonly user: AuthUser;
  readonly reportId: string;
}

function resolveTrainerCommentContext(
  user: AuthUser | null,
  reportId: string | undefined,
): TrainerCommentContext | null {
  if (!user || !reportId || !isTrainerRole(user.role)) {
    return null;
  }

  return { user, reportId };
}

/** 報告詳細でのトレーナーコメント送信・更新（UC-R05 / P-R01 / P-R02） */
export function useReportCommentSubmit({
  reportId,
  reload,
}: UseReportCommentSubmitOptions): {
  readonly canManageComments: boolean;
  readonly submitComment: (content: string) => Promise<void>;
  readonly updateComment: (commentId: string, content: string) => Promise<void>;
} {
  const { user } = useAuth();
  const canManageComments =
    resolveTrainerCommentContext(user, reportId) !== null;

  const submitComment = useCallback(
    async (content: string): Promise<void> => {
      const context = resolveTrainerCommentContext(user, reportId);
      if (!context) {
        return;
      }

      await postReportComment(context.reportId, { content }, context.user);
      await reload(context.user);
    },
    [reload, reportId, user],
  );

  const updateComment = useCallback(
    async (commentId: string, content: string): Promise<void> => {
      const context = resolveTrainerCommentContext(user, reportId);
      if (!context) {
        return;
      }

      await putReportComment(
        context.reportId,
        commentId,
        { content },
        context.user,
      );
      await reload(context.user);
    },
    [reload, reportId, user],
  );

  return { canManageComments, submitComment, updateComment };
}
