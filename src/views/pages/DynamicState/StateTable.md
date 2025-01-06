## Sequence of Interactions for State Management in StateTable Component

### Initial Setup
1. **State Initialization**:
   - `useTableStore` initializes state variables (`items`, `filters`, `pagination`, etc.) using Zustand.
   - Local states (`isOnline`, `filters`) are set up in the component.

2. **Persist Filters**:
   - `filters` state is loaded from `sessionStorage` if available.
   - On any update to `filters`, the new state is saved back to `sessionStorage`.

### Network Monitoring
3. **Network Status**:
   - `networkMonitor.onOnline` is used to monitor network changes.
   - If the application goes online, cached queries are invalidated to fetch fresh data.

### Data Fetching
4. **Data Query**:
   - `useQuery` is used to fetch data from Supabase with filtering and pagination applied.
   - `fetchData` builds the Supabase query based on the provided filters and pagination state.

### CRUD Operations

#### Create
5. **Create Mutation**:
   - `createMutation` adds new items:
     - **Online Mode**: Inserts data into Supabase and returns the new item.
     - **Offline Mode**: Generates a temporary ID, adds the item to local state using `addItem`, and queues the item for syncing later using `syncQueue.addToQueue`.
   - The mutation optimistically updates the query cache for offline scenarios.

#### Update
6. **Update Mutation**:
   - Updates an existing item:
     - **Online Mode**: Sends the updated data to Supabase.
     - **Offline Mode**: Updates the local state with `updateItem` and adds the update to the sync queue.
   - Cache is updated optimistically.

#### Delete
7. **Delete Mutation**:
   - Deletes an item:
     - **Online Mode**: Deletes the record in Supabase.
     - **Offline Mode**: Removes the item from local state with `deleteItem` and adds the deletion to the sync queue.
   - Cache is updated optimistically.

### User Interactions

8. **Date Range Filtering**:
   - `RangePicker` allows users to filter data by date range.
   - Selected dates are saved in `filters`, triggering a refetch of data.

9. **Pagination**:
   - Pagination state (`current`, `pageSize`) is updated when users navigate pages.
   - This triggers a data refetch with the updated pagination values.

10. **Table Actions**:
    - Each table row includes buttons for `Update` and `Delete`.
    - These buttons trigger the respective mutations.

### Rendering and UI

11. **Loading State**:
    - Displays a loading indicator when data or mutations are in progress.

12. **Table Rendering**:
    - Ant Design `Table` component displays fetched or locally cached data.
    - Pagination and filters are integrated directly into the table.

### Key Features

- **Offline Support**:
  - Uses local state and a sync queue for CRUD operations when offline.
  - Syncs queued operations with Supabase when back online.

- **Optimistic Updates**:
  - Mutations update the query cache immediately for a smoother user experience.

- **Persistent Filters**:
  - Saves filter settings in `sessionStorage` to maintain state across sessions.

- **Dynamic Data Fetching**:
  - Utilizes `useQuery` with `TanStack Query` for efficient and dynamic data fetching.
