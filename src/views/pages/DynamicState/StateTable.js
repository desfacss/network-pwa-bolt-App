//#dynamicState/index.js
import React, { useState, useEffect } from 'react';
import { Table, DatePicker, Space, Button, Input, Form } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from 'api/supabaseClient';
import { syncQueue } from 'state/services/offline/syncQueue';
import useTableStore from 'state/stores/useTable';
import { networkMonitor } from 'state/services/offline/networkMonitor';

const { RangePicker } = DatePicker;

const StateTable = () => {
    const { items, filters, pagination, setItems, setFilters, setPagination, addItem, updateItem, deleteItem } = useTableStore();
    const [isOnline, setIsOnline] = useState(true);
    const queryClient = useQueryClient();

    useEffect(() => {
        const unsubscribe = networkMonitor.onOnline(state => {
            setIsOnline(state);
            if (state) {
                queryClient.invalidateQueries('data'); // Refetch data when back online
            }
        });
        return () => unsubscribe();
    }, [queryClient]);

    const fetchData = async ({ queryKey }) => {
        const [, filters, pagination] = queryKey;
        let query = supabase
            .from('y_state')
            .select('*', { count: 'exact' });
    
        if (filters.dateRange && filters.dateRange.length === 2) {
            const [startDate, endDate] = filters.dateRange;
            const startIso = startDate.startOf('day').toISOString().split('T')[0]; // Only the date part
            const endIso = endDate.endOf('day').toISOString().split('T')[0];       // Only the date part
    
            // Assuming 'updated_at' can be either '2025-01-06 13:21:02' or '2025-01-06T13:21:02.173985'
            query = query
                .gte('updated_at', `${startIso} 00:00:00`) // Start of day
                .lte('updated_at', `${endIso} 23:59:59`);  // End of day
        }
    
        query = query.range((pagination.current - 1) * pagination.pageSize, pagination.current * pagination.pageSize - 1);
    
        const { data, error, count } = await query;
    
        if (error) throw new Error(error.message);
    
        return { items: data, total: count };
    };

    const { data, isLoading } = useQuery({
        queryKey: ['data', filters, pagination], 
        queryFn: fetchData,
    });

    const createMutation = useMutation({
        mutationFn: async (newItem) => {
            if (isOnline) {
                const { data, error } = await supabase.from('y_state').insert([newItem]);
                if (error) throw new Error(error.message);
                return data[0];
            } else {
                const item = { ...newItem, id: Math.random().toString(36).substr(2, 9) };
                addItem(item);
                syncQueue.addToQueue({ type: 'create', item });
            }
        },
        onSuccess: () => queryClient.invalidateQueries('data'),
        onError: (error) => console.error(error),  // Add error handling
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, ...updatedItem }) => {
            if (isOnline) {
                const { data, error } = await supabase.from('y_state').update(updatedItem).eq('id', id);
                if (error) throw new Error(error.message);
                return data[0];
            } else {
                updateItem(updatedItem);
                syncQueue.addToQueue({ type: 'update', item: updatedItem });
            }
        },
        onSuccess: () => queryClient.invalidateQueries('data'),
        onError: (error) => console.error(error),  // Add error handling
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            if (isOnline) {
                const { error } = await supabase.from('y_state').delete().eq('id', id);
                if (error) throw new Error(error.message);
            } else {
                deleteItem(id);
                syncQueue.addToQueue({ type: 'delete', id });
            }
        },
        onSuccess: () => queryClient.invalidateQueries('data'),
        onError: (error) => console.error(error),  // Add error handling
    });

    const [form] = Form.useForm();
    const onFinish = (values) => {
        createMutation.mutate({ ...values, date: new Date().toISOString().split('T')[0] });
        form.resetFields();
    };

    const columns = [
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Updated Date', dataIndex: 'updated_at', key: 'updated_at' },
        {
            title: 'Action',
            dataIndex: '',
            key: 'x',
            render: (_, record) => (
                <Space size="middle">
                    <Button onClick={() => updateMutation.mutate({ ...record, name: `Updated ${record.name}` })}>Update</Button>
                    <Button onClick={() => deleteMutation.mutate(record.id)}>Delete</Button>
                </Space>
            ),
        },
    ];

    if (isLoading) return <div>Loading...</div>;

    return (
        <div style={{ padding: 20 }}>
            <Space style={{ marginBottom: 20 }}>
                <RangePicker
                    onChange={(dates, dateStrings) => {
                        setFilters({ dateRange: dates });
                    }}
                    value={filters.dateRange}
                    allowClear
                />
                <Button type="primary" onClick={() => setPagination({ ...pagination, current: 1 })}>
                    Apply Filters
                </Button>
            </Space>
            <Form form={form} onFinish={onFinish} layout="inline">
                <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                    <Input placeholder="Name" />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Add
                    </Button>
                </Form.Item>
            </Form>
            <Table
                columns={columns}
                dataSource={isOnline ? data?.items : items}
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
};

export default StateTable;
