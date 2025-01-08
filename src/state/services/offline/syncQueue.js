
// import { offlineDB } from 'state/services/offline/dexie';
// import { networkMonitor } from 'state/services/offline/networkMonitor';

// const RETRY_DELAYS = [1000, 5000, 15000, 30000, 60000]; // Exponential backoff delays
// const MAX_RETRIES = RETRY_DELAYS.length;

// class SyncQueue {
//     constructor() {
//         this.queue = [];
//         this.isProcessing = false;
//         this.initialize();
//     }

//     async initialize() {
//         try {
//             console.log("A1. SyncQueue: Initializing sync queue...");
//             // Ensure database is opened before accessing tables
//             await offlineDB.open();
//             this.queue = await offlineDB.syncQueue.toArray();
//             console.log("A2. SyncQueue: Loaded queue items:", this.queue.length);
//             this.isProcessing = await offlineDB.getSyncQueueState() || false;
//             console.log("A3. SyncQueue: Current processing state:", this.isProcessing);

//             // Use subscribe for network status changes
//             this.unsubscribeFromNetwork = networkMonitor.subscribe(this.handleNetworkChange.bind(this));
//             console.log("A4. SyncQueue: Subscribed to network status changes.");

//             // Setup intervals for retry and cleanup
//             this.retryInterval = setInterval(this.retryFailedOperations.bind(this), 5 * 60 * 1000); // Every 5 minutes
//             this.cleanUpInterval = setInterval(this.cleanUpQueue.bind(this), 24 * 60 * 60 * 1000); // Daily cleanup
//             console.log("A5. SyncQueue: Set up retry and cleanup intervals.");
//         } catch (error) {
//             console.error('A6. SyncQueue initialization error:', error);
//             throw error;
//         }
//     }

//     handleNetworkChange(status) {
//         console.log("A7. Network status changed to:", status);
//         if (status) {
//             this.processQueue();
//         }
//     }

//     onQueueUpdate(callback) {
//         this.queueChangeListeners = this.queueChangeListeners || [];
//         this.queueChangeListeners.push(callback);
//         console.log("A8. Added queue update listener. Total listeners:", this.queueChangeListeners.length);
//         return () => {
//             const index = this.queueChangeListeners.indexOf(callback);
//             if (index > -1) {
//                 this.queueChangeListeners.splice(index, 1);
//                 console.log("A9. Removed queue update listener. Remaining listeners:", this.queueChangeListeners.length);
//             }
//         };
//     }

//     /**
//      * Adds an operation to the sync queue
//      * @param {Object} operation - The operation to queue
//      * @returns {Object} The queue item
//      */
//     async addToQueue(operation) {
//         try {
//             const queueItem = {
//                 id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
//                 domain: 'y_state', // hardcoded for now, since we're dealing with one domain
//                 operation,
//                 timestamp: Date.now(),
//                 retries: 0,
//                 status: 'pending',
//                 lastAttempt: null,
//             };

//             await offlineDB.syncQueue.add(queueItem);
//             this.queue.push(queueItem);
//             console.log("A10. Added to queue:", queueItem);

//             // If online and connection is stable, start processing immediately
//             if (networkMonitor.isOnline && networkMonitor.isConnectionStable) {
//                 console.log("A11. Network is online and stable, triggering queue processing.");
//                 this.processQueue();
//             }

//             return queueItem;
//         } catch (error) {
//             console.error('A12. Error adding to sync queue:', error);
//             throw error;
//         }
//     }

//     /**
//      * Processes the sync queue
//      */
//     async processQueue() {
//         if (this.isProcessing || this.queue.length === 0) {
//             console.log("A13. Queue processing skipped: Already processing or queue empty.");
//             return;
//         }

//         this.isProcessing = true;
//         await offlineDB.updateSyncQueueState({ isProcessing: true });
//         console.log("A14. Started processing queue. Items to process:", this.queue.length);

