// import { db } from 'state/services/offline/dexie';
// import { create } from 'zustand';

// const useGenericStore = (tableName) => {
//     return create((set, get) => ({
//         [tableName]: [],
//         syncStatus: {
//             pendingOperations: 0,
//             lastSync: null,
//         },
//         setItems: (items) => set({ [tableName]: items }),
//         addItem: async (item) => {
//             // Add to local state
//             set(state => ({
//                 [tableName]: [...state[tableName], item],
//                 syncStatus: {
//                     ...state.syncStatus,
//                     pendingOperations: state.syncStatus.pendingOperations + 1
//                 }
//             }));

//             // Add to local database
//             const table = await db.ensureStore(tableName);
//             await table.add(item);
            
//             // Queue sync operation
//             await db.syncQueue.add({
//                 table: tableName,
//                 data: item,
//                 operation: 'insert'
//             });
//         },
//         updateItem: async (item) => {
//             // Update in local state
//             set(state => ({
//                 [tableName]: state[tableName].map(i => i.id === item.id ? item : i),
//                 syncStatus: {
//                     ...state.syncStatus,
//                     pendingOperations: state.syncStatus.pendingOperations + 1
//                 }
//             }));

//             // Update in local database
//             const table = await db.ensureStore(tableName);
//             await table.put(item);
            
//             // Queue sync operation
//             await db.syncQueue.add({
//                 table: tableName,
//                 data: item,
//                 operation: 'update'
//             });
//         },
//         deleteItem: async (id) => {
//             // Remove from local state
//             set(state => ({
//                 [tableName]: state[tableName].filter(i => i.id !== id),
//                 syncStatus: {
//                     ...state.syncStatus,
//                     pendingOperations: state.syncStatus.pendingOperations + 1
//                 }
//             }));

//             // Remove from local database
//             const table = await db.ensureStore(tableName);
//             await table.delete(id);
            
//             // Queue sync operation
//             await db.syncQueue.add({
//                 table: tableName,
//                 data: { id },
//                 operation: 'delete'
//             });
//         },
//         syncStatusUpdate: (status) => set({ syncStatus: { ...get().syncStatus, ...status } }),
//     }));
// };

// export default useGenericStore;


import { db } from 'state/services/offline/dexie';
import { create } from 'zustand';

const useGenericStore = (tableName) => {
    return create((set, get) => ({
        [tableName]: [],
        syncStatus: {
            pendingOperations: 0,
            lastSync: null,
        },
        setItems: (items) => set({ [tableName]: items }),
        addItem: async (item) => {
            // Add to local state
            set(state => ({
                [tableName]: [...state[tableName], item],
                syncStatus: {
                    ...state.syncStatus,
                    pendingOperations: state.syncStatus.pendingOperations + 1
                }
            }));

            // Add to local database
            try {
                const table = await db.ensureStore(tableName);
                await table.add(item);
                
                // Queue sync operation
                await db.syncQueue.add({
                    table: tableName,
                    data: item,
                    operation: 'insert'
                });
            } catch (error) {
                console.error('Error adding item to local DB:', error);
                // Optionally, you might want to revert the local state change here
            }
        },
        updateItem: async (item) => {
            // Update in local state
            set(state => ({
                [tableName]: state[tableName].map(i => i.id === item.id ? item : i),
                syncStatus: {
                    ...state.syncStatus,
                    pendingOperations: state.syncStatus.pendingOperations + 1
                }
            }));

            // Update in local database
            try {
                const table = await db.ensureStore(tableName);
                await table.put(item);
                
                // Queue sync operation
                await db.syncQueue.add({
                    table: tableName,
                    data: item,
                    operation: 'update'
                });
            } catch (error) {
                console.error('Error updating item in local DB:', error);
                // Optionally, revert local state change if needed
            }
        },
        deleteItem: async (id) => {
            // Remove from local state
            set(state => ({
                [tableName]: state[tableName].filter(i => i.id !== id),
                syncStatus: {
                    ...state.syncStatus,
                    pendingOperations: state.syncStatus.pendingOperations + 1
                }
            }));

            // Remove from local database
            try {
                const table = await db.ensureStore(tableName);
                await table.delete(id);
                
                // Queue sync operation
                await db.syncQueue.add({
                    table: tableName,
                    data: { id },
                    operation: 'delete'
                });
            } catch (error) {
                console.error('Error deleting item from local DB:', error);
                // Optionally, revert local state change if needed
            }
        },
        syncStatusUpdate: (status) => set({ syncStatus: { ...get().syncStatus, ...status } }),
    }));
};

export default useGenericStore;