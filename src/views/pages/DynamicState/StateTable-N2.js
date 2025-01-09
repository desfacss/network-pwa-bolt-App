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

    //     // // ZUSTAND STORAGE RELATED
    //     // // const { items, filters, setFilters, pagination, setPagination } = useTableStore();
    //     // // const { currentPage, pageSize } = pagination;
    //     // const { items, setFilters, pagination, setPagination } = useTableStore();
    //     // const currentPage = pagination?.currentPage ?? 1; // Default to 1 if undefined
    //     // const pageSize = pagination?.pageSize ?? 5; // Default to 5 if undefined
    //     // // const { items, filters = {}, pagination = { currentPage: 1, pageSize: 5 } } = useTableStore();
    //     // const filters = {
    //     //     dateRange: filters?.dateRange ?? [dayjs().subtract(3, 'days'), dayjs()], // Default
    //     //   };
    //     // const [isOnline, setIsOnline] = useState(true);
    //     // const queryClient = useQueryClient();
    //     // const { addToQueue, queueStatus } = useSyncQueue();

    //     // // ZUSTAND STORAGE RELATED ENDS

    //     // // ZUSTAND STORAGE RELATED
    //     // const { items, filters, setFilters, pagination, setPagination } = useTableStore();
    //     // const currentPage = pagination?.currentPage ?? 1; // Default to 1 if undefined
    //     // const pageSize = pagination?.pageSize ?? 5; // Default to 5 if undefined
    //     // const dateRange = filters?.dateRange ?? [dayjs().subtract(3, 'days'), dayjs()]; // Default if undefined
    //     // const [isOnline, setIsOnline] = useState(true);
    //     // const queryClient = useQueryClient();
    //     // const { addToQueue, queueStatus } = useSyncQueue();
    //     // // ZUSTAND STORAGE RELATED ENDS

    //     // ZUSTAND STORAGE RELATED
    // // const store = useTableStore();
    // // const { items, setFilters, pagination } = store;
    // // const currentPage = pagination?.currentPage ?? 1; // Default to 1 if undefined
    // // const pageSize = pagination?.pageSize ?? 5; // Default to 5 if undefined
    // // const filters = store.filters ?? {}; // Ensure filters is always an object
    // // const dateRange = filters.dateRange ?? [dayjs().subtract(3, 'days'), dayjs()]; // Default if undefined
    // const [isOnline, setIsOnline] = useState(true);
    // const queryClient = useQueryClient();
    // const { addToQueue, queueStatus } = useSyncQueue();
    // // const setPagination = (newPagination) => store.setState({ pagination: newPagination });
    // const setCurrentPage = (newPagination) => {
    //     console.log("1. Updating pagination:", newPagination);
    //     store.setState({ pagination: newPagination });
    // };
    // // ZUSTAND STORAGE RELATED ENDS

    // SESSION STORAGE RELATED
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
    // SESSION STORAGE RELATED ENDS

    // ZUSTAND
    // useEffect(() => {
    //     console.log("Pagination state:", pagination);
    // }, [pagination]);
    // ZUSTAND

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

    const pageSize = 5; // COMMENTED FOR ZUSRAND FOR SESSION ITS NEEDED
    // const fetchData = async ({ pageParam = 1 }) => {
    const fetchData = async ({ pageParam = currentPage }) => {
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
        queryKey: ['data', filters], // correct for slice or all
        // queryKey: ['data', filters, currentPage], // correct for slice or all
        queryFn: fetchData,
        // want to check total or not
        getNextPageParam: (lastPage) => lastPage.pageParam + 1,
        getPreviousPageParam: (firstPage) => firstPage.pageParam > 1 ? firstPage.pageParam - 1 : undefined,
        initialPageParam: currentPage,
        // want to check total or not
        // getNextPageParam: (lastPage) => {
        //     const nextPage = lastPage.pageParam + 1;
        //     return nextPage <= Math.ceil(lastPage.total / pageSize) ? nextPage : undefined;
        // },
        // getPreviousPageParam: (firstPage) => {
        //     const prevPage = firstPage.pageParam - 1;
        //     return prevPage > 0 ? prevPage : undefined;
        // },

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

    // ZUSTAND RELATED ADDED Invalidate or not?
    // Ensure currentPage Sync:
    // useEffect(() => {
    //     queryClient.invalidateQueries('data');
    // }, [currentPage, queryClient]);
    // ZUSTAND RELATED ENDS

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

    // SESSION STORAGE RELATED
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
    // SESSION STORAGE RELATED ENDS

    // NOT WORKING FOR ZUSTAND

    // const onPaginationChange = useCallback((page, pageSize) => {
    //     console.log("P4. Pagination change requested for page:", page);
    //     setCurrentPage({ currentPage: page, pageSize: pageSize });  
    //     if (page > currentPage) {
    //         fetchNextPage({ pageParam: page });  // Use 'page' directly
    //     } else if (page < currentPage) {
    //         fetchPreviousPage({ pageParam: page }); // Use 'page' directly
    //     }
    // }, [currentPage, fetchNextPage, fetchPreviousPage, setCurrentPage]);
    // ZUSTAND STORAGE RELATED

    // Debounce pagination change to prevent multiple API calls on rapid clicks
    const debouncedPaginationChange = useCallback(
        debounce(onPaginationChange, 100),
        [onPaginationChange]
    );
    // Compute the items to display in the table
    // Recompute the dataSource when data.pages changes
    const allItems = useMemo(() =>
        data?.pages?.flatMap(page => page.items) || []
        // Check for data Existence:
        // data?.pages?.flatMap(page => page.items) ?? [] // this one is correct?
        , [data?.pages]);

    const totalCount = data?.pages?.[0]?.total || 0;
    const totalPages = Math.ceil(totalCount / pageSize);
    const curTotalPages = (currentPage * pageSize) + 1
    // const total = totalCount > curTotalPages ? curTotalPages : totalCount
    const total = Math.min(Math.max(allItems?.length, curTotalPages), totalCount)
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
                dataSource={isOnline ? allItems : items} // without queryKEY page
                // dataSource={isOnline ? allItems.slice((currentPage - 1) * pageSize, currentPage * pageSize) : items} // with KEY SPECIFIC current page
                rowKey={(record) => record.id}
                pagination={{
                    // simple: true,
                    // pageSizeOptions: ['5', '10', '20'],
                    pageSize: pageSize,
                    onChange: debouncedPaginationChange,
                    total: total, // Ensure this matches server-side total count
                    current: currentPage,
                    showSizeChanger: false
                }}
                loading={isLoading || isFetching || createMutation.isLoading || isFetchingNextPage || isFetchingPreviousPage}
            />
        </div>
    );
};

export default StateTable;