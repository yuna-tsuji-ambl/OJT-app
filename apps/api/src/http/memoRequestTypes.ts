export interface UpdateMemoBody {
  memo: string;
}

export function parseUpdateMemoBody(body: unknown): UpdateMemoBody | null {
  if (typeof body !== 'object' || body === null || !('memo' in body)) {
    return null;
  }
  if (typeof body.memo !== 'string') {
    return null;
  }
  return { memo: body.memo };
}
