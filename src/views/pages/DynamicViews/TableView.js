import React, { useState, useMemo } from 'react';
import { Table, Button, Dropdown, Menu } from 'antd';
import { DownOutlined } from '@ant-design/icons';

const TableView = ({ data, viewConfig }) => {
    const [groupedData, setGroupedData] = useState(null);

    // Group Data if groupBy is defined
    const groupedTableData = useMemo(() => {
        if (!viewConfig.groupBy || viewConfig.groupBy.length === 0) {
            return data;
        }

        const groupByField = viewConfig.groupBy[0]; // Taking the first field for now
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

    // Define Table Columns
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
    }));

    // Action Menu
    const actionMenu = (record) => (
        <Menu>
            {viewConfig.actions.row.map((action) => (
                <Menu.Item key={action} onClick={() => handleRowAction(action, record)}>
                    {action.charAt(0).toUpperCase() + action.slice(1)}
                </Menu.Item>
            ))}
        </Menu>
    );

    const handleRowAction = (action, record) => {
        console.log(`Action "${action}" triggered for:`, record);
        // Implement your action logic here
    };

    const handleBulkAction = (action) => {
        console.log(`Bulk action "${action}" triggered for selected rows.`);
        // Implement your bulk action logic here
    };

    // Render grouped data if applicable
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
                    />
                )}
        </div>
    );
};

export default TableView;
