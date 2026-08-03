import { execFile } from 'node:child_process';
import { mkdir, open, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);

const DEFAULT_COMMAND_TIMEOUT_MS = 600_000;
const COMMAND_MAX_BUFFER_BYTES = 10 * 1024 * 1024;
const FAILED_EXIT_CODE = 1;
const DEFAULT_FIRESTORE_EMULATOR_HOST = '127.0.0.1:8081';
const DEFAULT_PROJECT_ID = 'ojt-app';
/** E2E 実行中のネスト Vitest が共有 Emulator を汚さないよう別プロジェクトを使う */
const NESTED_VITEST_PROJECT_ID = 'ojt-app-vitest-gate';

export interface CommandResult {
  readonly exitCode: number;
  readonly stdout: string;
  readonly stderr: string;
}

interface ExecFileFailure {
  readonly code?: number;
  readonly stdout?: string;
  readonly stderr?: string;
}

function isExecFileFailure(error: unknown): error is ExecFileFailure {
  return typeof error === 'object' && error !== null;
}

function toCommandResultFromFailure(error: unknown): CommandResult {
  if (!isExecFileFailure(error)) {
    return {
      exitCode: FAILED_EXIT_CODE,
      stdout: '',
      stderr: String(error),
    };
  }

  return {
    exitCode: typeof error.code === 'number' ? error.code : FAILED_EXIT_CODE,
    stdout: error.stdout ?? '',
    stderr: error.stderr ?? String(error),
  };
}

async function runNpmCommand(
  args: readonly string[],
  env: NodeJS.ProcessEnv = process.env,
  timeoutMs: number = DEFAULT_COMMAND_TIMEOUT_MS,
): Promise<CommandResult> {
  const npmExecPath = process.env.npm_execpath;
  const command = npmExecPath ? process.execPath : 'npm';
  const commandArgs = npmExecPath ? [npmExecPath, ...args] : [...args];

  try {
    const { stdout, stderr } = await execFileAsync(command, commandArgs, {
      cwd: REPO_ROOT,
      env,
      timeout: timeoutMs,
      maxBuffer: COMMAND_MAX_BUFFER_BYTES,
    });
    return { exitCode: 0, stdout, stderr };
  } catch (error) {
    return toCommandResultFromFailure(error);
  }
}

export async function isFirestoreEmulatorReachable(
  host = DEFAULT_FIRESTORE_EMULATOR_HOST,
  timeoutMs = 1500,
): Promise<boolean> {
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

const NESTED_VITEST_LOCK_PATH = path.join(
  REPO_ROOT,
  'test-results',
  '.nested-vitest.lock',
);

/** Playwright worker 跨ぎでネスト Vitest の同時起動を抑止する */
async function withNestedVitestGate<T>(run: () => Promise<T>): Promise<T> {
  await mkdir(path.dirname(NESTED_VITEST_LOCK_PATH), { recursive: true });
  const started = Date.now();
  const timeoutMs = DEFAULT_COMMAND_TIMEOUT_MS;

  while (Date.now() - started < timeoutMs) {
    try {
      const handle = await open(NESTED_VITEST_LOCK_PATH, 'wx');
      await handle.writeFile(String(process.pid));
      await handle.close();
      try {
        return await run();
      } finally {
        await rm(NESTED_VITEST_LOCK_PATH, { force: true });
      }
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }

  throw new Error('Timed out waiting for nested Vitest lock');
}

/**
 * API Vitest を Firestore Emulator 付きで実行する。
 * 既に Emulator が起動している場合は再利用し、`emulators:exec` のポート衝突を避ける。
 */
export async function runApiVitestWithFirestoreEmulator(
  vitestArgs: readonly string[],
): Promise<CommandResult> {
  return withNestedVitestGate(async () => {
    const innerCommand = ['test', '-w', '@ojt-app/api', '--', ...vitestArgs];
    const host =
      process.env.FIRESTORE_EMULATOR_HOST ?? DEFAULT_FIRESTORE_EMULATOR_HOST;

    if (await isFirestoreEmulatorReachable(host)) {
      return runNpmCommand(innerCommand, {
        ...process.env,
        FIRESTORE_EMULATOR_HOST: host,
        GCP_PROJECT_ID: NESTED_VITEST_PROJECT_ID,
        AUTH_MODE: process.env.AUTH_MODE ?? 'mock',
      });
    }

    return runNpmCommand([
      'exec',
      '--',
      'firebase',
      'emulators:exec',
      '--only',
      'firestore',
      '--project',
      DEFAULT_PROJECT_ID,
      `npm test -w @ojt-app/api -- ${vitestArgs.join(' ')}`,
    ]);
  });
}
