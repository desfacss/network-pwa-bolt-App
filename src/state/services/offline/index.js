// File: src/db/index.js
import { openDB } from 'idb';

export const dbPromise = openDB('crud-app', 1, {
    upgrade(db) {
        if (!db.objectStoreNames.contains('syncQueue')) {
            db.createObjectStore('syncQueue', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('data')) {
            db.createObjectStore('data', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('deadLetterQueue')) {
            db.createObjectStore('deadLetterQueue', { keyPath: 'id' });
        }
    },
});

export const withDBErrorHandling = async (operation) => {
    try {
        const db = await dbPromise;
        return await operation(db);
    } catch (error) {
        console.error('IndexedDB operation failed:', error);
        throw error;
    }
};