import { create } from 'zustand';

const useUserStore = create((set) => ({
    users: [],
    setUsers: (userList) => set({ users: userList }),
}));

export default useUserStore;
