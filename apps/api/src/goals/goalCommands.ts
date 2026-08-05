import type { GoalRepository } from '../repositories/goalRepository.js';
import {
  ensureGoalAccess,
  ensureTrainerCanDeleteGoal,
  resolveCreateTraineeId,
  resolveListTraineeId,
} from './goalAccess.js';
import { buildGoal } from './buildGoal.js';
import type { UserContext } from '../domain/types.js';
import { GoalNotFoundError } from '../domain/errors.js';
import type {
  CreateGoalInput,
  Goal,
  ListGoalsQuery,
  UpdateGoalInput,
} from './goalTypes.js';
import {
  validateCreateGoalInput,
  validateUpdateGoalInput,
} from './goalValidation.js';

export async function listGoalsCommand(
  query: ListGoalsQuery,
  context: UserContext,
  goalRepository: GoalRepository,
): Promise<Goal[]> {
  const traineeId = resolveListTraineeId(context, query.traineeId);
  return goalRepository.findByTraineeId(traineeId);
}

export async function createGoalCommand(
  input: CreateGoalInput,
  context: UserContext,
  goalRepository: GoalRepository,
): Promise<Goal> {
  validateCreateGoalInput(input);

  const traineeId = resolveCreateTraineeId(context, input.traineeId);
  const goal = buildGoal({
    input,
    traineeId,
    createdBy: context.userId,
  });

  return goalRepository.save(goal);
}

export async function updateGoalCommand(
  goalId: string,
  input: UpdateGoalInput,
  context: UserContext,
  goalRepository: GoalRepository,
): Promise<Goal> {
  const existing = await goalRepository.findById(goalId);

  if (!existing) {
    throw new GoalNotFoundError(goalId);
  }

  ensureGoalAccess(context, existing);
  validateUpdateGoalInput(input, existing);

  const mergedInput: CreateGoalInput = {
    title: input.title ?? existing.title,
    description:
      input.description !== undefined
        ? input.description
        : existing.description,
    startDate: input.startDate ?? existing.startDate,
    endDate: input.endDate ?? existing.endDate,
    progress: input.progress ?? existing.progress,
    status: input.status ?? existing.status,
  };

  const goal = buildGoal({
    input: mergedInput,
    traineeId: existing.traineeId,
    createdBy: existing.createdBy,
    existing,
  });

  return goalRepository.save(goal);
}

export async function deleteGoalCommand(
  goalId: string,
  context: UserContext,
  goalRepository: GoalRepository,
): Promise<void> {
  const existing = await goalRepository.findById(goalId);

  if (!existing) {
    throw new GoalNotFoundError(goalId);
  }

  ensureTrainerCanDeleteGoal(context, existing);
  await goalRepository.delete(goalId);
}
