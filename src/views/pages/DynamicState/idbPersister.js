import { openDB } from 'idb';

const DB_NAME = 'app-cache';
const STORE_NAME = 'queries';

export const createIDBPersister = async () => {
    const db = await openDB(DB_NAME, 1, {
        upgrade(db) {
            db.createObjectStore(STORE_NAME);
        },
    });

    return {
        persistQuery: async (key, value) => {
            try {
                await db.put(STORE_NAME, value, JSON.stringify(key));
            } catch (error) {
                console.error('Error persisting query:', error);
            }
        },
        restoreQuery: async (key) => {
            try {
                return await db.get(STORE_NAME, JSON.stringify(key));
            } catch (error) {
                console.error('Error restoring query:', error);
                return undefined;
            }
        },
        removeQuery: async (key) => {
            try {
                await db.delete(STORE_NAME, JSON.stringify(key));
            } catch (error) {
                console.error('Error removing query:', error);
            }
        },
        removeClient: async (client) => {
            try {
                const keys = await db.getAllKeys(STORE_NAME);
                const clientKeys = keys.filter(key =>
                    key.startsWith(`["${client}`)
                );
                await Promise.all(
                    clientKeys.map(key => db.delete(STORE_NAME, key))
                );
            } catch (error) {
                console.error('Error removing client:', error);
            }
        },
        persist: async (key, value) => {
            try {
                await db.put(STORE_NAME, value, JSON.stringify(key));
            } catch (error) {
                console.error('Error persisting:', error);
            }
        },
        restore: async () => {
            try {
                const allData = {};
                const keys = await db.getAllKeys(STORE_NAME);
                await Promise.all(
                    keys.map(async (key) => {
                        const value = await db.get(STORE_NAME, key);
                        if (value) {
                            allData[key] = value;
                        }
                    })
                );
                return allData;
            } catch (error) {
                console.error('Error restoring:', error);
                return {};
            }
        }
    };
};