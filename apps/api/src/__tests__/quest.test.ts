import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QUEST_STATUS } from '@ojt-app/shared';
import {
  approveQuest,
  createQuest,
  getQuestList,
  getPendingQuestList,
  getTrainerDashboard,
  getTrainerQuestProgressList,
  requestClearQuest,
  TRAINER_DASHBOARD_SECTION_TYPE,
  type Quest,
  type QuestStore,
  type SheetRepository,
  type TrainerDashboard,
} from '../quest.js';
import { findTrainerDashboardSection } from '../domain/trainerDashboard.js';
import {
  CREATE_QUEST_INPUT,
  SHEET_QUEST_REACT,
  SHEET_QUEST_TYPESCRIPT,
  TRAINEE_USER_ID,
  TRAINER_CREATED_QUEST,
  TRAINER_USER_ID,
  CLEARED_TRAINER_CREATED_QUEST,
  PENDING_TRAINER_CREATED_QUEST,
  createMockQuestStore,
  createMockSheetRepository,
  createTraineeMergedListMocks,
  createTrainerProgressListStore,
  assertCreatedQuestOnTrainerDashboard,
  assertCreatedQuestOnTraineeList,
  expectListContainsQuest,
  expectQuestApproved,
  expectQuestClearRequestApplied,
} from './questTestFixtures.js';

/**
 * U-Q01: クエスト一覧の表示
 * 前提条件: 新卒ユーザーとしてログイン中
 * アクション: クエスト一覧画面を開く
 * 期待結果: シートから読み込まれたクエスト情報（大項目、小項目、到達レベルなど）が一覧表示されること
 */
describe('U-Q01 クエスト一覧の表示', () => {
  const traineeUserId = TRAINEE_USER_ID;
  const sheetQuests: Quest[] = [SHEET_QUEST_TYPESCRIPT, SHEET_QUEST_REACT];

  let sheetRepository: SheetRepository;

  beforeEach(() => {
    sheetRepository = createMockSheetRepository({
      loadQuests: vi.fn().mockResolvedValue(sheetQuests),
    });
  });

  it('getQuestList_新卒ログイン中_シートのクエスト情報が一覧で返る', async () => {
    const quests = await getQuestList(
      traineeUserId,
      'trainee',
      sheetRepository,
    );

    expect(sheetRepository.loadQuests).toHaveBeenCalledWith(traineeUserId);
    expect(quests).toHaveLength(2);
    expect(quests[0]).toEqual(
      expect.objectContaining({
        majorItem: '開発基礎',
        minorItem: 'TypeScript基礎',
        achievementLevel: 'Lv1',
      }),
    );
    expect(quests[1]).toEqual(
      expect.objectContaining({
        majorItem: '開発基礎',
        minorItem: 'React入門',
        achievementLevel: 'Lv2',
      }),
    );
  });
});

/**
 * U-Q02: クエストのクリア申請
 * 前提条件: 新卒ユーザーとしてログイン中、かつ未クリアのクエストがある
 * アクション: 対象クエストの「申請」ボタンを押す
 * 期待結果: クエストのステータスが「申請中」に変更されること
 */
describe('U-Q02 クエストのクリア申請', () => {
  const traineeUserId = TRAINEE_USER_ID;
  const unclearedQuest: Quest = {
    ...SHEET_QUEST_TYPESCRIPT,
    status: QUEST_STATUS.NOT_CLEARED,
  };

  let questStore: QuestStore;

  beforeEach(() => {
    questStore = createMockQuestStore({
      getById: vi.fn().mockResolvedValue({ ...unclearedQuest }),
    });
  });

  it('requestClearQuest_新卒未クリアクエスト_ステータスが申請中に変更される', async () => {
    const result = await requestClearQuest(
      unclearedQuest.id,
      traineeUserId,
      'trainee',
      questStore,
    );

    expectQuestClearRequestApplied(questStore, unclearedQuest.id, result);
  });
});

