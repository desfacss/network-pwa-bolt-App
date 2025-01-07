// import { openDB } from 'idb';

// class IndexedDBService {
//     constructor() {
//         this.db = null;
//         this.DB_NAME = 'enhancedAppDB';
//         this.DB_VERSION = 2; // Increased from 1 to 2 to trigger upgrade
//     }

//     async init() {
//         this.db = await openDB(this.DB_NAME, this.DB_VERSION, {
//             upgrade(db) {
//                 if (!db.objectStoreNames.contains('records')) {
//                     const recordStore = db.createObjectStore('records', { keyPath: 'id' });
//                     recordStore.createIndex('timestamp', 'timestamp');
//                 }
//                 if (!db.objectStoreNames.contains('viewConfigs')) {
//                     const configStore = db.createObjectStore('viewConfigs', { keyPath: 'id' });
//                     configStore.createIndex('timestamp', 'timestamp');
//                 }
//                 if (!db.objectStoreNames.contains('syncQueue')) {
//                     const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
//                     syncStore.createIndex('timestamp', 'timestamp');
//                 }
//                 // Create data store with indexes
//                 if (!db.objectStoreNames.contains('data')) {
//                     const dataStore = db.createObjectStore('data', { keyPath: 'id' });
//                     dataStore.createIndex('lastModified', 'lastModified');
//                 }
//             },
//         });
//     }

//     async set(storeName, key, value) {
//         await this.db.put(storeName, {
//             id: key, // Adding a keyPath field for the object
//             data: value,
//             timestamp: Date.now(),
//             version: 1,
//         });
//     }

//     async get(storeName, key) {
//         return this.db.get(storeName, key);
//     }

//     async addToSyncQueue(action, data) {
//         await this.db.add('syncQueue', {
//             id: `${Date.now()}-${Math.random()}`, // Adding a unique keyPath value
//             action,
//             data,
//             timestamp: Date.now(),
//         });
//     }
// }

// export const indexedDB = new IndexedDBService();

import { openDB } from 'idb';

class IndexedDBService {
    constructor() {
        this.db = null;
        this.DB_NAME = 'enhancedAppDB';
        this.DB_VERSION = 2; // Increased from 1 to 2 to trigger upgrade
    }

    async init() {
        this.db = await openDB(this.DB_NAME, this.DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('records')) {
                    const recordStore = db.createObjectStore('records', { keyPath: 'id' });
                    recordStore.createIndex('timestamp', 'timestamp');
                }
                if (!db.objectStoreNames.contains('viewConfigs')) {
                    const configStore = db.createObjectStore('viewConfigs', { keyPath: 'id' });
                    configStore.createIndex('timestamp', 'timestamp');
                }
                if (!db.objectStoreNames.contains('syncQueue')) {
                    const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
                    syncStore.createIndex('timestamp', 'timestamp');
                }
                // Create data store with indexes
                if (!db.objectStoreNames.contains('data')) {
                    const dataStore = db.createObjectStore('data', { keyPath: 'id' });
                    dataStore.createIndex('lastModified', 'lastModified');
                }
            },
        });
    }

    async set(storeName, key, value) {
        await this.db.put(storeName, {
            id: key, // Adding a keyPath field for the object
            data: value,
            timestamp: Date.now(),
            version: 1,
        });
    }

    async get(storeName, key) {
        return this.db.get(storeName, key);
    }

    async getAll(storeName) {
        return this.db.getAll(storeName);
    }

    async addToSyncQueue(action, data) {
        await this.db.add('syncQueue', {
            id: `${Date.now()}-${Math.random()}`, // Adding a unique keyPath value
            action,
            data,
            timestamp: Date.now(),
        });
    }
}

export const indexedDB = new IndexedDBService();
