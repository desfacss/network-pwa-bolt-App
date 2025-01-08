// import React, { useState, useEffect, useMemo } from 'react';
// import { Table, DatePicker, Space, Button, Input, Form } from 'antd';
// import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { supabase } from 'api/supabaseClient';
// import { useSyncQueueManager } from 'state/hooks/useSyncQueueManager';
// import useTableStore from 'state/stores/useTableStore';
// import { networkMonitor } from 'state/services/offline/networkMonitor';
// import dayjs from 'dayjs';
// import { debounce } from 'lodash';

// const { RangePicker } = DatePicker;

// const StateTable = () => {
//     const { items, setItems } = useTableStore();
//     const [isOnline, setIsOnline] = useState(true);
//     const queryClient = useQueryClient();
//     const { addToQueue, queueStatus } = useSyncQueueManager();

//     // Persist filter state using sessionStorage
//     const [filters, setFilters] = useState(() => {
//         const savedState = sessionStorage.getItem('filters');
//         if (savedState) {
//             const parsedState = JSON.parse(savedState);
//             return {
//                 ...parsedState,
//                 dateRange: parsedState.dateRange ? parsedState.dateRange.map(dateString => dayjs(dateString)) : []
//             };
//         }
//         return { dateRange: [dayjs(), dayjs()] };
//     });

//     useEffect(() => {
//         sessionStorage.setItem('filters', JSON.stringify({
//             ...filters,
//             dateRange: filters.dateRange ? filters.dateRange.map(date => date.toISOString()) : []
//         }));
//     }, [filters]);

//     // Network status change listener
//     useEffect(() => {
//         const handleNetworkChange = (state) => {
//             console.log("Network status changed to:", state);
//             setIsOnline(state);
//             if (state) {
//                 queryClient.invalidateQueries('data');
//             }
//         };

//         const unsubscribe = networkMonitor.subscribe('online', handleNetworkChange);

//         return () => {
//             console.log("Cleaning up network status listener");
//             unsubscribe();
//         };
//     }, [queryClient]);

//     const fetchData = async ({ pageParam = 1 }) => {
//         let query = supabase
//             .from('y_state')
//             .select('id, name, updated_at', { count: 'exact' });

//         if (filters.dateRange?.length === 2) {
//             const [startDate, endDate] = filters.dateRange.map(date => dayjs(date));
//             const startIso = startDate.startOf('day').toISOString();
//             const endIso = endDate.endOf('day').toISOString();
//             query = query
//                 .gte('updated_at', startIso)
//                 .lte('updated_at', endIso);
//         }

//         const pageSize = 5; // Hardcode or use from state if dynamic
//         const offset = (pageParam - 1) * pageSize;
//         const { data, error, count } = await query.range(offset, offset + pageSize - 1);

//         if (error) throw new Error(error.message);

//         return { items: data, total: count, pageParam };
//     };

//     const {
//         data,
//         isLoading,
//         isFetching,
//         fetchNextPage,
//         hasNextPage
//     } = useInfiniteQuery({
//         queryKey: ['data', filters],
//         queryFn: fetchData,
//         getNextPageParam: (lastPage, allPages) => {
//             const total = lastPage.total;
//             const pageSize = 5; // Match with fetchData
//             const nextPage = allPages.length + 1;
//             return nextPage * pageSize < total ? nextPage : undefined;
//         },
//         staleTime: 1000 * 60 * 5,
//         cacheTime: 1000 * 60 * 30,
//         refetchOnWindowFocus: false,
//     });

//     // Mutations for CRUD operations
//     const createMutation = useMutation({
//         mutationFn: async (item) => {
//             if (isOnline) {
//                 const { data, error } = await supabase.from('y_state').insert([item]).select('*');
//                 if (error) throw new Error(error.message);
//                 return data[0];
//             } else {
//                 addToQueue({ type: 'create', item });
//                 return item; // Return for optimistic UI update
//             }
//         },
//         onMutate: async (newItem) => {
//             queryClient.cancelQueries(['data', filters]);
//             const previousData = queryClient.getQueryData(['data', filters]);
//             queryClient.setQueryData(['data', filters], old => ({
//                 ...old,
//                 pages: old?.pages.map(page => ({
//                     ...page,
//                     items: [...page.items, newItem]
//                 }))
//             }));
//             return { previousData };
//         },
//         onSuccess: () => {
//             queryClient.invalidateQueries(['data', filters]);
//         },
//         onError: (_, __, context) => {
//             queryClient.setQueryData(['data', filters], context.previousData);
//         }
//     });