/**
 * U-Q03: 申請一覧の表示
 * 前提条件: OJTトレーナーとしてログイン中
 * アクション: ダッシュボード画面を開く
 * 期待結果: 新卒から申請された「申請中」のクエスト一覧が表示されること
 */
describe('U-Q03 申請一覧の表示', () => {
  const trainerUserId = TRAINER_USER_ID;

  const pendingQuests: Quest[] = [
    { ...SHEET_QUEST_TYPESCRIPT, status: QUEST_STATUS.PENDING },
    { ...SHEET_QUEST_REACT, status: QUEST_STATUS.PENDING },
  ];

  let questStore: QuestStore;

  beforeEach(() => {
    questStore = createMockQuestStore({
      getPendingQuests: vi.fn().mockResolvedValue(pendingQuests),
    });
  });

  it('getPendingQuestList_トレーナーログイン中_申請中クエスト一覧が返る', async () => {
    const quests = await getPendingQuestList(
      trainerUserId,
      'trainer',
      questStore,
    );

    expect(questStore.getPendingQuests).toHaveBeenCalledOnce();
    expect(quests).toHaveLength(2);
    expect(quests.every((quest) => quest.status === QUEST_STATUS.PENDING)).toBe(
      true,
    );
    expect(quests[0]).toEqual(
      expect.objectContaining({
        majorItem: '開発基礎',
        minorItem: 'TypeScript基礎',
        achievementLevel: 'Lv1',
        status: QUEST_STATUS.PENDING,
      }),
    );
    expect(quests[1]).toEqual(
      expect.objectContaining({
        majorItem: '開発基礎',
        minorItem: 'React入門',
        achievementLevel: 'Lv2',
        status: QUEST_STATUS.PENDING,
      }),
    );
  });
});

/**
 * U-Q04: クエストの承認
 * 前提条件: OJTトレーナーとしてログイン中
 * アクション: 「申請中」のクエストの「承認」ボタンを押す
 * 期待結果: ステータスが「クリア」に変更され、シート更新処理（モック関数）が正しく呼ばれること
 */
describe('U-Q04 クエストの承認', () => {
  const trainerUserId = TRAINER_USER_ID;
  const pendingQuest: Quest = {
    ...SHEET_QUEST_TYPESCRIPT,
    status: QUEST_STATUS.PENDING,
  };

  let questStore: QuestStore;
  let sheetRepository: SheetRepository;

  beforeEach(() => {
    questStore = createMockQuestStore({
      getById: vi.fn().mockResolvedValue({ ...pendingQuest }),
    });
    sheetRepository = createMockSheetRepository();
  });

  it('approveQuest_トレーナー申請中クエスト_ステータスがクリアに変更されシート更新が呼ばれる', async () => {
    const result = await approveQuest(
      pendingQuest.id,
      trainerUserId,
      'trainer',
      questStore,
      sheetRepository,
    );

    expectQuestApproved(questStore, pendingQuest.id, result, {
      sheetRepository,
    });
  });
});

/**
 * U-Q05: ダッシュボードのクエスト作成機能表示
 * 前提条件: OJTトレーナーとしてログイン中
 * アクション: ダッシュボード画面を開く
 * 期待結果: 画面上部にクエスト作成機能が表示されること
 */
describe('U-Q05 ダッシュボードのクエスト作成機能表示', () => {
  const trainerUserId = TRAINER_USER_ID;

  it('getTrainerDashboard_トレーナーログイン中_画面上部にクエスト作成機能が含まれる', () => {
    const dashboard: TrainerDashboard = getTrainerDashboard(
      trainerUserId,
      'trainer',
    );

    const questCreateSection = findTrainerDashboardSection(
      dashboard,
      TRAINER_DASHBOARD_SECTION_TYPE.QUEST_CREATE,
    );

    expect(questCreateSection).toBeDefined();
    expect(questCreateSection?.visible).toBe(true);
    expect(questCreateSection?.position).toBe('top');
    expect(dashboard.sections[0]).toEqual(questCreateSection);
  });
});

