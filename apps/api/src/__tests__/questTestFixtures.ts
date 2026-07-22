import { expect, vi } from 'vitest';
import { QUEST_STATUS, type QuestStatus } from '@ojt-app/shared';
import { assignmentToQuest } from '../domain/assignmentQuestMapping.js';
import { createAssignmentFromInput } from '../domain/createAssignment.js';
import { isFormattedAchievementLevel } from '../domain/achievementLevel.js';
import type {
  Assignment,
  CreateAssignmentInput,
} from '../domain/assignmentTypes.js';
import type { CreateQuestInput } from '../domain/questTypes.js';
import type { Quest } from '../domain/types.js';
import type { AssignmentRepository } from '../repositories/assignmentRepository.js';
import { AssignmentMemory } from '../repositories/assignmentMemory.js';
import { InMemoryAssignmentRepository } from '../repositories/inMemoryAssignmentRepository.js';

export const TRAINEE_USER_ID = 'trainee-1';
export const TRAINER_USER_ID = 'trainer-1';

export const CREATE_QUEST_INPUT: CreateQuestInput = {
  majorItem: '開発基礎',
  minorItem: '新規クエスト',
  achievementLevel: 'Lv1',
};

export const CREATE_ASSIGNMENT_INPUT: CreateAssignmentInput = {
  traineeId: TRAINEE_USER_ID,
  majorItem: '開発基礎',
  title: '新規クエスト',
  description: '詳細',
  achievementLevel: 'Lv1',
};

export const CREATE_QUEST_DROPDOWN_INPUT_LEVEL_3: CreateQuestInput = {
  majorItem: '開発基礎',
  minorItem: '新規クエスト',
  achievementLevel: '3',
};

export const EXPECTED_ACHIEVEMENT_LEVEL_LV3 = 'Lv3';

