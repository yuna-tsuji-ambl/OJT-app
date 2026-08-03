import { describe, expect, it } from 'vitest';
import {
  parseQuestionMessageBody,
  parseReplyMessageBody,
  parseTrainerNewMessageBody,
  parseTrainerNewTextMessageBody,
  parseTrainerTextReplyBody,
} from './messageRequestTypes.js';

describe('parseQuestionMessageBody', () => {
  it('threadIdとtemplateId_新卒テンプレ返信ボディを返す', () => {
    expect(
      parseQuestionMessageBody({
        trainerId: 'trainer-1',
        threadId: 'thread-1',
        templateId: 'TQ1',
      }),
    ).toEqual({
      trainerId: 'trainer-1',
      threadId: 'thread-1',
      templateId: 'TQ1',
      content: undefined,
      stampId: undefined,
    });
  });

  it('templateIdとcontentが同時_不正としてnull', () => {
    expect(
      parseQuestionMessageBody({
        trainerId: 'trainer-1',
        templateId: 'TQ1',
        content: '補足',
      }),
    ).toBeNull();
  });
});

describe('parseTrainerNewTextMessageBody / parseReplyMessageBody', () => {
  it('traineeIdとcontentのみ_新規自由記述として受理', () => {
    expect(
      parseTrainerNewTextMessageBody({
        traineeId: 'trainee-1',
        content: '進捗共有の時間をください',
      }),
    ).toEqual({
      traineeId: 'trainee-1',
      content: '進捗共有の時間をください',
    });
  });

  it('threadId付きcontent_新規自由記述パーサは拒否しレガシーにも落とさない', () => {
    const body = {
      threadId: 'thread-1',
      traineeId: 'trainee-1',
      content: '15時に声をかけてください',
    };

    expect(parseTrainerNewTextMessageBody(body)).toBeNull();
    expect(parseReplyMessageBody(body)).toBeNull();
    expect(parseTrainerTextReplyBody(body)).toEqual({
      threadId: 'thread-1',
      traineeId: 'trainee-1',
      content: '15時に声をかけてください',
    });
  });

  it('templateId付きの新規テンプレ_新規自由記述パーサは拒否', () => {
    expect(
      parseTrainerNewTextMessageBody({
        traineeId: 'trainee-1',
        templateId: 'TT4',
        content: '補足',
      }),
    ).toBeNull();
    expect(
      parseTrainerNewMessageBody({
        traineeId: 'trainee-1',
        templateId: 'TT4',
      }),
    ).toEqual({
      traineeId: 'trainee-1',
      templateId: 'TT4',
    });
  });
});
