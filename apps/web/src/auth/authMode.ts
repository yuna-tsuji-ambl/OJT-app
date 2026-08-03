export type WebAuthMode = 'mock' | 'firebase';

export function resolveWebAuthMode(
  env: ImportMetaEnv = import.meta.env,
): WebAuthMode {
  return env.VITE_AUTH_MODE === 'firebase' ? 'firebase' : 'mock';
}
