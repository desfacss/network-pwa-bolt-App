import React, { useCallback, useEffect, useState, memo } from 'react';
import { Table, DatePicker, Space, Button, Input, Form, Tag } from 'antd';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider
} from '@tanstack/react-query';
// import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
// import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { supabase } from 'configs/SupabaseConfig';
import useTableStore from './useTableStore';
// import { useSyncQueue } from './useSyncQueue';
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
// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       networkMode: 'offlineFirst', // Use offline first strategy
//       staleTime: 1000 * 60 * 1, // 1 minutes
//       // The staleTime of 5 minutes might be too long or too short depending on your application's data freshness requirements. If the data changes frequently, you might want a shorter staleTime to ensure users see updates sooner. If data changes less often, this might be fine
//       refetchOnWindowFocus: false,
//       // refetchOnWindowFocus: (query) => query.queryKey[0] === 'data', // Only refetch for 'data' queries - FOR BETTER CONTROL OF WHAT YOU WANT TO LOAD****
//       // Setting refetchOnWindowFocus to false means the app won't automatically refetch data when the user returns to the tab/window. This could lead to users seeing outdated information if they expect real-time or near real-time updates.
//     },
//   },
// });

// // Persist the QueryClient state
// const localStoragePersister = createSyncStoragePersister({ storage: window.localStorage });
// persistQueryClient({
//   queryClient,
//   persister: localStoragePersister,
// });

