import type { ReportFormFieldDefinition } from '../domain/reportForm';

interface ReportCardContentProps<TKey extends string> {
  fields: readonly ReportFormFieldDefinition<TKey>[];
  content: Record<TKey, string>;
}

/** 報告カード内の本文（フィールド一覧） */
export function ReportCardContent<TKey extends string>({
  fields,
  content,
}: ReportCardContentProps<TKey>) {
  return (
    <dl>
      {fields.map((field) => (
        <div key={field.key}>
          <dt>{field.label}</dt>
          <dd>{content[field.key]}</dd>
        </div>
      ))}
    </dl>
  );
}
