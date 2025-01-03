import { create } from 'zustand';

const useDataStore = create((set) => ({
    data: null,
    rawData: null,
    setData: (data) => set({ data }),
    setRawData: (rawData) => set({ rawData }),
}));

export default useDataStore;