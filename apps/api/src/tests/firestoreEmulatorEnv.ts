const DEFAULT_FIRESTORE_EMULATOR_HOST = '127.0.0.1:8081';
const DEFAULT_TEST_GCP_PROJECT_ID = 'ojt-app-dev';

/** Firestore 結合テスト向けに Emulator / Project の環境変数を揃える。 */
export function ensureFirestoreEmulatorEnv(): void {
  process.env.GCP_PROJECT_ID =
    process.env.GCP_PROJECT_ID ?? DEFAULT_TEST_GCP_PROJECT_ID;
  process.env.FIRESTORE_EMULATOR_HOST =
    process.env.FIRESTORE_EMULATOR_HOST ?? DEFAULT_FIRESTORE_EMULATOR_HOST;
}
