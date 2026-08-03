export type AuthMode = 'mock' | 'firebase';

export function resolveAuthMode(
  env: NodeJS.ProcessEnv = process.env,
): AuthMode {
  return env.AUTH_MODE === 'firebase' ? 'firebase' : 'mock';
}
