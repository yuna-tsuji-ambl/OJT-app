import { useCallback, useState } from 'react';

export function useSelectedMessageThread() {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  const selectThread = useCallback((threadId: string) => {
    setSelectedThreadId(threadId);
  }, []);

  return { selectedThreadId, selectThread, setSelectedThreadId };
}
