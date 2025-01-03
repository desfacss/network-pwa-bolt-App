// import { create } from 'zustand';

// const useViewConfigStore = create((set) => ({
//     viewConfig: null,
//     setViewConfig: (config) => set({ viewConfig: config }),
// }));

// export default useViewConfigStore;


// state/stores/viewConfigStore.js
/**
 * Enhanced view configuration store with versioning
 */
import create from 'zustand';
import { persist } from 'zustand/middleware';

export const useViewConfigStore = create(
    persist(
        (set, get) => ({
            configs: {},
            setConfig: (userId, tableId, config) =>
                set((state) => ({
                    configs: {
                        ...state.configs,
                        [`${userId}-${tableId}`]: config,
                    },
                })),
            getConfig: (userId, tableId) => {
                const { configs } = get();
                return configs[`${userId}-${tableId}`] || null;
            },
        }),
        { name: 'view-config-store' }
    )
);