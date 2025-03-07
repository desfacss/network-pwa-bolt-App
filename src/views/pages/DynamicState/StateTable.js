//#dynamicState/index.js
import React, { useState, useEffect, useMemo } from 'react';
import { Table, DatePicker, Space, Button, Input, Form } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from 'configs/SupabaseConfig';
import { useSyncQueueManager } from 'state/hooks/useSyncQueueManager';
import useTableStore from 'state/stores/useTable';
import { networkMonitor } from 'state/services/offline/networkMonitor';
import dayjs from 'dayjs';
// import { debounce } from 'lodash';
import useDebouncedInvalidate from 'state/hooks/useDebouncedInvalidate';

// import useGenericStore from 'state/stores/useGenericStore';
// useGenericStore

const { RangePicker } = DatePicker;

const StateTable = () => {
    // Use the domain when accessing the store
    // const { items, pagination, setItems, setPagination, addItem, updateItem, deleteItem } = useTableStore('y_state'); // If dynamic
    const { items, pagination, setItems, setPagination, addItem, updateItem, deleteItem } = useTableStore('y_state')();
    // const { items, pagination, setItems, setPagination, addItem, updateItem, deleteItem } = useTableStore((state) => state.y_state);
    // const { items, pagination, setItems, setPagination, addItem, updateItem, deleteItem } = useTableStore(state => state);


    // const { addItem, updateItem, deleteItem } = useTableStore('y_state');

    const [isOnline, setIsOnline] = useState(true);
    const queryClient = useQueryClient();

    // Create debounced function outside useEffect but inside component with pagination and current data issue
    // const debouncedInvalidate = useMemo(
    //     () => 
    //     debounce(() => {
    //         console.log("L3. Network is online, invalidating queries");
    //         queryClient.invalidateQueries('data');

    //         // Use optional chaining to safely access data.total
    //         const currentData = queryClient.getQueryData('data');
    //         if (currentData && currentData.total < (pagination.current - 1) * pagination.pageSize) {
    //             setPagination((prev) => ({ ...prev, current: 1 }));
    //         }
    //     }, 500),
    //     [queryClient, pagination.current, pagination.pageSize]
    // );

    const debouncedInvalidate = useDebouncedInvalidate(queryClient, {
        current: pagination.current,
        pageSize: pagination.pageSize,
        setPagination: setPagination
    });


    // const debouncedInvalidate = useMemo(() => {
    //     return () => {
    //         console.log("Placeholder for debouncedInvalidate: Pagination logic is disabled");
    //     };
    // }, []);


    // Persist filter state using sessionStorage
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
        sessionStorage.setItem('filters', JSON.stringify({
            ...filters,
            dateRange: filters.dateRange ? filters.dateRange.map(date => date.toISOString()) : []
        }));
    }, [filters]);

    useEffect(() => {
        const handleNetworkChange = (state) => {
            console.log("L1. Network status changed to:", state);
            setIsOnline(state);
            if (state) {
                debouncedInvalidate();
            }
        };

        const unsubscribe = networkMonitor.subscribe('online', handleNetworkChange);

        return () => {
            console.log("Cleaning up network status listener");
            unsubscribe();
            debouncedInvalidate.cancel();
        };
    }, [debouncedInvalidate]);

    // This useEffect is for handling network status changes
    // useEffect(() => {
    //     const debouncedInvalidate = debounce(() => {
    //         console.log("L3. Network is online, invalidating queries");
    //         queryClient.invalidateQueries('data');

    //         // // Use optional chaining to safely access data.total
    //         const currentData = queryClient.getQueryData('data');
    //         if (currentData && currentData.total < (pagination.current - 1) * pagination.pageSize) {
    //             setPagination((prev) => ({ ...prev, current: 1 }));
    //         }
    //     }, 500);

    //     const handleNetworkChange = (state) => {
    //         console.log("L1. Network status changed to:", state);
    //         setIsOnline(state);
    //         if (state) {
    //             debouncedInvalidate();
    //         }
    //     };

    //     const unsubscribe = networkMonitor.subscribe('online', handleNetworkChange);

    //     return () => {
    //         console.log("Cleaning up network status listener");
    //         unsubscribe();
    //         debouncedInvalidate.cancel();
    //     };
    // }, [debouncedInvalidate, queryClient]);
    // }, [debouncedInvalidate, pagination.current, pagination.pageSize, queryClient]);

    // const fetchData = async ({ queryKey }) => {
    //     // const [, filters, pagination] = queryKey; // revisit later is pagination is needed
    //     const [, filters] = queryKey; // Removed pagination since it's commented out
    //     let query = supabase
    //         .from('y_state')
    //         .select('id, name, updated_at', { count: 'exact' });

    //     if (filters.dateRange && filters.dateRange.length === 2) {
    //         const [startDate, endDate] = filters.dateRange.map(date => dayjs(date));
    //         const startIso = startDate.startOf('day').toISOString().split('T')[0];
    //         const endIso = endDate.endOf('day').toISOString().split('T')[0];

    //         query = query
    //             .gte('updated_at', `${startIso} 00:00:00`)
    //             .lte('updated_at', `${endIso} 23:59:59`);
    //     }

    //     // Ensure pagination.current starts from 1 if no changes have been made
    //     if (pagination.current < 1) {
    //         setPagination((prev) => ({ ...prev, current: 1 }));
    //     }

    //     const offset = (pagination.current - 1) * pagination.pageSize;
    //     // Use count from the query result for pagination
    //     const { data, error, count } = await query;

    //     console.log('Fetched data:', { data, count }); // Add console log to check data availability

    //     if (error) throw new Error(error.message);

    //     // Now calculate end using 'count'
    //     const end = Math.min(offset + pagination.pageSize - 1, count ? count - 1 : offset); // Adjust end to prevent out-of-bounds

    //     return { items: data, total: count };
    // };

    const fetchData = async ({ queryKey }) => {
        const [, filters, pagination] = queryKey;

        // Initialize the base query
        let query = supabase
            .from('y_state')
            .select('id, name, updated_at', { count: 'exact' });

        // Apply date range filters if present
        if (filters.dateRange?.length === 2) {
            const [startDate, endDate] = filters.dateRange.map(date => dayjs(date));
            const startIso = startDate.startOf('day').toISOString().split('T')[0];
            const endIso = endDate.endOf('day').toISOString().split('T')[0];

            query = query
                .gte('updated_at', `${startIso} 00:00:00`)
                .lte('updated_at', `${endIso} 23:59:59`);
        }

        // Validate and adjust pagination
        if (pagination.current < 1) {
            setPagination((prev) => ({
                ...prev,
                current: 1
            }));
        }

        // Calculate pagination range
        const offset = (pagination.current - 1) * pagination.pageSize;

        // Execute the initial query to get total count
        const { error: countError, count } = await query; // Destructure only what we need

        if (countError) {
            console.error('Error fetching count:', countError);
            throw new Error(countError.message);
        }

        // Calculate the safe end index based on total count
        const end = Math.min(offset + pagination.pageSize - 1, count ? count - 1 : offset);

        // Apply pagination range to query
        const paginatedQuery = query.range(offset, end);

        // Execute the paginated query
        const paginatedResult = await paginatedQuery;

        if (paginatedResult.error) {
            console.error('Error fetching paginated data:', paginatedResult.error);
            throw new Error(paginatedResult.error.message);
        }

        console.log('Fetched data:', {
            data: paginatedResult.data,
            count,
            offset,
            end
        });

        return {
            items: paginatedResult.data,
            total: count
        };
    };

    // const fetchData = async ({ queryKey }) => {
    //     const [, filters] = queryKey;
    //     let query = supabase
    //         .from('y_state')
    //         .select('id, name, updated_at', { count: 'exact' });

    //     if (filters.dateRange && filters.dateRange.length === 2) {
    //         const [startDate, endDate] = filters.dateRange.map(date => dayjs(date));
    //         const startIso = startDate.startOf('day').toISOString();
    //         const endIso = endDate.endOf('day').toISOString();

    //         query = query
    //             .gte('updated_at', startIso)
    //             .lte('updated_at', endIso);
    //     }

    // const current = pagination?.current || 1; // temporary to avoid error - commented earlier - need to fix there and remove here
    // const pageSize = pagination?.pageSize || 5; // temporary to avoid error - commented earlier - need to fix there and remove here

    //     const offset = (current - 1) * pageSize;
    //     query = query.range(offset, offset + pageSize - 1);

    //     const { data, error, count } = await query;
    //     console.log('Query results:', { data, error, count });

    //     if (error) {
    //         console.error('Error fetching data:', error.message);
    //         throw new Error(error.message);
    //     }

    //     return { items: data, total: count };
    // };


    // Use the hook to get the sync queue manager methods
    const { addToQueue } = useSyncQueueManager();

    const { data, isLoading } = useQuery({
        queryKey: ['data', filters, pagination],
        queryFn: fetchData,
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 30,
        refetchOnWindowFocus: false,
        onSettled: (data, error) => {
            console.log("useQuery: Fetching data settled", { data, error });
        }
    });


    // Function to generate random data
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

    const createMutation = useMutation({
        mutationFn: async (item) => {
            console.log("A4.createMutation: mutationFn start", { isOnline, item });

            if (isOnline) {
                console.log("A5.createMutation: Attempting online insert", item);
                addItem(item); // Immediate UI update
                try {
                    const { data, error } = await supabase.from('y_state').insert([item]).select('*');
                    if (error) throw new Error(error.message);
                    console.log("A8.createMutation: Online insert successful", data);
                    // Update local state with server response if needed
                    updateItem(data[0]);
                    return data[0];
                } catch (err) {
                    console.error("createMutation: Caught error during online insert", err);
                    // Rollback local state if server operation fails
                    deleteItem(item.id);
                    throw err;
                }
            } else {
                console.log("createMutation: Offline mode - adding to local state and sync queue", item);
                addItem(item, false);// Immediate UI update
                addToQueue({ type: 'create', item }, 'y_state');
                return item; // Return offline item for UI update
            }
        },
        onMutate: async (newItem) => {
            // Always ensure local state is updated optimistically
            console.log("A3.createMutation: onMutate - preparing for optimistic update", newItem);
            queryClient.cancelQueries('data');
            queryClient.setQueryData('data', (old) => {
                if (old && old.items) {
                    return { ...old, items: [...old.items, newItem] };
                }
                return old;
            });
        },
        onError: (err, newItem, context) => {
            console.error("A 5.1. createMutation: Mutation failed, rolling back", err);
        },
        onSuccess: () => {
            console.log("A9. createMutation: Mutation successful, invalidating data query");
            queryClient.invalidateQueries('data');
        }
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, ...updatedItem }) => {
            console.log("U1.updateMutation: mutationFn start", { id, updatedItem });
            if (isOnline) {
                console.log("U2.updateMutation: Attempting online update", { id, updatedItem });
                const { data, error } = await supabase.from('y_state').update(updatedItem).eq('id', id);
                if (error) throw new Error(error.message);
                console.log("U3.updateMutation: Online update successful", data);
                return data[0];
            } else {
                console.log("U4.updateMutation: Offline mode - updating local state and sync queue", { id, updatedItem });
                updateItem(updatedItem);
                addToQueue({ type: 'update', item: updatedItem }, 'y_state');
                return updatedItem;
            }
        },
        onMutate: async ({ id, ...updatedItem }) => {
            console.log("U5.updateMutation: onMutate - preparing for optimistic update", { id, updatedItem });
            await queryClient.cancelQueries('data');
            const previousData = queryClient.getQueryData('data');
            queryClient.setQueryData('data', (old) => {
                if (old && old.items) {
                    return {
                        ...old,
                        items: old.items.map(item => item.id === id ? { ...item, ...updatedItem } : item)
                    };
                }
                return old;
            });
            return { previousData };
        },
        onError: (err, { id, ...updatedItem }, context) => {
            console.error("U6.updateMutation: Mutation failed, rolling back", err);
            queryClient.setQueryData('data', context.previousData);
        },
        onSuccess: () => {
            console.log("U7.updateMutation: Mutation successful, invalidating data query");
            queryClient.invalidateQueries('data');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            console.log("D1.deleteMutation: mutationFn start", id);
            if (isOnline) {
                console.log("D2.deleteMutation: Attempting online delete", id);
                const { error } = await supabase.from('y_state').delete().eq('id', id);
                if (error) throw new Error(error.message);
                console.log("D3.deleteMutation: Online delete successful");
            } else {
                console.log("D4.deleteMutation: Offline mode - deleting from local state and sync queue", id);
                deleteItem(id);
                addToQueue({ type: 'delete', id }, 'y_state');
            }
        },
        onMutate: async (id) => {
            console.log("D5.deleteMutation: onMutate - preparing for optimistic update", id);
            await queryClient.cancelQueries('data');
            const previousData = queryClient.getQueryData('data');
            queryClient.setQueryData('data', (old) => {
                if (old && old.items) {
                    return {
                        ...old,
                        items: old.items.filter(item => item.id !== id)
                    };
                }
                return old;
            });
            return { previousData };
        },
        onError: (err, id, context) => {
            console.error("D6.deleteMutation: Mutation failed, rolling back", err);
            queryClient.setQueryData('data', context.previousData);
        },
        onSuccess: () => {
            console.log("D7.deleteMutation: Mutation successful, invalidating data query");
            queryClient.invalidateQueries('data');
        }
    });

    const [form] = Form.useForm();
    const onFinish = () => {
        const values = generateRandomData();
        console.log("A1. Form submission started with values:", values);
        createMutation.mutate(values);
        console.log("A2. Form submission processed");
        form.resetFields();
    };

    const onDateRangeChange = (dates) => {
        if (dates && dates.length === 2) {
            setFilters({ ...filters, dateRange: dates.map(date => dayjs(date)) });
        } else {
            setFilters({ ...filters, dateRange: [] });
        }
    };

    const columns = useMemo(() => [
        // not only columns, consider memoizing more complex calculations or data transformations if they occur frequently.
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Updated Date', dataIndex: 'updated_at', key: 'updated_at' },
        {
            title: 'Action',
            dataIndex: '',
            key: 'action', // Unique key for the action column
            render: (_, record) => {
                return (
                    <Space size="middle" key={record.id}>
                        <Button onClick={() => updateMutation.mutate({ ...record, name: `Updated ${record.name}` })}>
                            Update
                        </Button>
                        <Button onClick={() => deleteMutation.mutate(record.id)}>
                            Delete
                        </Button>
                    </Space>
                );
            },
        },
    ], [updateMutation, deleteMutation]);

    if (isLoading) return <div>Loading...</div>;

    console.log("A7. L2. D2.1. Main Bloc - Component render", { isOnline, items: isOnline ? data?.items : items, filters, pagination });

    return (
        <div style={{ padding: 20 }}>
            <Space style={{ marginBottom: 20 }}>
                <RangePicker
                    onChange={onDateRangeChange}
                    value={filters.dateRange}
                    allowClear
                />
                <Button type="primary" onClick={() => setPagination({ ...pagination, current: 1 })}>
                    Apply Filters
                </Button>
            </Space>
            <Form form={form} onFinish={onFinish} layout="inline">
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Add
                    </Button>
                </Form.Item>
            </Form>

            <Table
                columns={columns}
                dataSource={isOnline ? data?.items : items}
                rowKey={(record) => record.id}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: isOnline ? data?.total : items.length,
                    onChange: (current, pageSize) => setPagination({ current, pageSize }),
                }}
                loading={isLoading || createMutation.isLoading || updateMutation.isLoading || deleteMutation.isLoading}
            />
        </div>
    );
}

export default StateTable;


// Offline
// A1, A2, A3, A7

// A1. Form submission started with values: {id: 437, name: 'Name 437', email: 'email437@example.com', phone: '+91766551318', address: 'Address for 437', …}
// A2. Form submission processed
// A3.createMutation: onMutate - preparing for optimistic update {id: 437, name: 'Name 437', email: 'email437@example.com', phone: '+91766551318', address: 'Address for 437', …}
// A7. L2. D2.1. Component render

// Delete
//    D5, D1, D2, D2.1 D3, D7 