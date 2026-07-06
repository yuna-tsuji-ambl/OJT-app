interface ConditionSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

export function ConditionSlider({
  label,
  value,
  onChange,
}: ConditionSliderProps) {
  const inputId = `slider-${label}`;

  return (
    <div>
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        type="range"
        role="slider"
        aria-label={label}
        aria-valuemin={1}
        aria-valuemax={5}
        aria-valuenow={value}
        min={1}
        max={5}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <span>{value}</span>
    </div>
  );
}
