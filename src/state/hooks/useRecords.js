// state/hooks/useRecords.js
/**
 * Enhanced records hook with offline support and optimistic updates
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from 'configs/SupabaseConfig';
import { indexedDB } from 'state/services/indexedDB';
import { useUserStore } from '../stores/userStore';
// import { indexedDB } from '../../services/cache/indexedDB';

export const useRecords = (tableId) => {
    const queryClient = useQueryClient();
    const user = useUserStore((state) => state.user);

    const fetchRecords = async () => {
        try {
            // First try to get from IndexedDB
            const cachedData = await indexedDB.get('records', tableId);

            if (cachedData && Date.now() - cachedData.timestamp < 300000) {
                return cachedData.data;
            }
            // Fetch from Supabase
            const { data, error } = await supabase
                .from(tableId)
                .select('*')
                .order('id', { ascending: true })
            // .eq('organization_id', user?.organization_id);;

            if (error) throw error;

            // Save to IndexedDB
            await indexedDB.set('records', tableId, data);

            return data;
        } catch (error) {
            console.error('Error fetching records:', error);
            throw error;
        }
    };
    const addRecord = useMutation({
        mutationFn: async (newData) => {
            // Optimistic update
            queryClient.setQueryData(['records', tableId], (old) => [...(old || []), newData]);

            try {
                const { data, error } = await supabase.from(tableId).insert(newData);
                if (error) throw error;
                return data;
            } catch (error) {
                queryClient.invalidateQueries(['records', tableId]);
                throw error;
            }
        },
    });

    const updateRecord = useMutation({
        mutationFn: async ({ id, ...updates }) => {
            // Optimistic update
            queryClient.setQueryData(['records', tableId], (old) =>
                old.map((record) => (record.id === id ? { ...record, ...updates } : record))
            );

            try {
                const { data, error } = await supabase.from(tableId).update(updates).eq('id', id);
                if (error) throw error;
                return data;
            } catch (error) {
                queryClient.invalidateQueries(['records', tableId]);
                throw error;
            }
        },
    });

    const deleteRecord = useMutation({
        mutationFn: async (id) => {
            // Optimistic update
            queryClient.setQueryData(['records', tableId], (old) =>
                old.filter((record) => record.id !== id)
            );

            try {
                const { data, error } = await supabase.from(tableId).delete().eq('id', id);
                if (error) throw error;
                return data;
            } catch (error) {
                queryClient.invalidateQueries(['records', tableId]);
                throw error;
            }
        },
    });

    const mutation = useMutation({
        mutationFn: async (newData) => {
            // Optimistically update cache
            queryClient.setQueryData(['records', tableId], (old) => [...old, newData]);

            try {
                const { data, error } = await supabase
                    .from(tableId)
                    .insert(newData);

                if (error) throw error;
                return data;
            } catch (error) {
                // Revert optimistic update on error
                queryClient.invalidateQueries(['records', tableId]);
                throw error;
            }
        },
    });
    // console.log("1", tableId)
    return {
        query: useQuery({
            queryKey: ['records', tableId],
            queryFn: fetchRecords,
            enabled: true,
            refetchOnWindowFocus: true,  // Disable refetching when the window is focused
            retry: false,
            // enabled: !!user?.organization_id,
            staleTime: 30000,
            cacheTime: 1 * 60 * 1000,
            refetchInterval: 15000,
        }),
        // mutation,
        addRecord,
        updateRecord,
        deleteRecord,
    };
};