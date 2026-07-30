import type { Report } from './reportTypes.js';

/** 報告一覧を更新日時（updatedAt）の新しい順に並べ替える（UC-R03 / UC-R04） */
export function sortReportsNewestFirst(reports: readonly Report[]): Report[] {
  return [...reports].sort((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt),
  );
}
