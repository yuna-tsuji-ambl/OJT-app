export async function parseJsonResponse<T>(
  response: Response,
  errorMessage: string,
): Promise<T> {
  if (!response.ok) {
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}

function isAbsentJsonBody(body: unknown): body is null | undefined | '' {
  return body === null || body === undefined || body === '';
}

/** 404 または空ボディを「未作成」として null に正規化する */
export async function parseOptionalJsonResponse<T>(
  response: Response,
  errorMessage: string,
): Promise<T | null> {
  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  const body: unknown = await response.json();
  if (isAbsentJsonBody(body)) {
    return null;
  }

  return body as T;
}
