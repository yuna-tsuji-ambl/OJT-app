import { describe, expect, it } from 'vitest';
import { hasDualSendPayload, resolveDualSendParts } from './messageDualSend';

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
