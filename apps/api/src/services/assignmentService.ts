import { ensureTrainee, ensureTrainer } from '../domain/authorization.js';
import {
  assignmentToQuest,
  createAssignmentInputFromQuestInput,
} from '../domain/assignmentQuestMapping.js';
import { QUEST_STATUS } from '../domain/constants.js';
import { AssignmentNotFoundError } from '../domain/errors.js';
import {
  mapTrainerQuestProgressList,
  mapTraineeQuestList,
} from '../domain/questListDisplay.js';
import type { CreateQuestInput } from '../domain/questTypes.js';
import type {
  Assignment,
  CreateAssignmentInput,
  UpdateAssignmentInput,
} from '../domain/assignmentTypes.js';
import type { Quest, UserContext } from '../domain/types.js';
import type { AssignmentRepository } from '../repositories/assignmentRepository.js';

export class AssignmentService {
  async listForTrainee(
    context: UserContext,
    assignmentRepository: AssignmentRepository,
  ): Promise<Quest[]> {
    ensureTrainee(context);
    const assignments = await assignmentRepository.findByTraineeId(
      context.userId,
    );
    return mapTraineeQuestList(assignments.map(assignmentToQuest));
  }

  async listForTrainerManage(
    context: UserContext,
    assignmentRepository: AssignmentRepository,
  ): Promise<Assignment[]> {
    ensureTrainer(context);
    return assignmentRepository.listByTrainer(context.userId);
  }

  async listTrainerProgress(
    context: UserContext,
    assignmentRepository: AssignmentRepository,
  ): Promise<Quest[]> {
    ensureTrainer(context);
    const assignments = await assignmentRepository.listByTrainer(
      context.userId,
    );
    return mapTrainerQuestProgressList(assignments.map(assignmentToQuest));
  }

  async listPending(
    context: UserContext,
    assignmentRepository: AssignmentRepository,
  ): Promise<Quest[]> {
    ensureTrainer(context);
    const assignments = await assignmentRepository.listPending();
    return assignments.map(assignmentToQuest);
  }

  async create(
    input: CreateAssignmentInput,
    context: UserContext,
    assignmentRepository: AssignmentRepository,
  ): Promise<Assignment> {
    ensureTrainer(context);
    return assignmentRepository.create(input, context.userId);
  }

  async createFromQuestInput(
    input: CreateQuestInput,
    context: UserContext,
    assignmentRepository: AssignmentRepository,
  ): Promise<Quest> {
    const assignment = await this.create(
      createAssignmentInputFromQuestInput(input),
      context,
      assignmentRepository,
    );
    return assignmentToQuest(assignment);
  }

  async update(
    assignmentId: string,
    input: UpdateAssignmentInput,
    context: UserContext,
    assignmentRepository: AssignmentRepository,
  ): Promise<Assignment> {
    ensureTrainer(context);
    return assignmentRepository.update(assignmentId, input);
  }

  async delete(
    assignmentId: string,
    context: UserContext,
    assignmentRepository: AssignmentRepository,
  ): Promise<void> {
    ensureTrainer(context);
    await assignmentRepository.delete(assignmentId);
  }

  async requestClear(
    assignmentId: string,
    context: UserContext,
    assignmentRepository: AssignmentRepository,
  ): Promise<Quest> {
    ensureTrainee(context);
    await this.requireAssignmentForTrainee(
      assignmentId,
      context,
      assignmentRepository,
    );

    const updated = await assignmentRepository.updateStatus(
      assignmentId,
      QUEST_STATUS.PENDING,
    );
    return assignmentToQuest(updated);
  }

  async approve(
    assignmentId: string,
    context: UserContext,
    assignmentRepository: AssignmentRepository,
  ): Promise<Quest> {
    ensureTrainer(context);
    const updated = await assignmentRepository.updateStatus(
      assignmentId,
      QUEST_STATUS.CLEARED,
    );
    return assignmentToQuest(updated);
  }

  private async requireAssignmentForTrainee(
    assignmentId: string,
    context: UserContext,
    assignmentRepository: AssignmentRepository,
  ): Promise<Assignment> {
    const assignment = await assignmentRepository.findById(assignmentId);

    if (!assignment || assignment.traineeId !== context.userId) {
      throw new AssignmentNotFoundError(assignmentId);
    }

    return assignment;
  }
}
