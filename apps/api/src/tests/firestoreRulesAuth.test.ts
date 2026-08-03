import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const rulesPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../../firestore.rules',
);

describe('F-10 Firestore rules (U-A23)', () => {
  it('U-A23: Auth 必須の骨子（request.auth）が定義されている', () => {
    const rules = readFileSync(rulesPath, 'utf8');
    expect(rules).toContain('request.auth != null');
    expect(rules).toContain('match /users/{userId}');
    expect(rules).toMatch(/allow read, write:\s*if false/);
  });
});
