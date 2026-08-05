import {
  parseReportTypeFilterValue,
  REPORT_TYPE_FILTER_FIELD_ID,
  REPORT_TYPE_FILTER_LABEL,
  REPORT_TYPE_FILTER_OPTIONS,
  type ReportTypeFilterValue,
} from '../domain/reportForm';

interface ReportTypeFilterProps {
  readonly value: ReportTypeFilterValue;
  readonly onChange: (value: ReportTypeFilterValue) => void;
}

/** トレーナー報告一覧の種別フィルタ（E-R10） */
export function ReportTypeFilter({ value, onChange }: ReportTypeFilterProps) {
  return (
    <div className="report-type-filter">
      <label htmlFor={REPORT_TYPE_FILTER_FIELD_ID}>
        {REPORT_TYPE_FILTER_LABEL}
      </label>
      <select
        id={REPORT_TYPE_FILTER_FIELD_ID}
        className="form-select"
        aria-label={REPORT_TYPE_FILTER_LABEL}
        value={value}
        onChange={(event) => {
          const nextValue = parseReportTypeFilterValue(event.target.value);
          if (nextValue !== null) {
            onChange(nextValue);
          }
        }}
      >
        {REPORT_TYPE_FILTER_OPTIONS.map((option) => (
          <option key={option.value || 'all'} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
