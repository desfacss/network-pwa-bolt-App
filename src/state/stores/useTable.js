// stores/useTable.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { openDB } from 'idb';

const DB_NAME = 'myDb';
const DB_VERSION = 1;

const createTableStore = (domain) => create(
    persist(
        (set, get) => ({
            domain,
            items: [],
            filters: { dateRange: null },
            pagination: { current: 1, pageSize: 5 },
            syncStatus: {
                pendingOperations: 0,
                lastSync: null,
                hasConflicts: false,
            },

            setItems: (items) => {
                try {
                    const validatedItems = items.map((item) => {
                        if (!item.id || !item.name || !item.updated_at) {
                            throw new Error(`Invalid item in ${domain}: ${JSON.stringify(item)}`);
                        }
                        return {
                            ...item,
                            version: item.version || 1,
                            lastModified: item.lastModified || new Date().toISOString(),
                        };
                    });
                    set({ items: validatedItems });
                } catch (error) {
                    console.error('Validation error:', error);
                    throw error;
                }
            },

            setFilters: (filters) => set({ filters }),
            setPagination: (pagination) => set({ pagination }),

            // addItem: (item) => {
            //     try {
            //         if (!item.id || !item.name || !item.updated_at) {
            //             throw new Error(`Invalid item in ${domain}: ${JSON.stringify(item)}`);
            //         }
            //         const newItem = {
            //             ...item,
            //             version: 1,
            //             lastModified: new Date().toISOString(),
            //             updated_at: new Date(item.updated_at).toISOString()
            //         };
            //         set((state) => ({ items: [...state.items, newItem] }));
            //         console.log(`${domain} store: Added new item`, newItem);
            //     } catch (error) {
            //         console.error('Validation error:', error);
            //         throw error;
            //     }
            // },

            addItem: async (item, isOnline = true, getStorage) => {
                try {
                    if (!item.id || !item.name || !item.updated_at) {
                        throw new Error(`Invalid item in ${domain}: ${JSON.stringify(item)}`);
                    }
                    const newItem = {
                        ...item,
                        version: 1,
                        lastModified: new Date().toISOString(),
                        updated_at: new Date(item.updated_at).toISOString()
                    };
                    // Update local state
                    set((state) => ({
                        items: [...state.items, newItem],
                        syncStatus: {
                            ...state.syncStatus,
                            pendingOperations: isOnline ? state.syncStatus.pendingOperations : state.syncStatus.pendingOperations + 1
                        }
                    }));
                    console.log(`${domain} store: Added new item`, newItem);
            
                    if (!isOnline) {
                        // Queue for sync when offline
                        console.log('Adding item offline:', item);
                        const syncQueue = await getStorage().getItem(`syncQueue-${domain}`) || [];
                        syncQueue.push({ type: 'add', item: newItem });
                        await getStorage().setItem(`syncQueue-${domain}`, syncQueue);
                    }
                } catch (error) {
                    console.error('Validation error:', error);
                    throw error;
                }
            },

            // updateItem: (item) => {
            //     try {
            //         if (!item.id) {
            //             throw new Error(`Item must have an id to be updated in ${domain}.`);
            //         }
            //         const updatedItem = {
            //             ...item,
            //             version: (item.version || 1) + 1,
            //             lastModified: new Date().toISOString(),
            //         };
            //         set((state) => ({
            //             items: state.items.map((i) =>
            //                 i.id === updatedItem.id ? updatedItem : i
            //             ),
            //         }));
            //     } catch (error) {
            //         console.error('Validation error:', error);
            //         throw error;
            //     }
            // },

            updateItem: async (item, isOnline = true, getStorage) => {
                try {
                    if (!item.id) {
                        throw new Error(`Item must have an id to be updated in ${domain}.`);
                    }
                    const updatedItem = {
                        ...item,
                        version: (item.version || 1) + 1,
                        lastModified: new Date().toISOString(),
                    };
                    set((state) => ({
                        items: state.items.map((i) =>
                            i.id === updatedItem.id ? updatedItem : i
                        ),
                        syncStatus: {
                            ...state.syncStatus,
                            pendingOperations: isOnline ? state.syncStatus.pendingOperations : state.syncStatus.pendingOperations + 1
                        }
                    }));
            
                    if (!isOnline) {
                        const syncQueue = await getStorage().getItem(`syncQueue-${domain}`) || [];
                        syncQueue.push({ type: 'update', item: updatedItem });
                        await getStorage().setItem(`syncQueue-${domain}`, syncQueue);
                    }
                } catch (error) {
                    console.error('Validation error:', error);
                    throw error;
                }
            },

            // deleteItem: (id) => {
            //     if (!id) {
            //         console.error(`Item ID is required for deletion in ${domain}.`);
            //         return;
            //     }
            //     set((state) => ({
            //         items: state.items.filter((item) => item.id !== id),
            //     }));
            // },

            deleteItem: async (id, isOnline = true, getStorage) => {
                if (!id) {
                    console.error(`Item ID is required for deletion in ${domain}.`);
                    return;
                }
                set((state) => ({
                    items: state.items.filter((item) => item.id !== id),
                    syncStatus: {
                        ...state.syncStatus,
                        pendingOperations: isOnline ? state.syncStatus.pendingOperations : state.syncStatus.pendingOperations + 1
                    }
                }));
            
                if (!isOnline) {
                    const syncQueue = await getStorage().getItem(`syncQueue-${domain}`) || [];
                    syncQueue.push({ type: 'delete', id });
                    await getStorage().setItem(`syncQueue-${domain}`, syncQueue);
                }
            },

            updateSyncStatus: (status) =>
                set((state) => ({
                    syncStatus: { ...state.syncStatus, ...status },
                })),
        }),
        {
            name: `table-state-${domain}`,
            getStorage: () => ({
                getItem: async (name) => {
                    try {
                        const db = await openDB(DB_NAME, DB_VERSION, {
                            upgrade(db) {
                                if (!db.objectStoreNames.contains('syncQueue')) {
                                    db.createObjectStore('syncQueue');
                                }
                            },
                        });
                        const data = await db.get('syncQueue', name);
                        return data ? JSON.parse(data) : null;
                    } catch (error) {
                        console.error('Storage read error:', error);
                        return null;
                    }
                },
                setItem: async (name, value) => {
                    try {
                        const db = await openDB(DB_NAME, DB_VERSION, {
                            upgrade(db) {
                                if (!db.objectStoreNames.contains('syncQueue')) {
                                    db.createObjectStore('syncQueue');
                                }
                            },
                        });
                        await db.put('syncQueue', JSON.stringify(value), name);
                    } catch (error) {
                        console.error('Storage write error:', error);
                        throw error;
                    }
                },
                removeItem: async (name) => {
                    try {
                        const db = await openDB(DB_NAME, DB_VERSION, {
                            upgrade(db) {
                                if (!db.objectStoreNames.contains('syncQueue')) {
                                    db.createObjectStore('syncQueue');
                                }
                            },
                        });
                        await db.delete('syncQueue', name);
                    } catch (error) {
                        console.error('Storage delete error:', error);
                        throw error;
                    }
                },
            }),
        }
    )
);

