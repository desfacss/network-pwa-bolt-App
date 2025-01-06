//#dynamicState/index.js
import React, { useState, useEffect, useMemo } from 'react';
import { Table, DatePicker, Space, Button, Input, Form } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from 'api/supabaseClient';
import { syncQueue } from 'state/services/offline/syncQueue';
import useTableStore from 'state/stores/useTable';
import { networkMonitor } from 'state/services/offline/networkMonitor';
import dayjs from 'dayjs'; // Ensure dayjs is imported

const { RangePicker } = DatePicker;

const StateTable = () => {
    const { items, pagination, setItems, setPagination, addItem, updateItem, deleteItem } = useTableStore();
    const [isOnline, setIsOnline] = useState(true);
    const queryClient = useQueryClient();

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
        const unsubscribe = networkMonitor.onOnline(state => {
            setIsOnline(state);
            if (state) {
                queryClient.invalidateQueries('data'); 
            }
        });
        return () => unsubscribe();
    }, [queryClient]);

    const fetchData = async ({ queryKey }) => {
        const [, filters, pagination] = queryKey;
        let query = supabase
            .from('y_state')
            .select('id, name, updated_at', { count: 'exact' });
    
        if (filters.dateRange && filters.dateRange.length === 2) {
            const [startDate, endDate] = filters.dateRange.map(date => dayjs(date));
            const startIso = startDate.startOf('day').toISOString().split('T')[0]; 
            const endIso = endDate.endOf('day').toISOString().split('T')[0];       

            query = query
                .gte('updated_at', `${startIso} 00:00:00`) 
                .lte('updated_at', `${endIso} 23:59:59`);
        }
    
        query = query.range((pagination.current - 1) * pagination.pageSize, pagination.current * pagination.pageSize - 1);
    
        const { data, error, count } = await query;
    
        if (error) throw new Error(error.message);
    
        return { items: data, total: count };
    };

    const { data, isLoading } = useQuery({
        queryKey: ['data', filters, pagination], 
        queryFn: fetchData,
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 30,
        refetchOnWindowFocus: false,
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
        onMutate: async (newItem) => {
            await queryClient.cancelQueries('data');
            const previousData = queryClient.getQueryData('data');
            queryClient.setQueryData('data', (old) => {
                if (old && old.items) {
                    return { ...old, items: [...old.items, newItem] };
                }
                return old;
            });
            return { previousData };
        },
        onError: (err, newItem, context) => {
            queryClient.setQueryData('data', context.previousData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries('data');
        }
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
        onMutate: async ({ id, ...updatedItem }) => {
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
            queryClient.setQueryData('data', context.previousData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries('data');
        }
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
        onMutate: async (id) => {
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
            queryClient.setQueryData('data', context.previousData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries('data');
        }
    });

    const [form] = Form.useForm();
    const onFinish = (values) => {
        createMutation.mutate({ ...values, date: new Date().toISOString().split('T')[0] });
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
    ], []);

    if (isLoading) return <div>Loading...</div>;

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
