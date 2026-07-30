import { useState, type FormEvent } from 'react';

interface ReportCommentTextFormProps {
  readonly fieldId: string;
  readonly fieldLabel: string;
  readonly submitButtonLabel: string;
  readonly initialContent?: string;
  readonly clearOnSuccess?: boolean;
  readonly formClassName: string;
  readonly onSubmit: (content: string) => Promise<void>;
}

/** コメント作成・編集で共有するテキスト送信フォーム */
export function ReportCommentTextForm({
  fieldId,
  fieldLabel,
  submitButtonLabel,
  initialContent = '',
  clearOnSuccess = false,
  formClassName,
  onSubmit,
}: ReportCommentTextFormProps) {
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const trimmedContent = content.trim();
  const canSubmit = !isSubmitting && trimmedContent.length > 0;

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(trimmedContent);
      if (clearOnSuccess) {
        setContent('');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className={formClassName} onSubmit={handleSubmit}>
      <label htmlFor={fieldId}>{fieldLabel}</label>
      <textarea
        id={fieldId}
        className="form-textarea"
        aria-label={fieldLabel}
        value={content}
        onChange={(event) => setContent(event.target.value)}
      />
      <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
        {submitButtonLabel}
      </button>
    </form>
  );
}
