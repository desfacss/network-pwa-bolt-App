// // # services/offline/syncQueue.js
// /**
//  * Manages offline operations queue and synchronization
//  */
// import { indexedDB } from '../cache/indexedDB';
// import { networkMonitor } from './networkMonitor';
// import { conflictResolver } from './conflictResolution';

// class SyncQueueManager {
//   constructor() {
//     this.queue = [];
//     this.isProcessing = false;
//     this.initialize();
//   }

//   async initialize() {
//     // Load pending operations from IndexedDB
//     const pending = await indexedDB.getAllFromStore('syncQueue');
//     this.queue = pending || [];
    
//     // Start processing when online
//     networkMonitor.onOnline(() => this.processQueue());
//   }

//   async addToQueue(operation) {
//     const queueItem = {
//       id: Date.now().toString(),
//       operation,
//       timestamp: Date.now(),
//       retries: 0
//     };
    
//     this.queue.push(queueItem);
//     await indexedDB.set('syncQueue', queueItem.id, queueItem);
    
//     if (networkMonitor.isOnline) {
//       this.processQueue();
//     }
//   }

//   async processQueue() {
//     if (this.isProcessing || this.queue.length === 0) return;
    
//     this.isProcessing = true;
    
//     for (const item of this.queue) {
//       try {
//         const result = await this.processOperation(item);
//         await this.removeFromQueue(item.id);
        
//         if (result.conflict) {
//           await conflictResolver.resolve(result.conflict);
//         }
//       } catch (error) {
//         console.error('Sync error:', error);
//         item.retries++;
        
//         if (item.retries > 3) {
//           await this.removeFromQueue(item.id);
//           // Log failed operation
//           await analytics.logError('sync_failed', { item, error });
//         }
//       }
//     }
    
//     this.isProcessing = false;
//   }

//   async removeFromQueue(id) {
//     this.queue = this.queue.filter(item => item.id !== id);
//     await indexedDB.delete('syncQueue', id);
//   }
// }

// export const syncQueue = new SyncQueueManager();


// services/offline/syncQueue.js
/**
 * Manages offline operations queue and synchronization
 */
import { indexedDB } from '../cache/indexedDB';
import { networkMonitor } from './networkMonitor';
import { conflictResolver } from './conflictResolution';

class SyncQueueManager {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.initialize();
  }

  // Initialize by loading pending operations from IndexedDB
  async initialize() {
    try {
      const pending = await indexedDB.getAllFromStore('syncQueue');
      this.queue = pending || [];
    } catch (error) {
      console.error('Error loading sync queue:', error);
    }
    
    // Start processing queue when network becomes available
    networkMonitor.onOnline(() => this.processQueue());
  }

  // Add an operation to the sync queue
  async addToQueue(operation) {
    const queueItem = {
      id: Date.now().toString(),
      operation,
      timestamp: Date.now(),
      retries: 0
    };
    
    try {
      this.queue.push(queueItem);
      await indexedDB.set('syncQueue', queueItem.id, queueItem);
      
      if (networkMonitor.isOnline) {
        this.processQueue();
      }
    } catch (error) {
      console.error('Error adding to sync queue:', error);
    }
  }

  // Process all items in the queue when online
  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    
    this.isProcessing = true;
    
    for (const item of this.queue) {
      try {
        const result = await this.processOperation(item);
        await this.removeFromQueue(item.id);
        
        if (result.conflict) {
          await conflictResolver.resolve(result.conflict);
        }
      } catch (error) {
        console.error('Sync error:', error);
        item.retries++;
        
        if (item.retries > 3) {
          await this.removeFromQueue(item.id);
          await analytics.logError('sync_failed', { item, error });
        }
      }
    }
    
    this.isProcessing = false;
  }

  // Remove an item from the queue after processing
  async removeFromQueue(id) {
    try {
      this.queue = this.queue.filter(item => item.id !== id);
      await indexedDB.delete('syncQueue', id);
    } catch (error) {
      console.error('Error removing from sync queue:', error);
    }
  }

  // Placeholder for processing operation, should be implemented based on your use case
  async processOperation(item) {
    // Implement this method based on your operation type (e.g., create, update, delete)
    // This is a placeholder
    return { conflict: null };
  }
}