//         try {
//             for (let i = 0; i < this.queue.length; i++) {
//                 const item = this.queue[i];
//                 if (item.status === 'failed' && item.retries >= MAX_RETRIES) {
//                     console.log("A15. Skipping permanently failed item:", item.id);
//                     continue;
//                 }

//                 try {
//                     await this.processOperation(item);
//                     await offlineDB.syncQueue.delete(item.id);
//                     this.queue.splice(i, 1);
//                     i--; // Adjust index after removal
//                     console.log("A16. Successfully processed item:", item.id);
//                 } catch (error) {
//                     console.error('A17. Sync error for item:', item.id, error);

//                     const updatedItem = {
//                         ...item,
//                         retries: item.retries + 1,
//                         status: item.retries + 1 >= MAX_RETRIES ? 'failed' : 'pending',
//                         lastAttempt: Date.now(),
//                         error: error.message,
//                     };

//                     await offlineDB.syncQueue.put(updatedItem);
//                     this.queue[i] = updatedItem;

//                     // Wait before next retry
//                     await new Promise(resolve => {
//                         console.log("A18. Waiting before retry for item:", item.id, "Delay:", RETRY_DELAYS[Math.min(item.retries, MAX_RETRIES - 1)]);
//                         setTimeout(resolve, RETRY_DELAYS[Math.min(item.retries, MAX_RETRIES - 1)]);
//                     });
//                 }
//             }
//         } finally {
//             this.isProcessing = false;
//             await offlineDB.updateSyncQueueState({ isProcessing: false });
//             console.log("A19. Finished processing queue.");
//         }
//     }

//     /**
//      * Processes a single operation from the queue
//      * @param {Object} item - The queue item to process
//      */
//     async processOperation(item) {
//         const { operation } = item;
//         console.log("A20. Processing operation:", operation.type);
//         switch (operation.type) {
//             case 'create':
//                 return this.handleCreate(operation.item);
//             case 'update':
//                 return this.handleUpdate(operation.item);
//             case 'delete':
//                 return this.handleDelete(operation.id);
//             default:
//                 throw new Error(`A21. Unknown operation type: ${operation.type}`);
//         }
//     }

//     // Rest of your CRUD handling methods (handleCreate, handleUpdate, handleDelete)

//     async handleCreate(item) {
//         try {
//             const response = await fetch(`/api/y_state`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(item),
//             });

//             if (!response.ok) {
//                 throw new Error(`HTTP error! status: ${response.status}`);
//             }

//             const newItem = await response.json();
//             // Optionally update local state or return the new item for further handling
//             return newItem;
//         } catch (error) {
//             console.error('Error creating item:', error);
//             throw error;
//         }
//     }

//     async handleUpdate(item) {
//         try {
//             const response = await fetch(`/api/y_state/${item.id}`, {
//                 method: 'PUT',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(item),
//             });

//             if (!response.ok) {
//                 throw new Error(`HTTP error! status: ${response.status}`);
//             }

//             const updatedItem = await response.json();
//             // Optionally update local state or return the updated item
//             return updatedItem;
//         } catch (error) {
//             console.error('Error updating item:', error);
//             throw error;
//         }
//     }

//     async handleDelete(id) {
//         try {
//             const response = await fetch(`/api/y_state/${id}`, {
//                 method: 'DELETE',
//             });

//             if (!response.ok) {
//                 throw new Error(`HTTP error! status: ${response.status}`);
//             }

//             // Typically, DELETE operations don't return content, but you might return metadata
//             return { message: 'Item deleted successfully' };
//         } catch (error) {
//             console.error('Error deleting item:', error);
//             throw error;
//         }
//     }

//     /**
//      * Retries operations that failed but haven't exceeded max retries
//      */
//     async retryFailedOperations() {
//         const failedItems = await offlineDB.syncQueue.where('status').equals('failed').and(item => item.retries < MAX_RETRIES).toArray();
//         console.log("A22. Retrying", failedItems.length, "failed operations");

