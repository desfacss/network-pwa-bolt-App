import { useMemo } from 'react';
import { syncQueue } from './syncQueue';

export function useSyncQueue() {
  // Memoize the sync queue processing to avoid unnecessary re-renders
  useMemo(() => {
    if (syncQueue.queue.length > 0 && !syncQueue.processing) {
      syncQueue.process();
    }
  }, []);

  // No cleanup needed since syncQueue is a singleton
}