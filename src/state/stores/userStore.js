// import { create } from 'zustand';

// const useUserStore = create((set) => ({
//     users: [],
//     setUsers: (userList) => set({ users: userList }),
// }));

// export default useUserStore;

// state/stores/userStore.js
/**
 * Enhanced user store with role-based access control
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUserStore = create(
    persist(
        (set, get) => ({
            user: null,
            setUser: (user) => set({ user }),
            clearUser: () => set({ user: null }),
            hasPermission: (permission) => {
                const { user } = get();
                return user?.permissions?.includes(permission) || false;
            },
        }),
        { name: 'user-store' }
    )
);
