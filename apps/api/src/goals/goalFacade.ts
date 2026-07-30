import { toUserContext } from '../domain/userContext.js';
import type { UserContext, UserRole } from '../domain/types.js';
import type { GoalRepository } from '../repositories/goalRepository.js';
import {
  createGoalCommand,
  deleteGoalCommand,
  listGoalsCommand,
  updateGoalCommand,
} from './goalCommands.js';
import type {
  CreateGoalInput,
  Goal,
  ListGoalsQuery,
  UpdateGoalInput,
} from './goalTypes.js';

async function runWithUserContext<T>(
  userId: string,
  role: UserRole,
  execute: (context: UserContext) => Promise<T>,
): Promise<T> {
  return execute(toUserContext(userId, role));
}

export async function listGoals(
  query: ListGoalsQuery,
  userId: string,
  role: UserRole,
  goalRepository: GoalRepository,
): Promise<Goal[]> {
  return runWithUserContext(userId, role, (context) =>
    listGoalsCommand(query, context, goalRepository),
  );
}

export async function createGoal(
  input: CreateGoalInput,
  userId: string,
  role: UserRole,
  goalRepository: GoalRepository,
): Promise<Goal> {
  return runWithUserContext(userId, role, (context) =>
    createGoalCommand(input, context, goalRepository),
  );
}

export async function updateGoal(
  goalId: string,
  input: UpdateGoalInput,
  userId: string,
  role: UserRole,
  goalRepository: GoalRepository,
): Promise<Goal> {
  return runWithUserContext(userId, role, (context) =>
    updateGoalCommand(goalId, input, context, goalRepository),
  );
}

export async function deleteGoal(
  goalId: string,
  userId: string,
  role: UserRole,
  goalRepository: GoalRepository,
): Promise<void> {
  return runWithUserContext(userId, role, (context) =>
    deleteGoalCommand(goalId, context, goalRepository),
  );
}