//     // Function to generate random data - Kept intact as requested
//     const generateRandomData = () => {
//         const randomId = Math.floor(Math.random() * 10000); // Example random ID
//         return {
//             id: randomId,
//             name: `Name ${randomId}`,
//             email: `email${randomId}@example.com`,
//             phone: `+91${Math.floor(Math.random() * 1000000000)}`,
//             address: `Address for ${randomId}`,
//             city: `City ${randomId}`,
//             state: `State ${randomId}`,
//             country: `Country ${randomId}`,
//             created_at: new Date().toISOString(),
//             updated_at: new Date().toISOString(),
//         };
//     };

//     const onFinish = () => {
//         const values = generateRandomData();
//         console.log("A1. Form submission started with values:", values);
//         createMutation.mutate(values);
//         console.log("A2. Form submission processed");
//     };

//     const onDateRangeChange = (dates) => {
//         if (dates && dates.length === 2) {
//             setFilters({ ...filters, dateRange: dates.map(date => dayjs(date)) });
//         } else {
//             setFilters({ ...filters, dateRange: [] });
//         }
//     };

//     const columns = useMemo(() => [
//         { title: 'Name', dataIndex: 'name', key: 'name' },
//         { title: 'Updated Date', dataIndex: 'updated_at', key: 'updated_at' },
//         {
//             title: 'Action',
//             dataIndex: '',
//             key: 'action',
//             render: (_, record) => (
//                 <Space size="middle">
//                     <Button onClick={() => console.log('Update action for', record)}>Update</Button>
//                     <Button onClick={() => console.log('Delete action for', record.id)}>Delete</Button>
//                 </Space>
//             ),
//         },
//     ], []);

//     return (
//         <div style={{ padding: 20 }}>
//             <Space style={{ marginBottom: 20 }}>
//                 <RangePicker
//                     onChange={onDateRangeChange}
//                     value={filters.dateRange}
//                     allowClear
//                 />
//                 <Button type="primary" onClick={() => queryClient.invalidateQueries('data')}>
//                     Apply Filters
//                 </Button>
//                 <div>Sync Status: Pending: {queueStatus.pending}, Failed: {queueStatus.failed}, Total: {queueStatus.total}</div>
//             </Space>
//             <Form onFinish={onFinish} layout="inline">
//                 <Form.Item>
//                     <Button type="primary" htmlType="submit">
//                         Add
//                     </Button>
//                 </Form.Item>
//             </Form>

//             <Table
//                 columns={columns}
//                 dataSource={isOnline ? data?.pages.flatMap(page => page.items) : items}
//                 rowKey={(record) => record.id}
//                 pagination={{
//                     pageSize: 5,
//                     onChange: (page, pageSize) => {
//                         fetchNextPage({ pageParam: page });
//                     },
//                     total: data?.pages[0]?.total || 0,
//                     showSizeChanger: false
//                 }}
//                 loading={isLoading || isFetching || createMutation.isLoading}
//             />
//         </div>
//     );
// };

// export default StateTable;


import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Table, DatePicker, Space, Button, Input, Form } from 'antd';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from 'api/supabaseClient';
import { useSyncQueue } from 'state/hooks/useSyncQueue';
// import useTableStore from 'state/stores/useTableStore';
import { networkMonitor } from 'state/services/offline/networkMonitor';
import dayjs from 'dayjs';
import { debounce } from 'lodash';
import useTableStore from 'state/stores/useGenericDomainTable';

const { RangePicker } = DatePicker;

