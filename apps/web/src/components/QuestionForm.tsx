import { QUESTION_TEMPLATE } from '../domain/statusConstants';

interface QuestionFormProps {
  onSelectTemplate: (template: string) => void;
  onSend: () => void;
}

export function QuestionForm({ onSelectTemplate, onSend }: QuestionFormProps) {
  return (
    <div className="btn-group">
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => onSelectTemplate(QUESTION_TEMPLATE)}
      >
        {QUESTION_TEMPLATE}
      </button>
      <button type="button" className="btn btn-primary" onClick={onSend}>
        送信
      </button>
    </div>
  );
}
