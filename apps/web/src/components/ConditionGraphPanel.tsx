import type { ConditionGraphData } from '../api/conditionApi';
import { CONDITION_GRAPH_REGION_LABEL } from '../domain/conditionUiConstants';
import { ConditionLineChart } from './ConditionLineChart';
import { ConditionTransitionTable } from './ConditionTransitionTable';

interface ConditionGraphPanelProps {
  graphData: ConditionGraphData;
}

export function ConditionGraphPanel({ graphData }: ConditionGraphPanelProps) {
  return (
    <section aria-label={CONDITION_GRAPH_REGION_LABEL}>
      <ConditionLineChart lineChart={graphData.lineChart} />
      <ConditionTransitionTable transitionTable={graphData.transitionTable} />
    </section>
  );
}
