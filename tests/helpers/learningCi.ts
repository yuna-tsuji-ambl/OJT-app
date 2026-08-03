import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { expect } from '@playwright/test';
import { runApiVitestWithFirestoreEmulator } from './runApiVitestWithFirestore.js';

const execFileAsync = promisify(execFile);

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);

const CI_WORKFLOW_RELATIVE_PATH = '.github/workflows/ci.yml';
const LEARNING_E2E_SPEC_RELATIVE_PATH = 'tests/learning.spec.test.ts';

const DEFAULT_COMMAND_TIMEOUT_MS = 600_000;
const COMMAND_MAX_BUFFER_BYTES = 10 * 1024 * 1024;
const FAILED_EXIT_CODE = 1;

export const LEARNING_CI_GATE_TIMEOUT_MS = DEFAULT_COMMAND_TIMEOUT_MS;

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

interface LearningVitestSuite {
  readonly label: string;
  readonly args: readonly string[];
}

export const LEARNING_E2E_AUTOMATION_IDS = [
  'E-L01',
  'E-L02',
  'E-L03',
  'E-L04',
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
    pattern: /@ojt-app\/web|learnings\.test\.tsx/,
    description:
      'CI が学び Web の Vitest（@ojt-app/web / learnings.test.tsx）を実行すること',
  },
];

const LEARNING_WEB_VITEST_SUITE: LearningVitestSuite = {
  label: 'Web learnings',
  args: [
    'test',
    '-w',
    '@ojt-app/web',
    '--',
    '--run',
    'src/tests/learnings.test.tsx',
  ],
};

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

export async function expectCiWorkflowRunsLearningVitestAndPlaywright(): Promise<void> {
  const workflow = await readUtf8File(CI_WORKFLOW_RELATIVE_PATH);

  for (const requirement of CI_WORKFLOW_REQUIREMENTS) {
    expect(requirement.pattern.test(workflow), requirement.description).toBe(
      true,
    );
  }
}

export async function expectLearningFeatureVitestSuitesPass(): Promise<void> {
  const apiResult = await runApiVitestWithFirestoreEmulator([
    'src/tests/learnings.test.ts',
  ]);
  expectCommandSucceeded(apiResult, 'API learnings (Firestore Emulator)');

  const webResult = await runNpmCommand(LEARNING_WEB_VITEST_SUITE.args);
  expectCommandSucceeded(webResult, LEARNING_WEB_VITEST_SUITE.label);
}

export async function expectLearningE2eAutomationTargetsPresent(): Promise<void> {
  const specSource = await readUtf8File(LEARNING_E2E_SPEC_RELATIVE_PATH);

  for (const testId of LEARNING_E2E_AUTOMATION_IDS) {
    expect(
      specSource.includes(testId),
      `${LEARNING_E2E_SPEC_RELATIVE_PATH} に ${testId} が定義されていること`,
    ).toBe(true);
  }
}
