export function readRouteParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

export function readQueryParam(
  value: unknown,
): string | null {
  return typeof value === 'string' ? value : null;
}
