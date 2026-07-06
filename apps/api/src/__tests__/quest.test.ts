import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  approveQuest,
  createQuest,
  getQuestList,
  getPendingQuestList,
  getTrainerDashboard,
  getTrainerQuestProgressList,
  requestClearQuest,
  type CreateQuestInput,
  type Quest,
  type QuestStore,
  type SheetRepository,
  type TrainerDashboard,
} from '../quest.js';

/**
 * U-Q01: クエスト一覧の表示
 * 前提条件: 新卒ユーザーとしてログイン中
 * アクション: クエスト一覧画面を開く
 * 期待結果: シートから読み込まれたクエスト情報（大項目、小項目、到達レベルなど）が一覧表示されること
 */
describe('U-Q01 クエスト一覧の表示', () => {
  const traineeUserId = 'trainee-1';

  const sheetQuests: Quest[] = [
    {
      id: 'quest-1',
      majorItem: '開発基礎',
      minorItem: 'TypeScript基礎',
      achievementLevel: 'Lv1',
    },
    {
      id: 'quest-2',
      majorItem: '開発基礎',
      minorItem: 'React入門',
      achievementLevel: 'Lv2',
    },
  ];

  let sheetRepository: SheetRepository;

  beforeEach(() => {
    sheetRepository = {
      loadQuests: vi.fn().mockResolvedValue(sheetQuests),
      updateOnApproval: vi.fn().mockResolvedValue(undefined),
    };
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
  const traineeUserId = 'trainee-1';
  const questId = 'quest-1';

  const unclearedQuest: Quest = {
    id: questId,
    majorItem: '開発基礎',
    minorItem: 'TypeScript基礎',
    achievementLevel: 'Lv1',
    status: '未クリア',
  };

  let questStore: QuestStore;

  beforeEach(() => {
    questStore = {
      getById: vi.fn().mockResolvedValue({ ...unclearedQuest }),
      update: vi.fn().mockResolvedValue(undefined),
      getPendingQuests: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      listAllQuests: vi.fn().mockResolvedValue([]),
    };
  });

  it('requestClearQuest_新卒未クリアクエスト_ステータスが申請中に変更される', async () => {
    const result = await requestClearQuest(
      questId,
      traineeUserId,
      'trainee',
      questStore,
    );

    expect(questStore.getById).toHaveBeenCalledWith(questId);
    expect(questStore.update).toHaveBeenCalledWith(
      expect.objectContaining({
        id: questId,
        status: '申請中',
      }),
    );
    expect(result.status).toBe('申請中');
  });
});

/**
 * U-Q03: 申請一覧の表示
 * 前提条件: OJTトレーナーとしてログイン中
 * アクション: ダッシュボード画面を開く
 * 期待結果: 新卒から申請された「申請中」のクエスト一覧が表示されること
 */
describe('U-Q03 申請一覧の表示', () => {
  const trainerUserId = 'trainer-1';

  const pendingQuests: Quest[] = [
    {
      id: 'quest-1',
      majorItem: '開発基礎',
      minorItem: 'TypeScript基礎',
      achievementLevel: 'Lv1',
      status: '申請中',
    },
    {
      id: 'quest-2',
      majorItem: '開発基礎',
      minorItem: 'React入門',
      achievementLevel: 'Lv2',
      status: '申請中',
    },
  ];

  let questStore: QuestStore;

  beforeEach(() => {
    questStore = {
      getById: vi.fn(),
      update: vi.fn(),
      getPendingQuests: vi.fn().mockResolvedValue(pendingQuests),
      create: vi.fn(),
      listAllQuests: vi.fn().mockResolvedValue([]),
    };
  });

  it('getPendingQuestList_トレーナーログイン中_申請中クエスト一覧が返る', async () => {
    const quests = await getPendingQuestList(
      trainerUserId,
      'trainer',
      questStore,
    );

    expect(questStore.getPendingQuests).toHaveBeenCalledOnce();
    expect(quests).toHaveLength(2);
    expect(quests.every((quest) => quest.status === '申請中')).toBe(true);
    expect(quests[0]).toEqual(
      expect.objectContaining({
        majorItem: '開発基礎',
        minorItem: 'TypeScript基礎',
        achievementLevel: 'Lv1',
        status: '申請中',
      }),
    );
    expect(quests[1]).toEqual(
      expect.objectContaining({
        majorItem: '開発基礎',
        minorItem: 'React入門',
        achievementLevel: 'Lv2',
        status: '申請中',
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
  const trainerUserId = 'trainer-1';
  const questId = 'quest-1';

  const pendingQuest: Quest = {
    id: questId,
    majorItem: '開発基礎',
    minorItem: 'TypeScript基礎',
    achievementLevel: 'Lv1',
    status: '申請中',
  };

  let questStore: QuestStore;
  let sheetRepository: SheetRepository;

  beforeEach(() => {
    questStore = {
      getById: vi.fn().mockResolvedValue({ ...pendingQuest }),
      update: vi.fn().mockResolvedValue(undefined),
      getPendingQuests: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      listAllQuests: vi.fn().mockResolvedValue([]),
    };
    sheetRepository = {
      loadQuests: vi.fn().mockResolvedValue([]),
      updateOnApproval: vi.fn().mockResolvedValue(undefined),
    };
  });

  it('approveQuest_トレーナー申請中クエスト_ステータスがクリアに変更されシート更新が呼ばれる', async () => {
    const result = await approveQuest(
      questId,
      trainerUserId,
      'trainer',
      questStore,
      sheetRepository,
    );

    expect(questStore.getById).toHaveBeenCalledWith(questId);
    expect(questStore.update).toHaveBeenCalledWith(
      expect.objectContaining({
        id: questId,
        status: 'クリア',
      }),
    );
    expect(sheetRepository.updateOnApproval).toHaveBeenCalledWith(
      expect.objectContaining({
        id: questId,
        status: 'クリア',
      }),
    );
    expect(result.status).toBe('クリア');
  });
});

/**
 * U-Q05: ダッシュボードのクエスト作成機能表示
 * 前提条件: OJTトレーナーとしてログイン中
 * アクション: ダッシュボード画面を開く
 * 期待結果: 画面上部にクエスト作成機能が表示されること
 */
describe('U-Q05 ダッシュボードのクエスト作成機能表示', () => {
  const trainerUserId = 'trainer-1';

  it('getTrainerDashboard_トレーナーログイン中_画面上部にクエスト作成機能が含まれる', async () => {
    const dashboard: TrainerDashboard = await getTrainerDashboard(
      trainerUserId,
      'trainer',
    );

    const questCreateSection = dashboard.sections.find(
      (section) => section.type === 'questCreate',
    );

    expect(questCreateSection).toBeDefined();
    expect(questCreateSection?.visible).toBe(true);
    expect(questCreateSection?.position).toBe('top');
    expect(dashboard.sections[0]).toEqual(questCreateSection);
  });
});

/**
 * U-Q06: クエスト作成後の進捗表示（トレーナー側）
 * 前提条件: OJTトレーナーとしてログイン中
 * アクション: ダッシュボード上部のクエスト作成機能で新しいクエストを追加する
 * 期待結果: 作成したクエストがトレーナー画面に表示され、進捗状況（未着手・申請中・クリアなど）が確認できること
 */
describe('U-Q06 クエスト作成後の進捗表示（トレーナー側）', () => {
  const trainerUserId = 'trainer-1';

  const createInput: CreateQuestInput = {
    majorItem: '開発基礎',
    minorItem: '新規クエスト',
    achievementLevel: 'Lv1',
  };

  const createdQuest: Quest = {
    id: 'quest-new-1',
    majorItem: '開発基礎',
    minorItem: '新規クエスト',
    achievementLevel: 'Lv1',
    status: '未クリア',
  };

  type QuestStoreForCreation = QuestStore;

  let questStore: QuestStoreForCreation;

  beforeEach(() => {
    questStore = {
      getById: vi.fn(),
      update: vi.fn(),
      getPendingQuests: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue(createdQuest),
      listAllQuests: vi.fn().mockResolvedValue([createdQuest]),
    };
  });

  it('createQuest後getTrainerQuestProgressList_トレーナー_作成クエストの進捗状況が確認できる', async () => {
    const created = await createQuest(
      trainerUserId,
      'trainer',
      createInput,
      questStore,
    );

    const progressList = await getTrainerQuestProgressList(
      trainerUserId,
      'trainer',
      questStore,
    );

    expect(questStore.create).toHaveBeenCalledWith(createInput);
    expect(created).toEqual(
      expect.objectContaining({
        majorItem: '開発基礎',
        minorItem: '新規クエスト',
        achievementLevel: 'Lv1',
        status: '未クリア',
      }),
    );
    expect(progressList).toHaveLength(1);
    expect(progressList[0]).toEqual(
      expect.objectContaining({
        id: created.id,
        minorItem: '新規クエスト',
        status: '未クリア',
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
  const traineeUserId = 'trainee-1';

  const sheetQuests: Quest[] = [
    {
      id: 'quest-1',
      majorItem: '開発基礎',
      minorItem: 'TypeScript基礎',
      achievementLevel: 'Lv1',
    },
  ];

  const trainerCreatedQuest: Quest = {
    id: 'quest-new-1',
    majorItem: '開発基礎',
    minorItem: '新規クエスト',
    achievementLevel: 'Lv1',
    status: '未クリア',
  };

  let sheetRepository: SheetRepository;
  let questStore: QuestStore;

  beforeEach(() => {
    sheetRepository = {
      loadQuests: vi.fn().mockResolvedValue(sheetQuests),
      updateOnApproval: vi.fn().mockResolvedValue(undefined),
    };
    questStore = {
      getById: vi.fn(),
      update: vi.fn(),
      getPendingQuests: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      listAllQuests: vi.fn().mockResolvedValue([trainerCreatedQuest]),
    };
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
          id: 'quest-new-1',
          minorItem: '新規クエスト',
          achievementLevel: 'Lv1',
          status: '未クリア',
        }),
      ]),
    );
  });
});
