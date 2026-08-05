import {
  buildReportFieldId,
  DAILY_REPORT_FORM_FIELDS,
  DAILY_REPORT_PAGE_TITLE,
  REPORT_TYPE_DAILY,
  REPORT_TYPE_WEEKLY,
  WEEKLY_REPORT_FORM_FIELDS,
  WEEKLY_REPORT_PAGE_TITLE,
  type DailyReportFormFieldKey,
  type DailyReportFormValues,
  type ReportFormFieldDefinition,
  type ReportFormType,
  type WeeklyReportFormFieldKey,
  type WeeklyReportFormValues,
} from '../domain/reportForm';

type ReportFormProps =
  | {
      reportType: typeof REPORT_TYPE_DAILY;
      values: DailyReportFormValues;
      onChange: (field: DailyReportFormFieldKey, value: string) => void;
      disabled?: boolean;
    }
  | {
      reportType: typeof REPORT_TYPE_WEEKLY;
      values: WeeklyReportFormValues;
      onChange: (field: WeeklyReportFormFieldKey, value: string) => void;
      disabled?: boolean;
    };

interface ReportTextFieldsProps<TKey extends string> {
  reportType: ReportFormType;
  formLabel: string;
  fields: readonly ReportFormFieldDefinition<TKey>[];
  values: Record<TKey, string>;
  onChange: (field: TKey, value: string) => void;
  disabled: boolean;
}

function ReportTextFields<TKey extends string>({
  reportType,
  formLabel,
  fields,
  values,
  onChange,
  disabled,
}: ReportTextFieldsProps<TKey>) {
  return (
    <form className="report-form" aria-label={formLabel}>
      {fields.map((field) => {
        const fieldId = buildReportFieldId(reportType, field.key);

        return (
          <div key={field.key} className="form-field">
            <label htmlFor={fieldId}>{field.label}</label>
            <textarea
              id={fieldId}
              className="form-textarea"
              value={values[field.key]}
              disabled={disabled}
              onChange={(event) => onChange(field.key, event.target.value)}
            />
          </div>
        );
      })}
    </form>
  );
}

export function ReportForm(props: ReportFormProps) {
  const disabled = props.disabled ?? false;

  if (props.reportType === REPORT_TYPE_DAILY) {
    return (
      <ReportTextFields
        reportType={REPORT_TYPE_DAILY}
        formLabel={DAILY_REPORT_PAGE_TITLE}
        fields={DAILY_REPORT_FORM_FIELDS}
        values={props.values}
        onChange={props.onChange}
        disabled={disabled}
      />
    );
  }

  return (
    <ReportTextFields
      reportType={REPORT_TYPE_WEEKLY}
      formLabel={WEEKLY_REPORT_PAGE_TITLE}
      fields={WEEKLY_REPORT_FORM_FIELDS}
      values={props.values}
      onChange={props.onChange}
      disabled={disabled}
    />
  );
}
