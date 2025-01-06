# Sequence of Interactions for `SyncQueueManager`

## Initialization

1. **Database Setup**:
   - Fetch pending operations from the database (`syncQueue`).
   - Load the processing state (`syncQueueState`).

2. **Network Monitoring**:
   - Add listeners to detect online status and connection quality changes.
   - Trigger `processQueue` when the connection is stable.

3. **Periodic Tasks**:
   - Retry failed operations every 5 minutes.
   - Clean up old queue items daily.

4. **Notify Listeners**:
   - Notify subscribers about the current state of the queue.

---

## Adding Operations to the Queue

1. Create a new `queueItem` with operation details and metadata.
2. Save the `queueItem` to the database.
3. Push the operation to the queue and notify listeners.
4. Perform an optimistic UI update using `useTableStore`.
5. If the network connection is stable, trigger `processQueue`.

---

## Processing the Queue

1. **Initial Checks**:
   - Skip processing if the queue is empty or already being processed.
   - Mark the state as processing in the database.

2. **Operation Processing**:
   - Iterate through each item in the queue.
   - Skip items marked as "failed" with max retries reached.
   - Process operations (`create`, `update`, `delete`).
   - On success:
     - Remove the item from the database and queue.
   - On failure:
     - Increment the retry count, mark the item status, and update the database.
     - Apply exponential backoff for retries.

3. **Final State Update**:
   - Mark the processing state as false in the database.
   - Notify listeners.

---

## Retry Failed Operations

1. Identify failed items in the queue that haven't reached the max retries.
2. Reset their status to "pending" and trigger `processQueue`.

---

## Cleanup

1. Identify old queue items (older than 30 days) with a "failed" status and max retries reached.
2. Delete such items from the database and queue.
3. Notify listeners.

---

## Listener Management

1. Allow external listeners to subscribe to queue updates.
2. Notify listeners of the queue's current status.

---

## Operation Handling

- **Create**:
  - Process and handle conflict resolution if necessary.
- **Update**:
  - Check for conflicts with the server version.
  - Resolve conflicts (e.g., merge, last-write wins) and update the server.
- **Delete**:
  - Verify the item exists before deleting to prevent conflicts.

---

## Optimistic Updates

- Update UI or local state immediately using `useTableStore` for `create`, `update`, and `delete` operations.
