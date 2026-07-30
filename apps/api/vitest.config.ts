import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const monorepoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);

export default defineConfig({
  resolve: {
    alias: {
      '@ojt-app/shared': path.resolve(
        monorepoRoot,
        'packages/shared/src/index.ts',
      ),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    hookTimeout: 30_000,
    env: {
      FIRESTORE_EMULATOR_HOST:
        process.env.FIRESTORE_EMULATOR_HOST ?? '127.0.0.1:8081',
      GCP_PROJECT_ID: process.env.GCP_PROJECT_ID ?? 'ojt-app-dev',
    },
  },
});