export const syncQueue = new SyncQueueManager();


// # services/offline/networkMonitor.js
/**
 * Network status monitoring and management
 */
class NetworkMonitor {
  constructor() {
    this.isOnline = navigator.onLine;
    this.listeners = new Set();
    
    window.addEventListener('online', () => this.updateStatus(true));
    window.addEventListener('offline', () => this.updateStatus(false));
  }

  updateStatus(status) {
    this.isOnline = status;
    this.notifyListeners();
  }

  onOnline(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener(this.isOnline));
  }
}

export const networkMonitor = new NetworkMonitor();


// // # services/analytics/eventTracking.js
// /**
//  * User activity and event tracking system
//  */
// class Analytics {
//   constructor() {
//     this.queue = [];
//     this.isProcessing = false;
//   }

//   async trackEvent(eventName, data) {
//     const event = {
//       eventName,
//       data,
//       timestamp: Date.now(),
//       sessionId: this.getSessionId()
//     };

//     this.queue.push(event);
//     await this.processQueue();
//   }

//   async logError(errorType, errorData) {
//     await this.trackEvent('error', {
//       type: errorType,
//       ...errorData,
//       timestamp: Date.now()
//     });
//   }

//   async processQueue() {
//     if (this.isProcessing || !this.queue.length) return;
    
//     this.isProcessing = true;
    
//     while (this.queue.length) {
//       const event = this.queue.shift();
//       try {
//         await this.sendToAnalytics(event);
//       } catch (error) {
//         console.error('Analytics error:', error);
//         // Store failed events in IndexedDB for retry
//         await indexedDB.set('failedAnalytics', event.timestamp.toString(), event);
//       }
//     }
    
//     this.isProcessing = false;
//   }

//   getSessionId() {
//     if (!this.sessionId) {
//       this.sessionId = Date.now().toString(36);
//     }
//     return this.sessionId;
//   }
// }

// export const analytics = new Analytics();


// services/analytics/eventTracking.js
/**
 * User activity and event tracking system
 */
import { indexedDB } from '../../services/cache/indexedDB';

class Analytics {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
  }

  // Track an event by adding it to the queue
  async trackEvent(eventName, data) {
    const event = {
      eventName,
      data,
      timestamp: Date.now(),
      sessionId: this.getSessionId()
    };

    this.queue.push(event);
    await this.processQueue();
  }

  // Log an error as an event
  async logError(errorType, errorData) {
    await this.trackEvent('error', {
      type: errorType,
      ...errorData,
      timestamp: Date.now()
    });
  }

  // Process the analytics queue, sending events to the server if online
  async processQueue() {
    if (this.isProcessing || !this.queue.length) return;
    
    this.isProcessing = true;
    
    while (this.queue.length > 0) {
    // while (this.queue.length && this.queue.length > 0) {
      const event = this.queue.shift();
      try {
        await this.sendToAnalytics(event);
      } catch (error) {
        console.error('Analytics error:', error);
        try {
          await indexedDB.set('failedAnalytics', event.timestamp.toString(), event);
        } catch (dbError) {
          console.error('Error saving failed analytics event:', dbError);
        }
      }
    }
    
    this.isProcessing = false;
  }

  // Send event to analytics service (placeholder for actual implementation)
  async sendToAnalytics(event) {
    // Placeholder for actual implementation to send to analytics service
    console.log('Sending event to analytics:', event);
    // Here, you would implement the actual sending to your analytics service
  }

  // Generate or retrieve session ID
  getSessionId() {
    if (!this.sessionId) {
      this.sessionId = Date.now().toString(36);
    }
    return this.sessionId;
  }
}

export const analytics = new Analytics();


// // # services/security/tokenManager.js
// /**
//  * Token management and refresh logic
//  */
// import { supabase } from '../api/supabase';
// import { analytics } from '../analytics/eventTracking';

// class TokenManager {
//   constructor() {
//     this.refreshTimeout = null;
//     this.initialize();
//   }

