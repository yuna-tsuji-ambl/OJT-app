export const MESSAGE_THREAD_LIST_PAGE_SIZE = 20;
export const FIRST_MESSAGE_THREAD_LIST_PAGE = 1;

export interface PaginatedMessageThreads<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

function countPagedTotalPages(totalItems: number, pageSize: number): number {
  if (totalItems === 0) {
    return 0;
  }

  return Math.ceil(totalItems / pageSize);
}

function createMessageThreadListPageStartIndex(
  page: number,
  pageSize: number,
): number {
  return (page - FIRST_MESSAGE_THREAD_LIST_PAGE) * pageSize;
}

function slicePagedItems<T>(items: T[], page: number, pageSize: number): T[] {
  const startIndex = createMessageThreadListPageStartIndex(page, pageSize);

  return items.slice(startIndex, startIndex + pageSize);
}

export function isEmptyPaginatedMessageThreads<T>(
  paginated: PaginatedMessageThreads<T>,
): boolean {
  return paginated.totalItems === 0;
}

export function paginateMessageThreads<T>(
  threads: T[],
  page: number,
  pageSize = MESSAGE_THREAD_LIST_PAGE_SIZE,
): PaginatedMessageThreads<T> {
  const totalItems = threads.length;

  return {
    items: slicePagedItems(threads, page, pageSize),
    page,
    pageSize,
    totalItems,
    totalPages: countPagedTotalPages(totalItems, pageSize),
  };
}