const DEFAULT_TIMESTAMPS = {
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

export function questToAssignment(
  quest: Quest,
  traineeId: string = TRAINEE_USER_ID,
  createdBy: string = TRAINER_USER_ID,
): Assignment {
  return {
    id: quest.id,
    traineeId,
    createdBy,
    majorItem: quest.majorItem,
    title: quest.minorItem,
    description: '',
    achievementLevel: quest.achievementLevel,
    status: quest.status ?? QUEST_STATUS.NOT_CLEARED,
    ...DEFAULT_TIMESTAMPS,
  };
}

export const SHEET_QUEST_TYPESCRIPT: Quest = {
  id: 'quest-1',
  majorItem: '開発基礎',
  minorItem: 'TypeScript基礎',
  achievementLevel: 'Lv1',
};

export const SHEET_QUEST_REACT: Quest = {
  id: 'quest-2',
  majorItem: '開発基礎',
  minorItem: 'React入門',
  achievementLevel: 'Lv2',
};

export const TRAINER_CREATED_QUEST: Quest = {
  id: 'quest-new-1',
  majorItem: '開発基礎',
  minorItem: '新規クエスト',
  achievementLevel: 'Lv1',
  status: QUEST_STATUS.NOT_CLEARED,
};

export const PENDING_TRAINER_CREATED_QUEST: Quest = {
  ...TRAINER_CREATED_QUEST,
  status: QUEST_STATUS.PENDING,
};

export const CLEARED_TRAINER_CREATED_QUEST: Quest = {
  ...TRAINER_CREATED_QUEST,
  status: QUEST_STATUS.CLEARED,
};

export function createMockAssignmentRepository(
  overrides: Partial<AssignmentRepository> = {},
): AssignmentRepository {
  return {
    findByTraineeId: vi.fn().mockResolvedValue([]),
    findById: vi.fn(),
    listByTrainer: vi.fn().mockResolvedValue([]),
    listPending: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn().mockResolvedValue(undefined),
    updateStatus: vi.fn(),
    ...overrides,
  };
}

export function createInMemoryAssignmentRepositoryForTests(
  seed: Assignment[] = [],
): AssignmentRepository {
  return new InMemoryAssignmentRepository(new AssignmentMemory(seed));
}

export function createTrainerProgressListRepository(
  storeQuests: Quest[],
): AssignmentRepository {
  const assignments = storeQuests.map((quest) => questToAssignment(quest));
  return createMockAssignmentRepository({
    listByTrainer: vi.fn().mockResolvedValue(assignments),
  });
}

export function createCapturingAssignmentRepository(): {
  assignmentRepository: AssignmentRepository;
  getStoredAssignment: () => Assignment | undefined;
} {
  let storedAssignment: Assignment | undefined;

  const assignmentRepository = createMockAssignmentRepository({
    create: vi
      .fn()
      .mockImplementation(
        async (input: CreateAssignmentInput, createdBy: string) => {
          storedAssignment = createAssignmentFromInput(input, createdBy);
          return storedAssignment;
        },
      ),
    listByTrainer: vi
      .fn()
      .mockImplementation(async () =>
        storedAssignment ? [storedAssignment] : [],
      ),
  });

  return {
    assignmentRepository,
    getStoredAssignment: () => storedAssignment,
  };
}

export function createTraineeAssignmentMocks(storeQuests: Quest[]): {
  assignmentRepository: AssignmentRepository;
} {
  const traineeAssignments = [
    questToAssignment(SHEET_QUEST_TYPESCRIPT),
    ...storeQuests.map((quest) => questToAssignment(quest)),
  ];

  return {
    assignmentRepository: createMockAssignmentRepository({
      findByTraineeId: vi.fn().mockResolvedValue(traineeAssignments),
      listByTrainer: vi
        .fn()
        .mockResolvedValue(
          storeQuests.map((quest) => questToAssignment(quest)),
        ),
    }),
  };
}

export function expectListContainsQuest(
  quests: Quest[],
  expected: Partial<Quest> & Pick<Quest, 'id'>,
): void {
  expect(quests).toEqual(
    expect.arrayContaining([expect.objectContaining(expected)]),
  );
}

export function expectProgressListContainsTitle(
  quests: Quest[],
  questId: string,
  title: string,
): void {
  expect(quests.length).toBeGreaterThan(0);
  expect(
    quests.every(
      (quest) =>
        typeof quest.majorItem === 'string' && quest.majorItem.length > 0,
    ),
  ).toBe(true);
  expectListContainsQuest(quests, { id: questId, majorItem: title });
}

export function expectQuestClearRequestApplied(
  assignmentRepository: AssignmentRepository,
  questId: string,
  result: Quest,
): void {
  expect(assignmentRepository.updateStatus).toHaveBeenCalledWith(
    questId,
    QUEST_STATUS.PENDING,
  );
  expect(result.status).toBe(QUEST_STATUS.PENDING);
}

export function expectQuestApproved(
  assignmentRepository: AssignmentRepository,
  questId: string,
  result: Quest,
): void {
  expect(assignmentRepository.updateStatus).toHaveBeenCalledWith(
    questId,
    QUEST_STATUS.CLEARED,
  );
  expect(result.status).toBe(QUEST_STATUS.CLEARED);
}

type GetQuestList = (
  userId: string,
  role: 'trainee',
  assignmentRepository: AssignmentRepository,
) => Promise<Quest[]>;

type GetTrainerQuestProgressList = (
  userId: string,
  role: 'trainer',
  assignmentRepository: AssignmentRepository,
) => Promise<Quest[]>;

export async function assertCreatedQuestOnTrainerDashboard(
  getTrainerQuestProgressList: GetTrainerQuestProgressList,
  trainerUserId: string,
  assignmentRepository: AssignmentRepository,
  quest: Quest,
  status: QuestStatus,
): Promise<void> {
  const progressList = await getTrainerQuestProgressList(
    trainerUserId,
    'trainer',
    assignmentRepository,
  );

  expect(assignmentRepository.listByTrainer).toHaveBeenCalledOnce();
  expectProgressListContainsTitle(progressList, quest.id, quest.majorItem);
  expectListContainsQuest(progressList, {
    id: quest.id,
    status,
  });
}

export async function assertCreatedQuestOnTraineeList(
  getQuestList: GetQuestList,
  traineeUserId: string,
  assignmentRepository: AssignmentRepository,
  quest: Quest,
  status: QuestStatus,
): Promise<void> {
  const quests = await getQuestList(
    traineeUserId,
    'trainee',
    assignmentRepository,
  );

  expect(assignmentRepository.findByTraineeId).toHaveBeenCalledWith(
    traineeUserId,
  );
  expectTraineeListContainsDisplayFields(quests, quest);
  expectListContainsQuest(quests, {
    id: quest.id,
    status,
  });
}

export function expectTraineeListContainsDisplayFields(
  quests: Quest[],
  quest: Quest,
): void {
  expectListContainsQuest(quests, {
    id: quest.id,
    majorItem: quest.majorItem,
    minorItem: quest.minorItem,
    achievementLevel: quest.achievementLevel,
  });

  const targetQuest = quests.find((item) => item.id === quest.id);
  expect(targetQuest).toBeDefined();
  expect(isFormattedAchievementLevel(targetQuest!.achievementLevel)).toBe(true);
}

export function assignmentAsQuest(assignment: Assignment): Quest {
  return assignmentToQuest(assignment);
}
