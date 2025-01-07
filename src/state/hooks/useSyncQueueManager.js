// // state/hooks/useSyncQueueManager.js
// import { useState, useEffect, useCallback } from 'react';
// import { syncQueue } from '../services/offline/sync'; // Adjust path as necessary
// import useTableStore from 'state/stores/useTable';

// export const useSyncQueueManager = () => {
//     const [queueStatus, setQueueStatus] = useState({ 
//         pending: 0, 
//         failed: 0, 
//         total: 0, 
//         isProcessing: false 
//     });

//     useEffect(() => {
//         const updateStatus = () => {
//             setQueueStatus({
//                 pending: syncQueue.queue.filter(item => item.status === 'pending').length,
//                 failed: syncQueue.queue.filter(item => item.status === 'failed').length,
//                 total: syncQueue.queue.length,
//                 isProcessing: syncQueue.isProcessing,
//             });
//         };

//         const unsubscribe = syncQueue.onQueueUpdate(updateStatus);
//         updateStatus(); // Call once to initialize

//         return () => {
//             unsubscribe();
//         };
//     }, []);

//     const addToQueue = useCallback((operation, domain = 'y_state') => {
//         const queueItem = syncQueue.addToQueue(operation, domain);
//         const { addItem, updateItem, deleteItem } = useTableStore(domain);
        
//         // Perform optimistic UI updates
//         switch (operation.type) {
//             case 'create':
//                 addItem(operation.item);
//                 break;
//             case 'update':
//                 updateItem(operation.item);
//                 break;
//             case 'delete':
//                 deleteItem(operation.id);
//                 break;
//         }

//         return queueItem;
//     }, []);

//     return { addToQueue, queueStatus };
// };


// import { useState, useEffect, useCallback } from 'react';
// import { syncQueue } from '../services/offline/sync'; // Adjust path as necessary
// import useTableStore from 'state/stores/useTable';

// export const useSyncQueueManager = (domain = 'y_state') => {
//     const [queueStatus, setQueueStatus] = useState({ 
//         pending: 0, 
//         failed: 0, 
//         total: 0, 
//         isProcessing: false 
//     });

//     // We'll use this inside useCallback to ensure we're not using stale closures
//     const { addItem, updateItem, deleteItem } = useTableStore(domain);

//     useEffect(() => {
//         const updateStatus = () => {
//             setQueueStatus({
//                 pending: syncQueue.queue.filter(item => item.status === 'pending').length,
//                 failed: syncQueue.queue.filter(item => item.status === 'failed').length,
//                 total: syncQueue.queue.length,
//                 isProcessing: syncQueue.isProcessing,
//             });
//         };

//         const unsubscribe = syncQueue.onQueueUpdate(updateStatus);
//         updateStatus(); // Call once to initialize

//         return () => {
//             unsubscribe();
//         };
//     }, []);

//     const addToQueue = useCallback((operation) => {
//         const queueItem = syncQueue.addToQueue(operation, domain);

//         // Perform optimistic UI updates
//         switch (operation.type) {
//             case 'create':
//                 addItem(operation.item);
//                 break;
//             case 'update':
//                 updateItem(operation.item);
//                 break;
//             case 'delete':
//                 deleteItem(operation.id);
//                 break;
//         }

//         return queueItem;
//     }, [addItem, updateItem, deleteItem, domain]);

//     return { addToQueue, queueStatus };
// };


import { useState, useEffect, useCallback } from 'react';
import { syncQueue } from '../services/offline/sync'; // Adjust path as necessary
import useTableStore from 'state/stores/useTable';

export const useSyncQueueManager = (domain = 'y_state') => {
    const [queueStatus, setQueueStatus] = useState({ 
        pending: 0, 
        failed: 0, 
        total: 0, 
        isProcessing: false 
    });

    // We'll use this inside useCallback to ensure we're not using stale closures
    const { addItem, updateItem, deleteItem } = useTableStore(domain);

    useEffect(() => {
        const updateStatus = () => {
            setQueueStatus({
                pending: syncQueue.queue.filter(item => item.status === 'pending').length,
                failed: syncQueue.queue.filter(item => item.status === 'failed').length,
                total: syncQueue.queue.length,
                isProcessing: syncQueue.isProcessing,
            });
        };

        const unsubscribe = syncQueue.onQueueUpdate(updateStatus);
        updateStatus(); // Call once to initialize

        return () => {
            unsubscribe();
        };
    }, [syncQueue]); // Add syncQueue to dependency array if syncQueue might change

    const addToQueue = useCallback((operation) => {
        const queueItem = syncQueue.addToQueue(operation, domain);

        // Perform optimistic UI updates
        switch (operation.type) {
            case 'create':
                addItem(operation.item);
                break;
            case 'update':
                updateItem(operation.item);
                break;
            case 'delete':
                deleteItem(operation.id);
                break;
        }

        return queueItem;
    }, [addItem, updateItem, deleteItem, domain]);

    return { addToQueue, queueStatus };
};