/**
 * U-Q06: クエスト作成（トレーナー側）
 * 前提条件: OJTトレーナーとしてログイン中
 * アクション: ダッシュボード上部のクエスト作成機能で新しいクエストを追加する
 * 期待結果: クエストが作成され、トレーナー画面の一覧に表示されること
 */
describe('U-Q06 クエスト作成（トレーナー側）', () => {
  const trainerUserId = TRAINER_USER_ID;
  const createdQuest = TRAINER_CREATED_QUEST;

  let questStore: QuestStore;

  beforeEach(() => {
    questStore = createMockQuestStore({
      create: vi.fn().mockResolvedValue(createdQuest),
      listAllQuests: vi.fn().mockResolvedValue([createdQuest]),
    });
  });

  it('createQuest後getTrainerQuestProgressList_トレーナー_作成クエストの進捗状況が確認できる', async () => {
    const created = await createQuest(
      trainerUserId,
      'trainer',
      CREATE_QUEST_INPUT,
      questStore,
    );

    const progressList = await getTrainerQuestProgressList(
      trainerUserId,
      'trainer',
      questStore,
    );

    expect(questStore.create).toHaveBeenCalledWith(CREATE_QUEST_INPUT);
    expect(created).toEqual(expect.objectContaining(TRAINER_CREATED_QUEST));
    expect(progressList).toHaveLength(1);
    expect(progressList[0]).toEqual(
      expect.objectContaining({
        id: created.id,
        minorItem: TRAINER_CREATED_QUEST.minorItem,
        status: QUEST_STATUS.NOT_CLEARED,
      }),
    );
  });
});

/**
 * U-Q07: 作成クエストの新卒側表示
 * 前提条件: トレーナーがクエストを作成済み、新卒ユーザーとしてログイン中
 * アクション: クエスト一覧画面を開く
 * 期待結果: トレーナーが作成したクエストが新卒側のクエスト一覧に表示されること
 */
describe('U-Q07 作成クエストの新卒側表示', () => {
  const traineeUserId = TRAINEE_USER_ID;

  let sheetRepository: SheetRepository;
  let questStore: QuestStore;

  beforeEach(() => {
    ({ questStore, sheetRepository } = createTraineeMergedListMocks([
      TRAINER_CREATED_QUEST,
    ]));
  });

  it('getQuestList_新卒ログイン中_トレーナー作成クエストが一覧に含まれる', async () => {
    const quests = await getQuestList(
      traineeUserId,
      'trainee',
      sheetRepository,
      questStore,
    );

    expect(sheetRepository.loadQuests).toHaveBeenCalledWith(traineeUserId);
    expect(questStore.listAllQuests).toHaveBeenCalledOnce();
    expect(quests).toHaveLength(2);
    expect(quests).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          minorItem: 'TypeScript基礎',
          achievementLevel: 'Lv1',
        }),
        expect.objectContaining({
          id: TRAINER_CREATED_QUEST.id,
          minorItem: TRAINER_CREATED_QUEST.minorItem,
          achievementLevel: TRAINER_CREATED_QUEST.achievementLevel,
          status: QUEST_STATUS.NOT_CLEARED,
        }),
      ]),
    );
  });
});

/**
 * U-Q08: 作成クエストのトレーナー側一覧表示
 * 前提条件: トレーナーがクエストを作成済み、OJTトレーナーとしてログイン中
 * アクション: ダッシュボード画面を開く
 * 期待結果: トレーナーが作成したクエストがトレーナー画面の一覧に表示されること
 *
 * 結合境界: TrainerQuestService.listQuestProgress → QuestStore.listAllQuests
 */
