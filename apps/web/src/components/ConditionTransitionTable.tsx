import type { ConditionGraphTableRow } from '../api/conditionApi';

interface ConditionTransitionTableProps {
  rows: ConditionGraphTableRow[];
}

export function ConditionTransitionTable({
  rows,
}: ConditionTransitionTableProps) {
  return (
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
          <tr key={`${row.recordedAt}-${index}`}>
            <td>{row.recordedAt}</td>
            <td>{row.workload}</td>
            <td>{row.comprehension}</td>
            <td>{row.mental}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