//   async initialize() {
//     supabase.auth.onAuthStateChange((event, session) => {
//       if (event === 'SIGNED_IN') {
//         this.scheduleRefresh(session);
//       } else if (event === 'SIGNED_OUT') {
//         this.clearRefresh();
//       }
//     });
//   }

//   scheduleRefresh(session) {
//     if (this.refreshTimeout) {
//       clearTimeout(this.refreshTimeout);
//     }

//     const expiresIn = session.expires_in * 1000;
//     const refreshTime = expiresIn - (5 * 60 * 1000); // 5 minutes before expiry

//     this.refreshTimeout = setTimeout(() => this.refreshToken(), refreshTime);
//   }

//   async refreshToken() {
//     try {
//       const { data: { session }, error } = await supabase.auth.refreshSession();
      
//       if (error) throw error;
      
//       this.scheduleRefresh(session);
      
//       analytics.trackEvent('token_refreshed', {
//         timestamp: Date.now()
//       });
//     } catch (error) {
//       console.error('Token refresh failed:', error);
//       analytics.logError('token_refresh_failed', { error });
//     }
//   }

//   clearRefresh() {
//     if (this.refreshTimeout) {
//       clearTimeout(this.refreshTimeout);
//       this.refreshTimeout = null;
//     }
//   }
// }

// export const tokenManager = new TokenManager();

// services/security/tokenManager.js
/**
 * Token management and refresh logic
 */
import { supabase } from '../api/supabase';
import { analytics } from '../analytics/eventTracking';

class TokenManager {
  constructor() {
    this.refreshTimeout = null;
    this.initialize();
  }

  // Set up listeners for authentication state changes
  async initialize() {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        this.scheduleRefresh(session);
      } else if (event === 'SIGNED_OUT') {
        this.clearRefresh();
      }
    });
  }

  // Schedule token refresh before it expires
  scheduleRefresh(session) {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }

    const expiresIn = session.expires_in * 1000;
    const refreshTime = expiresIn - (5 * 60 * 1000); // 5 minutes before expiry

    this.refreshTimeout = setTimeout(() => this.refreshToken(), refreshTime);
  }

  // Refresh the token with retry logic
  async refreshToken() {
    let retries = 0;
    const maxRetries = 3;
    
    while (retries < maxRetries) {
      try {
        const { data: { session }, error } = await supabase.auth.refreshSession();
        
        if (error) throw error;
        
        this.scheduleRefresh(session);
        analytics.trackEvent('token_refreshed', { timestamp: Date.now() });
        return;
      } catch (error) {
        retries++;
        if (retries >= maxRetries) {
          console.error('Token refresh failed after retries:', error);
          analytics.logError('token_refresh_failed', { error });
          return;
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries))); // Exponential backoff
      }
    }
  }

  // Clear the refresh timeout when user signs out
  clearRefresh() {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }
  }
}

export const tokenManager = new TokenManager();

// # services/sync/dataMerge.js
/**
 * Data merging and conflict resolution
 */
class DataMergeService {
  async mergeRecords(localData, serverData) {
    const merged = {};
    const conflicts = [];

    // Compare and merge records
    for (const key in serverData) {
      const serverRecord = serverData[key];
      const localRecord = localData[key];

      if (!localRecord) {
        merged[key] = serverRecord;
        continue;
      }

      if (this.hasConflict(localRecord, serverRecord)) {
        conflicts.push({
          key,
          local: localRecord,
          server: serverRecord
        });
      } else {
        merged[key] = this.getNewerVersion(localRecord, serverRecord);
      }
    }

    return {
      merged,
      conflicts
    };
  }

  hasConflict(local, server) {
    return local.version !== server.version && 
           local.lastModified > server.lastModified;
  }

  getNewerVersion(local, server) {
    return local.lastModified > server.lastModified ? local : server;
  }
}

export const dataMerge = new DataMergeService();

// # utils/performance/lazyLoader.js
/**
 * Component lazy loading utilities
 */
import React, { Suspense } from 'react';