describe('U-Q08 作成クエストのトレーナー側一覧表示', () => {
  const trainerUserId = TRAINER_USER_ID;

  let questStore: QuestStore;

  beforeEach(() => {
    questStore = createTrainerProgressListStore([TRAINER_CREATED_QUEST]);
  });

  it('getTrainerQuestProgressList_トレーナーログイン中_作成クエストが一覧に表示される', async () => {
    const progressList = await getTrainerQuestProgressList(
      trainerUserId,
      'trainer',
      questStore,
    );

    expect(questStore.listAllQuests).toHaveBeenCalledOnce();
    expect(progressList).toHaveLength(1);
    expect(progressList[0]).toEqual(
      expect.objectContaining(TRAINER_CREATED_QUEST),
    );
  });
});

/**
 * U-Q09: 作成クエストのクリア申請（新卒側）
 * 前提条件: トレーナーがクエストを作成済み、新卒ユーザーとしてログイン中、かつ当該クエストが未クリアである
 * アクション: 対象クエストの「申請」ボタンを押す
 * 期待結果: クエストのステータスが「申請中」に変更されること
 *
 * 結合境界: QuestService.requestClear → QuestStore.getById / QuestStore.update
 */
describe('U-Q09 作成クエストのクリア申請（新卒側）', () => {
  const traineeUserId = TRAINEE_USER_ID;
  const questId = TRAINER_CREATED_QUEST.id;

  let questStore: QuestStore;

  beforeEach(() => {
    questStore = createMockQuestStore({
      getById: vi.fn().mockResolvedValue({ ...TRAINER_CREATED_QUEST }),
    });
  });

  it('requestClearQuest_新卒未クリアの作成クエスト_ステータスが申請中に変更される', async () => {
    const result = await requestClearQuest(
      questId,
      traineeUserId,
      'trainee',
      questStore,
    );

    expectQuestClearRequestApplied(questStore, questId, result);
    expect(questStore.update).toHaveBeenCalledWith(
      expect.objectContaining({
        minorItem: TRAINER_CREATED_QUEST.minorItem,
      }),
    );
  });
});

/**
 * U-Q10: 作成クエストの申請状況表示（トレーナー側）
 * 前提条件: 新卒が作成クエストを申請済み、OJTトレーナーとしてログイン中
 * アクション: ダッシュボード画面を開く
 * 期待結果: 申請中の作成クエストが一覧に表示され、申請状況（「申請中」など）が確認できること
 *
 * 結合境界: TrainerQuestService.listQuestProgress → QuestStore.listAllQuests
 */
describe('U-Q10 作成クエストの申請状況表示（トレーナー側）', () => {
  const trainerUserId = TRAINER_USER_ID;

  let questStore: QuestStore;

  beforeEach(() => {
    questStore = createTrainerProgressListStore([
      PENDING_TRAINER_CREATED_QUEST,
    ]);
  });

  it('getTrainerQuestProgressList_トレーナーログイン中_申請中の作成クエストと申請状況が確認できる', async () => {
    const progressList = await getTrainerQuestProgressList(
      trainerUserId,
      'trainer',
      questStore,
    );

    expect(questStore.listAllQuests).toHaveBeenCalledOnce();
    expect(progressList).toHaveLength(1);
    expectListContainsQuest(progressList, {
      id: PENDING_TRAINER_CREATED_QUEST.id,
      minorItem: PENDING_TRAINER_CREATED_QUEST.minorItem,
      status: QUEST_STATUS.PENDING,
    });
  });
});

/**
 * U-Q11: 作成クエストの承認（トレーナー側）
 * 前提条件: 新卒が作成クエストを申請済み、OJTトレーナーとしてログイン中
 * アクション: ダッシュボードから当該クエストの「承認」ボタンを押す
 * 期待結果: ステータスが「クリア」に変更されること
 *
 * 結合境界: TrainerQuestService.approve → QuestStore.getById / QuestStore.update
 */
