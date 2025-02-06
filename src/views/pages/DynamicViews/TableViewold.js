import React, { useState, useMemo } from 'react';
import { Table, Button, Dropdown, Menu, Modal } from 'antd';
import { DownOutlined, PlusOutlined } from '@ant-design/icons';
import DynamicForm from '../DynamicForm';

const TableView = ({ data, viewConfig, updateData, deleteData, onFinish }) => {
    const [groupedData, setGroupedData] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editItem, setEditItem] = useState(null);

    const openModal = (item = null) => {
        setEditItem(item);
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
        setEditItem(null);
    };

    const groupedTableData = useMemo(() => {
        if (!viewConfig?.tableview?.groupBy || viewConfig?.tableview?.groupBy?.length === 0) {
            return data;
        }

        const groupByField = viewConfig?.tableview?.groupBy[0];
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

    const handleRowAction = (action, record) => {
        if (action === 'edit') {
            openModal(record);
        } else if (action === 'delete') {
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
        }
    };

    const handleBulkAction = (action) => {
        console.log(`Bulk action "${action}" triggered for selected rows.`);
        // Implement bulk action logic
    };

    const columns = viewConfig?.tableview?.fields?.map((fieldConfig) => ({
        title: fieldConfig.fieldName,
        dataIndex: fieldConfig.fieldName,
        key: fieldConfig.fieldName,
        sorter: (a, b) =>
            typeof a[fieldConfig.fieldName] === 'string'
                ? a[fieldConfig.fieldName].localeCompare(b[fieldConfig.fieldName])
                : a[fieldConfig.fieldName] - b[fieldConfig.fieldName],
    }));

    const actionMenu = (record) => (
        <Menu>
            {viewConfig?.tableview?.actions?.row?.map((action) => (
                <Menu.Item key={action} onClick={() => handleRowAction(action, record)}>
                    {action.charAt(0).toUpperCase() + action.slice(1)}
                </Menu.Item>
            ))}
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
                />
            </div>
        ));
    };

    return (
        <div>
            <div style={{ marginBottom: 16 }}>
                {viewConfig?.tableview?.actions?.bulk?.map((action) => (
                    <Button
                        key={action}
                        type="primary"
                        style={{ marginRight: 8 }}
                        onClick={() => handleBulkAction(action)}
                    >
                        {action.charAt(0).toUpperCase() + action.slice(1)}
                    </Button>
                ))}
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => openModal()}
                >
                    Add New Task
                </Button>
            </div>
            {viewConfig?.tableview?.groupBy && viewConfig?.tableview?.groupBy?.length > 0
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
                    />
                )}

            {/* Modal for Add/Edit */}
            <Modal
                title={editItem ? 'Edit Task' : 'Add New Task'}
                visible={isModalVisible}
                onCancel={closeModal}
                footer={null}
            >
                <DynamicForm
                    schemas={viewConfig}
                    formData={editItem || {}}
                    onFinish={(formData) => {
                        onFinish(formData, editItem);
                        closeModal();
                    }}
                />
            </Modal>
        </div>
    );
};

export default TableView;
