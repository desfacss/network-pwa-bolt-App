// components/DynamicTable/index.jsx
/**
 * Enhanced dynamic table component with advanced features
 */
import React, { useEffect } from 'react';
import { Table } from 'antd';
import { useRecords } from 'state/hooks/useRecords';
import { useViewConfig } from 'state/hooks/useViewConfig';
import { useUserStore } from 'state/stores/userStore';
// import { useRecords } from '../../state/hooks/useRecords';
// import { useViewConfig } from '../../state/hooks/useViewConfig';
// import { useUserStore } from '../../state/stores/userStore';
// import { subscriptionService } from '../../services/realtime/subscriptionService';

const DynamicTable = () => {
    const entityType = 'y_state'
    const onConfigChange = () => { }
    // const user = useUserStore((state) => state.user);
    const { query: { data: records, isLoading: recordsLoading }, mutation } = useRecords(entityType);
    console.log("Rp", records, recordsLoading)

    // Add serial numbers to records
    const recordsWithSerialNumbers = records?.map((record, index) => ({
        ...record,
        serialNumber: index + 1, // Add a serial number
    }));

    // const { data: viewConfig, isLoading: configLoading } = useViewConfig(entityType);

    // useEffect(() => {
    //     if (user?.organization_id) {
    //         subscriptionService.subscribe(tableId,
    //             { organization_id: user.organization_id },
    //             (payload) => {
    //                 console.log('Real-time update:', payload);
    //             }
    //         );
    //     }

    //     return () => subscriptionService.unsubscribe(tableId);
    // }, [tableId, user?.organization_id]);

    const columns = [
        { title: 'S.No', dataIndex: 'serialNumber', key: 'serialNumber' },
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
    ]//.filter(col => viewConfig?.visibleColumns?.includes(col.key));

    // if (!user) return <div>Please log in</div>;
    // if (recordsLoading || configLoading) return <div>Loading...</div>;
    if (recordsLoading) return <div>Loading...</div>;

    return (
        <Table
            columns={columns}
            dataSource={recordsWithSerialNumbers}
            rowKey="id"
            pagination={{
                // pageSize: viewConfig?.pageSize || 10,
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