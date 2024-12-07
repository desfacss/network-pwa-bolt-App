import React, { useState, useMemo } from 'react';
import { Table, Button, Dropdown, Menu, Input, Modal, Select, Checkbox, Pagination } from 'antd';
import { DownOutlined, SearchOutlined } from '@ant-design/icons';

const { Option } = Select;

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
    const [groupByField, setGroupByField] = useState(null);
    const [visibleColumns, setVisibleColumns] = useState(viewConfig.fields.map(f => f.fieldName));
    const [columnsOrder, setColumnsOrder] = useState(viewConfig.fields.map(f => f.fieldName)); // Store the order of columns
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const { showFeatures, exportOptions, globalSearch } = viewConfig;

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
    };

    // Handle Bulk Actions
    const handleBulkAction = (action) => {
        console.log(`Bulk action "${action}" triggered for selected rows.`);
        // Implement your bulk action logic here
    };

    const groupedData = useMemo(() => {
        if (!groupByField) {
            return { Default: data };
        }

        const groups = {};
        data.forEach((item) => {
            const groupKey = item[groupByField] || 'Ungrouped';
            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(item);
        });

        return groups;
    }, [data, groupByField]);

    const handleSave = (updatedRow) => updateData(updatedRow);

    const columns = useMemo(() => {
        return viewConfig.fields
            .filter(fieldConfig => visibleColumns.includes(fieldConfig.fieldName)) // Filter visible columns
            .map((fieldConfig) => ({
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
    }, [viewConfig, visibleColumns]);

    const actionMenu = (record) => (
        <Menu>
            {viewConfig.actions.row.map((action) => (
                <Menu.Item key={action} onClick={() => handleRowAction(action, record)}>
                    {action.charAt(0).toUpperCase() + action.slice(1)}
                </Menu.Item>
            ))}
        </Menu>
    );

    const handleColumnVisibilityChange = (checkedValues) => {
        setVisibleColumns(checkedValues);
    };

    const renderGroupedTable = () => {
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

    const columnVisibilityMenu = (
        <Menu>
            {viewConfig.fields.map((col) => (
                <Menu.Item key={col.fieldName}>
                    <Checkbox
                        checked={visibleColumns.includes(col.fieldName)}
                        onChange={(e) => handleColumnVisibilityChange(e.target.checked ? [...visibleColumns, col.fieldName] : visibleColumns.filter(c => c !== col.fieldName))}
                    >
                        {col.fieldName}
                    </Checkbox>
                </Menu.Item>
            ))}
        </Menu>
    );

    const renderPagination = () => {
        return (
            <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={data.length}
                onChange={(page, size) => {
                    setCurrentPage(page);
                    setPageSize(size);
                }}
            />
        );
    };

    const renderGlobalSearch = () => {
        return globalSearch.includes('dateRange') && (
            <div style={{ marginBottom: 16 }}>
                <Input
                    placeholder="Search by date range"
                    prefix={<SearchOutlined />}
                    onChange={(e) => console.log("Search query:", e.target.value)}
                />
            </div>
        );
    };

    const handleExport = (type) => {
        console.log(`Export as ${type}`);
        // Implement export logic here for pdf/csv
    };

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
                {viewConfig.actions.bulk.map((action) => (
                    <Button
                        key={action}
                        type="primary"
                        onClick={() => handleBulkAction(action)}
                    >
                        {action.charAt(0).toUpperCase() + action.slice(1)}
                    </Button>
                ))}
                {showFeatures.includes('groupBy') && (
                    <Select
                        style={{ width: 200 }}
                        placeholder="Group By"
                        onChange={(value) => setGroupByField(value)}
                        allowClear
                    >
                        {viewConfig.groupBy.map((field) => (
                            <Option key={field} value={field}>
                                {field.charAt(0).toUpperCase() + field.slice(1)}
                            </Option>
                        ))}
                    </Select>
                )}
                {showFeatures.includes('columnVisibility') && (
                    <Dropdown overlay={columnVisibilityMenu} trigger={['click']}>
                        <Button>Column Visibility</Button>
                    </Dropdown>
                )}
                {exportOptions.length > 0 && (
                    <Dropdown overlay={
                        <Menu>
                            {exportOptions.includes('csv') && <Menu.Item key="csv" onClick={() => handleExport('csv')}>Export as CSV</Menu.Item>}
                            {exportOptions.includes('pdf') && <Menu.Item key="pdf" onClick={() => handleExport('pdf')}>Export as PDF</Menu.Item>}
                        </Menu>
                    }>
                        <Button>Export</Button>
                    </Dropdown>
                )}
            </div>

            {renderGlobalSearch()}

            {groupByField
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
                        pagination={false}
                        components={{
                            body: {
                                cell: EditableCell,
                            },
                        }}
                    />
                )}

            {showFeatures.includes('pagination') && renderPagination()}
        </div>
    );
};

export default TableView;
