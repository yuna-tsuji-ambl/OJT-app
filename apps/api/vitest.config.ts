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
    // Firestore Emulator を複数ファイルで共有するため並列実行するとデータが混線する
    fileParallelism: false,
    hookTimeout: 60_000,
    testTimeout: 60_000,
    env: {
      AUTH_MODE: process.env.AUTH_MODE ?? 'mock',
      FIRESTORE_EMULATOR_HOST:
        process.env.FIRESTORE_EMULATOR_HOST ?? '127.0.0.1:8081',
      // emulators:auth の --project ojt-app と揃える
      GCP_PROJECT_ID: process.env.GCP_PROJECT_ID ?? 'ojt-app',
    },
  },
});