// Cache for storing domain-specific stores
const stores = {};

const useTableStore = (domain) => {
    console.log(`Accessing store for domain: ${domain}`);
    if (!stores[domain]) {
        console.log(`Creating new store for domain: ${domain}`);
        stores[domain] = createTableStore(domain);
    }
    console.log(`Returning store for domain: ${domain}`, stores[domain]);
    return stores[domain];
};

export default useTableStore; // Add this line at the end of the file to make it a default export



// without dynamic domain 
// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';
// import { openDB } from 'idb'; // OpenDB method for accessing IndexedDB

// const DB_NAME = 'myDb'; // Use your desired DB name
// const DB_VERSION = 1; // Version for IndexedDB schema

// const useTableStore = create(
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

//             // Set multiple items at once
//             setItems: (items) => {
//                 try {
//                     // Perform simple validation (ensure items are objects with required fields)
//                     const validatedItems = items.map((item) => {
//                         if (!item.id || !item.name || !item.date) {
//                             throw new Error(`6x. Invalid item: ${JSON.stringify(item)}`);



//                         }
//                         return {
//                             ...item,
//                             version: item.version || 1,
//                             lastModified: item.lastModified || new Date().toISOString(),
//                         };
//                     });
//                     set({ items: validatedItems });
//                 } catch (error) {
//                     console.error('Validation error:', error);
//                     throw error;
//                 }
//             },

