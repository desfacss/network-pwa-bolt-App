import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Table, DatePicker, Space, Button, Input, Form } from 'antd';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from 'api/supabaseClient';
import { useSyncQueue } from 'state/hooks/useSyncQueue';
import useTableStore from 'state/stores/useGenericDomainTable';
import { networkMonitor } from 'state/services/offline/networkMonitor';
import dayjs from 'dayjs';
import { debounce } from 'lodash';

const { RangePicker } = DatePicker;

const StateTable = () => {
    const { items, setItems } = useTableStore();
    const [isOnline, setIsOnline] = useState(true);
    const queryClient = useQueryClient();
    const { addToQueue, queueStatus } = useSyncQueue();
    const [currentPage, setCurrentPage] = useState(1); // Manage current page state

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

    const pageSize = 5;
    const fetchData = async ({ pageParam = 1 }) => {
        console.log("P1. Fetching data for page:", pageParam);
        let query = supabase
            .from('y_state')
            .select('id, name, updated_at', { count: 'exact' });

        if (filters.dateRange?.length === 2) {
            const [startDate, endDate] = filters.dateRange.map(date => dayjs(date));
            const startIso = startDate.startOf('day').toISOString();
            const endIso = endDate.endOf('day').toISOString();
            query = query.gte('updated_at', startIso).lte('updated_at', endIso);
        }

        const offset = (pageParam - 1) * pageSize;
        const { data, error, count } = await query.range(offset, offset + pageSize - 1);

        if (error) {
            console.error('P2. Error fetching data:', error);
            throw new Error(error.message);
        }

        console.log("P3. Fetched data:", { items: data, total: count, pageParam });
        return { items: data, total: count, pageParam };
    };

    // Use Infinite Query for pagination
        const { 
        data, 
        isLoading, 
        isFetching, 
        fetchNextPage, 
        fetchPreviousPage, 
        hasNextPage, 
        hasPreviousPage, 
        isFetchingNextPage, 
        isFetchingPreviousPage 
    } = useInfiniteQuery({
        queryKey: ['data', filters],
        queryFn: fetchData,
        getNextPageParam: (lastPage) => lastPage.pageParam + 1,
        getPreviousPageParam: (firstPage) => firstPage.pageParam > 1 ? firstPage.pageParam - 1 : undefined,
        initialPageParam: currentPage,


        // getNextPageParam: (lastPage, allPages) => {
        //     const nextPage = lastPage.pageParam + 1;
        //     return nextPage * pageSize < lastPage.total ? nextPage : undefined;
        // },
        // getPreviousPageParam: (firstPage, allPages) => {
        //     const prevPage = firstPage.pageParam - 1;
        //     return prevPage > 0 ? prevPage : undefined;
        // },
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 30,
        refetchOnWindowFocus: false,
        // can comment later
        onSuccess: (data) => {
            console.log("P9. Query Success:", data);
        },
        onError: (error) => {
            console.error("P10. Query Error:", error);
        }
        // finish can comment later
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
        const randomId = Math.floor(Math.random() * 10000);
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

    const onPaginationChange = useCallback((page, pageSize) => {
        console.log("P4. Pagination change requested for page:", page);
        setCurrentPage(page);  // Update current page
        // Fetch data for the exact page requested
        if (page > (data?.pageParams?.length || 0)) {
            console.log("P5. Fetching new page:", page);
            fetchNextPage({ pageParam: page });
        } else if (page < (data?.pageParams?.length || 1)) {
            console.log("P6. Fetching previous page:", page);
            fetchPreviousPage({ pageParam: page });
        } else {
            // If the page is already fetched, no new fetch is needed
            console.log("P7. Using cached data for page:", page);
        }
    }, [data?.pageParams, fetchNextPage, fetchPreviousPage]);

    // Debounce pagination change to prevent multiple API calls on rapid clicks
    const debouncedPaginationChange = useCallback(
        debounce(onPaginationChange, 100),
        [onPaginationChange]
    );
    // Compute the items to display in the table
    // Recompute the dataSource when data.pages changes
    const allItems = useMemo(() => 
        data?.pages?.flatMap(page => page.items) || []
    , [data?.pages]);

    const totalCount = data?.pages?.[0]?.total || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

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

            <Table
                columns={columns}
                dataSource={isOnline ? allItems : items}
                rowKey={(record) => record.id}
                pagination={{
                    pageSize: pageSize,
                    onChange: debouncedPaginationChange,
                    total: totalCount,
                    current: currentPage,

                    // total: data?.pages[0]?.total || 0,
                    // current: data?.pageParams?.length || 1,
                    showSizeChanger: false
                }}
                loading={isLoading || isFetching || createMutation.isLoading || isFetchingNextPage || isFetchingPreviousPage}
            />
        </div>
    );
};

export default StateTable;