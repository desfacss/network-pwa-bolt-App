// // services/cache/indexedDB.js
// /**
//  * Enhanced IndexedDB implementation with versioning and sync
//  */
// import { openDB } from 'idb';

// const DB_NAME = 'enhancedAppDB';
// const DB_VERSION = 1;
// let db;

// async function init() {
//     db = await openDB(DB_NAME, DB_VERSION, {
//         upgrade(db) {
//             if (!db.objectStoreNames.contains('records')) {
//                 const recordStore = db.createObjectStore('records');
//                 recordStore.createIndex('timestamp', 'timestamp');
//             }
//             if (!db.objectStoreNames.contains('viewConfigs')) {
//                 const configStore = db.createObjectStore('viewConfigs');
//                 configStore.createIndex('timestamp', 'timestamp');
//             }
//             if (!db.objectStoreNames.contains('syncQueue')) {
//                 const syncStore = db.createObjectStore('syncQueue');
//                 syncStore.createIndex('timestamp', 'timestamp');
//             }
//         },
//     });
// }

// async function set(storeName, key, value) {
//     await db.put(storeName, {
//         data: value,
//         timestamp: Date.now(),
//         version: 1,
//     }, key);
// }

// async function get(storeName, key) {
//     return db.get(storeName, key);
// }

// async function addToSyncQueue(action, data) {
//     await db.add('syncQueue', {
//         action,
//         data,
//         timestamp: Date.now(),
//     }, `${Date.now()}-${Math.random()}`);
// }

// export default { init, set, get, addToSyncQueue };


import { openDB } from 'idb';

class IndexedDBService {
    constructor() {
        this.db = null;
        this.DB_NAME = 'enhancedAppDB';
        this.DB_VERSION = 1;
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
