import {
  LEARNING_ADD_LINK_LABEL,
  LEARNING_LINKS_FIELD_LABEL,
  LEARNING_LINKS_MAX_COUNT,
  LEARNING_REMOVE_LINK_LABEL,
  createEmptyLearningLinkFormValue,
  type LearningLinkFormValue,
} from '../domain/learningForm';

interface LinkInputListProps {
  readonly links: readonly LearningLinkFormValue[];
  readonly onChange: (links: readonly LearningLinkFormValue[]) => void;
  readonly fieldIdPrefix: string;
}

export function LinkInputList({
  links,
  onChange,
  fieldIdPrefix,
}: LinkInputListProps) {
  const addLink = () => {
    if (links.length >= LEARNING_LINKS_MAX_COUNT) {
      return;
    }
    onChange([...links, createEmptyLearningLinkFormValue()]);
  };

  const removeLink = (index: number) => {
    onChange(links.filter((_, currentIndex) => currentIndex !== index));
  };

  const updateLink = (
    index: number,
    field: keyof LearningLinkFormValue,
    value: string,
  ) => {
    onChange(
      links.map((link, currentIndex) =>
        currentIndex === index ? { ...link, [field]: value } : link,
      ),
    );
  };

  return (
    <fieldset className="learning-form__links">
      <legend>{LEARNING_LINKS_FIELD_LABEL}</legend>
      {links.map((link, index) => {
        const urlFieldId = `${fieldIdPrefix}-link-url-${index}`;
        const labelFieldId = `${fieldIdPrefix}-link-label-${index}`;

        return (
          <div
            key={`${fieldIdPrefix}-link-${index}`}
            className="learning-form__link-row"
          >
            <div className="learning-form__field">
              <label htmlFor={urlFieldId}>URL</label>
              <input
                id={urlFieldId}
                type="url"
                value={link.url}
                onChange={(event) =>
                  updateLink(index, 'url', event.target.value)
                }
              />
            </div>
            <div className="learning-form__field">
              <label htmlFor={labelFieldId}>ラベル（任意）</label>
              <input
                id={labelFieldId}
                type="text"
                value={link.label}
                onChange={(event) =>
                  updateLink(index, 'label', event.target.value)
                }
              />
            </div>
            <button
              type="button"
              className="btn"
              onClick={() => removeLink(index)}
            >
              {LEARNING_REMOVE_LINK_LABEL}
            </button>
          </div>
        );
      })}
      <button
        type="button"
        className="btn"
        onClick={addLink}
        disabled={links.length >= LEARNING_LINKS_MAX_COUNT}
      >
        {LEARNING_ADD_LINK_LABEL}
      </button>
    </fieldset>
  );
}
