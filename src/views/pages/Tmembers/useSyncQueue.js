// import { useMemo } from 'react';
// import { syncQueue } from './syncQueue';

// export function useSyncQueue() {
//   // Memoize the sync queue processing to avoid unnecessary re-renders
//   useMemo(() => {
//     if (syncQueue.queue.length > 0 && !syncQueue.processing) {
//       syncQueue.process();
//     }
//   }, []);

//   // No cleanup needed since syncQueue is a singleton
// }

import { useMemo, useEffect } from 'react';
import { syncQueue } from './syncQueue';
import { networkMonitor } from '../../../services/networkMonitor';

export function useSyncQueue() {
  const processQueue = useMemo(() => {
    return () => {
      if (syncQueue.queue.length > 0 && !syncQueue.processing) {
        syncQueue.process();
      }
    };
  }, []);

  useEffect(() => {
    const unsubscribe = networkMonitor.subscribe((isOnline) => {
      if (isOnline) {
        processQueue();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [processQueue]);

  // No cleanup needed since syncQueue is a singleton
}