import { describe, expect, it, vi } from 'vitest';
import {
  formatMessageSendError,
  hasDualSendPayload,
  resolveDualSendParts,
  runDualSendSequence,
} from './messageDualSend';

describe('U-SV10/14 resolveDualSendParts', () => {
  it('テンプレと自由記述両方_両方返す', () => {
    expect(resolveDualSendParts('TQ1', '補足です')).toEqual({
      templateId: 'TQ1',
      freeText: '補足です',
    });
  });

  it('テンプレのみ_自由記述はnull', () => {
    expect(resolveDualSendParts('TQ1', '')).toEqual({
      templateId: 'TQ1',
      freeText: null,
    });
  });

  it('テンプレ＋空白のみの自由記述_テンプレのみ', () => {
    expect(resolveDualSendParts('TQ1', '   ')).toEqual({
      templateId: 'TQ1',
      freeText: null,
    });
  });

  it('自由記述のみ', () => {
    expect(resolveDualSendParts('', '本文')).toEqual({
      templateId: null,
      freeText: '本文',
    });
  });

  it('両方空_ペイロードなし', () => {
    const parts = resolveDualSendParts('', '  ');
    expect(parts).toEqual({ templateId: null, freeText: null });
    expect(hasDualSendPayload(parts)).toBe(false);
  });
});

describe('U-SV10 runDualSendSequence', () => {
  it('両方あり_テンプレを先に呼び自由記述を後に呼ぶ', async () => {
    const order: string[] = [];
    const sendTemplate = vi.fn(async (templateId: string) => {
      order.push(`template:${templateId}`);
      return 'template-ok';
    });
    const sendFreeText = vi.fn(async (freeText: string) => {
      order.push(`text:${freeText}`);
      return 'text-ok';
    });

    const result = await runDualSendSequence(
      { templateId: 'TQ1', freeText: '補足' },
      sendTemplate,
      sendFreeText,
    );

    expect(order).toEqual(['template:TQ1', 'text:補足']);
    expect(result).toEqual({
      templateResult: 'template-ok',
      freeTextResult: 'text-ok',
    });
  });

  it('テンプレのみ_自由記述コールバックは呼ばない', async () => {
    const sendTemplate = vi.fn(async () => 'template-ok');
    const sendFreeText = vi.fn(async () => 'text-ok');

    const result = await runDualSendSequence(
      { templateId: 'TQ1', freeText: null },
      sendTemplate,
      sendFreeText,
    );

    expect(sendTemplate).toHaveBeenCalledOnce();
    expect(sendFreeText).not.toHaveBeenCalled();
    expect(result.freeTextResult).toBeUndefined();
  });

  it('自由記述のみ_テンプレコールバックは呼ばない', async () => {
    const sendTemplate = vi.fn(async () => 'template-ok');
    const sendFreeText = vi.fn(async () => 'text-ok');

    const result = await runDualSendSequence(
      { templateId: null, freeText: '本文' },
      sendTemplate,
      sendFreeText,
    );

    expect(sendTemplate).not.toHaveBeenCalled();
    expect(sendFreeText).toHaveBeenCalledWith('本文');
    expect(result.templateResult).toBeUndefined();
  });
});

describe('formatMessageSendError', () => {
  it('Errorならmessageを返す', () => {
    expect(formatMessageSendError(new Error('失敗'), 'fallback')).toBe('失敗');
  });

  it('未知の値ならfallbackを返す', () => {
    expect(formatMessageSendError('x', 'fallback')).toBe('fallback');
  });
});
