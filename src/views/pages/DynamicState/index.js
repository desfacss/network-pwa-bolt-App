import React from 'react';
import { Table, Button, Popconfirm, Card } from 'antd';
import { useRecords } from 'state/hooks/useRecords';
import StateTable from './StateTable';

const DynamicTable = () => {
    const entityType = 'y_state';
    const {
        query: { data: records, isLoading },
        addRecord,
        updateRecord,
        deleteRecord,
    } = useRecords(entityType);

    const recordsWithSerialNumbers = records?.map((record, index) => ({
        ...record,
        serialNumber: index + 1,
    }));

    const handleEdit = (record) => {
        const updatedData = { ...record, name: 'Updated Name' }; // Example update
        updateRecord.mutate({ id: record.id, ...updatedData });
    };

    const handleDelete = (id) => {
        deleteRecord.mutate(id);
    };

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
        };
    };

    // Add random data when the button is clicked
    const handleAddRandom = () => {
        const newRecord = generateRandomData();
        addRecord.mutate(newRecord);
    };

    const columns = [
        { title: 'S.No', dataIndex: 'id', key: 'id' },
        { title: 'Name', dataIndex: 'name', key: 'name' },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <>
                    <Button onClick={() => handleEdit(record)}>Edit</Button>
                    <Popconfirm
                        title="Are you sure to delete this record?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button danger>Delete</Button>
                    </Popconfirm>
                </>
            ),
        },
    ];

    if (isLoading) return <div>Loading...</div>;

    return (
        <Card>
            <StateTable />
            {/* <Button type="primary" onClick={handleAddRandom} style={{ marginBottom: 16 }}>
                Add Random Record
            </Button>
            <Table
                columns={columns}
                dataSource={records}
                rowKey="id"
                pagination={{ showSizeChanger: true }}
            /> */}
        </Card>
    );
};

export default DynamicTable;
