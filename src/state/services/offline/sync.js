// // state/services/offline/sync.js
// import { db } from './dexie';
// import { networkMonitor } from './networkMonitor';

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
//             this.queue = await db.syncQueue.toArray();
//             this.isProcessing = await db.table('syncQueueState').get('isProcessing') || false;

//             networkMonitor.addEventListener('onOnline', this.processQueue.bind(this));
//             networkMonitor.addEventListener('onConnectionQualityChange', () => {
//                 if (!this.isProcessing && this.queue.length > 0 && networkMonitor.isConnectionStable) {
//                     this.processQueue();
//                 }
//             });

//             // Setup intervals for retry and cleanup
//             setInterval(this.retryFailedOperations.bind(this), 5 * 60 * 1000); // Every 5 minutes
//             setInterval(this.cleanUpQueue.bind(this), 24 * 60 * 60 * 1000); // Daily cleanup
//         } catch (error) {
//             console.error('Sync queue initialization error:', error);
//         }
//     }

//     onQueueUpdate(callback) {
//         // Assuming you want to notify on every change to queue array or status
//         const updateHandler = () => {
//             callback();
//         };

//         // Add this handler to any event or change you want to track
//         this.queueChangeListeners = this.queueChangeListeners || [];
//         this.queueChangeListeners.push(updateHandler);

//         // Return an unsubscribe function
//         return () => {
//             const index = this.queueChangeListeners.indexOf(updateHandler);
//             if (index > -1) {
//                 this.queueChangeListeners.splice(index, 1);
//             }
//         };
//     }

//     async addToQueue(operation, domain = 'y_state') {
//         try {
//             const queueItem = {
//                 id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
//                 domain,
//                 operation,
//                 timestamp: Date.now(),
//                 retries: 0,
//                 status: 'pending',
//                 lastAttempt: null,
//             };

//             await db.syncQueue.add(queueItem);
//             this.queue.push(queueItem);

//             if (networkMonitor.isOnline && networkMonitor.isConnectionStable) {
//                 this.processQueue();
//             }

//             // Notify listeners after adding an item
//             this.notifyListeners();

//             return queueItem;
//         } catch (error) {
//             console.error('Error adding to sync queue:', error);
//             throw error;
//         }
//     }

//     async processQueue() {
//         if (this.isProcessing || this.queue.length === 0) return;

//         this.isProcessing = true;
//         await db.table('syncQueueState').put({ isProcessing: true }, 'isProcessing');

//         for (let i = 0; i < this.queue.length; i++) {
//             const item = this.queue[i];
//             if (item.status === 'failed' && item.retries >= MAX_RETRIES) continue;

//             try {
//                 await this.processOperation(item);
//                 await db.syncQueue.delete(item.id);
//                 this.queue.splice(i, 1);
//                 i--; // Adjust index after removal
//             } catch (error) {
//                 console.error('Sync error:', error);

//                 const updatedItem = {
//                     ...item,
//                     retries: item.retries + 1,
//                     status: item.retries + 1 >= MAX_RETRIES ? 'failed' : 'pending',
//                     lastAttempt: Date.now(),
//                     error: error.message,
//                 };

//                 await db.syncQueue.put(updatedItem);
//                 this.queue[i] = updatedItem;

//                 await new Promise(resolve => setTimeout(resolve, RETRY_DELAYS[Math.min(item.retries, MAX_RETRIES - 1)]));
//             }
//         }

//         // Notify listeners after processing items
//         this.notifyListeners();

//         this.isProcessing = false;
//         await db.table('syncQueueState').put({ isProcessing: false }, 'isProcessing');
//     }

//     notifyListeners() {
//         if (this.queueChangeListeners && this.queueChangeListeners.length) {
//             this.queueChangeListeners.forEach(listener => listener());
//         }
//     }