const StateTable = () => {
    const { items, setItems } = useTableStore();
    const [isOnline, setIsOnline] = useState(true);
    const queryClient = useQueryClient();
    const { addToQueue, queueStatus } = useSyncQueue();

    // Persist filter state using sessionStorage
    // This state will be used for filtering data based on user input
    const [filters, setFilters] = useState(() => {
        const savedState = sessionStorage.getItem('filters');
        if (savedState) {
            const parsedState = JSON.parse(savedState);
            return {
                ...parsedState,
                dateRange: parsedState.dateRange ? parsedState.dateRange.map(dateString => dayjs(dateString)) : []
            };
        }
        return { dateRange: [dayjs(), dayjs()] };
    });

    useEffect(() => {
        // Save the filters to sessionStorage whenever they change
        sessionStorage.setItem('filters', JSON.stringify({
            ...filters,
            dateRange: filters.dateRange ? filters.dateRange.map(date => date.toISOString()) : []
        }));
    }, [filters]);

    // Network status change listener with debounce
    // This effect listens for network status changes to manage online/offline behavior
    const debouncedInvalidate = useCallback(
        debounce(() => {
            console.log("A0.1. Invalidating queries due to network change");
            queryClient.invalidateQueries('data');
        }, 500),
        [queryClient]
    );

    // useEffect(() => {
    //     const handleNetworkChange = (state) => {
    //         console.log("A0. Network status changed to:", state);
    //         if (state !== isOnline) {
    //             setIsOnline(state);
    //             if (state) {
    //                 debouncedInvalidate();
    //             }
    //         }
    //     };

    //     const unsubscribe = networkMonitor.subscribe(handleNetworkChange);

    //     // Cleanup the subscription when the component unmounts
    //     return () => {
    //         console.log("A0.2. Cleaning up network status listener");
    //         unsubscribe();
    //         debouncedInvalidate.cancel();
    //     };
    // }, [isOnline, debouncedInvalidate]);

    useEffect(() => {
        const handleNetworkChange = (state) => {
            console.log("A0. Network status changed to:", state);
            if (state !== isOnline) {
                setIsOnline(state);
                if (state) {
                    debouncedInvalidate();
                }
            }
        };

        const unsubscribe = networkMonitor.subscribe(handleNetworkChange);

        return () => {
            console.log("A0.2. Cleaning up network status listener");
            unsubscribe();
            debouncedInvalidate.cancel();
        };
    }, [isOnline, debouncedInvalidate]);

    // useEffect(() => {
    //     const unsubscribe = networkMonitor.subscribe(handleNetworkChange);

    //     return () => {
    //         console.log("A0.2. Cleaning up network status listener");
    //         unsubscribe();
    //         debouncedInvalidate.cancel();
    //     };
    // }, [isOnline, debouncedInvalidate]);
    const pageSize = 7;
    const initPageParam = 1;
    // Fetch data from Supabase with pagination
    const fetchData = async ({ pageParam = initPageParam }) => {
        console.log("P1. Fetching data for page:", pageParam);
        let query = supabase
            .from('y_state')
            .select('id, name, updated_at', { count: 'exact' });

        if (filters.dateRange?.length === 2) {
            const [startDate, endDate] = filters.dateRange.map(date => dayjs(date));
            const startIso = startDate.startOf('day').toISOString();
            const endIso = endDate.endOf('day').toISOString();
            query = query
                .gte('updated_at', startIso)
                .lte('updated_at', endIso);
        }

        // const pageSize = 10; // Hardcode or use from state if dynamic
        const offset = (pageParam - 1) * pageSize;
        const { data, error, count } = await query.range(offset, offset + pageSize - 1);

        if (error) {
            console.error('P2. Error fetching data:', error);
            throw new Error(error.message);
        }

        console.log("P3. Fetched data:", { items: data, total: count, pageParam });
        return { items: data, total: count, pageParam };
    };

    // // Static page number for testing
    // const staticPage = 2; // Change this to 1 or any other number to test different pages

    // Use Infinite Query for pagination
    const {
        data,
        isLoading,
        isFetching,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteQuery({ // useQuery - manage pagination manually and query for each page, does not flatten available data
        queryKey: ['data', filters],
        queryFn: fetchData,
        // initialPageParam: 1, // or 1, for testing
        // initialPageParam: staticPage, // Start with page 2 for testing
        getNextPageParam: (lastPage, allPages) => {
            console.log("P8. Last Page:", lastPage, "All Pages:", allPages);
            const total = lastPage.total;
            // const pageSize = 10; // Match with fetchData
            const nextPage = allPages.length + 1;
            return nextPage * pageSize < total ? nextPage : undefined;
        },
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 30,
        refetchOnWindowFocus: false,
        onSuccess: (data) => {
            console.log("P9. Query Success:", data);
        },
        onError: (error) => {
            console.error("P10. Query Error:", error);
        }
    });

    // Mutations for CRUD operations
    const createMutation = useMutation({
        mutationFn: async (item) => {
            console.log("A1. Mutating - Creating item:", item);
            if (isOnline) {
                const { data, error } = await supabase.from('y_state').insert([item]).select('*');
                if (error) {
                    console.error("A2. Error creating item:", error);
                    throw new Error(error.message);
                }
                console.log("A3. Item created:", data[0]);
                return data[0];
            } else {
                console.log("A4. Adding item to offline queue");
                addToQueue({ type: 'create', item });
                return item; // Return for optimistic UI update
            }
        },
        onMutate: async (newItem) => {
            console.log("A5. OnMutate - Preparing for optimistic update:", newItem);
            queryClient.cancelQueries(['data', filters]);
            const previousData = queryClient.getQueryData(['data', filters]);
            queryClient.setQueryData(['data', filters], old => ({
                ...old,
                pages: old?.pages.map(page => ({
                    ...page,
                    items: [...page.items, newItem]
                }))
            }));
            return { previousData };
        },
        onSuccess: () => {
            console.log("A6. Mutation successful, invalidating data query");
            queryClient.invalidateQueries(['data', filters]);
        },
        onError: (_, __, context) => {
            console.error("A7. Mutation failed, rolling back:", context.previousData);
            queryClient.setQueryData(['data', filters], context.previousData);
        }
    });

    // Function to generate random data - Kept intact as requested
    const generateRandomData = () => {
        const randomId = Math.floor(Math.random() * 10000); // Example random ID
        return {
            id: randomId,
            name: `Name ${randomId}`,
            email: `email${randomId}@example.com`,
            phone: `+91${Math.floor(Math.random() * 1000000000)}`,
            address: `Address for ${randomId}`,
            city: `City ${randomId}`,
            state: `State ${randomId}`,
            country: `Country ${randomId}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
    };

    const onFinish = () => {
        const values = generateRandomData();
        console.log("A1. Form submission started with values:", values);
        createMutation.mutate(values);
        console.log("A2. Form submission processed");
    };

    // Handle date range changes for filtering
    const onDateRangeChange = (dates) => {
        console.log("F1. Date range changed:", dates);
        if (dates && dates.length === 2) {
            setFilters({ ...filters, dateRange: dates.map(date => dayjs(date)) });
        } else {
            setFilters({ ...filters, dateRange: [] });
        }
    };

    // Define table columns
    const columns = useMemo(() => [
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Updated Date', dataIndex: 'updated_at', key: 'updated_at' },
        {
            title: 'Action',
            dataIndex: '',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button onClick={() => console.log('U1. Update action for', record)}>Update</Button>
                    <Button onClick={() => console.log('D1. Delete action for', record.id)}>Delete</Button>
                </Space>
            ),
        },
    ], []);

    // Helper function to log fetchNextPage calls
    const fetchNextPageWithLog = useCallback((options) => {
        console.log("P5.1. Calling fetchNextPage with options:", options);
        fetchNextPage(options);
    }, [fetchNextPage]);

    // const onPaginationChange = useCallback((page, pageSize) => {
    //     fetchNextPage({ pageParam: page });
    // }, [fetchNextPage]);

    // const onPaginationChange = useCallback((page, pageSize) => {
    //     console.log("P4. Pagination change requested for page:", page);
    //     if (page > (data?.pageParams?.length || 0)) {
    //         console.log("P5. Fetching new page:", page);
    //         fetchNextPage({ pageParam: page });
    //     } else {

    //         console.log("P6. Using cached data for page:", page);
    //         // No need to fetch if we already have this page in cache

    //         // // If needed, we might just need to update the current page without fetching
    //         // queryClient.setQueryData(['data', filters], (oldData) => ({
    //         //     ...oldData,
    //         //     pageParams: oldData?.pageParams.slice(0, page)
    //         // }));
    //     }
    // // }, [fetchNextPage, data?.pageParams, queryClient, filters]);
    // }, [fetchNextPage, data?.pageParams]);

    const onPaginationChange = useCallback((page, pageSize) => {
        console.log("P4. Pagination change requested for page:", page);
        if (page > (data?.pageParams?.length || 0)) {
            console.log("P5. Fetching new page:", page);
            fetchNextPageWithLog({ pageParam: page });
        } else {
            console.log("P6. Using cached data for page:", page);
        }
    }, [data?.pageParams, fetchNextPageWithLog]);

    // Debounce pagination change to prevent multiple API calls on rapid clicks
    const debouncedPaginationChange = useCallback(
        debounce((page, pageSize) => {
            onPaginationChange(page, pageSize);
        }, 100),
        [onPaginationChange]
    );
    // Compute the items to display in the table
    // Recompute the dataSource when data.pages changes
    const allItems = useMemo(() => {
        console.log("P7. Recomputing allItems with data:", data);
        return data?.pages.flatMap(page => page.items) || [];
    }, [data?.pages]); // Use data.pages as the dependency, not just data
    // }, [data]);
    // }, [data?.pages]);

    // const debouncedPaginationChange = useCallback(
    //     debounce((page, pageSize) => {
    //         console.log("P4. Pagination change requested for page:", page);
    //         if (page > (data?.pageParams?.length || 0)) {
    //             console.log("P5. Fetching new page:", page);
    //             fetchNextPageWithLog({ pageParam: page });
    //         } else {
    //             console.log("P6. Using cached data for page:", page);
    //         }
    //     }, 100),
    //     [data?.pageParams, fetchNextPageWithLog]
    // );

    // const allItems = useMemo(() => 
    //     data?.pages?.flatMap(page => page.items) || []
    // , [data]);

    // const debouncedPaginationChange = useCallback(
    //     debounce((page, pageSize) => {
    //         console.log("P4. Pagination change requested for page:", page);
    //         onPaginationChange(page, pageSize);
    //     }, 100), // 100ms delay, adjust as needed
    //     [onPaginationChange]
    // );



    // const debouncedPaginationChange = useCallback(
    //     debounce((page, pageSize) => {
    //         console.log("P4. Pagination change requested for page:", page);
    //         if (page > (data?.pageParams?.length || 0)) {
    //             console.log("P5. Fetching new page:", page);
    //             fetchNextPageWithLog({ pageParam: page });
    //         } else {
    //             console.log("P6. Using cached data for page:", page);
    //         }
    //     }, 100), // 100ms delay, adjust as needed
    //     [data?.pageParams, fetchNextPageWithLog]
    // );

    return (
        <div style={{ padding: 20 }}>
            <Space style={{ marginBottom: 20 }}>
                <RangePicker
                    onChange={onDateRangeChange}
                    value={filters.dateRange}
                    allowClear
                />
                <Button type="primary" onClick={() => {
                    console.log("F2. Filters applied, invalidating queries");
                    queryClient.invalidateQueries('data');
                }}>
                    Apply Filters
                </Button>
                <div>Sync Status: Pending: {queueStatus.pending}, Failed: {queueStatus.failed}, Total: {queueStatus.total}</div>
            </Space>
            <Form onFinish={onFinish} layout="inline">
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Add
                    </Button>
                </Form.Item>
            </Form>

            {/* <Table
                // key={data?.pages?.length} // guess to reload page if needed
                columns={columns}
                // dataSource={isOnline ? data?.pages.flatMap(page => page.items) : items}
                dataSource={isOnline ? allItems : items}
                rowKey={(record) => record.id}
                pagination={{
                    pageSize: 5,
                    onChange: debouncedPaginationChange,
                // pagination={{
                //     pageSize: 5,
                //     onChange: onPaginationChange,
                    // onChange: (page, pageSize) => {
                    //     fetchNextPage({ pageParam: page });
                    // },
                    total: data?.pages[0]?.total || 0,
                    // current: data?.pageParams?.[data.pageParams.length - 1] || 1, // current page
                    // current: data?.pageParams?.length || 1, // current page
                    current: data?.pageParams?.length || 1,
                    showSizeChanger: false
                }}
                // loading={isLoading || isFetching || createMutation.isLoading}
                loading={isLoading || isFetching || createMutation.isLoading || isFetchingNextPage}
            /> */}
            <Table
                columns={columns}
                dataSource={isOnline ? allItems : items}
                rowKey={(record) => record.id}
                pagination={{
                    pageSize: pageSize,
                    onChange: debouncedPaginationChange,
                    total: data?.pages[0]?.total || 0,
                    current: data?.pageParams?.length || 1,
                    showSizeChanger: false
                }}
                loading={isLoading || isFetching || createMutation.isLoading || isFetchingNextPage}
            />
        </div>
    );
};

export default StateTable;