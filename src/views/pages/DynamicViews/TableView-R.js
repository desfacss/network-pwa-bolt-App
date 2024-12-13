import React, { useState, useMemo } from 'react';
import { Table, Button, Dropdown, Menu, Modal, Input, Space, Checkbox, Tooltip } from 'antd';
// import { DownOutlined, PlusOutlined, SearchOutlined,FilterOutlined, GroupOutlined } from '@ant-design/icons';
import { DownOutlined, SearchOutlined, EditOutlined, DeleteOutlined, CopyOutlined, PlusOutlined, FilterOutlined, GroupOutlined, ExportOutlined } from '@ant-design/icons';
import DynamicForm from '../DynamicForm';
import { snakeCaseToTitleCase } from 'components/util-components/utils';

const actionIcons = {
    edit: <EditOutlined />,
    delete: <DeleteOutlined />,
    copy: <CopyOutlined />,
    add_new: <PlusOutlined />
};


const TableView = ({ data, viewConfig, updateData, deleteData, onFinish, users }) => {
    const [groupedData, setGroupedData] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [visibleColumns, setVisibleColumns] = useState(viewConfig?.tableview?.fields?.map(field => field?.fieldName));
    const [selectedGroupBy, setSelectedGroupBy] = useState(null); // Default to no group by

    const { showFeatures, exportOptions, globalSearch, groupBy } = viewConfig?.tableview;


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
        if (!selectedGroupBy) return data; // If no selectedGroupBy selected, return flat data

        const groups = {};
        data.forEach((item) => {
            const groupKey = item[selectedGroupBy] || 'Ungrouped';
            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(item);
        });

        setGroupedData(groups);
        return groups;
    }, [data, selectedGroupBy]);

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
        if (action === "add_new_task") {
            openModal();
        } else {
            console.log(`Bulk action "${action}" triggered. Placeholder for now.`);
        }
    };

    const bulkActionButtons = viewConfig?.tableview?.actions?.bulk?.map((action) => (
        <Button
            key={action}
            type="primary"
            style={{ marginRight: 8 }}
            onClick={() => handleBulkAction(action)}
        >
            {action === "add_new_task" ? "Add New Task" : `Placeholder for ${action}`}
        </Button>
    ));

    const handleExport = (type) => {
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
            title: snakeCaseToTitleCase(fieldConfig?.fieldName),
            dataIndex: fieldConfig?.fieldName,
            key: fieldConfig?.fieldName,
            sorter: (a, b) =>
                typeof a[fieldConfig?.fieldName] === 'string'
                    ? a[fieldConfig?.fieldName].localeCompare(b[fieldConfig?.fieldName])
                    : a[fieldConfig?.fieldName] - b[fieldConfig?.fieldName],
            render: (text, record) => {
                if (!visibleColumns?.includes(fieldConfig?.fieldName)) {
                    return null; // If column is not visible, return null
                }
                return text
                // const truncatedText = text?.length > 20 ? `${text?.substring(0, 20)}...` : text;
                // console.log(truncatedText, text)
                // return (
                //     <Tooltip title={(truncatedText !== text) ? text : ''}>
                //         <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>
                //             {truncatedText}
                //         </div>
                //     </Tooltip>
                // );
            },
            ellipsis: true,
        })).filter((column) => visibleColumns?.includes(column?.key)); // Filter out invisible columns
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
        setSelectedGroupBy(value);
    };

    const renderGroupedTable = () => {
        if (!groupedData) return null;

        return Object.keys(groupedData).map((group) => (
            <div key={group} style={{ marginBottom: 20 }}>
                <h3>{group}</h3>
                <Table
                    dataSource={groupedData[group]}
                    columns={columns}
                    rowKey="id"
                    // pagination={false}
                    pagination={{
                        pageSizeOptions: ['5', '10', '20', '50'], // Options for page sizes
                        defaultPageSize: 5, // Initial page size
                        showSizeChanger: true, // Enables the page size changer dropdown
                        showQuickJumper: true, // Enables quick jump to a page
                    }}
                    renderRow={(record) => (
                        <Dropdown overlay={actionMenu(record)} trigger={['click']}>
                            <Button>Actions</Button>
                        </Dropdown>
                    )}
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
                <Menu.Item key={fieldConfig?.fieldName}>
                    <Checkbox
                        checked={visibleColumns?.includes(fieldConfig?.fieldName)}
                        onChange={() => toggleColumnVisibility(fieldConfig?.fieldName)}
                    >
                        {fieldConfig?.fieldName}
                    </Checkbox>
                </Menu.Item>
            ))}
        </Menu>
    );

    const dynamicBulkActions = viewConfig?.tableview?.actions?.bulk?.filter(action =>
        action?.includes("add_new_")
    );

    // Always include action column, regardless of column visibility
    const actionColumn = {
        title: 'Actions',
        key: 'actions',
        render: (text, record) => (
            <Dropdown overlay={actionMenu(record)} trigger={['click']}>
                <Button>Actions</Button>
            </Dropdown>
        ),
    };

    const allColumns = useMemo(() => {
        const columnsWithActions = [...columns, actionColumn];
        return columnsWithActions;
    }, [columns]);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'nowrap', marginBottom: 16 }}>
                {/* Left Section */}
                <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    {/* Column Visibility Button */}
                    {showFeatures.includes('columnVisibility') && <Dropdown overlay={columnVisibilityMenu} trigger={['click']}>
                        <Button icon={<FilterOutlined />} style={{ marginRight: 8 }} />
                    </Dropdown>}

                    {/* Group By Button */}
                    {groupBy?.length > 0 && (
                        <Dropdown
                            overlay={
                                <Menu>
                                    <Menu.Item key="none" onClick={() => handleGroupByChange(null)}>
                                        None
                                    </Menu.Item>
                                    {viewConfig?.tableview?.groupBy?.map((field) => (
                                        <Menu.Item key={field} onClick={() => handleGroupByChange(field)}>
                                            {`Group by ${field}`}
                                        </Menu.Item>
                                    ))}
                                </Menu>
                            }
                            trigger={['click']}
                        >
                            <Button icon={<GroupOutlined />} style={{ marginLeft: 8 }} />
                        </Dropdown>
                    )}

                    {/* Search Bar */}
                    {showFeatures.includes('basicSearch') && <Space style={{ marginLeft: 16 }}>
                        <Input
                            placeholder="Search"
                            value={searchText}
                            onChange={handleSearchChange}
                            prefix={<SearchOutlined />}
                            style={{ width: 200 }}
                        />
                    </Space>}
                </div>

                {/* Right Section */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {/* Bulk Actions */}
                    {[
                        ...(dynamicBulkActions || []),
                        ...viewConfig?.tableview?.bulkActions//?.filter(action => !action.includes("add_new_"))
                    ].map((action) => (
                        <Button
                            key={action}
                            type="primary"
                            style={{ marginRight: 8 }}
                            onClick={() => handleBulkAction(action)}
                        >
                            {action
                                .split('_')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(' ')}
                        </Button>
                    ))}

                    {/* Export Dropdown with Icon */}
                    {exportOptions?.length > 0 && (
                        <Dropdown
                            overlay={
                                <Menu>
                                    {exportOptions.includes('csv') && (
                                        <Menu.Item key="csv" onClick={() => handleExport('CSV')}>
                                            Export to CSV
                                        </Menu.Item>
                                    )}
                                    {exportOptions.includes('pdf') && (
                                        <Menu.Item key="pdf" onClick={() => handleExport('PDF')}>
                                            Export to PDF
                                        </Menu.Item>
                                    )}
                                </Menu>
                            }
                            trigger={['click']}
                        >
                            <Button icon={<ExportOutlined />} style={{ marginLeft: 8 }} />
                        </Dropdown>
                    )}

                </div>
            </div>



            {/* Table with Action Icons */}
            {selectedGroupBy ? renderGroupedTable() : (
                <Table
                    dataSource={filteredData}
                    columns={allColumns}
                    rowKey="id"
                />
            )}

            {/* Modal for Adding/Editing Task */}
            <Modal
                title={editItem ? 'Edit Task' : 'Add New Task'}
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <DynamicForm
                    schemas={viewConfig}
                    formData={editItem || {}}
                    onFinish={(formData) => {
                        onFinish(formData, editItem);
                        setIsModalVisible(false);
                    }}
                />
            </Modal>
        </div>
    );
};

export default TableView;
