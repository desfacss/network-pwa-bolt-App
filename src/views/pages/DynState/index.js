import React, { useCallback, useEffect, useState } from 'react';
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
  console.log = () => { };
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

  // *************
  const [isOnline, setIsOnline] = useState(true);
  // const debouncedInvalidate = useCallback(
  //   debounce(() => {
  //     console.log("A0.1. Invalidating queries due to network change");
  //     queryClient.invalidateQueries('data');
  //   }, 500),
  //   [queryClient]
  // );
  // *************
  useSyncQueue();

  const queryClient = useQueryClient();

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

  // *************
  useEffect(() => {
    const handleNetworkChange = (state) => {
      console.log("A0. Network status changed to:", state);
      if (state !== isOnline) {
        setIsOnline(state);
        // if (state) {
        //   debouncedInvalidate();
        // }
      }
    };

    const unsubscribe = networkMonitor.subscribe(handleNetworkChange);

    return () => {
      console.log("A0.2. Cleaning up network status listener");
      unsubscribe();
      // debouncedInvalidate.cancel();
    };
  }, [isOnline]);
  // *************

  const onFinish = () => {
    const values = generateRandomData();
    createMutation.mutate(values);
  };

  const fetchData = async ({ pageParam = storedCurrentPage }) => {
    console.log("Fetching data with pageParam:", pageParam);
    console.log("Calculated offset:", (pageParam - 1) * storedPageSize);

    let query = supabase
      .from('y_state')
      .select('*', { count: 'exact' });

    if (storedFilters.dateRange?.length === 2) {
      const [startDate, endDate] = storedFilters.dateRange.map(date => dayjs(date));
      const startIso = startDate.startOf('day').toISOString();
      const endIso = endDate.endOf('day').toISOString();
      query = query.gte('created_at', startIso).lte('created_at', endIso);
    }

    const offset = (pageParam - 1) * storedPageSize;
    const { data, error, count } = await query.range(offset, offset + storedPageSize - 1);

    if (error) {
      console.error('Error fetching data:', error);
      return { items: [], total: count || 0, pageParam };
    }

    return { items: data || [], total: count || 0, pageParam };
  };

  const {
    data,
    isLoading,
    fetchNextPage,
    fetchPreviousPage,
  } = useInfiniteQuery({
    queryKey: ['data', storedFilters, storedCurrentPage],
    queryFn: fetchData,
    initialPageParam: storedCurrentPage,
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = Math.ceil(lastPage.total / storedPageSize);
      return lastPage.pageParam < totalPages ? lastPage.pageParam + 1 : undefined;
    },
    getPreviousPageParam: (firstPage) => firstPage.pageParam > 1 ? firstPage.pageParam - 1 : undefined,
    //******  enabled: networkMonitor.isOnline(),
    enabled: isOnline,
    onSuccess: (data) => {
      console.log("Query success:", data);
    },
    onError: (error) => {
      console.log("Query error:", error);
    },
  });

  // const { 
  //   data, 
  //   isLoading, 
  //   fetchNextPage, 
  //   fetchPreviousPage,
  // } = useInfiniteQuery({
  //   queryKey: ['data', storedFilters, storedCurrentPage],
  //   queryFn: fetchData,
  //   initialPageParam: storedCurrentPage,
  //   getNextPageParam: (lastPage, allPages) => {
  //     const totalPages = Math.ceil(lastPage.total / storedPageSize);
  //     return lastPage.pageParam < totalPages ? lastPage.pageParam + 1 : undefined;
  //   },
  //   getPreviousPageParam: (firstPage) => firstPage.pageParam > 1 ? firstPage.pageParam - 1 : undefined,
  //   enabled: networkMonitor.isOnline(),
  // });

  useEffect(() => {
    // After mutation success (create/delete), refetch current page
    const currentData = data?.pages?.find(page => page.pageParam === storedCurrentPage);
    if (!currentData?.items?.length && storedCurrentPage > 1) {
      // If current page is empty and not first page, go to previous page
      setPagination({ currentPage: storedCurrentPage - 1, pageSize: storedPageSize });
    }
  }, [data, storedCurrentPage, storedPageSize, setPagination]);

  const allItems = data?.pages?.flatMap(page => page.items) || [];
  console.log("allItems:", allItems);
  const totalCount = data?.pages?.[0]?.total ?? 0;

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

  const onDateRangeChange = (dates) => {
    setFilters({ ...storedFilters, dateRange: dates ? dates.map(date => dayjs(date)) : [] });
  };

  const onPaginationChange = useCallback((page, newPageSize) => {
    setPagination({ currentPage: page, pageSize: newPageSize });
    if (page !== storedCurrentPage) {
      if (page > storedCurrentPage) {
        fetchNextPage({ pageParam: page });
      } else {
        fetchPreviousPage({ pageParam: page });
      }
    }
  }, [storedCurrentPage, fetchNextPage, fetchPreviousPage, setPagination]);

  const createMutation = useMutation({
    mutationFn: async (item) => {
      const { data, error } = await supabase.from('y_state').insert([item]).select('*');
      if (error) throw new Error(error.message);
      return data[0];
    },
    onSettled: () => {
      queryClient.invalidateQueries(['data', storedFilters]);
    },
    onMutate: async (newItem) => {
      console.log("Optimistic update for create:", newItem)
      await queryClient.cancelQueries(['data', storedFilters]);
      console.log("Current cache after mutation:", queryClient.getQueryData(['data', storedFilters]));
      const previousItems = queryClient.getQueryData(['data', storedFilters]);
      queryClient.setQueryData(['data', storedFilters], (old) => ({
        pages: old?.pages?.map(page => ({
          ...page,
          items: [...page.items, newItem]
        })) || [],
        pageParams: old?.pageParams || []
      }));
      console.log("Optimistic update for create2:", previousItems)
      return { previousItems };
    },
  });


  // const updateMutation = useMutation({
  //   mutationFn: async (item) => {
  //     const { data, error } = await supabase.from('y_state').update({ name: `${item.name}-updated` }).eq('id', item.id).select('*');
  //     if (error) throw new Error(error.message);
  //     return data[0];
  //   },
  //   onSettled: () => {
  //     queryClient.invalidateQueries(['data', storedFilters]);
  //   },
  // });

  const updateMutation = useMutation({
    mutationFn: async (item) => {
      const { data, error } = await supabase.from('y_state').update({ name: `${item.name}-updated` }).eq('id', item.id).select('*');
      if (error) throw new Error(error.message);
      return data[0];
    },
    onSettled: () => {
      queryClient.invalidateQueries(['data', storedFilters]);
    },
    onMutate: async (updatedItem) => {
      await queryClient.cancelQueries(['data', storedFilters]);
      const previousItems = queryClient.getQueryData(['data', storedFilters]);
      queryClient.setQueryData(['data', storedFilters], (old) => ({
        pages: old?.pages?.map(page => ({
          ...page,
          items: page.items.map(item =>
            item.id === updatedItem.id ? { ...item, name: `${updatedItem.name}-updated` } : item
          )
        })) || [],
        pageParams: old?.pageParams || []
      }));
      return { previousItems };
    },
  });

  // const deleteMutation = useMutation({
  //   mutationFn: async (id) => {
  //     const { error } = await supabase.from('y_state').delete().eq('id', id);
  //     if (error) throw new Error(error.message);
  //     return id;
  //   },
  //   onSettled: () => {
  //     queryClient.invalidateQueries(['data', storedFilters]);
  //   },
  // });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('y_state').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return id;
    },
    onSettled: () => {
      queryClient.invalidateQueries(['data', storedFilters]);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries(['data', storedFilters]);
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
        <RangePicker onChange={onDateRangeChange} value={storedFilters.dateRange?.map(date => dayjs(date))} allowClear />
        <Button onClick={() => queryClient.invalidateQueries(['data', storedFilters])}>Apply Filters</Button>
      </Space>

      <Form onFinish={onFinish}>
        <Form.Item>
          <Button type="primary" htmlType="submit">Add Row</Button>
        </Form.Item>
      </Form>

      <Table
        columns={columns}
        dataSource={allItems}
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

const DynStateWithProvider = () => (
  <QueryClientProvider client={queryClient}>
    <DynState />
  </QueryClientProvider>
);

export default DynStateWithProvider;