const DynState = () => {
  const {
    filters: storedFilters = {},
    pagination: { pageSize: storedPageSize = 5, currentPage: storedCurrentPage = 1 },
    setFilters,
    setPagination
  } = useTableStore();

  const queryKey = ['data', storedFilters, storedCurrentPage, storedPageSize];

  const [isOnline, setIsOnline] = useState(networkMonitor.isOnline());

  // useSyncQueue();

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

  useEffect(() => {
    const unsubscribe = networkMonitor.subscribe(setIsOnline);
    return () => unsubscribe();
  }, []);

  const onFinish = () => {
    const newItem = generateRandomData();
    newItem.isSynced = false; // Since it's not yet synced
    newItem.isPendingCreate = true; // Mark as pending creation
    createMutation.mutate(newItem);
  };

  const fetchData = async ({ pageParam = storedCurrentPage }) => {
    console.log("F1: Fetching data from Supabase with pageParam:", pageParam);
    console.log("F2: Calculated offset:", (pageParam - 1) * storedPageSize);

    let query = supabase
      .from('y_state')
      .select('*', { count: 'exact' });

    // PERFORMANCE IMPROVEMENTS - CONCEPT
    // Server-Side Filtering: If your dataset grows, consider implementing server-side filtering. This would mean updating your backend to support more complex queries. For instance, if your backend supports it, you could include more filters in your Supabase query:
    // javascript
    // let query = supabase
    //   .from('y_state')
    //   .select('*', { count: 'exact' });

    // if (storedFilters.name) {
    //   query = query.ilike('name', `%${storedFilters.name}%`);
    // }

    if (storedFilters.dateRange?.length === 2) {
      const [startDate, endDate] = storedFilters.dateRange.map(date => dayjs(date));
      const startIso = startDate.startOf('day').toISOString();
      const endIso = endDate.endOf('day').toISOString();
      query = query.gte('created_at', startIso).lte('created_at', endIso);
    }

    const offset = (pageParam - 1) * storedPageSize;
    const { data, error, count } = await query.range(offset, offset + storedPageSize - 1);

    if (error) {
      console.error('F3: Error fetching data:', error);
      return { items: [], total: count || 0, pageParam };
    }

    console.log("F4: Data fetched from Supabase:", data);
    return { items: data || [], total: count || 0, pageParam };
  };

  const {
    data,
    isLoading,
    fetchNextPage,
    fetchPreviousPage,
  } = useInfiniteQuery({
    queryKey,
    queryFn: fetchData,
    initialPageParam: storedCurrentPage,
    refetchOnReconnect: true, // Refetch when reconnecting to network
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = Math.ceil(lastPage.total / storedPageSize);
      return lastPage.pageParam < totalPages ? lastPage.pageParam + 1 : undefined;
    },
    getPreviousPageParam: (firstPage) => firstPage.pageParam > 1 ? firstPage.pageParam - 1 : undefined,
    enabled: isOnline,
    onSuccess: (data) => {
      console.log("F5: Query success:", data);
    },
    onError: (error) => {
      console.log("F6: Query error:", error);
    },
  });

  useEffect(() => {
    console.log("F7: Data updated:", data);
  }, [data]);
  useEffect(() => {
    // After mutation success (create/delete), refetch current page
    const currentData = data?.pages?.find(page => page.pageParam === storedCurrentPage);
    if (!currentData?.items?.length && storedCurrentPage > 1) {
      // If current page is empty and not first page, go to previous page
      setPagination({ currentPage: storedCurrentPage - 1, pageSize: storedPageSize });
    }
  }, [data, storedCurrentPage, storedPageSize, setPagination]);

  const allItems = data?.pages?.flatMap(page => page.items) || [];
  console.log("F8: allItems:", allItems);
  const totalCount = data?.pages?.[0]?.total ?? 0;

  const initialState = {
    id: 1,
    name: 'Example',
    isSynced: false,
    isPendingCreate: true,
    isPendingUpdate: false,
    isPendingDelete: false
  };

  const handleCreate = async (item) => {
    try {
      const { data, error } = await supabase
        .from('y_state')
        .insert([{ ...item, isSynced: true, isPendingCreate: false }])
        .select();

      if (error) {
        throw new Error(error.message);
      }
      return data[0]; // Return the created item
    } catch (error) {
      console.error('Error creating item:', error);
      throw error;
    }
  };

  const syncData = async () => {
    // Fetch all items that need syncing
    const itemsToSync = queryClient.getQueryData(queryKey).pages.flatMap(page => page.items.filter(item =>
      item.isPendingCreate || item.isPendingUpdate || item.isPendingDelete
    ));

    for (const item of itemsToSync) {
      if (item.isPendingCreate) {
        await handleCreate(item);
      } else if (item.isPendingUpdate) {
        await handleUpdate(item);
      } else if (item.isPendingDelete) {
        await handleDelete(item.id);
      }
      // Update the item in the cache to reflect it's now synced
      item.isSynced = true;
      item.isPendingCreate = false;
      item.isPendingUpdate = false;
      item.isPendingDelete = false;
      queryClient.setQueryData(queryKey, /* ... */); // Update cache accordingly
    }
  };

  useEffect(() => {
    if (isOnline) {
      syncData();
    }
  }, [isOnline]);

  const columns = [
    {
      title: 'Status',
      key: 'status',
      render: (text, record) => {
        if (record.isPendingCreate) return <Tag color="green">New</Tag>;
        if (record.isPendingUpdate) return <Tag color="blue">Updated</Tag>;
        if (record.isPendingDelete) return <Tag color="red">Deleted</Tag>;
        return <Tag color="default">Synced</Tag>;
      },
    },
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
          {/* <Button disabled={!isOnline} onClick={() => handleUpdate(record)}>Update</Button>
          <Button disabled={!isOnline} onClick={() => handleDelete(record.id)}>Delete</Button> */}
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

  // Helper function to find the page where the item is
  const findPageForItem = (id) => {
    return data?.pages?.findIndex(page => page.items.some(item => item.id === id)) + 1 || storedCurrentPage;
  };

  const createMutation = useMutation({
    mutationFn: async (item) => {
      console.log("A1: Attempting to save item to Supabase:", item);
      const { data, error } = await supabase.from('y_state').insert([item]).select('*');
      if (error) {
        console.error('A2: Error saving to Supabase:', error);
        throw new Error(error.message);
      }
      console.log("A3: Item saved to Supabase:", data[0]);
      return data[0];
    },
    onSettled: (newItem, error) => {
      if (!error) {
        const page = findPageForItem(newItem.id);
        // queryClient.invalidateQueries(queryKey, { exact: true });
        // console.log("A4: Query invalidated after item creation");
      } else {
        console.log("A5: Error in mutation settled:", error);
      }
    },
    onMutate: async (newItem) => {
      newItem.isPendingCreate = true;
      newItem.isSynced = false;
      // newItem.syncStatus = isOnline ? SYNC_STATUS.SYNCED : SYNC_STATUS.PENDING;
      console.log("A6: Saving new item to cache offline:", newItem);
      await queryClient.cancelQueries(queryKey);
      const previousItems = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old) => ({
        pages: old?.pages?.map(page => ({
          ...page,
          items: [...(page.items || []), newItem]
        })) || [],
        pageParams: old?.pageParams || []
      }));
      console.log("A7: Cache updated with new item:", queryClient.getQueryData(queryKey));
      return { previousItems };
    },
    onError: (err, newItem, context) => {
      console.log("A8: Mutation error for new item creation:", err);
      if (context && context.previousItems) {
        queryClient.setQueryData(queryKey, context.previousItems);
        console.log("A9: Cache reverted after mutation error");
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (item) => {
      console.log("U1: Attempting to update item in Supabase:", item);
      const { data, error } = await supabase.from('y_state').update({ name: `${item.name}-updated` }).eq('id', item.id).select('*');
      if (error) {
        console.error('U2: Error updating in Supabase:', error);
        throw new Error(error.message);
      }
      console.log("U3: Item updated in Supabase:", data[0]);
      return data[0];
    },
    onSettled: (updatedItem, error) => {
      if (!error) {
        const page = findPageForItem(updatedItem.id);
        // queryClient.invalidateQueries(queryKey, { exact: true });
        // console.log("U4: Query invalidated after item update");
      } else {
        console.log("U5: Error in mutation settled for update:", error);
      }
    },
    onMutate: async (updatedItem) => {
      updatedItem.isPendingUpdate = true;
      updatedItem.isSynced = false;
      // updatedItem.syncStatus = isOnline ? SYNC_STATUS.SYNCED : SYNC_STATUS.PENDING;
      console.log("U6: Updating item in cache offline:", updatedItem);
      await queryClient.cancelQueries(queryKey);
      const previousItems = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old) => ({
        pages: old?.pages?.map(page => ({
          ...page,
          items: page.items.map(item =>
            item.id === updatedItem.id ? { ...item, name: `${updatedItem.name}-updated` } : item
          )
        })) || [],
        pageParams: old?.pageParams || []
      }));
      console.log("U7: Cache updated with item update:", queryClient.getQueryData(queryKey));
      return { previousItems };
    },
    onError: (err, updatedItem, context) => {
      console.log("U8: Mutation error for item update:", err);
      if (context && context.previousItems) {
        queryClient.setQueryData(queryKey, context.previousItems);
        console.log("U9: Cache reverted after update mutation error");
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      console.log("D1: Attempting to delete item from Supabase with id:", id);
      const { error } = await supabase.from('y_state').delete().eq('id', id);
      if (error) {
        console.error('D2: Error deleting from Supabase:', error);
        throw new Error(error.message);
      }
      console.log("D3: Item deleted from Supabase with id:", id);
      return id;
    },
    onSettled: (deletedId, error) => {
      if (!error) {
        const page = findPageForItem(deletedId);
        // queryClient.invalidateQueries(queryKey, { exact: true });
        // console.log("D4: Query invalidated after item deletion");
      } else {
        console.log("D5: Error in mutation settled for deletion:", error);
      }
    },
    onMutate: async (id) => {
      const item = allItems.find(item => item.id === id);
      if (item) {
        item.isPendingDelete = true;
        item.isSynced = false;
      }
      // newItem.syncStatus = isOnline ? SYNC_STATUS.SYNCED : SYNC_STATUS.PENDING;
      console.log("D6: Deleting item from cache offline with id:", id);
      await queryClient.cancelQueries(queryKey);
      const previousItems = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old) => ({
        pages: old?.pages?.map(page => ({
          ...page,
          items: page.items.filter(item => item.id !== id)
        })) || [],
        pageParams: old?.pageParams || []
      }));
      console.log("D7: Cache updated after item deletion:", queryClient.getQueryData(queryKey));
      return { previousItems };
    },
    onError: (err, id, context) => {
      console.log("D8: Mutation error for item deletion:", err);
      if (context && context.previousItems) {
        queryClient.setQueryData(queryKey, context.previousItems);
        console.log("D9: Cache reverted after delete mutation error");
      }
    },
  });

  const handleUpdate = (record) => {
    updateMutation.mutate(record);
  };

  const handleDelete = (id) => {
    deleteMutation.mutate(id);
  };

  const debouncedOnDateRangeChange = useCallback(
    debounce((dates) => {
      setFilters({ ...storedFilters, dateRange: dates ? dates.map(date => dayjs(date)) : [] });
    }, 500),
    [storedFilters, setFilters]
  );

  return (
    <div style={{ padding: 20 }}>
      {/* Show network status */}
      <div>Network Status: {isOnline ? "Online" : "Offline"}</div>

      <div style={{ padding: 20 }}>
        <div>{isOnline ? "Online" : "Offline - Data might be out of date"}</div>
      </div>
      {/* Rest of the component */}
      <Space style={{ marginBottom: 20 }}>
        {/* // Use this debounced function in your component */}
        <RangePicker onChange={debouncedOnDateRangeChange} value={storedFilters.dateRange?.map(date => dayjs(date))} allowClear />
        {/* <RangePicker onChange={onDateRangeChange} value={storedFilters.dateRange?.map(date => dayjs(date))} allowClear /> */}
        <Button onClick={() => queryClient.invalidateQueries(queryKey)}>Apply Filters</Button>
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

const DynStateWithProvider = memo(() => (
  <DynState />
));

export default DynStateWithProvider;