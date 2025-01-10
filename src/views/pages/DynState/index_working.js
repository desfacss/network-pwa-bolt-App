import React, { useCallback, useEffect } from 'react';
import { Table, DatePicker, Space, Button, Input, Form } from 'antd';
import { 
  useInfiniteQuery, 
  useMutation, 
  useQueryClient, 
  QueryClient, 
  QueryClientProvider 
} from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { supabase } from 'api/supabaseClient';
import useTableStore from './useTableStore';
import { useSyncQueue } from './useSyncQueue';
import { networkMonitor } from '../../../services/networkMonitor';
import dayjs from 'dayjs';
import { debounce } from 'lodash';

// Define the logging flag
let isLoggingEnabled = true;

// Override console.log based on the logging flag
if (!isLoggingEnabled) {
  console.log = () => {};
}

const { RangePicker } = DatePicker;

// Setup QueryClient with persistence
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: 'offlineFirst', // Use offline first strategy
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Persist the QueryClient state
const localStoragePersister = createSyncStoragePersister({ storage: window.localStorage });
persistQueryClient({
  queryClient,
  persister: localStoragePersister,
});

const DynState = () => {
  const { 
    filters: storedFilters = {}, 
    pagination: { pageSize: storedPageSize = 5, currentPage: storedCurrentPage = 1 },
    setFilters,
    setPagination
  } = useTableStore();

  useSyncQueue();

  const queryClient = useQueryClient();

  useEffect(() => {
    setPagination({ currentPage: 1, pageSize: storedPageSize });
  }, [storedFilters]); // Reset page to 1 when filters change

  // Function to generate random data
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

  // Fetch data function for both online and offline scenarios
  const fetchData = async ({ pageParam = storedCurrentPage }) => {
    console.log("Fetching data with pageParam:", pageParam);
    console.log("Calculated offset:", (pageParam - 1) * storedPageSize);

    let query = supabase
      .from('y_state')
      .select('*', { count: 'exact' }); // Fetch all fields

    // Date handling in fetchData function
    if (storedFilters.dateRange?.length === 2) {
      // Debug logs to verify stored date objects
      console.log('Stored date range:', storedFilters.dateRange);
      console.log('Are stored dates dayjs objects?', storedFilters.dateRange.map(date => dayjs.isDayjs(date)));
      // Explicit conversion back to dayjs objects since Dates are stored as ISO strings in localStorage and We need dayjs objects for date operations
      const [startDate, endDate] = storedFilters.dateRange.map(date => dayjs(date));
      console.log('Converted dates:', { startDate, endDate });
      // Create ISO strings for database query
      const startIso = startDate.startOf('day').toISOString();
      const endIso = endDate.endOf('day').toISOString();
      query = query.gte('created_at', startIso).lte('created_at', endIso);
    }

    const offset = (pageParam - 1) * storedPageSize;
    const { data, error, count } = await query.range(offset, offset + storedPageSize - 1);

    if (error) {
      console.error('Error fetching data:', error);
      return { items: [], total: count || 0, pageParam }; // Keep count if available for accurate pagination
    }

    console.log("Query URL:", query.uri); // Log after query is constructed for accuracy
    return { items: data || [], total: count || 0, pageParam };
  };
  // // Fetch data function for both online and offline scenarios
  // const fetchData = async ({ pageParam = storedCurrentPage }) => {

  //   console.log("Fetching data with pageParam:", pageParam);
  //   console.log("Calculated offset:", (pageParam - 1) * storedPageSize);
  //   console.log("Query URL:", query.uri);
  //   let query = supabase
  //     .from('y_state')
  //     .select('*', { count: 'exact' }); // Fetch all fields

      

  //   // if (storedFilters.dateRange?.length === 2) {
  //   //   const [startDate, endDate] = storedFilters.dateRange.map(date => dayjs(date));
  //   //   const startIso = startDate.startOf('day').toISOString();
  //   //   const endIso = endDate.endOf('day').toISOString();
  //   //   query = query.gte('created_at', startIso).lte('created_at', endIso);
  //   // }

  //   // Date handling in fetchData function
  //   if (storedFilters.dateRange?.length === 2) {
  //     // Debug logs to verify stored date objects
  //     console.log('Stored date range:', storedFilters.dateRange);
  //     console.log('Are stored dates dayjs objects?', storedFilters.dateRange.map(date => dayjs.isDayjs(date)));
  //     // Explicit conversion back to dayjs objects since Dates are stored as ISO strings in localStorage and We need dayjs objects for date operations
  //     const [startDate, endDate] = storedFilters.dateRange.map(date => dayjs(date));
  //     console.log('Converted dates:', { startDate, endDate });
  //     // Create ISO strings for database query
  //     const startIso = startDate.startOf('day').toISOString();
  //     const endIso = endDate.endOf('day').toISOString();
  //     query = query.gte('created_at', startIso).lte('created_at', endIso);
  //   }

  //   const offset = (pageParam - 1) * storedPageSize;
  //   const { data, error, count } = await query.range(offset, offset + storedPageSize - 1);

  //   if (error) {
  //     console.error('Error fetching data:', error);
  //     return { items: [], total: 0, pageParam };
  //   }

  //   return { items: data || [], total: count || 0, pageParam };
  // };

  // const { 
  //   data, 
  //   isLoading, 
  //   fetchNextPage, 
  //   fetchPreviousPage,
  // } = useInfiniteQuery({
  //   queryKey: ['data', storedFilters, storedCurrentPage],
  //   queryFn: fetchData,
  //   initialPageParam: storedCurrentPage,
  //   getNextPageParam: (lastPage) => {
  //     const nextOffset = lastPage.pageParam * storedPageSize;
  //     return nextOffset < lastPage.total ? lastPage.pageParam + 1 : undefined;
  //   },
  //   getPreviousPageParam: (firstPage) => firstPage.pageParam > 1 ? firstPage.pageParam - 1 : undefined,
  //   enabled: networkMonitor.isOnline(), // Only fetch when online
  // });

  const { 
    data, 
    isLoading, 
    fetchNextPage, 
    fetchPreviousPage,
  } = useInfiniteQuery({
    queryKey: ['data', storedFilters, storedCurrentPage],
    queryFn: fetchData,
    initialPageParam: storedCurrentPage,
    getNextPageParam: (lastPage) => {
      const nextOffset = lastPage.pageParam * storedPageSize;
      const nextPage = lastPage.total > nextOffset ? lastPage.pageParam + 1 : undefined;
      console.log("Next page param calculated:", nextPage);
      return nextPage;
    },
    getPreviousPageParam: (firstPage) => {
      const previousPage = firstPage.pageParam > 1 ? firstPage.pageParam - 1 : undefined;
      console.log("Previous page param calculated:", previousPage);
      return previousPage;
    },
    enabled: networkMonitor.isOnline(), // Only fetch when online
    onSuccess: (data) => {
      console.log("Query success:", data);
    },
    onError: (error) => {
      console.log("Query error:", error);
    },
  });


  const allItems = data?.pages?.find(page => page.pageParam === storedCurrentPage)?.items || [];

  const totalCount = data?.pages?.[0]?.total ?? 0;

  // Define table columns
  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    { title: 'Created At', dataIndex: 'created_at', key: 'created_at' },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle" key={record.id}>
          <Button onClick={() => handleUpdate(record)}>Update</Button>
          <Button onClick={() => handleDelete(record.id)}>Delete</Button>
        </Space>
      ),
    },
  ];

  // Handle date range changes for filtering
  const onDateRangeChange = (dates) => {
    // Debug logs to verify incoming date objects
    console.log('Raw dates from RangePicker:', dates);
    console.log('Are dates dayjs objects?', dates?.map(date => dayjs.isDayjs(date)));
    
    // Always convert to dayjs objects before storing
    // This is necessary because:
    // 1. We want consistent date handling throughout the app
    // 2. Dates will be serialized to strings when stored in localStorage via Zustand persist
    setFilters({ ...storedFilters, dateRange: dates ? dates.map(date => dayjs(date)) : [] });
  };

  // Handle pagination change
  const onPaginationChange = useCallback((page, newPageSize) => {
    setPagination({ currentPage: page, pageSize: newPageSize });
    if (page > storedCurrentPage) {
      fetchNextPage({ pageParam: page });
    } else if (page < storedCurrentPage) {
      fetchPreviousPage({ pageParam: page });
    }
  }, [storedCurrentPage, fetchNextPage, fetchPreviousPage, setPagination]);

  // Mutations for CRUD operations
  const createMutation = useMutation({
    mutationFn: async (item) => {
      const { data, error } = await supabase.from('y_state').insert([item]).select('*');
      if (error) throw new Error(error.message);
      return data[0];
    },
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: ['data', storedFilters] });
      const previousItems = queryClient.getQueryData(['data', storedFilters]);
      queryClient.setQueryData(['data', storedFilters], (old) => ({
        pages: old?.pages?.map(page => ({
          ...page,
          items: [...page.items, newItem]
        })) || [],
        pageParams: old?.pageParams || []
      }));
      return { previousItems };
    },
    onError: (err, newItem, context) => {
      queryClient.setQueryData(['data', storedFilters], context.previousItems);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['data', storedFilters]);
    },
  });

  // Update mutation with only name change
  const updateMutation = useMutation({
    mutationFn: async (item) => {
      const { data, error } = await supabase.from('y_state').update({ name: `${item.name}-updated` }).eq('id', item.id).select('*');
      if (error) throw new Error(error.message);
      return data[0];
    },
    onMutate: async (updatedItem) => {
      await queryClient.cancelQueries({ queryKey: ['data', storedFilters] });
      const previousItems = queryClient.getQueryData(['data', storedFilters]);
      queryClient.setQueryData(['data', storedFilters], (old) => ({
        pages: old?.pages?.map(page => ({
          ...page,
          items: page.items.map(item => item.id === updatedItem.id ? { ...item, name: `${updatedItem.name}-updated` } : item)
        })) || [],
        pageParams: old?.pageParams || []
      }));
      return { previousItems };
    },
    onError: (err, updatedItem, context) => {
      queryClient.setQueryData(['data', storedFilters], context.previousItems);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['data', storedFilters]);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('y_state').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['data', storedFilters] });
      const previousItems = queryClient.getQueryData(['data', storedFilters]);
      queryClient.setQueryData(['data', storedFilters], (old) => ({
        pages: old?.pages?.map(page => ({
          ...page,
          items: page.items.filter(item => item.id !== id)
        })) || [],
        pageParams: old?.pageParams || []
      }));
      return { previousItems };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['data', storedFilters], context.previousItems);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['data', storedFilters]);
    },
  });

  const handleUpdate = (record) => {
    updateMutation.mutate(record);
  };

  const handleDelete = (id) => {
    deleteMutation.mutate(id);
  };

  return (
    <div style={{ padding: 20 }}>
      <Space style={{ marginBottom: 20 }}>
        {/* <RangePicker onChange={onDateRangeChange} value={storedFilters.dateRange} allowClear /> */}
        <RangePicker onChange={onDateRangeChange} value={storedFilters.dateRange?.map(date => date ? dayjs(date) : null)} allowClear />
        <Button onClick={() => queryClient.invalidateQueries('data')}>Apply Filters</Button>
      </Space>

      <Form onFinish={onFinish}>
        <Form.Item>
          <Button type="primary" htmlType="submit">Add Row</Button>
        </Form.Item>
      </Form>

      <Table
        columns={columns}
        dataSource={isLoading ? [] : allItems}
        rowKey="id"
        pagination={{
          pageSize: storedPageSize,
          current: storedCurrentPage,
          total: totalCount,
          onChange: onPaginationChange,
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '25', '50']
        }}
        loading={isLoading}
      />
    </div>
  );
};

// Wrap the component with QueryClientProvider to make queryClient available
const DynStateWithProvider = () => (
  <QueryClientProvider client={queryClient}>
    <DynState />
  </QueryClientProvider>
);

export default DynStateWithProvider;