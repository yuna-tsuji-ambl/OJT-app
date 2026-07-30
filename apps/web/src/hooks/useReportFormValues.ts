import { useCallback, useState } from 'react';

export function useReportFormValues<TValues extends Record<string, string>>(
  createEmptyValues: () => TValues,
): {
  values: TValues;
  updateField: <TKey extends keyof TValues & string>(
    field: TKey,
    value: string,
  ) => void;
  replaceValues: (next: TValues) => void;
} {
  const [values, setValues] = useState(createEmptyValues);

  const updateField = useCallback(
    <TKey extends keyof TValues & string>(field: TKey, value: string): void => {
      setValues((current) => ({ ...current, [field]: value }));
    },
    [],
  );

  const replaceValues = useCallback((next: TValues): void => {
    setValues(next);
  }, []);

  return { values, updateField, replaceValues };
}
