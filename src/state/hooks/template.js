// state/stores/userStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { openDB } from 'idb'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { Table } from 'antd'
import { supabase } from 'api/supabaseClient'

export const useUserStore = create(
    persist(
        (set) => ({
            user: null,
            setUser: (user) => set({ user }),
            clearUser: () => set({ user: null }),
        }),
        { name: 'user-store' }
    )
)

// state/stores/viewConfigStore.js
// import create from 'zustand'
// import { persist } from 'zustand/middleware'

export const useViewConfigStore = create(
    persist(
        (set) => ({
            columnConfigs: {},
            setColumnConfig: (userId, tableId, config) =>
                set((state) => ({
                    columnConfigs: {
                        ...state.columnConfigs,
                        [`${userId}-${tableId}`]: config,
                    },
                })),
        }),
        { name: 'view-config-store' }
    )
)

// utils/indexedDB.js
// import { openDB } from 'idb'

const DB_NAME = 'myAppDB'
const DB_VERSION = 1

export const initDB = async () => {
    const db = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('records')) {
                db.createObjectStore('records', { keyPath: 'id' })
            }
            if (!db.objectStoreNames.contains('viewConfigs')) {
                db.createObjectStore('viewConfigs', { keyPath: 'id' })
            }
        },
    })
    return db
}

export const saveToIndexedDB = async (storeName, data) => {
    const db = await initDB()
    const tx = db.transaction(storeName, 'readwrite')
    const store = tx.objectStore(storeName)
    await store.put(data)
}

export const getFromIndexedDB = async (storeName, id) => {
    const db = await initDB()
    return db.get(storeName, id)
}

// state/hooks/useRecords.js
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { supabase } from '../supabaseClient'
// import { useUserStore } from '../stores/userStore'
// import { saveToIndexedDB, getFromIndexedDB } from '../utils/indexedDB'

export const useRecords = () => {
    const queryClient = useQueryClient()
    const user = useUserStore((state) => state.user)

    const fetchRecords = async () => {
        // First try to get from IndexedDB
        const cachedData = await getFromIndexedDB('records', 'latest')

        // Fetch from Supabase
        const { data, error } = await supabase
            .from('records')
            .select('*')
            .eq('organization_id', user.organization_id)

        if (error) throw error

        // Save to IndexedDB
        await saveToIndexedDB('records', { id: 'latest', data })

        return data
    }

    return useQuery({
        queryKey: ['records', user?.organization_id],
        queryFn: fetchRecords,
        enabled: !!user?.organization_id,
        staleTime: 30000, // Consider data fresh for 30 seconds
        cacheTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
    })
}

// state/hooks/useViewConfig.js
// import { useQuery, useMutation } from '@tanstack/react-query'
// import { supabase } from '../supabaseClient'
// import { useUserStore } from '../stores/userStore'
// import { useViewConfigStore } from '../stores/viewConfigStore'
// import { saveToIndexedDB, getFromIndexedDB } from '../utils/indexedDB'

export const useViewConfig = (tableId) => {
    const user = useUserStore((state) => state.user)
    const { setColumnConfig } = useViewConfigStore()

    const fetchConfig = async () => {
        // Try local cache first
        const cachedConfig = await getFromIndexedDB('viewConfigs', `${user.id}-${tableId}`)
        if (cachedConfig) return cachedConfig

        // Fetch from Supabase
        const { data, error } = await supabase
            .from('user_view_configs')
            .select('*')
            .eq('user_id', user.id)
            .eq('table_id', tableId)
            .single()

        if (error) throw error

        // Cache the config
        await saveToIndexedDB('viewConfigs', {
            id: `${user.id}-${tableId}`,
            data: data.config
        })
        setColumnConfig(user.id, tableId, data.config)

        return data.config
    }

    return useQuery({
        queryKey: ['viewConfig', user?.id, tableId],
        queryFn: fetchConfig,
        enabled: !!user?.id && !!tableId,
        staleTime: Infinity, // View configs don't change often
    })
}

// pages/DynamicTable/index.js
// import React from 'react'
// import { Table } from 'antd'
// import { supabase } from 'api/supabaseClient'
// import { useRecords } from '../../state/hooks/useRecords'
// import { useViewConfig } from '../../state/hooks/useViewConfig'
// import { useUserStore } from '../../state/stores/userStore'

const TABLE_ID = 'main-records-table'

const DynamicTable = () => {
    // const user = useUserStore((state) => state.user)
    const { data: records, isLoading: recordsLoading } = useRecords()
    const { data: viewConfig, isLoading: configLoading } = useViewConfig(TABLE_ID)

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
    ].filter(col => viewConfig?.visibleColumns?.includes(col.key))

    // if (!user) return <div>Please log in</div>
    if (recordsLoading || configLoading) return <div>Loading...</div>

    return (
        <Table
            columns={columns}
            dataSource={records}
            rowKey="id"
            pagination={{ pageSize: 10 }}
        />
    )
}

export default DynamicTable
