import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { expect } from '@playwright/test';

const execFileAsync = promisify(execFile);

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);

const CI_WORKFLOW_RELATIVE_PATH = '.github/workflows/ci.yml';
const REPORT_E2E_SPEC_RELATIVE_PATH = 'tests/report.spec.test.ts';

const DEFAULT_COMMAND_TIMEOUT_MS = 600_000;
const COMMAND_MAX_BUFFER_BYTES = 10 * 1024 * 1024;
const FAILED_EXIT_CODE = 1;

/** E-R11 本体のテストタイムアウト（Vitest 実行を含む） */
export const REPORT_CI_GATE_TIMEOUT_MS = DEFAULT_COMMAND_TIMEOUT_MS;

interface CommandResult {
  readonly exitCode: number;
  readonly stdout: string;
  readonly stderr: string;
}

interface ExecFileFailure {
  readonly code?: number;
  readonly stdout?: string;
  readonly stderr?: string;
}

interface CiWorkflowRequirement {
  readonly pattern: RegExp;
  readonly description: string;
}

interface ReportVitestSuite {
  readonly label: string;
  readonly args: readonly string[];
}

/** CI がカバーすべき報告書 E2E のテスト ID（E-R11 以外） */
export const REPORT_E2E_AUTOMATION_IDS = [
  'E-R01',
  'E-R02',
  'E-R03',
  'E-R04',
  'E-R05',
  'E-R06',
  'E-R07',
  'E-R08',
  'E-R09',
  'E-R10',
] as const;

const CI_WORKFLOW_REQUIREMENTS: readonly CiWorkflowRequirement[] = [
  {
    pattern: /npm test|vitest/,
    description: 'CI に Vitest（npm test / vitest）実行ステップがあること',
  },
  {
    pattern: /test:e2e|playwright test/,
    description:
      'CI に Playwright（test:e2e / playwright test）実行ステップがあること',
  },
  {
    pattern: /@ojt-app\/web|test:report|reports\.test\.tsx/,
    description:
      'CI が報告書 Web の Vitest（@ojt-app/web / test:report / reports.test.tsx）を実行すること',
  },
];

const REPORT_WEB_VITEST_SUITE: ReportVitestSuite = {
  label: 'Web reports',
  args: [
    'test',
    '-w',
    '@ojt-app/web',
    '--',
    '--run',
    'src/tests/reports.test.tsx',
  ],
};

/** Firestore Emulator 上で API 報告書 Vitest を実行する（U-R / I-R） */
const API_REPORTS_VITEST_INNER_COMMAND =
  'npm test -w @ojt-app/api -- src/tests/reports.test.ts src/tests/reportOwnListQuery.test.ts';

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

async function readUtf8File(relativePath: string): Promise<string> {
  return readFile(path.join(REPO_ROOT, relativePath), 'utf8');
}

/**
 * shell なしで npm を起動する（Windows の npm.cmd + shell による DEP0190 を避ける）。
 * Playwright / npm 経由実行時は `npm_execpath` が利用できる。
 */
async function runNpmCommand(
  args: readonly string[],
  timeoutMs: number = DEFAULT_COMMAND_TIMEOUT_MS,
): Promise<CommandResult> {
  const npmExecPath = process.env.npm_execpath;
  const command = npmExecPath ? process.execPath : 'npm';
  const commandArgs = npmExecPath ? [npmExecPath, ...args] : [...args];

  try {
    const { stdout, stderr } = await execFileAsync(command, commandArgs, {
      cwd: REPO_ROOT,
      env: process.env,
      timeout: timeoutMs,
      maxBuffer: COMMAND_MAX_BUFFER_BYTES,
    });
    return { exitCode: 0, stdout, stderr };
  } catch (error) {
    return toCommandResultFromFailure(error);
  }
}

function expectCommandSucceeded(
  result: CommandResult,
  suiteLabel: string,
): void {
  expect(
    result.exitCode,
    `${suiteLabel} Vitest が失敗しました\n${result.stdout}\n${result.stderr}`,
  ).toBe(0);
}

/**
 * CI ワークフローが vitest と playwright を実行する定義になっていることを検証する（E-R11）。
 * 報告書の Web Vitest（U-R 系）も含むこと。
 */
export async function expectCiWorkflowRunsVitestAndPlaywright(): Promise<void> {
  const workflow = await readUtf8File(CI_WORKFLOW_RELATIVE_PATH);

  for (const requirement of CI_WORKFLOW_REQUIREMENTS) {
    expect(requirement.pattern.test(workflow), requirement.description).toBe(
      true,
    );
  }
}

/**
 * Firestore Emulator を起動したうえで API 報告書 Vitest を実行する。
 * （reports.test.ts は Emulator 必須。未起動だと hook timeout になる）
 */
async function runApiReportsVitestWithFirestoreEmulator(): Promise<CommandResult> {
  // npm exec -- firebase emulators:exec --only firestore --project ojt-app-dev "<vitest>"
  return runNpmCommand([
    'exec',
    '--',
    'firebase',
    'emulators:exec',
    '--only',
    'firestore',
    '--project',
    'ojt-app-dev',
    API_REPORTS_VITEST_INNER_COMMAND,
  ]);
}

/** 報告書仕様の自動化対象 Vitest（API・Web）が Pass することを検証する（E-R11） */
export async function expectReportFeatureVitestSuitesPass(): Promise<void> {
  const apiResult = await runApiReportsVitestWithFirestoreEmulator();
  expectCommandSucceeded(apiResult, 'API reports (Firestore Emulator)');

  const webResult = await runNpmCommand(REPORT_WEB_VITEST_SUITE.args);
  expectCommandSucceeded(webResult, REPORT_WEB_VITEST_SUITE.label);
}

/**
 * report.spec.test.ts に E-R01〜E-R10 が揃っていることを検証する。
 * （E2E の実実行は同一 CI ジョブ内の E-R01〜E-R10 が担う。ネスト起動はしない）
 */
export async function expectReportE2eAutomationTargetsPresent(): Promise<void> {
  const specSource = await readUtf8File(REPORT_E2E_SPEC_RELATIVE_PATH);

  for (const testId of REPORT_E2E_AUTOMATION_IDS) {
    expect(
      specSource.includes(testId),
      `${REPORT_E2E_SPEC_RELATIVE_PATH} に ${testId} が定義されていること`,
    ).toBe(true);
  }
}
