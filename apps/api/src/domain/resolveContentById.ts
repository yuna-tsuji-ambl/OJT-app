export function createContentResolver(
  contentById: Readonly<Record<string, string>>,
  createError: (id: string) => Error,
): (id: string) => string {
  return (id: string) => {
    const content = contentById[id];

    if (!content) {
      throw createError(id);
    }

    return content;
  };
}
