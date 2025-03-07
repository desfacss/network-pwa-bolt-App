import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Table, DatePicker, Space, Button, Input, Form } from 'antd';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from 'configs/SupabaseConfig';
import useTableStore from 'state/stores/useGenericDomainTable';
import dayjs from 'dayjs';
import { debounce } from 'lodash';

const { RangePicker } = DatePicker;

const StateTable = () => {
  // Using Zustand store with fallback values
  const {
    pageSize: storedPageSize = 5, // Default to 5 if not set in store
    currentPage: storedCurrentPage = 1, // Default to 1 if not set in store
    setPagination: storedSetPagination,
    filters: storedFilters = {},
  } = useTableStore();

  // Fallback for pagination state
  const [localCurrentPage, setLocalCurrentPage] = useState(storedCurrentPage);
  const [localPageSize, setLocalPageSize] = useState(storedPageSize);
  const [localFilters, setLocalFilters] = useState(storedFilters);

  // Unified pagination setter with fallback
  const setPagination = useCallback((newPagination) => {
    console.log("Updating pagination:", newPagination);
    if (storedSetPagination) {
      storedSetPagination(newPagination);
    } else {
      // Local fallback
      setLocalCurrentPage(newPagination.currentPage || localCurrentPage);
      setLocalPageSize(newPagination.pageSize || localPageSize);
    }
  }, [storedSetPagination, localCurrentPage, localPageSize]);

  // Use these values in the component
  const pageSize = storedSetPagination ? storedPageSize : localPageSize;
  const currentPage = storedSetPagination ? storedCurrentPage : localCurrentPage;
  const filters = storedSetPagination ? storedFilters : localFilters;

  // Date range from filters
  const dateRange = filters.dateRange || [dayjs().subtract(3, 'days'), dayjs()];

  const fetchData = async ({ pageParam = currentPage }) => {
    console.log("Fetching data for page:", pageParam);
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
      console.error('Error fetching data:', error);
      return { items: [], total: 0, pageParam }; // Return empty data instead of throwing
    }

    console.log("Data fetched:", data);
    console.log("Total count:", count);

    return { items: data || [], total: count || 0, pageParam };
  };

  const queryClient = useQueryClient();

  // Use Infinite Query for pagination
  const {
    data,
    isLoading,
    isFetching,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
  } = useInfiniteQuery({
    queryKey: ['data', filters, currentPage],
    queryFn: fetchData,
    initialPageParam: currentPage,
    getNextPageParam: (lastPage) => {
      const nextOffset = lastPage.pageParam * pageSize;
      return nextOffset < lastPage.total ? lastPage.pageParam + 1 : undefined;
    },
    getPreviousPageParam: (firstPage) => firstPage.pageParam > 1 ? firstPage.pageParam - 1 : undefined,
    cacheTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      console.log("Query Success:", data);
    },
    onError: (error) => {
      console.error("Query Error:", error);
    }
  });

  // Log query data for debugging
  useEffect(() => {
    console.log("Infinite Query Data:", data);
  }, [data]);

  // Handle pagination change
  const onPaginationChange = useCallback((page, newPageSize) => {
    console.log("Pagination change requested for page:", page, "with size:", newPageSize);
    setPagination({ currentPage: page, pageSize: newPageSize });
    if (page > currentPage) {
      fetchNextPage({ pageParam: page });
    } else if (page < currentPage) {
      fetchPreviousPage({ pageParam: page });
    }
  }, [currentPage, fetchNextPage, fetchPreviousPage, setPagination]);

  // Debounce pagination change
  const debouncedPaginationChange = useCallback(
    debounce(onPaginationChange, 100),
    [onPaginationChange]
  );

  // Compute items for table
  const allItems = useMemo(() =>
    data?.pages?.flatMap(page => page.items) || [],
    [data?.pages]);

  console.log("All items for table:", allItems);

  const totalCount = data?.pages?.[0]?.total || 0;

  // Define table columns
  const columns = useMemo(() => [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Updated Date', dataIndex: 'updated_at', key: 'updated_at' },
    {
      title: 'Action',
      dataIndex: '',
      key: 'action',
      render: (_, record) => (
        <Space size="middle" key={record.id}>
          <Button onClick={() => handleUpdate(record)}>Update</Button>
          <Button onClick={() => handleDelete(record.id)}>Delete</Button>
        </Space>
      ),
    },
  ], []);

  // Handle date range changes for filtering
  const onDateRangeChange = (dates) => {
    console.log("Date range changed:", dates);
    const newFilters = { ...filters, dateRange: dates ? dates.map(date => dayjs(date)) : [] };
    if (storedSetPagination) {
      useTableStore.setState({ filters: newFilters });
    } else {
      setLocalFilters(newFilters);
    }
  };

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

  // Mutations for CRUD operations
  const createMutation = useMutation({
    mutationFn: async (item) => {
      const { data, error } = await supabase.from('y_state').insert([item]).select('*');
      if (error) {
        throw new Error(error.message);
      }
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['data', filters, currentPage]);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (item) => {
      const { data, error } = await supabase.from('y_state').update(item).eq('id', item.id);
      if (error) {
        throw new Error(error.message);
      }
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['data', filters, currentPage]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      console.log("Deleting item with ID:", id); // Add this log to verify the ID being passed
      const { error } = await supabase.from('y_state').delete().eq('id', id);
      if (error) {
        console.error("Delete Error:", error);
        throw new Error(error.message);
      }
      return id;
    },
    onSuccess: () => {
      console.log("Delete successful, invalidating queries");
      queryClient.invalidateQueries(['data', filters, currentPage]);
    },
    onError: (error) => {
      console.error("Mutation error:", error);
    }
  });

  // Handle update
  const handleUpdate = (record) => {
    const updatedData = { ...record, name: `Updated Name ${record.id}` }; // Example update
    updateMutation.mutate(updatedData);
  };

  // Handle delete
  const handleDelete = (id) => {
    deleteMutation.mutate(id);
  };

  return (
    <div style={{ padding: 20 }}>
      <Space style={{ marginBottom: 20 }}>
        <RangePicker
          onChange={onDateRangeChange}
          value={dateRange}
          allowClear
        />
        <Button type="primary" onClick={() => queryClient.invalidateQueries('data')}>
          Apply Filters
        </Button>
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
        dataSource={allItems}
        rowKey={(record) => record.id}
        pagination={{
          pageSize: pageSize,
          onChange: debouncedPaginationChange,
          total: totalCount,
          current: currentPage,
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '25', '50']
        }}
        loading={isLoading || isFetching}
      />
    </div>
  );
};

export default StateTable;