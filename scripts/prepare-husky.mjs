import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';

if (process.env.HUSKY === '0') {
  process.exit(0);
}

if (!existsSync('node_modules/husky/package.json')) {
  process.exit(0);
}

execSync('husky', { stdio: 'inherit' });
