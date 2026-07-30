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
const GOAL_E2E_SPEC_RELATIVE_PATH = 'tests/goal.spec.test.ts';

const DEFAULT_COMMAND_TIMEOUT_MS = 600_000;
const COMMAND_MAX_BUFFER_BYTES = 10 * 1024 * 1024;
const FAILED_EXIT_CODE = 1;

export const GOAL_CI_GATE_TIMEOUT_MS = DEFAULT_COMMAND_TIMEOUT_MS;

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

interface GoalVitestSuite {
  readonly label: string;
  readonly args: readonly string[];
}

export const GOAL_E2E_AUTOMATION_IDS = [
  'E-G01',
  'E-G02',
  'E-G03',
  'E-G04',
  'E-G05',
  'E-G06',
  'E-G07',
  'E-G08',
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
    pattern: /@ojt-app\/web|goals\.test\.tsx/,
    description:
      'CI が目標 Web の Vitest（@ojt-app/web / goals.test.tsx）を実行すること',
  },
];

const GOAL_WEB_VITEST_SUITE: GoalVitestSuite = {
  label: 'Web goals',
  args: [
    'test',
    '-w',
    '@ojt-app/web',
    '--',
    '--run',
    'src/tests/goals.test.tsx',
  ],
};

const API_GOALS_VITEST_INNER_COMMAND =
  'npm test -w @ojt-app/api -- src/tests/goals.test.ts';

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

export async function expectCiWorkflowRunsGoalVitestAndPlaywright(): Promise<void> {
  const workflow = await readUtf8File(CI_WORKFLOW_RELATIVE_PATH);

  for (const requirement of CI_WORKFLOW_REQUIREMENTS) {
    expect(requirement.pattern.test(workflow), requirement.description).toBe(
      true,
    );
  }
}

async function runApiGoalsVitestWithFirestoreEmulator(): Promise<CommandResult> {
  return runNpmCommand([
    'exec',
    '--',
    'firebase',
    'emulators:exec',
    '--only',
    'firestore',
    '--project',
    'ojt-app-dev',
    API_GOALS_VITEST_INNER_COMMAND,
  ]);
}

export async function expectGoalFeatureVitestSuitesPass(): Promise<void> {
  const apiResult = await runApiGoalsVitestWithFirestoreEmulator();
  expectCommandSucceeded(apiResult, 'API goals (Firestore Emulator)');

  const webResult = await runNpmCommand(GOAL_WEB_VITEST_SUITE.args);
  expectCommandSucceeded(webResult, GOAL_WEB_VITEST_SUITE.label);
}

export async function expectGoalE2eAutomationTargetsPresent(): Promise<void> {
  const specSource = await readUtf8File(GOAL_E2E_SPEC_RELATIVE_PATH);

  for (const testId of GOAL_E2E_AUTOMATION_IDS) {
    expect(
      specSource.includes(testId),
      `${GOAL_E2E_SPEC_RELATIVE_PATH} に ${testId} が定義されていること`,
    ).toBe(true);
  }
}