//         if (failedItems.length > 0 && networkMonitor.isOnline && networkMonitor.isConnectionStable) {
//             for (const item of failedItems) {
//                 item.status = 'pending';
//                 item.lastAttempt = null;
//                 await offlineDB.syncQueue.put(item);
//                 console.log("A23. Resetting item for retry:", item.id);
//             }
//             this.processQueue();
//         }
//     }

//     /**
//      * Cleans up old, permanently failed operations from the queue
//      */
//     async cleanUpQueue() {
//         const now = Date.now();
//         const count = await offlineDB.syncQueue.where('timestamp').below(now - (30 * 24 * 60 * 60 * 1000))
//             .and(item => item.status === 'failed' && item.retries >= MAX_RETRIES)
//             .delete();
//         console.log("A24. Cleaned up", count, "old failed operations from the queue.");
//     }
// }

// export const syncQueue = new SyncQueue();



import { offlineDB } from 'state/services/offline/offlinedb';
import { networkMonitor } from 'state/services/offline/networkMonitor';

const RETRY_DELAYS = [1000, 5000, 15000, 30000, 60000]; // Exponential backoff delays
const MAX_RETRIES = RETRY_DELAYS.length;

class SyncQueue {
    constructor() {
        this.queue = [];
        this.isProcessing = false;
        this.initialize();
    }

    async initialize() {
        try {
            console.log("A1. SyncQueue: Initializing sync queue...");
            await offlineDB.open();
            this.queue = await offlineDB.syncQueue.toArray();
            console.log("A2. SyncQueue: Loaded queue items:", this.queue.length);
            this.isProcessing = await offlineDB.getSyncQueueState() || false;
            console.log("A3. SyncQueue: Current processing state:", this.isProcessing);

            // Use subscribe for network status changes
            this.unsubscribeFromNetwork = networkMonitor.subscribe(this.handleNetworkChange.bind(this));
            console.log("A4. SyncQueue: Subscribed to network status changes.");

            // Setup intervals for retry and cleanup
            this.retryInterval = setInterval(this.retryFailedOperations.bind(this), 5 * 60 * 1000); // Every 5 minutes
            this.cleanUpInterval = setInterval(this.cleanUpQueue.bind(this), 24 * 60 * 60 * 1000); // Daily cleanup
            console.log("A5. SyncQueue: Set up retry and cleanup intervals.");
        } catch (error) {
            console.error('A6. SyncQueue initialization error:', error);
            throw error;
        }
    }

    handleNetworkChange(status) {
        console.log("A7. Network status changed to:", status);
        if (status) {
            this.processQueue();
        }
    }

    onQueueUpdate(callback) {
        this.queueChangeListeners = this.queueChangeListeners || [];
        this.queueChangeListeners.push(callback);
        console.log("A8. Added queue update listener. Total listeners:", this.queueChangeListeners.length);
        return () => {
            const index = this.queueChangeListeners.indexOf(callback);
            if (index > -1) {
                this.queueChangeListeners.splice(index, 1);
                console.log("A9. Removed queue update listener. Remaining listeners:", this.queueChangeListeners.length);
            }
        };
    }

    async addToQueue(operation) {
        try {
            const queueItem = {
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                domain: 'y_state', // hardcoded for now, since we're dealing with one domain
                operation,
                timestamp: Date.now(),
                retries: 0,
                status: 'pending',
                lastAttempt: null,
            };

            await offlineDB.syncQueue.add(queueItem);
            this.queue.push(queueItem);
            console.log("A10. Added to queue:", queueItem);

            // If online and connection is stable, start processing immediately
            if (networkMonitor.isOnline && networkMonitor.isConnectionStable) {
                console.log("A11. Network is online and stable, triggering queue processing.");
                this.processQueue();
            }

            // Notify listeners of queue update
            if (this.queueChangeListeners) {
                this.queueChangeListeners.forEach(listener => listener());
            }

            return queueItem;
        } catch (error) {
            console.error('A12. Error adding to sync queue:', error);
            throw error;
        }
    }

