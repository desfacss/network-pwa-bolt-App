//#dynamicState/index.js
import React, { useState, useEffect, useMemo } from 'react';
import { Table, DatePicker, Space, Button, Input, Form, Skeleton } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from 'api/supabaseClient';
import { syncQueue } from 'state/services/offline/syncQueue';
import useTableStore from 'state/stores/useTable';
import { networkMonitor } from 'state/services/offline/networkMonitor';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const StateTable = () => {
    const { items, pagination, setItems, setPagination, addItem, updateItem, deleteItem } = useTableStore();
    const [isOnline, setIsOnline] = useState(true);
    // const [previousData, setPreviousData] = useState(null); no old data
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

    //this useeffect is not executed if online or offline state change
    useEffect(() => {
        console.log("st")
        const unsubscribe = networkMonitor.onOnline(state => {
            setIsOnline(state);
            if (state) {
                queryClient.invalidateQueries('data');
            }
        });
        return () => unsubscribe();
    }, [queryClient, networkMonitor]);

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
    // const { data, isLoading, isFetching } = useQuery({ 
    const { data, isLoading } = useQuery({  // Include isFetching here
        queryKey: ['data', filters, pagination],
        queryFn: fetchData,
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 30,
        refetchOnWindowFocus: false,
        // onSuccess: (data) => {
        //     setPreviousData({ items: data.items, total: data.total });
        // }
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
            // date: new Date().toISOString(),
        };
    };

    // const createMutation = useMutation({
    //     mutationFn: async (newItem) => {
    //         const item = generateRandomData();
    //         if (isOnline) {
    //             console.log("A1", item)
    //             const { data, error } = await supabase.from('y_state').insert([item]).select('*');
    //             console.log("A2", data, error)
    //             if (error) throw new Error(error.message);
    //             return data[0];
    //         } else {
    //             // const item = { ...newItem, id: Math.random().toString(36).substr(2, 9) };
    //             // const item = generateRandomData();
    //             console.log("A1", item)
    //             addItem(item);
    //             syncQueue.addToQueue({ type: 'create', item });
    //         }
    //     },
    //     onMutate: async (newItem) => {
    //         await queryClient.cancelQueries('data');
    //         const previousData = queryClient.getQueryData('data');
    //         queryClient.setQueryData('data', (old) => {
    //             if (old && old.items) {
    //                 return { ...old, items: [...old.items, newItem] };
    //             }
    //             return old;
    //         });
    //         return { previousData };
    //     },
    //     onError: (err, newItem, context) => {
    //         queryClient.setQueryData('data', context.previousData);
    //     },
    //     onSuccess: () => {
    //         queryClient.invalidateQueries('data');
    //     }
    // });

    // const createMutation = useMutation({
    //     mutationFn: async (newItem) => {
    //         const item = generateRandomData();
    //         if (isOnline) {
    //             console.log("A1", item)
    //             const { data, error } = await supabase.from('y_state').insert([item]).select('*');
    //             console.log("A2", data, error)
    //             if (error) throw new Error(error.message);
    //             return data[0];
    //         } else {
    //             console.log("o1", item)
    //             const tempId = Math.random().toString(36).substr(2, 9);
    //             // const offlineItem = { ...newItem, id: tempId };
    //             const offlineItem = item;
    //             addItem(offlineItem); // Update local state immediately
    //             syncQueue.addToQueue({ type: 'create', item: offlineItem });
    //             return offlineItem; // Return the offline item for UI update
    //         }
    //     },
    //     onMutate: async (newItem) => {
    //         if (!isOnline) {
    //             queryClient.cancelQueries('data');
    //             const previousData = queryClient.getQueryData('data');
    //             queryClient.setQueryData('data', (old) => {
    //                 console.log("yu", newItem)
    //                 if (old && old.items) {
    //                     return { ...old, items: [...old.items, newItem] };
    //                 }
    //                 return old;
    //             });
    //             return { previousData };
    //         }
    //     },
    //     onError: (err, newItem, context) => {
    //         if (!isOnline) {
    //             queryClient.setQueryData('data', context.previousData);
    //         }
    //     },
    //     onSuccess: () => {
    //         if (isOnline) {
    //             queryClient.invalidateQueries('data');
    //         }
    //     }
    // });

    const createMutation = useMutation({
        mutationFn: async (newItem) => {
            const item = generateRandomData();
            if (isOnline) {
                // Update local state immediately for consistency
                console.log("tre", item)
                addItem(item); // Immediate UI update
                try {
                    const { data, error } = await supabase.from('y_state').insert([item]).select('*');
                    if (error) throw new Error(error.message);
                    console.log("tr", data)
                    // Optional: Update local state again with server response (in case the server modifies the data)
                    updateItem(data[0]); // Replace the item with server response
                    return data[0];
                } catch (err) {
                    // Rollback local state if server operation fails
                    deleteItem(item.id);
                    throw err;
                }
            } else {
                // Offline flow: update local state and add to syncQueue
                addItem(item);
                syncQueue.addToQueue({ type: 'create', item });
                return item; // Return offline item for UI update
            }
        },
        onMutate: async (newItem) => {
            // Always ensure local state is updated optimistically
            queryClient.cancelQueries('data');
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
            // Rollback changes if mutation fails
            queryClient.setQueryData('data', context.previousData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries('data'); // Refresh server data
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
        console.log("2")
        createMutation.mutate({ ...values, date: new Date().toISOString().split('T')[0] });
        console.log("3")

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
    // if (isLoading && !previousData) return <Skeleton active />;

    // const tableData = isFetching && previousData ? previousData.items : (isOnline ? data?.items : items);
    // const totalCount = isFetching && previousData ? previousData.total : (isOnline ? data?.total : items.length);

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
                {/* <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                    <Input placeholder="Name" />
                </Form.Item> */}
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Add
                    </Button>
                </Form.Item>
            </Form>
            {/* RPC Function goes here... */}

            <Table
                columns={columns}
                dataSource={isOnline ? data?.items : items}
                // dataSource={data?.items}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: isOnline ? data?.total : items.length,
                    onChange: (current, pageSize) => setPagination({ current, pageSize }),
                }}
                loading={isLoading || createMutation.isLoading || updateMutation.isLoading || deleteMutation.isLoading}
            />
            {/* <Table
                columns={columns}
                dataSource={tableData}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: totalCount,
                    onChange: (current, pageSize) => setPagination({ current, pageSize }),
                }}
                loading={isLoading || isFetching || createMutation.isLoading || updateMutation.isLoading || deleteMutation.isLoading}
            /> */}
        </div>
    );
};

export default StateTable;
