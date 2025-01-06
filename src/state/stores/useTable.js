import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { openDB } from 'idb'; // OpenDB method for accessing IndexedDB

const DB_NAME = 'myDb'; // Use your desired DB name
const DB_VERSION = 1; // Version for IndexedDB schema

const useTableStore = create(
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

            // Set multiple items at once
            setItems: (items) => {
                try {
                    // Perform simple validation (ensure items are objects with required fields)
                    const validatedItems = items.map((item) => {
                        if (!item.id || !item.name || !item.date) {
                            throw new Error(`Invalid item: ${JSON.stringify(item)}`);
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

            // Set filters
            setFilters: (filters) => set((state) => ({ ...state, filters })),

            // Set pagination
            setPagination: (pagination) => set((state) => ({ ...state, pagination })),

            // Add a new item
            addItem: (item) => {
                try {
                    if (!item.id || !item.name || !item.updated_at) {
                        throw new Error(`Invalid item: ${JSON.stringify(item)}`);
                    }
                    const newItem = {
                        ...item,
                        version: 1,
                        lastModified: new Date().toISOString(),
                    };
                    set((state) => ({ items: [...state.items, newItem] }));
                    console.log("ot", newItem)
                } catch (error) {
                    console.error('Validation error:', error);
                    throw error;
                }
            },

            // Update an existing item
            updateItem: (item) => {
                try {
                    if (!item.id) {
                        throw new Error('Item must have an id to be updated.');
                    }
                    const updatedItem = {
                        ...item,
                        version: item.version + 1,
                        lastModified: new Date().toISOString(),
                    };
                    set((state) => ({
                        items: state.items.map((i) =>
                            i.id === updatedItem.id ? updatedItem : i
                        ),
                    }));
                } catch (error) {
                    console.error('Validation error:', error);
                    throw error;
                }
            },

            // Delete an item by id
            deleteItem: (id) => {
                if (!id) {
                    console.error('Item ID is required for deletion.');
                    return;
                }
                set((state) => ({
                    items: state.items.filter((item) => item.id !== id),
                }));
            },

            // Update sync status
            updateSyncStatus: (status) =>
                set((state) => ({
                    syncStatus: { ...state.syncStatus, ...status },
                })),
        }),
        {
            name: 'table-state',
            getStorage: () => ({
                getItem: async (name) => {
                    try {
                        const db = await openDB(DB_NAME, DB_VERSION, {
                            upgrade(db) {
                                db.createObjectStore('syncQueue');
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
                                db.createObjectStore('syncQueue');
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
                                db.createObjectStore('syncQueue');
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

export default useTableStore;
