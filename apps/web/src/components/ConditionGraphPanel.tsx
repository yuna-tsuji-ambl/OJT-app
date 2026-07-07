import type { ConditionGraphData } from '../api/conditionApi';

interface ConditionGraphPanelProps {
  graphData: ConditionGraphData;
}

export function ConditionGraphPanel({ graphData }: ConditionGraphPanelProps) {
  const rows = graphData.labels.map((label, index) => ({
    label,
    workload: graphData.workload[index],
    comprehension: graphData.comprehension[index],
    mental: graphData.mental[index],
  }));

  return (
    <section aria-label="コンディション推移グラフ">
      <table>
        <thead>
          <tr>
            <th>記録日時</th>
            <th>業務量</th>
            <th>理解度</th>
            <th>メンタル</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row.label}-${index}`}>
              <td>{row.label}</td>
              <td>{row.workload}</td>
              <td>{row.comprehension}</td>
              <td>{row.mental}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
