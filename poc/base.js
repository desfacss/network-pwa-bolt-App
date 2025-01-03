// types/index.js
/**
 * Core type definitions for the application
 */
interface User {
    id: string;
    organization_id: string;
    email: string;
    role: 'admin' | 'user' | 'viewer';
    permissions: string[];
  }
  
  interface ViewConfig {
    id: string;
    user_id: string;
    table_id: string;
    config: {
      visibleColumns: string[];
      filters: Filter[];
      sorting: Sort[];
      pageSize: number;
    };
  }
  
  interface Filter {
    field: string;
    operator: 'equals' | 'contains' | 'gt' | 'lt';
    value: any;
  }
  
  interface Sort {
    field: string;
    direction: 'asc' | 'desc';
  }
  
  // services/cache/indexedDB.js
  /**
   * Enhanced IndexedDB implementation with versioning and sync
   */
  import { openDB, DBSchema, IDBPDatabase } from 'idb';
  
  interface MyDBSchema extends DBSchema {
    records: {
      key: string;
      value: {
        data: any;
        timestamp: number;
        version: number;
      };
    };
    viewConfigs: {
      key: string;
      value: {
        config: ViewConfig;
        timestamp: number;
      };
    };
    syncQueue: {
      key: string;
      value: {
        action: 'create' | 'update' | 'delete';
        data: any;
        timestamp: number;
      };
    };
  }
  
  class IndexedDBService {
    private db: IDBPDatabase<MyDBSchema>;
    private DB_NAME = 'enhancedAppDB';
    private DB_VERSION = 1;
  
    async init() {
      this.db = await openDB<MyDBSchema>(this.DB_NAME, this.DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('records')) {
            const recordStore = db.createObjectStore('records');
            recordStore.createIndex('timestamp', 'timestamp');
          }
          if (!db.objectStoreNames.contains('viewConfigs')) {
            const configStore = db.createObjectStore('viewConfigs');
            configStore.createIndex('timestamp', 'timestamp');
          }
          if (!db.objectStoreNames.contains('syncQueue')) {
            const syncStore = db.createObjectStore('syncQueue');
            syncStore.createIndex('timestamp', 'timestamp');
          }
        },
      });
    }
  
    async set(storeName: keyof MyDBSchema, key: string, value: any) {
      await this.db.put(storeName, {
        data: value,
        timestamp: Date.now(),
        version: 1,
      }, key);
    }
  
    async get(storeName: keyof MyDBSchema, key: string) {
      return this.db.get(storeName, key);
    }
  
    async addToSyncQueue(action: 'create' | 'update' | 'delete', data: any) {
      await this.db.add('syncQueue', {
        action,
        data,
        timestamp: Date.now(),
      }, `${Date.now()}-${Math.random()}`);
    }
  }
  
  export const indexedDB = new IndexedDBService();
  
  // services/api/supabase.js
  /**
   * Supabase client configuration and API utilities
   */
  import { createClient } from '@supabase/supabase-js';
  
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
  
  export const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Utility function for handling Supabase errors
  export const handleSupabaseError = (error: any) => {
    console.error('Supabase Error:', error);
    throw new Error(error.message || 'An error occurred with the database');
  };
  
  // services/realtime/subscriptionService.js
  /**
   * Real-time subscription service using Supabase
   */
  import { supabase } from '../api/supabase';
  import { indexedDB } from '../cache/indexedDB';
  
  class SubscriptionService {
    private subscriptions: Map<string, any> = new Map();
  
    subscribe(table: string, filter: any, callback: (payload: any) => void) {
      const subscription = supabase
        .from(table)
        .on('*', async (payload) => {
          // Cache the update
          await indexedDB.set('records', `${table}-${payload.new.id}`, payload.new);
          // Trigger callback
          callback(payload);
        })
        .subscribe();
  
      this.subscriptions.set(table, subscription);
    }
  
    unsubscribe(table: string) {
      const subscription = this.subscriptions.get(table);
      if (subscription) {
        supabase.removeSubscription(subscription);
        this.subscriptions.delete(table);
      }
    }
  }
  
  export const subscriptionService = new SubscriptionService();
  
  // state/stores/userStore.js
  /**
   * Enhanced user store with role-based access control
   */
  import create from 'zustand';
  import { persist } from 'zustand/middleware';
  import { User } from '../../types';
  
  interface UserState {
    user: User | null;
    setUser: (user: User) => void;
    clearUser: () => void;
    hasPermission: (permission: string) => boolean;
  }
  
  export const useUserStore = create<UserState>(
    persist(
      (set, get) => ({
        user: null,
        setUser: (user) => set({ user }),
        clearUser: () => set({ user: null }),
        hasPermission: (permission) => {
          const { user } = get();
          return user?.permissions?.includes(permission) || false;
        },
      }),
      { name: 'user-store' }
    )
  );
  
  // state/stores/viewConfigStore.js
  /**
   * Enhanced view configuration store with versioning
   */
  import create from 'zustand';
  import { persist } from 'zustand/middleware';
  import { ViewConfig } from '../../types';
  
  interface ViewConfigState {
    configs: Record<string, ViewConfig>;
    setConfig: (userId: string, tableId: string, config: ViewConfig) => void;
    getConfig: (userId: string, tableId: string) => ViewConfig | null;
  }
  
  export const useViewConfigStore = create<ViewConfigState>(
    persist(
      (set, get) => ({
        configs: {},
        setConfig: (userId, tableId, config) =>
          set((state) => ({
            configs: {
              ...state.configs,
              [`${userId}-${tableId}`]: config,
            },
          })),
        getConfig: (userId, tableId) => {
          const { configs } = get();
          return configs[`${userId}-${tableId}`] || null;
        },
      }),
      { name: 'view-config-store' }
    )
  );
  
  // state/hooks/useRecords.js
  /**
   * Enhanced records hook with offline support and optimistic updates
   */
  import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
  import { supabase } from '../../services/api/supabase';
  import { useUserStore } from '../stores/userStore';
  import { indexedDB } from '../../services/cache/indexedDB';
  
  export const useRecords = (tableId: string) => {
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
          .eq('organization_id', user?.organization_id);
  
        if (error) throw error;
  
        // Save to IndexedDB
        await indexedDB.set('records', tableId, data);
  
        return data;
      } catch (error) {
        console.error('Error fetching records:', error);
        throw error;
      }
    };
  
    const mutation = useMutation({
      mutationFn: async (newData: any) => {
        // Optimistically update cache
        queryClient.setQueryData(['records', tableId], (old: any) => [...old, newData]);
  
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
  
    return {
      query: useQuery(['records', tableId], fetchRecords, {
        enabled: !!user?.organization_id,
        staleTime: 30000,
        cacheTime: 5 * 60 * 1000,
      }),
      mutation,
    };
  };
  
  // components/DynamicTable/index.jsx
  /**
   * Enhanced dynamic table component with advanced features
   */
  import React, { useEffect } from 'react';
  import { Table } from 'antd';
  import { useRecords } from '../../state/hooks/useRecords';
  import { useViewConfig } from '../../state/hooks/useViewConfig';
  import { useUserStore } from '../../state/stores/userStore';
  import { subscriptionService } from '../../services/realtime/subscriptionService';
  
  interface DynamicTableProps {
    tableId: string;
    onConfigChange?: (config: any) => void;
  }
  
  const DynamicTable: React.FC<DynamicTableProps> = ({ tableId, onConfigChange }) => {
    const user = useUserStore((state) => state.user);
    const { query: { data: records, isLoading: recordsLoading }, mutation } = useRecords(tableId);
    const { data: viewConfig, isLoading: configLoading } = useViewConfig(tableId);
  
    useEffect(() => {
      if (user?.organization_id) {
        subscriptionService.subscribe(tableId, 
          { organization_id: user.organization_id },
          (payload) => {
            console.log('Real-time update:', payload);
          }
        );
      }
  
      return () => subscriptionService.unsubscribe(tableId);
    }, [tableId, user?.organization_id]);
  
    const columns = [
      { title: 'ID', dataIndex: 'id', key: 'id' },
      { title: 'Name', dataIndex: 'name', key: 'name' },
      { title: 'Email', dataIndex: 'email', key: 'email' },
      { title: 'Phone', dataIndex: 'phone', key: 'phone' },
      { title: 'Address', dataIndex: 'address', key: 'address' },
      { title: 'City', dataIndex: 'city', key: 'city' },
      { title: 'State', dataIndex: 'state', key: 'state' },
      { title: 'Country', dataIndex: 'country', key: 'country' },
      { title: 'Created At', dataIndex: 'created_at', key: 'created_at' },
      { title: 'Updated At', dataIndex: 'updated_at', key: 'updated_at' },
    ].filter(col => viewConfig?.visibleColumns?.includes(col.key));
  
    if (!user) return <div>Please log in</div>;
    if (recordsLoading || configLoading) return <div>Loading...</div>;
  
    return (
      <Table
        columns={columns}
        dataSource={records}
        rowKey="id"
        pagination={{ 
          pageSize: viewConfig?.pageSize || 10,
          showSizeChanger: true,
        }}
        onChange={(pagination, filters, sorter) => {
          if (onConfigChange) {
            onConfigChange({
              pagination,
              filters,
              sorter,
            });
          }
        }}
      />
    );
  };
  
  export default DynamicTable;