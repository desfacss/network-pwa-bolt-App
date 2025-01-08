import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { offlineDB } from 'state/services/offline/offlinedb';

// Define the domain name at the top for use throughout the file
const DOMAIN = 'y_state';

const createTableStore = () => create(
    persist(
        (set, get) => ({
            items: [],
            filters: { dateRange: null },
            pagination: { current: 1, pageSize: 5 },
            syncStatus: {
                pendingOperations: 0,
                lastSync: null,
                hasConflicts: false,
            },

            setItems: (items) => {
                const validatedItems = items.filter(item =>
                    item.id && item.name && item.email && item.updated_at
                ).map(item => ({
                    ...item,
                    version: item.version || 1,
                    lastModified: item.lastModified || new Date().toISOString(),
                }));

                if (validatedItems.length !== items.length) {
                    console.warn('Some items were filtered out due to missing required fields.');
                }

                set({ items: validatedItems });
            },

            setFilters: (filters) => set({ filters }),
            setPagination: (pagination) => set({ pagination }),

            addItem: async (item) => {
                if (!item.name || !item.email || !item.updated_at) {
                    console.error(`Invalid item in ${DOMAIN}:`, item);
                    return;
                }

                const newItem = {
                    ...item,
                    id: item.id || `${DOMAIN}-${Date.now()}`, // Generate temp id if missing
                    version: 1,
                    lastModified: new Date().toISOString(),
                    updated_at: new Date(item.updated_at).toISOString(),
                };

                set((state) => ({
                    items: [...state.items, newItem],
                    syncStatus: {
                        ...state.syncStatus,
                        pendingOperations: state.syncStatus.pendingOperations + 1,
                    },
                }));

                try {
                    await offlineDB.addItem(newItem);
                    await offlineDB.addToSyncQueue({ type: 'create', item: newItem });
                } catch (error) {
                    console.error(`Error adding item to ${DOMAIN}:`, error);
                }
            },

            updateItem: async (item) => {
                if (!item.id) {
                    console.error(`Item must have an id to be updated in ${DOMAIN}.`);
                    return;
                }

                const updatedItem = {
                    ...item,
                    version: (item.version || 1) + 1,
                    lastModified: new Date().toISOString(),
                };

                set((state) => ({
                    items: state.items.map(i => (i.id === updatedItem.id ? updatedItem : i)),
                    syncStatus: {
                        ...state.syncStatus,
                        pendingOperations: state.syncStatus.pendingOperations + 1,
                    },
                }));

                try {
                    await offlineDB.updateItem(updatedItem);
                    await offlineDB.addToSyncQueue({ type: 'update', item: updatedItem });
                } catch (error) {
                    console.error(`Error updating item in ${DOMAIN}:`, error);
                }
            },

            deleteItem: async (id) => {
                if (!id) {
                    console.error(`Item ID is required for deletion in ${DOMAIN}.`);
                    return;
                }

                set((state) => ({
                    items: state.items.filter(item => item.id !== id),
                    syncStatus: {
                        ...state.syncStatus,
                        pendingOperations: state.syncStatus.pendingOperations + 1,
                    },
                }));

                try {
                    await offlineDB.deleteItem(id);
                    await offlineDB.addToSyncQueue({ type: 'delete', id });
                } catch (error) {
                    console.error(`Error deleting item from ${DOMAIN}:`, error);
                }
            },

            updateSyncStatus: (status) => 
                set((state) => ({
                    syncStatus: { ...state.syncStatus, ...status },
                })),
        }),
        {
            name: `table-state-${DOMAIN}`,
            getStorage: () => ({
                getItem: async (name) => {
                    try {
                        const value = await offlineDB.table('syncQueue').get(name);
                        return value ? JSON.parse(value) : null;
                    } catch (error) {
                        console.error('Storage read error:', error);
                        return null;
                    }
                },
                setItem: async (name, value) => {
                    try {
                        await offlineDB.table('syncQueue').put(JSON.stringify(value), name);
                    } catch (error) {
                        console.error('Storage write error:', error);
                        throw error;
                    }
                },
                removeItem: async (name) => {
                    try {
                        await offlineDB.table('syncQueue').delete(name);
                    } catch (error) {
                        console.error('Storage delete error:', error);
                        throw error;
                    }
                },
            }),
        }
    )
);

// const createTableStore = () => create(
//     persist(
//         (set, get) => ({
//             items: [],
//             filters: { dateRange: null },
//             pagination: { current: 1, pageSize: 5 },
//             syncStatus: {
//                 pendingOperations: 0,
//                 lastSync: null,
//                 hasConflicts: false,
//             },

//             setItems: (items) => {
//                 const validatedItems = items.filter((item) => 
//                     item.id && item.name && item.email && item.updated_at
//                 ).map((item) => ({
//                     ...item,
//                     version: item.version || 1,
//                     lastModified: item.lastModified || new Date().toISOString(),
//                 }));

