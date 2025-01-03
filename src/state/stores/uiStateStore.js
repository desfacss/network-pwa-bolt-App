import { create } from 'zustand';
import dayjs from 'dayjs';

const useUIStateStore = create((set) => ({
    dateRange: [dayjs().subtract(30, 'days'), dayjs()],
    setDateRange: (range) => set({ dateRange: range }),

    visible: false,
    setVisible: (visibility) => set({ visible: visibility }),

    vd: null,
    setVd: (vdData) => set({ vd: vdData }),
}));

export default useUIStateStore;
