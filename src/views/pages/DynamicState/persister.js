// persister.js
export const createIDBPersister = (idb, allowedKeys) => ({
    persistQuery: async (key, value) => {
        if (!allowedKeys.includes(key[0])) return;
        await idb.put('queryCache', {
            queryKey: key,
            value,
            timestamp: Date.now(),
        });
    },
    restoreQuery: async (key) => {
        if (!allowedKeys.includes(key[0])) return;
        const data = await idb.get('queryCache', key);
        if (data && Date.now() - data.timestamp < 1000 * 60 * 60 * 24) { // 24 hours
            return data.value;
        }
        return undefined;
    },
    removeQuery: async (key) => {
        if (!allowedKeys.includes(key[0])) return;
        await idb.delete('queryCache', key);
    },
});