//     async processOperation(item) {
//         const { operation, domain } = item;
//         switch (operation.type) {
//             case 'create':
//                 await this.handleCreate(operation.item, domain);
//                 break;
//             case 'update':
//                 await this.handleUpdate(operation.item, domain);
//                 break;
//             case 'delete':
//                 await this.handleDelete(operation.id, domain);
//                 break;
//             default:
//                 throw new Error(`Unknown operation type: ${operation.type}`);
//         }
//     }

//     async handleCreate(item, domain) {
//         // Implement logic to create item in backend here
//         console.log('Creating item:', item, 'for domain:', domain);
//     }

//     async handleUpdate(item, domain) {
//         // Implement logic to update item in backend here
//         console.log('Updating item:', item, 'for domain:', domain);
//     }

//     async handleDelete(id, domain) {
//         // Implement logic to delete item from backend here
//         console.log('Deleting item with id:', id, 'for domain:', domain);
//     }

//     async retryFailedOperations() {
//         const failedItems = await db.syncQueue.where('status').equals('failed').and(item => item.retries < MAX_RETRIES).toArray();

//         if (failedItems.length > 0 && networkMonitor.isOnline && networkMonitor.isConnectionStable) {
//             for (const item of failedItems) {
//                 item.status = 'pending';
//                 item.lastAttempt = null;
//                 await db.syncQueue.put(item);
//             }
//             this.processQueue();
//         }
//     }

//     async cleanUpQueue() {
//         const now = Date.now();
//         await db.syncQueue.where('timestamp').below(now - (30 * 24 * 60 * 60 * 1000))
//             .and(item => item.status === 'failed' && item.retries >= MAX_RETRIES)
//             .delete();
//     }
// }

// export const syncQueue = new SyncQueue();


