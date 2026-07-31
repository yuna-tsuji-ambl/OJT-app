import { ensureTrainee } from '../domain/authorization.js';
import type { UserContext } from '../domain/types.js';

export function ensureTraineeCanCreateLearning(context: UserContext): void {
  ensureTrainee(context);
}
