const DEFAULT_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
const DEFAULT_FIRESTORE_EMULATOR_HOST = '127.0.0.1:8081';
const DEFAULT_PROJECT_ID = 'ojt-app';

/** Auth + Firestore Emulator 結合テスト向けに環境変数を揃える。 */
export function ensureAuthEmulatorEnv(): void {
  process.env.AUTH_MODE = 'firebase';
  // Auth Emulator のプロジェクトと一致させる（.firebaserc / emulators:auth）
  process.env.GCP_PROJECT_ID = DEFAULT_PROJECT_ID;
  process.env.FIREBASE_AUTH_EMULATOR_HOST =
    process.env.FIREBASE_AUTH_EMULATOR_HOST ?? DEFAULT_AUTH_EMULATOR_HOST;
  process.env.FIRESTORE_EMULATOR_HOST =
    process.env.FIRESTORE_EMULATOR_HOST ?? DEFAULT_FIRESTORE_EMULATOR_HOST;
}

export function getAuthEmulatorHost(): string {
  return process.env.FIREBASE_AUTH_EMULATOR_HOST ?? DEFAULT_AUTH_EMULATOR_HOST;
}

export async function isAuthEmulatorReachable(
  timeoutMs = 1500,
): Promise<boolean> {
  const host = getAuthEmulatorHost();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`http://${host}/`, {
      signal: controller.signal,
    });
    return response.status > 0;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}
