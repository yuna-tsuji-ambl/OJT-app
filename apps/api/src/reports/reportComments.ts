import type { Report, ReportComment } from './reportTypes.js';

/** 永続化・レスポンス用に comments を常に配列へ正規化する */
export function normalizeReportComments(report: Report): Report {
  return {
    ...report,
    comments: Array.isArray(report.comments) ? report.comments : [],
  };
}

export function createReportComment(
  authorId: string,
  content: string,
  now: string = new Date().toISOString(),
): ReportComment {
  return {
    id: crypto.randomUUID(),
    authorId,
    content,
    createdAt: now,
  };
}

/** コメント追加後の報告エンティティを組み立てる（updatedAt も更新） */
export function appendReportComment(
  report: Report,
  comment: ReportComment,
  now: string = comment.createdAt,
): Report {
  const normalized = normalizeReportComments(report);
  return {
    ...normalized,
    comments: [...normalized.comments, comment],
    updatedAt: now,
  };
}

export interface UpdateReportCommentResult {
  readonly report: Report;
  readonly comment: ReportComment;
}

/**
 * 指定コメントの本文を更新する。
 * コメントが無い場合は null。
 */
export function updateReportCommentContent(
  report: Report,
  commentId: string,
  content: string,
  now: string = new Date().toISOString(),
): UpdateReportCommentResult | null {
  const normalized = normalizeReportComments(report);
  const commentIndex = normalized.comments.findIndex(
    (comment) => comment.id === commentId,
  );

  if (commentIndex < 0) {
    return null;
  }

  const existing = normalized.comments[commentIndex]!;
  const comment: ReportComment = {
    ...existing,
    content,
  };
  const comments = normalized.comments.map((item, index) =>
    index === commentIndex ? comment : item,
  );

  return {
    report: {
      ...normalized,
      comments,
      updatedAt: now,
    },
    comment,
  };
}