    async processQueue() {
        if (this.isProcessing || this.queue.length === 0) {
            console.log("A13. Queue processing skipped: Already processing or queue empty.");
            return;
        }

        this.isProcessing = true;
        await offlineDB.updateSyncQueueState({ isProcessing: true });
        console.log("A14. Started processing queue. Items to process:", this.queue.length);

        try {
            for (let i = 0; i < this.queue.length; i++) {
                const item = this.queue[i];
                if (item.status === 'failed' && item.retries >= MAX_RETRIES) {
                    console.log("A15. Skipping permanently failed item:", item.id);
                    continue;
                }

                try {
                    await this.processOperation(item);
                    await offlineDB.syncQueue.delete(item.id);
                    this.queue.splice(i, 1);
                    i--; // Adjust index after removal
                    console.log("A16. Successfully processed item:", item.id);
                } catch (error) {
                    console.error('A17. Sync error for item:', item.id, error);

                    const updatedItem = {
                        ...item,
                        retries: item.retries + 1,
                        status: item.retries + 1 >= MAX_RETRIES ? 'failed' : 'pending',
                        lastAttempt: Date.now(),
                        error: error.message,
                    };

                    await offlineDB.syncQueue.put(updatedItem);
                    this.queue[i] = updatedItem;

                    // Wait before next retry
                    await new Promise(resolve => {
                        console.log("A18. Waiting before retry for item:", item.id, "Delay:", RETRY_DELAYS[Math.min(item.retries, MAX_RETRIES - 1)]);
                        setTimeout(resolve, RETRY_DELAYS[Math.min(item.retries, MAX_RETRIES - 1)]);
                    });
                }
            }
        } finally {
            this.isProcessing = false;
            await offlineDB.updateSyncQueueState({ isProcessing: false });
            console.log("A19. Finished processing queue.");
        }
    }

    async processOperation(item) {
        const { operation } = item;
        console.log("A20. Processing operation:", operation.type);
        switch (operation.type) {
            case 'create':
                return this.handleCreate(operation.item);
            case 'update':
                return this.handleUpdate(operation.item);
            case 'delete':
                return this.handleDelete(operation.id);
            default:
                throw new Error(`A21. Unknown operation type: ${operation.type}`);
        }
    }

    async handleCreate(item) {
        try {
            const response = await fetch(`/api/y_state`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(item),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const newItem = await response.json();
            return newItem;
        } catch (error) {
            console.error('Error creating item:', error);
            throw error;
        }
    }

    async handleUpdate(item) {
        try {
            const response = await fetch(`/api/y_state/${item.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(item),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const updatedItem = await response.json();
            return updatedItem;
        } catch (error) {
            console.error('Error updating item:', error);
            throw error;
        }
    }

    async handleDelete(id) {
        try {
            const response = await fetch(`/api/y_state/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return { message: 'Item deleted successfully' };
        } catch (error) {
            console.error('Error deleting item:', error);
            throw error;
        }
    }

    async retryFailedOperations() {
        const failedItems = await offlineDB.syncQueue.where('status').equals('failed').and(item => item.retries < MAX_RETRIES).toArray();
        console.log("A22. Retrying", failedItems.length, "failed operations");

        if (failedItems.length > 0 && networkMonitor.isOnline && networkMonitor.isConnectionStable) {
            for (const item of failedItems) {
                item.status = 'pending';
                item.lastAttempt = null;
                await offlineDB.syncQueue.put(item);
                console.log("A23. Resetting item for retry:", item.id);
            }
            this.processQueue();
        }
    }

    async cleanUpQueue() {
        const now = Date.now();
        const count = await offlineDB.syncQueue.where('timestamp').below(now - (30 * 24 * 60 * 60 * 1000))
            .and(item => item.status === 'failed' && item.retries >= MAX_RETRIES)
            .delete();
        console.log("A24. Cleaned up", count, "old failed operations from the queue.");
    }
}

export const syncQueue = new SyncQueue();