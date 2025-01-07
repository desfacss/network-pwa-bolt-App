import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, message, Space, Popconfirm } from 'antd';
import { supabase } from 'api/supabaseClient';

const StateManager = () => {
    const queryClient = useQueryClient();

    // Fetch states
    const { data: states, isLoading } = useQuery({
        queryKey: ['states'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('y_state')
                .select('*')
                .order('id', { ascending: true });
            console.log("t")
            if (error) throw error;
            return data;
        },
        refetchOnReconnect: true
    });

    // Add state mutation
    const addStateMutation = useMutation({
        mutationFn: async (newState) => {
            const { data, error } = await supabase
                .from('y_state')
                .insert([newState])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onMutate: async (newState) => {
            await queryClient.cancelQueries({ queryKey: ['states'] });
            const previousStates = queryClient.getQueryData(['states']);
            queryClient.setQueryData(['states'], old => [...old, { ...newState, id: Date.now() }]);
            return { previousStates };
        },
        onError: (err, newState, context) => {
            queryClient.setQueryData(['states'], context.previousStates);
            message.error('Failed to add state');
        },
        onSuccess: () => {
            message.success('State added successfully');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['states'] });
        }
    });

    // Update state mutation
    const updateStateMutation = useMutation({
        mutationFn: async (updatedState) => {
            const { data, error } = await supabase
                .from('y_state')
                .update(updatedState)
                .eq('id', updatedState.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onMutate: async (updatedState) => {
            await queryClient.cancelQueries({ queryKey: ['states'] });
            const previousStates = queryClient.getQueryData(['states']);
            queryClient.setQueryData(['states'], old =>
                old.map(state => state.id === updatedState.id ? updatedState : state)
            );
            return { previousStates };
        },
        onError: (err, updatedState, context) => {
            queryClient.setQueryData(['states'], context.previousStates);
            message.error('Failed to update state');
        },
        onSuccess: () => {
            message.success('State updated successfully');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['states'] });
        }
    });

    // Delete state mutation
    const deleteStateMutation = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase
                .from('y_state')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['states'] });
            const previousStates = queryClient.getQueryData(['states']);
            queryClient.setQueryData(['states'], old =>
                old.filter(state => state.id !== id)
            );
            return { previousStates };
        },
        onError: (err, id, context) => {
            queryClient.setQueryData(['states'], context.previousStates);
            message.error('Failed to delete state');
        },
        onSuccess: () => {
            message.success('State deleted successfully');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['states'] });
        }
    });

    // Generate random state data
    const generateRandomState = () => ({
        name: `State ${Math.floor(Math.random() * 1000)}`,
        email: `user${Math.floor(Math.random() * 1000)}@example.com`,
        phone: `+1${Math.floor(Math.random() * 10000000000)}`,
        address: `${Math.floor(Math.random() * 1000)} Random Street`,
        city: `City ${Math.floor(Math.random() * 100)}`,
        state: `State ${Math.floor(Math.random() * 50)}`,
        country: 'United States',
    });

    // Table columns
    const columns = [
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Phone', dataIndex: 'phone', key: 'phone' },
        { title: 'City', dataIndex: 'city', key: 'city' },
        { title: 'State', dataIndex: 'state', key: 'state' },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button onClick={() => {
                        const updatedState = { ...record, ...generateRandomState() };
                        updateStateMutation.mutate(updatedState);
                    }}>
                        Update
                    </Button>
                    <Popconfirm
                        title="Delete State"
                        description="Are you sure you want to delete this state?"
                        onConfirm={() => deleteStateMutation.mutate(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button danger>Delete</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="p-4">
            <Button
                type="primary"
                className="mb-4"
                onClick={() => {
                    const newState = generateRandomState();
                    addStateMutation.mutate(newState);
                }}
            >
                Add New State
            </Button>

            <Table
                columns={columns}
                dataSource={states}
                rowKey="id"
                loading={isLoading}
            />
        </div>
    );
};

export default StateManager;