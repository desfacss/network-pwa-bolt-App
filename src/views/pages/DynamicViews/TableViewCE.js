import React, { useState, useMemo } from 'react';
import { Table, Button, Dropdown, Menu, Input, Modal } from 'antd';
import { DownOutlined, SaveOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const EditableCell = ({ editable, children, record, dataIndex, handleSave, ...restProps }) => {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(record && record[dataIndex] || "");

    const save = () => {
        if (record && dataIndex) {
            handleSave({ ...record, [dataIndex]: value });
        }
        setEditing(false);
    };

    return editable ? (
        <td {...restProps}>
            {editing ? (
                <Input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onPressEnter={save}
                    onBlur={save}
                />
            ) : (
                <div onClick={() => setEditing(true)}>{children}</div>
            )}
        </td>
    ) : (
        <td {...restProps}>{children}</td>
    );
};

const TableView = ({ data, viewConfig, updateData, deleteData }) => {
    const [groupedData, setGroupedData] = useState(null);

    // Handle Row Actions
    const handleRowAction = (action, record) => {
        if (action === 'delete') {
            Modal.confirm({
                title: 'Are you sure you want to delete this record?',
                content: `This action cannot be undone. Record ID: ${record.id}`,
                okText: 'Yes, Delete',
                okType: 'danger',
                cancelText: 'Cancel',
                onOk: () => {
                    deleteData(record);
                },
            });
        } else {
            console.log(`Action "${action}" triggered for record:`, record);
            // Implement other actions as needed
        }
        // Implement other actions as needed
    };

    // Handle Bulk Actions
    const handleBulkAction = (action) => {
        console.log(`Bulk action "${action}" triggered for selected rows.`);
        // Implement your bulk action logic here
    };

    const groupedTableData = useMemo(() => {
        if (!viewConfig.groupBy || viewConfig.groupBy.length === 0) {
            return data;
        }

        const groupByField = viewConfig.groupBy[0];
        const groups = {};

        data.forEach((item) => {
            const groupKey = item[groupByField] || 'Ungrouped';
            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(item);
        });

        setGroupedData(groups);
        return groups;
    }, [data, viewConfig]);

    const handleSave = (updatedRow) => updateData(updatedRow);

    const columns = viewConfig.fields.map((fieldConfig) => ({
        title: fieldConfig.fieldName,
        dataIndex: fieldConfig.fieldName,
        key: fieldConfig.fieldName,
        sorter: (a, b) =>
            typeof a[fieldConfig.fieldName] === 'string'
                ? a[fieldConfig.fieldName].localeCompare(b[fieldConfig.fieldName])
                : a[fieldConfig.fieldName] - b[fieldConfig.fieldName],
        onCell: (record) => ({
            record,
            dataIndex: fieldConfig.fieldName,
            editable: true,
            handleSave,
        }),
    }));

    const actionMenu = (record) => (
        <Menu>
            {viewConfig.actions.row.map((action) => (
                <Menu.Item key={action} onClick={() => handleRowAction(action, record)}>
                    {action.charAt(0).toUpperCase() + action.slice(1)}
                </Menu.Item>
            ))}
            {/* <Menu.Item key="delete" onClick={() => deleteData('delete', record.id)}>
                <DeleteOutlined /> Delete
            </Menu.Item> */}
        </Menu>
    );

    const renderGroupedTable = () => {
        if (!groupedData) return null;

        return Object.keys(groupedData).map((group) => (
            <div key={group} style={{ marginBottom: 20 }}>
                <h3>{group}</h3>
                <Table
                    dataSource={groupedData[group]}
                    columns={[
                        ...columns,
                        {
                            title: 'Actions',
                            key: 'actions',
                            render: (_, record) => (
                                <Dropdown overlay={actionMenu(record)} trigger={['click']}>
                                    <Button>
                                        Actions <DownOutlined />
                                    </Button>
                                </Dropdown>
                            ),
                        },
                    ]}
                    rowKey="id"
                    pagination={false}
                    components={{
                        body: {
                            cell: EditableCell,
                        },
                    }}
                />
            </div>
        ));
    };

    return (
        <div>
            <div style={{ marginBottom: 16 }}>
                {viewConfig.actions.bulk.map((action) => (
                    <Button
                        key={action}
                        type="primary"
                        style={{ marginRight: 8 }}
                        onClick={() => handleBulkAction(action)}
                    >
                        {action.charAt(0).toUpperCase() + action.slice(1)}
                    </Button>
                ))}
            </div>
            {viewConfig.groupBy && viewConfig.groupBy.length > 0
                ? renderGroupedTable()
                : (
                    <Table
                        dataSource={data}
                        columns={[
                            ...columns,
                            {
                                title: 'Actions',
                                key: 'actions',
                                render: (_, record) => (
                                    <Dropdown overlay={actionMenu(record)} trigger={['click']}>
                                        <Button>
                                            Actions <DownOutlined />
                                        </Button>
                                    </Dropdown>
                                ),
                            },
                        ]}
                        rowKey="id"
                        components={{
                            body: {
                                cell: EditableCell,
                            },
                        }}
                    />
                )}
        </div>
    );
};

export default TableView;