//                 if (validatedItems.length !== items.length) {
//                     console.warn('Some items were filtered out due to missing required fields.');
//                 }

//                 set({ items: validatedItems });
//             },

//             setFilters: (filters) => set({ filters }),
//             setPagination: (pagination) => set({ pagination }),

//             addItem: async (item) => {
//                 if (!item.id || !item.name || !item.email || !item.updated_at) {
//                     console.error(`Invalid item in ${DOMAIN}:`, item);
//                     return;
//                 }

//                 const newItem = {
//                     ...item,
//                     version: 1,
//                     lastModified: new Date().toISOString(),
//                     updated_at: new Date(item.updated_at).toISOString(),
//                 };

//                 set((state) => ({
//                     items: [...state.items, newItem],
//                     syncStatus: {
//                         ...state.syncStatus,
//                         pendingOperations: state.syncStatus.pendingOperations + 1,
//                     },
//                 }));

//                 try {
//                     await offlineDB.addItem(newItem);
//                     await offlineDB.addToSyncQueue({ type: 'create', item: newItem });
//                 } catch (error) {
//                     console.error(`Error adding item to ${DOMAIN}:`, error);
//                 }
//             },

//             updateItem: async (item) => {
//                 if (!item.id) {
//                     console.error(`Item must have an id to be updated in ${DOMAIN}.`);
//                     return;
//                 }

//                 const updatedItem = {
//                     ...item,
//                     version: (item.version || 1) + 1,
//                     lastModified: new Date().toISOString(),
//                 };

//                 set((state) => ({
//                     items: state.items.map((i) => (i.id === updatedItem.id ? updatedItem : i)),
//                     syncStatus: {
//                         ...state.syncStatus,
//                         pendingOperations: state.syncStatus.pendingOperations + 1,
//                     },
//                 }));

//                 try {
//                     await offlineDB.updateItem(updatedItem);
//                     await offlineDB.addToSyncQueue({ type: 'update', item: updatedItem });
//                 } catch (error) {
//                     console.error(`Error updating item in ${DOMAIN}:`, error);
//                 }
//             },

//             deleteItem: async (id) => {
//                 if (!id) {
//                     console.error(`Item ID is required for deletion in ${DOMAIN}.`);
//                     return;
//                 }

//                 set((state) => ({
//                     items: state.items.filter((item) => item.id !== id),
//                     syncStatus: {
//                         ...state.syncStatus,
//                         pendingOperations: state.syncStatus.pendingOperations + 1,
//                     },
//                 }));

//                 try {
//                     await offlineDB.deleteItem(id);
//                     await offlineDB.addToSyncQueue({ type: 'delete', id });
//                 } catch (error) {
//                     console.error(`Error deleting item from ${DOMAIN}:`, error);
//                 }
//             },

//             updateSyncStatus: (status) => 
//                 set((state) => ({
//                     syncStatus: { ...state.syncStatus, ...status },
//                 })),
//         }),
//         {
//             name: `table-state-${DOMAIN}`,
//             getStorage: () => ({
//                 getItem: async (name) => {
//                     try {
//                         const value = await offlineDB.table('syncQueue').get(name);
//                         return JSON.parse(value) || null;
//                     } catch (error) {
//                         console.error('Storage read error:', error);
//                         return null;
//                     }
//                 },
//                 setItem: async (name, value) => {
//                     try {
//                         await offlineDB.table('syncQueue').put(JSON.stringify(value), name);
//                     } catch (error) {
//                         console.error('Storage write error:', error);
//                         throw error;
//                     }
//                 },
//                 removeItem: async (name) => {
//                     try {
//                         await offlineDB.table('syncQueue').delete(name);
//                     } catch (error) {
//                         console.error('Storage delete error:', error);
//                         throw error;
//                     }
//                 },
//             }),
//         }
//     )
// );

const useTableStore = () => createTableStore();

export default useTableStore;

// Notes for Making This Domain-Agnostic:
// Function Parameters: Instead of hardcoding y_state, all methods include domain as an argument. This allows for dynamic domain handling.
// Storage Management: The getStorage function is set up to interact with IndexedDB for any domain, though currently, it's tailored for y_state. For a multi-domain setup, you'd use dexieDB[domain] where applicable.
// Sync Queue: addToSyncQueue is used with the domain, so when you're ready for multiple domains, you'll just pass the domain parameter to this function.
// Dynamic Stores: The stores cache uses the domain name to create and retrieve store instances, allowing for multiple domain stores.

// To make this fully dynamic for multiple domains, you would:
// Dynamically create or check for the existence of tables in dexieDB based on the domain passed.
// Adjust the CRUD methods to use dexieDB[domain] instead of hardcoded table names.
// Ensure your syncQueue logic in sync.js also accounts for domain-specific queues or operations.