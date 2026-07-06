const FIRESTORE_NOT_FOUND_CODE = 5;

export function isFirestoreDatabaseNotFoundError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === FIRESTORE_NOT_FOUND_CODE
  );
}

export function toFirestoreStartupError(error: unknown): Error {
  if (!isFirestoreDatabaseNotFoundError(error)) {
    return error instanceof Error ? error : new Error(String(error));
  }

  const projectId = process.env.GCP_PROJECT_ID ?? '(not set)';
  const databaseId = process.env.FIRESTORE_DATABASE_ID ?? '(default)';
  return new Error(
    [
      'Firestore database was not found (gRPC NOT_FOUND).',
      `Project ID: ${projectId}`,
      `Database ID (configured): ${databaseId}`,
      'If you created a named database in Google Cloud (e.g. "ojt-app"), set:',
      '  FIRESTORE_DATABASE_ID=ojt-app',
      'on Cloud Run. The SDK default is "(default)" only.',
      'If no database exists yet, create one in GCP or Firebase Console (Native mode, asia-northeast1).',
    ].join('\n'),
    { cause: error },
  );
}