export const lazyLoad = (importFunc, { fallback = null } = {}) => {
  const LazyComponent = React.lazy(importFunc);

  return props => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// // # utils/performance/virtualList.js
// /**
//  * Virtual scrolling implementation for large lists
//  */
// import React, { useState, useEffect, useCallback } from 'react';

// export const VirtualList = ({ 
//   items, 
//   height, 
//   rowHeight, 
//   renderRow 
// }) => {
//   const [scrollTop, setScrollTop] = useState(0);
//   const [visibleItems, setVisibleItems] = useState([]);

//   const visibleCount = Math.ceil(height / rowHeight);
//   const totalHeight = items.length * rowHeight;

//   const getVisibleRange = useCallback(() => {
//     const start = Math.floor(scrollTop / rowHeight);
//     const end = Math.min(start + visibleCount + 1, items.length);
//     return { start, end };
//   }, [scrollTop, rowHeight, visibleCount, items.length]);

//   useEffect(() => {
//     const { start, end } = getVisibleRange();
//     setVisibleItems(
//       items.slice(start, end).map((item, index) => ({
//         ...item,
//         index: start + index
//       }))
//     );
//   }, [items, getVisibleRange]);

//   const handleScroll = (e) => {
//     setScrollTop(e.target.scrollTop);
//   };

//   return (
//     <div
//       style={{ height, overflow: 'auto' }}
//       onScroll={handleScroll}
//     >
//       <div style={{ height: totalHeight }}>
//         <div
//           style={{
//             transform: `translateY(${Math.floor(scrollTop / rowHeight) * rowHeight}px)`
//           }}
//         >
//           {visibleItems.map((item, index) => (
//             <div
//               key={item.index}
//               style={{ height: rowHeight }}
//             >
//               {renderRow(item)}
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };



// utils/performance/virtualList.js
/**
 * Virtual scrolling implementation for large lists
 */
import React, { useState, useEffect, useCallback } from 'react';

export const VirtualList = ({ 
  items, 
  height, 
  rowHeight, 
  renderRow 
}) => {
  // State to manage scroll position and visible items
  const [scrollTop, setScrollTop] = useState(0);
  const [visibleItems, setVisibleItems] = useState([]);

  // Calculate how many items should be visible based on container height and row height
  const visibleCount = Math.ceil(height / rowHeight);
  const totalHeight = items.length * rowHeight;

  // Function to determine which items should be rendered
  const getVisibleRange = useCallback(() => {
    const start = Math.floor(scrollTop / rowHeight);
    const end = Math.min(start + visibleCount + 1, items.length);
    return { start, end };
  }, [scrollTop, rowHeight, visibleCount, items.length]);

  // Effect to update visible items when scrolling or data changes
  useEffect(() => {
    const { start, end } = getVisibleRange();
    setVisibleItems(
      items.slice(start, end).map((item, index) => ({
        ...item,
        index: start + index
      }))
    );
  }, [items, getVisibleRange]);

  // Debounce scroll event to optimize performance
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  };

  // Handle scroll event with debounce
  const handleScroll = debounce((e) => {
    setScrollTop(e.target.scrollTop);
  }, 16); // 16ms debounce for ~60fps

  return (
    <div
      style={{ height, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      {/* Outer div to set the total scrollable height */}
      <div style={{ height: totalHeight }}>
        {/* Inner div to position visible items */}
        <div
          style={{
            transform: `translateY(${Math.floor(scrollTop / rowHeight) * rowHeight}px)`
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={item.index}
              style={{ height: rowHeight }}
            >
              {renderRow(item)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};





// # hooks/usePerformanceMonitor.js
/**
 * Performance monitoring hook
 */
import { useEffect, useCallback } from 'react';
import { analytics } from '../services/analytics/eventTracking';

export const usePerformanceMonitor = (componentName) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      analytics.trackEvent('component_lifecycle', {
        component: componentName,
        duration,
        timestamp: Date.now()
      });
    };
  }, [componentName]);

  const measureOperation = useCallback(async (operationName, operation) => {
    const startTime = performance.now();
    try {
      const result = await operation();
      const duration = performance.now() - startTime;
      
      analytics.trackEvent('operation_performance', {
        operation: operationName,
        duration,
        success: true
      });
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      analytics.trackEvent('operation_performance', {
        operation: operationName,
        duration,
        success: false,
        error: error.message
      });
      
      throw error;
    }
  }, []);

  return { measureOperation };
};
