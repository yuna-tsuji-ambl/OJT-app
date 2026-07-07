import type { ConditionDraft } from '../api/conditionTypes';
import { CONDITION_CURRENT_REGION_LABEL } from '../domain/conditionUiConstants';

interface CurrentConditionPanelProps {
  record: ConditionDraft;
}

export function CurrentConditionPanel({ record }: CurrentConditionPanelProps) {
  return (
    <section aria-label={CONDITION_CURRENT_REGION_LABEL}>
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
