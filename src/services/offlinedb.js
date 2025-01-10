import Dexie from 'dexie';

class OfflineDB extends Dexie {
    constructor(domain) {
        super(`OfflineDB_${domain}`);

        this.version(1).stores({
            [domain]: '++id, &email, name, phone, address, city, state, country, created_at, updated_at',
            syncQueue: '++id, *timestamp, domain, operation, status, retries',
            syncQueueState: 'id'
        });

        // Tables are accessed via the domain name
        this[domain] = this.table(domain);
        this.syncQueue = this.table('syncQueue');
        this.syncQueueState = this.table('syncQueueState');
    }

    async addItem(domain, item) {
        try {
            if (!item.email || !item.name) {
                throw new Error("Item must have at least 'email' and 'name' fields.");
            }
            return await this[domain].add(item);
        } catch (error) {
            console.error(`Error adding item to ${domain}:`, error);
            throw error;
        }
    }

    async updateItem(domain, item) {
        try {
            if (!item.id) {
                throw new Error("Item must have an 'id' to update.");
            }
            return await this[domain].put(item);
        } catch (error) {
            console.error(`Error updating item in ${domain}:`, error);
            throw error;
        }
    }

    async deleteItem(domain, id) {
        try {
            return await this[domain].delete(id);
        } catch (error) {
            console.error(`Error deleting item from ${domain}:`, error);
            throw error;
        }
    }

    async addToSyncQueue(operation, domain = 'y_state') {
        try {
            return await this.syncQueue.add({
                domain,
                operation,
                timestamp: Date.now(),
                status: 'pending',
                retries: 0
            });
        } catch (error) {
            console.error('Error adding to syncQueue:', error);
            throw error;
        }
    }

    async updateSyncQueueState(state) {
        try {
            return await this.syncQueueState.put(state, 'isProcessing');
        } catch (error) {
            console.error('Error updating syncQueueState:', error);
            throw error;
        }
    }

    async getSyncQueueState() {
        try {
            return await this.syncQueueState.get('isProcessing');
        } catch (error) {
            console.error('Error getting syncQueueState:', error);
            throw error;
        }
    }
}

// Export a function to create an instance of OfflineDB with the domain specified
export const createOfflineDB = (domain = 'y_state') => new OfflineDB(domain);

// Example usage:
// export const offlineDB = createOfflineDB('y_state');