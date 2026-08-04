export async function throwApiError(
  response: Response,
  fallbackMessage: string,
): Promise<never> {
  const body: unknown = await response.json().catch(() => null);
  const apiError =
    typeof body === 'object' &&
    body !== null &&
    'error' in body &&
    typeof body.error === 'string'
      ? body.error
      : fallbackMessage;
  throw new Error(apiError);
}