//             // Set filters
//             setFilters: (filters) => set((state) => ({ ...state, filters })),

//             // Set pagination
//             setPagination: (pagination) => set((state) => ({ ...state, pagination })),

//             // Add a new item
//     //         addItem: (item) => {
//     //             try {
//     //                 if (!item.id || !item.name || !item.updated_at) {
//     //                     throw new Error(`6. Invalid item: ${JSON.stringify(item)}`);

//     //                         //                         Validation error: Error: Invalid item: {"date":"2025-01-06"}
//     // // at addItem (src_views_pages_Dyna…ot-update.js:653:15)
//     // // at Object.mutationFn (src_views_pages_Dyna…hot-update.js:253:9)
//     //                 }
//     //                 const newItem = {
//     //                     ...item,
//     //                     version: 1,
//     //                     lastModified: new Date().toISOString(),
//     //                 };
//     //                 set((state) => ({ items: [...state.items, newItem] }));
//     //                 console.log("ot", newItem)
//     //             } catch (error) {
//     //                 console.error('Validation error:', error);
//     //                 throw error;
//     //             }
//     //         },

//             addItem: (item) => {
//                 try {
//                     if (!item.id || !item.name || !item.updated_at) {
//                         throw new Error(`6. Invalid item: ${JSON.stringify(item)}`);
//                     }
//                     const newItem = {
//                         ...item,
//                         version: 1,
//                         lastModified: new Date().toISOString(),
//                         updated_at: new Date(item.updated_at).toISOString() // Ensure updated_at is in ISO format
//                     };
//                     set((state) => ({ items: [...state.items, newItem] }));
//                     console.log("A6. useTable add new item", newItem)
//                 } catch (error) {
//                     console.error('Validation error:', error);
//                     throw error;
//                 }
//             },

//             // Update an existing item
//             updateItem: (item) => {
//                 try {
//                     if (!item.id) {
//                         throw new Error('Item must have an id to be updated.');
//                     }
//                     const updatedItem = {
//                         ...item,
//                         version: item.version + 1,
//                         lastModified: new Date().toISOString(),
//                     };
//                     set((state) => ({
//                         items: state.items.map((i) =>
//                             i.id === updatedItem.id ? updatedItem : i
//                         ),
//                     }));
//                 } catch (error) {
//                     console.error('Validation error:', error);
//                     throw error;
//                 }
//             },

//             // Delete an item by id
//             deleteItem: (id) => {
//                 if (!id) {
//                     console.error('Item ID is required for deletion.');
//                     return;
//                 }
//                 set((state) => ({
//                     items: state.items.filter((item) => item.id !== id),
//                 }));
//             },

//             // Update sync status
//             updateSyncStatus: (status) =>
//                 set((state) => ({
//                     syncStatus: { ...state.syncStatus, ...status },
//                 })),
//         }),
//         {
//             name: 'table-state',
//             getStorage: () => ({
//                 getItem: async (name) => {
//                     try {
//                         const db = await openDB(DB_NAME, DB_VERSION, {
//                             upgrade(db) {
//                                 db.createObjectStore('syncQueue');
//                             },
//                         });
//                         const data = await db.get('syncQueue', name);
//                         return data ? JSON.parse(data) : null;
//                     } catch (error) {
//                         console.error('Storage read error:', error);
//                         return null;
//                     }
//                 },
//                 setItem: async (name, value) => {
//                     try {
//                         const db = await openDB(DB_NAME, DB_VERSION, {
//                             upgrade(db) {
//                                 db.createObjectStore('syncQueue');
//                             },
//                         });
//                         await db.put('syncQueue', JSON.stringify(value), name);
//                     } catch (error) {
//                         console.error('Storage write error:', error);
//                         throw error;
//                     }
//                 },
//                 removeItem: async (name) => {
//                     try {
//                         const db = await openDB(DB_NAME, DB_VERSION, {
//                             upgrade(db) {
//                                 db.createObjectStore('syncQueue');
//                             },
//                         });
//                         await db.delete('syncQueue', name);
//                     } catch (error) {
//                         console.error('Storage delete error:', error);
//                         throw error;
//                     }
//                 },
//             }),
//         }
//     )
// );

// export default useTableStore;