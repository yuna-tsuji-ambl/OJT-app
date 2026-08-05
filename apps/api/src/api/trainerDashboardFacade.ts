import type { TrainerDashboard } from '../domain/trainerDashboardTypes.js';
import type { UserRole } from '../domain/types.js';
import { toUserContext } from '../domain/userContext.js';
import { TrainerDashboardService } from '../services/trainerDashboardService.js';

const trainerDashboardService = new TrainerDashboardService();

export function getTrainerDashboard(
  userId: string,
  role: UserRole,
): TrainerDashboard {
  return trainerDashboardService.getDashboard(toUserContext(userId, role));
}
