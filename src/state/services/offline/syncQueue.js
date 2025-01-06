import useTableStore from 'state/stores/useTable';
import { dbPromise } from './index';
import { networkMonitor } from './networkMonitor';

const RETRY_DELAYS = [1000, 5000, 15000, 30000, 60000]; // Exponential backoff delays
const MAX_RETRIES = RETRY_DELAYS.length;

class SyncQueueManager {
    constructor() {
        this.queue = [];
        this.isProcessing = false;
        this.listeners = new Set();
        this.initialize();
    }

    async initialize() {
        try {
            const db = await dbPromise;
            const pending = await db.getAll('syncQueue');
            this.queue = pending || [];

            // Load processing state from storage
            const storedState = await db.get('syncQueueState');
            this.isProcessing = storedState?.isProcessing || false;

            // Setup listeners for network connection
            networkMonitor.onOnline(() => {
                if (networkMonitor.isConnectionStable()) {
                    this.processQueue();
                }
            });

            // Monitor connection quality changes
            networkMonitor.onConnectionQualityChange(() => {
                if (!this.isProcessing && this.queue.length > 0 && networkMonitor.isConnectionStable()) {
                    this.processQueue();
                }
            });

            // Retry failed operations periodically
            setInterval(() => this.retryFailedOperations(), 5 * 60 * 1000); // Every 5 minutes

            this.notifyListeners();
        } catch (error) {
            console.error('Sync queue initialization error:', error);
        }
    }

    async addToQueue(operation) {
        try {
            const queueItem = {
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                operation,
                timestamp: Date.now(),
                retries: 0,
                status: 'pending',
                lastAttempt: null,
            };

            const db = await dbPromise;
            await db.put('syncQueue', queueItem);
            this.queue.push(queueItem);
            this.notifyListeners();

            // Optimistic UI update
            this.performOptimisticUpdate(operation);

            if (networkMonitor.isConnectionStable()) {
                this.processQueue();
            }
        } catch (error) {
            console.error('Error adding to sync queue:', error);
            throw error;
        }
    }

    async processQueue() {
        if (this.isProcessing || this.queue.length === 0) return;

        this.isProcessing = true;
        const db = await dbPromise;
        await db.put('syncQueueState', { isProcessing: true });

        for (const item of this.queue) {
            if (item.status === 'failed' && item.retries >= MAX_RETRIES) continue;

            try {
                await this.processOperation(item);
                await db.delete('syncQueue', item.id);
                this.queue = this.queue.filter(q => q.id !== item.id);
                this.notifyListeners();
            } catch (error) {
                console.error('Sync error:', error);

                const updatedItem = {
                    ...item,
                    retries: item.retries + 1,
                    status: item.retries + 1 >= MAX_RETRIES ? 'failed' : 'pending',
                    lastAttempt: Date.now(),
                    error: error.message,
                };

                await db.put('syncQueue', updatedItem);
                const itemIndex = this.queue.findIndex(q => q.id === item.id);
                if (itemIndex !== -1) {
                    this.queue[itemIndex] = updatedItem;
                }

                // Apply exponential backoff for retries
                await new Promise(resolve =>
                    setTimeout(resolve, Math.min(1000 * Math.pow(2, item.retries), 30000))
                );
            }
        }

        this.isProcessing = false;
        await db.put('syncQueueState', { isProcessing: false });
        this.notifyListeners();
    }

    async processOperation(item) {
        const { operation } = item;

        switch (operation.type) {
            case 'create':
                await this.handleCreate(operation.item);
                break;
            case 'update':
                await this.handleUpdate(operation.item);
                break;
            case 'delete':
                await this.handleDelete(operation.id);
                break;
            default:
                throw new Error(`Unknown operation type: ${operation.type}`);
        }
    }

    async handleCreate(item) {
        // Implementation for creating the item (API call or local logic)
        console.log('Processing create:', item);
        // Conflict resolution could be implemented here for create operations
    }

    async handleUpdate(item) {
        // Implementation for updating the item (API call or local logic)
        console.log('Processing update:', item);
        // Simple conflict resolution: last write wins or merge
        const serverItem = await this.getServerVersion(item.id);
        if (serverItem && item.version !== serverItem.version) {
            // Here you could implement a merge strategy or choose which version to keep
            console.log('Conflict detected, choosing last write wins:', item);
        }
    }

    async handleDelete(id) {
        // Implementation for deleting the item (API call or local logic)
        console.log('Processing delete:', id);
        // Check if item exists on server before deletion to avoid conflicts
    }

    async getServerVersion(id) {
        // Fetch the current version from the server for conflict checking
        // Placeholder for server API call
        return { id, version: 'server-version' };
    }

    async retryFailedOperations() {
        const failedItems = this.queue.filter(
            item => item.status === 'failed' && item.retries < MAX_RETRIES
        );

        if (failedItems.length > 0 && networkMonitor.isConnectionStable()) {
            for (const item of failedItems) {
                item.status = 'pending';
                item.lastAttempt = null;
                const db = await dbPromise;
                await db.put('syncQueue', item);
            }
            this.processQueue();
        }
    }

    onQueueUpdate(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    notifyListeners() {
        const status = {
            pending: this.queue.filter(item => item.status === 'pending').length,
            failed: this.queue.filter(item => item.status === 'failed').length,
            total: this.queue.length,
            isProcessing: this.isProcessing,
        };

        this.listeners.forEach(listener => listener(status));
    }

    performOptimisticUpdate(operation) {
        // This would be where you update your UI or local state optimistically
        // for example, updating the Zustand store:
        switch (operation.type) {
            case 'create':
                useTableStore.getState().addItem(operation.item);
                break;
            case 'update':
                useTableStore.getState().updateItem(operation.item);
                break;
            case 'delete':
                useTableStore.getState().deleteItem(operation.id);
                break;
        }
    }
}

export const syncQueue = new SyncQueueManager();