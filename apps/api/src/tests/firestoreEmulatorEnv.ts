import net from 'node:net';

const DEFAULT_FIRESTORE_EMULATOR_HOST = '127.0.0.1:8081';
const DEFAULT_TEST_GCP_PROJECT_ID = 'ojt-app-dev';
const EMULATOR_PROBE_TIMEOUT_MS = 500;

/** Firestore 結合テスト向けに Emulator / Project の環境変数を揃える。 */
export function ensureFirestoreEmulatorEnv(): void {
  process.env.GCP_PROJECT_ID =
    process.env.GCP_PROJECT_ID ?? DEFAULT_TEST_GCP_PROJECT_ID;
  process.env.FIRESTORE_EMULATOR_HOST =
    process.env.FIRESTORE_EMULATOR_HOST ?? DEFAULT_FIRESTORE_EMULATOR_HOST;
}

/** Emulator 未起動時は結合テストを skip するため、短い TCP プローブを行う。 */
export function isFirestoreEmulatorReachable(
  timeoutMs = EMULATOR_PROBE_TIMEOUT_MS,
): Promise<boolean> {
  ensureFirestoreEmulatorEnv();

  const hostEnv =
    process.env.FIRESTORE_EMULATOR_HOST ?? DEFAULT_FIRESTORE_EMULATOR_HOST;
  const [host, portText] = hostEnv.split(':');
  const port = Number(portText);

  if (!host || !Number.isFinite(port)) {
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    const socket = net.connect({ host, port });

    const finish = (reachable: boolean): void => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(reachable);
    };

    socket.setTimeout(timeoutMs);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false));
    socket.once('error', () => finish(false));
  });
}