// state/services/offline/sync.js
import { dexieDB } from './dexie';
import { networkMonitor } from './networkMonitor';

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
            this.queue = await dexieDB.syncQueue.toArray();
            this.isProcessing = await dexieDB.table('syncQueueState').get('isProcessing') || false;

            networkMonitor.addEventListener('onOnline', this.processQueue.bind(this));
            networkMonitor.addEventListener('onConnectionQualityChange', () => {
                if (!this.isProcessing && this.queue.length > 0 && networkMonitor.isConnectionStable) {
                    this.processQueue();
                }
            });

            // Setup intervals for retry and cleanup
            setInterval(this.retryFailedOperations.bind(this), 5 * 60 * 1000); // Every 5 minutes
            setInterval(this.cleanUpQueue.bind(this), 24 * 60 * 60 * 1000); // Daily cleanup
        } catch (error) {
            console.error('Sync queue initialization error:', error);
        }
    }

    onQueueUpdate(callback) {
        // Assuming you want to notify on every change to queue array or status
        const updateHandler = () => {
            callback();
        };

        // Add this handler to any event or change you want to track
        this.queueChangeListeners = this.queueChangeListeners || [];
        this.queueChangeListeners.push(updateHandler);

        // Return an unsubscribe function
        return () => {
            const index = this.queueChangeListeners.indexOf(updateHandler);
            if (index > -1) {
                this.queueChangeListeners.splice(index, 1);
            }
        };
    }

    async addToQueue(operation, domain = 'y_state') {
        try {
            const queueItem = {
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                domain,
                operation,
                timestamp: Date.now(),
                retries: 0,
                status: 'pending',
                lastAttempt: null,
            };

            await dexieDB.syncQueue.add(queueItem);
            this.queue.push(queueItem);

            if (networkMonitor.isOnline && networkMonitor.isConnectionStable) {
                this.processQueue();
            }

            // Notify listeners after adding an item
            this.notifyListeners();

            return queueItem;
        } catch (error) {
            console.error('Error adding to sync queue:', error);
            throw error;
        }
    }

    async processQueue() {
        if (this.isProcessing || this.queue.length === 0) return;

        this.isProcessing = true;
        await dexieDB.table('syncQueueState').put({ isProcessing: true }, 'isProcessing');

        for (let i = 0; i < this.queue.length; i++) {
            const item = this.queue[i];
            if (item.status === 'failed' && item.retries >= MAX_RETRIES) continue;

            try {
                await this.processOperation(item);
                await dexieDB.syncQueue.delete(item.id);
                this.queue.splice(i, 1);
                i--; // Adjust index after removal
            } catch (error) {
                console.error('Sync error:', error);

                const updatedItem = {
                    ...item,
                    retries: item.retries + 1,
                    status: item.retries + 1 >= MAX_RETRIES ? 'failed' : 'pending',
                    lastAttempt: Date.now(),
                    error: error.message,
                };

                await dexieDB.syncQueue.put(updatedItem);
                this.queue[i] = updatedItem;

                await new Promise(resolve => setTimeout(resolve, RETRY_DELAYS[Math.min(item.retries, MAX_RETRIES - 1)]));
            }
        }

        // Notify listeners after processing items
        this.notifyListeners();

        this.isProcessing = false;
        await dexieDB.table('syncQueueState').put({ isProcessing: false }, 'isProcessing');
    }

    notifyListeners() {
        if (this.queueChangeListeners && this.queueChangeListeners.length) {
            this.queueChangeListeners.forEach(listener => listener());
        }
    }

    async processOperation(item) {
        const { operation, domain } = item;
        switch (operation.type) {
            case 'create':
                await this.handleCreate(operation.item, domain);
                break;
            case 'update':
                await this.handleUpdate(operation.item, domain);
                break;
            case 'delete':
                await this.handleDelete(operation.id, domain);
                break;
            default:
                throw new Error(`Unknown operation type: ${operation.type}`);
        }
    }

    // async handleCreate(item, domain) {
    //     // Implement logic to create item in backend here
    //     console.log('Creating item:', item, 'for domain:', domain);
    // }

    // async handleUpdate(item, domain) {
    //     // Implement logic to update item in backend here
    //     console.log('Updating item:', item, 'for domain:', domain);
    // }

    // async handleDelete(id, domain) {
    //     // Implement logic to delete item from backend here
    //     console.log('Deleting item with id:', id, 'for domain:', domain);
    // }

    async handleCreate(item, domain) {
        try {
            const response = await fetch(`/api/${domain}`, {
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
            // Optionally update local state or return the new item for further handling
            return newItem;
        } catch (error) {
            console.error('Error creating item:', error);
            throw error;
        }
    }
    
    async handleUpdate(item, domain) {
        try {
            const response = await fetch(`/api/${domain}/${item.id}`, {
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
            // Optionally update local state or return the updated item
            return updatedItem;
        } catch (error) {
            console.error('Error updating item:', error);
            throw error;
        }
    }
    
    async handleDelete(id, domain) {
        try {
            const response = await fetch(`/api/${domain}/${id}`, {
                method: 'DELETE',
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            // Typically, DELETE operations don't return content, but you might return metadata
            return { message: 'Item deleted successfully' };
        } catch (error) {
            console.error('Error deleting item:', error);
            throw error;
        }
    }

    async retryFailedOperations() {
        const failedItems = await dexieDB.syncQueue.where('status').equals('failed').and(item => item.retries < MAX_RETRIES).toArray();

        if (failedItems.length > 0 && networkMonitor.isOnline && networkMonitor.isConnectionStable) {
            for (const item of failedItems) {
                item.status = 'pending';
                item.lastAttempt = null;
                await dexieDB.syncQueue.put(item);
            }
            this.processQueue();
        }
    }

    async cleanUpQueue() {
        const now = Date.now();
        await dexieDB.syncQueue.where('timestamp').below(now - (30 * 24 * 60 * 60 * 1000))
            .and(item => item.status === 'failed' && item.retries >= MAX_RETRIES)
            .delete();
    }
}

export const syncQueue = new SyncQueue();