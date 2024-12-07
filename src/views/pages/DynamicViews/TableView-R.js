import React, { useState, useMemo } from 'react';
import { Table, Button, Dropdown, Menu, Modal, Input, Space, Checkbox } from 'antd';
import { DownOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import DynamicForm from '../DynamicForm';

const TableView = ({ data, viewConfig, updateData, deleteData, onFinish }) => {
    const [groupedData, setGroupedData] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [visibleColumns, setVisibleColumns] = useState(viewConfig?.tableview?.fields?.map(field => field.fieldName));
    const [groupBy, setGroupBy] = useState(viewConfig?.tableview?.groupBy ? viewConfig.tableview.groupBy[0] : null);

    const openModal = (item = null) => {
        setEditItem(item);
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
        setEditItem(null);
    };

    // Grouping data by the selected field
    const groupedTableData = useMemo(() => {
        if (!groupBy) return data;

        const groups = {};
        data.forEach((item) => {
            const groupKey = item[groupBy] || 'Ungrouped';
            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(item);
        });

        setGroupedData(groups);
        return groups;
    }, [data, groupBy]);

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

    const handleExport = (type) => {
        // Dummy export functionality based on the selected type (CSV or PDF)
        console.log(`Export to ${type} triggered`);
    };

    const handleSearchChange = (e) => {
        setSearchText(e.target.value);
    };

    const filteredData = useMemo(() => {
        if (!searchText) return data;
        return data.filter((item) => {
            return Object.values(item).some((value) =>
                String(value).toLowerCase().includes(searchText.toLowerCase())
            );
        });
    }, [data, searchText]);

    const columns = useMemo(() => {
        return viewConfig?.tableview?.fields?.map((fieldConfig) => ({
            title: fieldConfig.fieldName,
            dataIndex: fieldConfig.fieldName,
            key: fieldConfig.fieldName,
            sorter: (a, b) =>
                typeof a[fieldConfig.fieldName] === 'string'
                    ? a[fieldConfig.fieldName].localeCompare(b[fieldConfig.fieldName])
                    : a[fieldConfig.fieldName] - b[fieldConfig.fieldName],
            render: (text, record) => {
                if (!visibleColumns.includes(fieldConfig.fieldName)) {
                    return null; // If column is not visible, return null
                }
                return text;
            },
        }));
    }, [viewConfig, visibleColumns]);

    const actionMenu = (record) => (
        <Menu>
            {viewConfig?.tableview?.actions?.row?.map((action) => (
                <Menu.Item key={action} onClick={() => handleRowAction(action, record)}>
                    {action.charAt(0).toUpperCase() + action.slice(1)}
                </Menu.Item>
            ))}
        </Menu>
    );

    const handleGroupByChange = (value) => {
        setGroupBy(value);
    };

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

    const toggleColumnVisibility = (field) => {
        setVisibleColumns((prevState) => {
            if (prevState.includes(field)) {
                return prevState.filter((col) => col !== field);
            } else {
                return [...prevState, field];
            }
        });
    };

    const columnVisibilityMenu = (
        <Menu>
            {viewConfig?.tableview?.fields?.map((fieldConfig) => (
                <Menu.Item key={fieldConfig.fieldName}>
                    <Checkbox
                        checked={visibleColumns.includes(fieldConfig.fieldName)}
                        onChange={() => toggleColumnVisibility(fieldConfig.fieldName)}
                    >
                        {fieldConfig.fieldName}
                    </Checkbox>
                </Menu.Item>
            ))}
        </Menu>
    );

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

                {/* Export Options */}
                {viewConfig?.tableview?.actions?.export && (
                    <Dropdown
                        overlay={
                            <Menu>
                                {viewConfig?.tableview?.actions?.export.includes('csv') && (
                                    <Menu.Item key="csv" onClick={() => handleExport('CSV')}>
                                        Export to CSV
                                    </Menu.Item>
                                )}
                                {viewConfig?.tableview?.actions?.export.includes('pdf') && (
                                    <Menu.Item key="pdf" onClick={() => handleExport('PDF')}>
                                        Export to PDF
                                    </Menu.Item>
                                )}
                            </Menu>
                        }
                        trigger={['click']}
                    >
                        <Button>
                            Export <DownOutlined />
                        </Button>
                    </Dropdown>
                )}

                {/* Global Search */}
                <Space style={{ marginLeft: 16 }}>
                    <Input
                        placeholder="Search"
                        value={searchText}
                        onChange={handleSearchChange}
                        prefix={<SearchOutlined />}
                        style={{ width: 200 }}
                    />
                </Space>

                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => openModal()}
                    style={{ marginLeft: 16 }}
                >
                    Add New Task
                </Button>
            </div>

            {/* Column Visibility Toggle Dropdown */}
            <Dropdown overlay={columnVisibilityMenu} trigger={['click']}>
                <Button>
                    Column Visibility <DownOutlined />
                </Button>
            </Dropdown>

            {/* Group By Dropdown */}
            {viewConfig?.tableview?.groupBy?.length > 0 && (
                <Dropdown
                    overlay={
                        <Menu>
                            {viewConfig?.tableview?.groupBy?.map((field) => (
                                <Menu.Item key={field}>
                                    <Button onClick={() => handleGroupByChange(field)}>{`Group by ${field}`}</Button>
                                </Menu.Item>
                            ))}
                        </Menu>
                    }
                    trigger={['click']}
                >
                    <Button style={{ marginLeft: 8 }}>
                        Group By <DownOutlined />
                    </Button>
                </Dropdown>
            )}

            {viewConfig?.tableview?.groupBy && viewConfig?.tableview?.groupBy?.length > 0
                ? renderGroupedTable()
                : (
                    <Table
                        dataSource={filteredData}
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

export default TableView