import type { ConditionDraft } from '../api/conditionApi';

interface CurrentConditionPanelProps {
  record: ConditionDraft;
}

export function CurrentConditionPanel({ record }: CurrentConditionPanelProps) {
  return (
    <section aria-label="現在のコンディション">
      <dl>
        <dt>業務量</dt>
        <dd>{record.workload}</dd>
        <dt>理解度</dt>
        <dd>{record.comprehension}</dd>
        <dt>メンタル</dt>
        <dd>{record.mental}</dd>
      </dl>
    </section>
  );
}
