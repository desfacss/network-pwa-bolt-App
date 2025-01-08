// import { useState, useEffect, useCallback } from 'react';
// import { syncQueue } from 'state/services/offline/sync'; // Adjust path as necessary
// import useTableStore from 'state/stores/useTable';

// export const useSyncQueueManager = (domain = 'y_state') => {
//     const [queueStatus, setQueueStatus] = useState({ 
//         pending: 0, 
//         failed: 0, 
//         total: 0, 
//         isProcessing: false 
//     });

//     // Retrieve store methods based on the domain
//     const { addItem, updateItem, deleteItem } = useTableStore(domain);

//     // Function to update queue status
//     const updateQueueStatus = useCallback(() => {
//         setQueueStatus({
//             pending: syncQueue.queue.filter(item => item.status === 'pending' && item.domain === domain).length,
//             failed: syncQueue.queue.filter(item => item.status === 'failed' && item.domain === domain).length,
//             total: syncQueue.queue.filter(item => item.domain === domain).length,
//             isProcessing: syncQueue.isProcessing,
//         });
//     }, [domain, syncQueue]);

//     useEffect(() => {
//         // Here we pass updateQueueStatus as the callback to onQueueUpdate
//         const unsubscribe = syncQueue.onQueueUpdate(updateQueueStatus);
//         updateQueueStatus(); // Initialize status

//         return () => {
//             unsubscribe();
//         };
//     }, [updateQueueStatus]);

//     const addToQueue = useCallback((operation) => {
//         const queueItem = syncQueue.addToQueue({ ...operation, domain }); // Add domain to operation

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
import { syncQueue } from 'state/services/offline/syncQueue';
import useTableStore from 'state/stores/useTable';

export const useSyncQueue = (domain = 'y_state') => {
    const [queueStatus, setQueueStatus] = useState({ 
        pending: 0, 
        failed: 0, 
        total: 0, 
        isProcessing: false 
    });

    const { addItem, updateItem, deleteItem } = useTableStore(domain);

    const updateQueueStatus = useCallback(() => {
        setQueueStatus({
            pending: syncQueue.queue.filter(item => item.status === 'pending' && item.domain === domain).length,
            failed: syncQueue.queue.filter(item => item.status === 'failed' && item.domain === domain).length,
            total: syncQueue.queue.filter(item => item.domain === domain).length,
            isProcessing: syncQueue.isProcessing,
        });
    }, [domain, syncQueue]);

    useEffect(() => {
        const unsubscribe = syncQueue.onQueueUpdate(updateQueueStatus);
        updateQueueStatus(); // Initialize status

        return () => {
            unsubscribe();
        };
    }, [updateQueueStatus]);

    const addToQueue = useCallback((operation) => {
        const queueItem = syncQueue.addToQueue({ ...operation, domain });

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