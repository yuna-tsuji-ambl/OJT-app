import type { ReactNode } from 'react';
import { MESSAGE_THREAD_DETAIL_REGION_LABEL } from '../domain/messageTrainerForm';

interface MessageThreadDetailProps {
  children: ReactNode;
}

export function MessageThreadDetail({ children }: MessageThreadDetailProps) {
  return (
    <section
      className="message-thread-detail"
      role="region"
      aria-label={MESSAGE_THREAD_DETAIL_REGION_LABEL}
    >
      {children}
    </section>
  );
}
