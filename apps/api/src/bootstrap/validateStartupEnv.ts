export function validateStartupEnv(): void {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction && process.env.FIRESTORE_EMULATOR_HOST) {
    throw new Error(
      'FIRESTORE_EMULATOR_HOST is set in production. Remove it from Cloud Run environment variables.',
    );
  }

  if (process.env.DB_PROVIDER === 'firestore' && !process.env.GCP_PROJECT_ID) {
    console.warn(
      'GCP_PROJECT_ID is not set. Firestore will use the SDK default project ID.',
    );
  }
}
