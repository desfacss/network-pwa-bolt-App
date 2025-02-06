import dayjs from 'dayjs';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const DOMAIN = 'y_state';

const useTableStore = create(
  persist(
    (set) => ({
    //   filters: { dateRange: [] },
      filters: { dateRange: [dayjs(), dayjs()] },
      pagination: { currentPage: 1, pageSize: 5 },
      
      setFilters: (filters) => set({ filters }),
      setPagination: (pagination) => set({ pagination }),
    }),
    {
      name: `table-state-${DOMAIN}`,
      getStorage: () => localStorage,
    }
  )
);

export default useTableStore;



// Items Management: Since TanStack Query now handles fetching, updating, and managing items, we've removed items, setItems, addItem, updateItem, and deleteItem from Zustand. These operations are now managed by TanStack Query mutations.
// Sync Status: The syncStatus state was removed because TanStack Query manages the synchronization of data through its persistence and mutation hooks. If specific sync status needs to be tracked, you can utilize custom hooks or manage this within your application logic rather than in the store.
// OfflineDB Integration: The direct integration with offlineDB for storing and retrieving state data has been simplified. We're now just using the default localStorage for persisting pagination and filters, as TanStack Query handles data persistence. 
// Item Validation and Transformation: Since these operations are now handled by the server or through optimistic UI updates in TanStack Query, we don't need these in the store.
// Error Handling: Errors related to CRUD operations are now managed within TanStack Query mutations or at the component level where needed.
// Complex State Operations: The logic for adding, updating, or deleting items is now part of your TanStack Query setup, reducing the need for complex state management in the store.

// This simplification aligns with using more of TanStack Query's features, keeping the store focused on managing UI state like filters and pagination, which are not directly tied to API responses or data persistence managed by TanStack Query.