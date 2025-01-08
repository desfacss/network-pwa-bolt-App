// import Dexie from 'dexie';

// class OfflineDB extends Dexie {
//     y_state;
//     syncQueue;
//     syncQueueState;

//     constructor() {
//         super('OfflineDB');

//         this.version(5).stores({
//             y_state: '++id, &email, name, phone, address, city, state, country, created_at, updated_at',
//             syncQueue: '++id, *timestamp, domain, operation, status, retries',
//             syncQueueState: 'id'
//         });

//         this.y_state = this.table('y_state');
//         this.syncQueue = this.table('syncQueue');
//         this.syncQueueState = this.table('syncQueueState');
//     }

//     async addItem(item) {
//         try {
//             return await this.y_state.add(item);
//         } catch (error) {
//             console.error('Error adding item to y_state:', error);
//             throw error;
//         }
//     }

//     async updateItem(item) {
//         try {
//             return await this.y_state.put(item);
//         } catch (error) {
//             console.error('Error updating item in y_state:', error);
//             throw error;
//         }
//     }

//     async deleteItem(id) {
//         try {
//             return await this.y_state.delete(id);
//         } catch (error) {
//             console.error('Error deleting item from y_state:', error);
//             throw error;
//         }
//     }

//     async addToSyncQueue(operation) {
//         try {
//             return await this.syncQueue.add({
//                 domain: 'y_state',
//                 operation,
//                 timestamp: Date.now(),
//                 status: 'pending',
//                 retries: 0
//             });
//         } catch (error) {
//             console.error('Error adding to syncQueue:', error);
//             throw error;
//         }
//     }

//     async updateSyncQueueState(state) {
//         try {
//             return await this.syncQueueState.put(state, 'isProcessing');
//         } catch (error) {
//             console.error('Error updating syncQueueState:', error);
//             throw error;
//         }
//     }

//     async getSyncQueueState() {
//         try {
//             return await this.syncQueueState.get('isProcessing');
//         } catch (error) {
//             console.error('Error getting syncQueueState:', error);
//             throw error;
//         }
//     }
// }

// export const dexieDB = new OfflineDB();


class OfflineDB extends Dexie {
    y_state;
    syncQueue;
    syncQueueState;

    constructor() {
        super('OfflineDB');

        this.version(5).stores({
            y_state: '++id, &email, name, phone, address, city, state, country, created_at, updated_at',
            syncQueue: '++id, *timestamp, domain, operation, status, retries',
            syncQueueState: 'id'
        });

        this.y_state = this.table('y_state');
        this.syncQueue = this.table('syncQueue');
        this.syncQueueState = this.table('syncQueueState');
    }

    async addItem(item) {
        try {
            // Ensure required fields are present
            if (!item.email || !item.name) {
                throw new Error("Item must have at least 'email' and 'name' fields.");
            }
            return await this.y_state.add(item);
        } catch (error) {
            console.error('Error adding item to y_state:', error);
            throw error;
        }
    }

    async updateItem(item) {
        try {
            if (!item.id) {
                throw new Error("Item must have an 'id' to update.");
            }
            return await this.y_state.put(item);
        } catch (error) {
            console.error('Error updating item in y_state:', error);
            throw error;
        }
    }

    async deleteItem(id) {
        try {
            return await this.y_state.delete(id);
        } catch (error) {
            console.error('Error deleting item from y_state:', error);
            throw error;
        }
    }

    async addToSyncQueue(operation) {
        try {
            return await this.syncQueue.add({
                domain: 'y_state',
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

export const dexieDB = new OfflineDB();

