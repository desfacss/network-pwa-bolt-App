import { create } from 'zustand';

const useViewConfigStore = create((set) => ({
    viewConfig: null,
    setViewConfig: (config) => set({ viewConfig: config }),
}));

export default useViewConfigStore;
