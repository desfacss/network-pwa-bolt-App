import React, { useState } from 'react';
import { Table, Input, Button, Dropdown, Menu } from 'antd';
import { DownOutlined, SaveOutlined, EditOutlined } from '@ant-design/icons';

const TableView = ({ data, viewConfig, updateRow, deleteRow }) => {
    const [editingRow, setEditingRow] = useState(null);
    const [rowChanges, setRowChanges] = useState({});

    const handleEdit = (record) => {
        setEditingRow(record.id);
        setRowChanges(record); // Initialize changes with the current record
    };

    const handleSave = async () => {
        await updateRow(rowChanges);
        setEditingRow(null);
    };

    const handleInputChange = (key, value) => {
        setRowChanges((prev) => ({ ...prev, [key]: value }));
    };

    const columns = viewConfig.fields.map((fieldConfig) => ({
        title: fieldConfig.fieldName,
        dataIndex: fieldConfig.fieldName,
        key: fieldConfig.fieldName,
        sorter: (a, b) => {
            if (typeof a[fieldConfig.fieldName] === 'string') {
                return a[fieldConfig.fieldName].localeCompare(b[fieldConfig.fieldName]);
            }
            return a[fieldConfig.fieldName] - b[fieldConfig.fieldName];
        },
        render: (text, record) =>
            editingRow === record.id ? (
                <Input
                    value={rowChanges[fieldConfig.fieldName]}
                    onChange={(e) => handleInputChange(fieldConfig.fieldName, e.target.value)}
                />
            ) : (
                text
            ),
    }));

    const actionMenu = (record) => (
        <Menu>
            <Menu.Item key="edit" onClick={() => handleEdit(record)}>
                Edit
            </Menu.Item>
            <Menu.Item key="delete" onClick={() => deleteRow(record.id)}>
                Delete
            </Menu.Item>
        </Menu>
    );

    return (
        <div>
            <Table
                dataSource={data}
                columns={[
                    ...columns,
                    {
                        title: 'Actions',
                        key: 'actions',
                        render: (_, record) =>
                            editingRow === record.id ? (
                                <Button
                                    type="primary"
                                    icon={<SaveOutlined />}
                                    onClick={handleSave}
                                >
                                    Save
                                </Button>
                            ) : (
                                <Dropdown overlay={actionMenu(record)} trigger={['click']}>
                                    <Button>
                                        Actions <DownOutlined />
                                    </Button>
                                </Dropdown>
                            ),
                    },
                ]}
                rowKey="id"
            />
        </div>
    );
};

export default TableView;
