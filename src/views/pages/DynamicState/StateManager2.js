import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, message, Space, Popconfirm } from 'antd';
import { supabase } from 'configs/SupabaseConfig';

const StateManager = () => {
    const queryClient = useQueryClient();
    const [isOnline, setIsOnline] = React.useState(navigator.onLine);

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

    // Table columns definition
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

    // Handle online/offline status
    React.useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Main query for fetching states
    const { data: states, isLoading } = useQuery({
        queryKey: ['states'],
        queryFn: async () => {
            if (!isOnline) {
                return queryClient.getQueryData(['states']) || [];
            }

            const { data, error } = await supabase
                .from('y_state')
                .select('*')
                .order('id', { ascending: true });

            if (error) throw error;
            return data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        cacheTime: 1000 * 60 * 60 * 24, // 24 hours
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
    });

    // Add state mutation
    const addStateMutation = useMutation({
        mutationFn: async (newState) => {
            if (!isOnline) {
                const stateWithId = { ...newState, id: Date.now() };
                const currentStates = queryClient.getQueryData(['states']) || [];
                queryClient.setQueryData(['states'], [...currentStates, stateWithId]);
                return stateWithId;
            }

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
            queryClient.setQueryData(['states'], old => [...(old || []), { ...newState, id: Date.now() }]);
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
            if (!isOnline) {
                const currentStates = queryClient.getQueryData(['states']) || [];
                queryClient.setQueryData(['states'],
                    currentStates.map(state =>
                        state.id === updatedState.id ? updatedState : state
                    )
                );
                return updatedState;
            }

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
                (old || []).map(state => state.id === updatedState.id ? updatedState : state)
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
            if (!isOnline) {
                const currentStates = queryClient.getQueryData(['states']) || [];
                queryClient.setQueryData(['states'],
                    currentStates.filter(state => state.id !== id)
                );
                return;
            }

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
                (old || []).filter(state => state.id !== id)
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

    // Sync effect for when coming back online
    React.useEffect(() => {
        const syncOfflineChanges = async () => {
            if (!isOnline) return;

            const cachedStates = queryClient.getQueryData(['states']);
            if (!cachedStates) return;

            try {
                // Fetch current server states
                const { data: serverStates } = await supabase
                    .from('y_state')
                    .select('*');

                // Find states that need to be synced
                const statesToSync = cachedStates.filter(
                    cachedState => !serverStates?.find(
                        serverState => serverState.id === cachedState.id
                    )
                );

                // Sync each state
                for (const state of statesToSync) {
                    await supabase
                        .from('y_state')
                        .upsert(state);
                }

                // Refetch to get latest data
                queryClient.invalidateQueries({ queryKey: ['states'] });
            } catch (error) {
                console.error('Error syncing offline changes:', error);
                message.error('Failed to sync offline changes');
            }
        };

        if (isOnline) {
            syncOfflineChanges();
        }
    }, [isOnline, queryClient]);

    return (
        <div className="p-4">
            <div className="mb-4 flex justify-between items-center">
                <Button
                    type="primary"
                    onClick={() => {
                        const newState = generateRandomState();
                        addStateMutation.mutate(newState);
                    }}
                >
                    Add New State
                </Button>
                <span className={`px-3 py-1 rounded ${isOnline ? 'bg-green-500' : 'bg-yellow-500'} text-white`}>
                    {isOnline ? 'Online' : 'Offline'}
                </span>
            </div>

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