describe('U-Q11 作成クエストの承認（トレーナー側）', () => {
  const trainerUserId = TRAINER_USER_ID;
  const questId = PENDING_TRAINER_CREATED_QUEST.id;

  let questStore: QuestStore;
  let sheetRepository: SheetRepository;

  beforeEach(() => {
    questStore = createMockQuestStore({
      getById: vi.fn().mockResolvedValue({ ...PENDING_TRAINER_CREATED_QUEST }),
    });
    sheetRepository = createMockSheetRepository();
  });

  it('approveQuest_トレーナー申請中の作成クエスト_ステータスがクリアに変更される', async () => {
    const result = await approveQuest(
      questId,
      trainerUserId,
      'trainer',
      questStore,
      sheetRepository,
    );

    expectQuestApproved(questStore, questId, result);
    expect(questStore.update).toHaveBeenCalledWith(
      expect.objectContaining({
        minorItem: PENDING_TRAINER_CREATED_QUEST.minorItem,
      }),
    );
  });
});

/**
 * U-Q12: 申請済み作成クエストの一覧表示
 * 前提条件: 新卒が作成クエストを申請済み
 * アクション: トレーナーでダッシュボードを開く／新卒でクエスト一覧を開く
 * 期待結果: 申請済みの作成クエストが、トレーナー・新卒の双方の一覧に表示され、ステータスが「申請中」であること
 */
describe('U-Q12 申請済み作成クエストの一覧表示', () => {
  const traineeUserId = TRAINEE_USER_ID;
  const trainerUserId = TRAINER_USER_ID;

  let questStore: QuestStore;
  let sheetRepository: SheetRepository;

  beforeEach(() => {
    ({ questStore, sheetRepository } = createTraineeMergedListMocks([
      PENDING_TRAINER_CREATED_QUEST,
    ]));
  });

  it('getTrainerQuestProgressList_トレーナーダッシュボード_申請済み作成クエストが申請中で表示される', async () => {
    await assertCreatedQuestOnTrainerDashboard(
      getTrainerQuestProgressList,
      trainerUserId,
      questStore,
      PENDING_TRAINER_CREATED_QUEST,
      QUEST_STATUS.PENDING,
    );
  });

  it('getQuestList_新卒クエスト一覧_申請済み作成クエストが申請中で表示される', async () => {
    await assertCreatedQuestOnTraineeList(
      getQuestList,
      traineeUserId,
      sheetRepository,
      questStore,
      PENDING_TRAINER_CREATED_QUEST,
      QUEST_STATUS.PENDING,
    );
  });
});

/**
 * U-Q13: 承認済み作成クエストの一覧表示
 * 前提条件: トレーナーが作成クエストを承認済み
 * アクション: トレーナーでダッシュボードを開く／新卒でクエスト一覧を開く
 * 期待結果: 承認済みの作成クエストが、トレーナー・新卒の双方の一覧に表示され、ステータスが「クリア」であること
 */
describe('U-Q13 承認済み作成クエストの一覧表示', () => {
  const traineeUserId = TRAINEE_USER_ID;
  const trainerUserId = TRAINER_USER_ID;

  let questStore: QuestStore;
  let sheetRepository: SheetRepository;

  beforeEach(() => {
    ({ questStore, sheetRepository } = createTraineeMergedListMocks([
      CLEARED_TRAINER_CREATED_QUEST,
    ]));
  });

  it('getTrainerQuestProgressList_トレーナーダッシュボード_承認済み作成クエストがクリアで表示される', async () => {
    await assertCreatedQuestOnTrainerDashboard(
      getTrainerQuestProgressList,
      trainerUserId,
      questStore,
      CLEARED_TRAINER_CREATED_QUEST,
      QUEST_STATUS.CLEARED,
    );
  });

  it('getQuestList_新卒クエスト一覧_承認済み作成クエストがクリアで表示される', async () => {
    await assertCreatedQuestOnTraineeList(
      getQuestList,
      traineeUserId,
      sheetRepository,
      questStore,
      CLEARED_TRAINER_CREATED_QUEST,
      QUEST_STATUS.CLEARED,
    );
  });
});
