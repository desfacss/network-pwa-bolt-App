import React, { useState, useMemo, useRef } from 'react';
import { Table, Button, Dropdown, Menu, Modal, Input, Space, Checkbox, Tag } from 'antd';
// import { DownOutlined, PlusOutlined, SearchOutlined,FilterOutlined, GroupOutlined } from '@ant-design/icons';
import { SearchOutlined, EditOutlined, DeleteOutlined, CopyOutlined, PlusOutlined, FilterOutlined, GroupOutlined, ExportOutlined } from '@ant-design/icons';
import DynamicForm from '../DynamicForm';
import { snakeCaseToTitleCase } from 'components/util-components/utils';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const actionIcons = {
    edit: <EditOutlined />,
    delete: <DeleteOutlined />,
    copy: <CopyOutlined />,
    add_new: <PlusOutlined />
};

const TableView = ({ data, viewConfig, fetchConfig, updateData, deleteData, openDrawer, users }) => {

    const pagination = {
        pageSizeOptions: ['10', '50', '100'], // Options for page sizes
        defaultPageSize: 10, // Initial page size
        showSizeChanger: true, // Enables the page size changer dropdown
        showQuickJumper: true, // Enables quick jump to a page
    }

    const [groupedData, setGroupedData] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [visibleColumns, setVisibleColumns] = useState(viewConfig?.tableview?.fields?.map(field => field?.fieldName));
    const [selectedGroupBy, setSelectedGroupBy] = useState(null);

    const { showFeatures, exportOptions, globalSearch, groupBy, viewLink, fields } = viewConfig?.tableview;


    const { session } = useSelector((state) => state.auth);
    const navigate = useNavigate();



    const handleRowAction = (action, record) => {
        // console.log("dr", record)
        if (action === 'details') {
            openDrawer(record, true);
        } else if (action === 'view') {
            navigate(`/app${viewLink}${record?.id}`)
        } else if (action === 'edit') {
            openDrawer(record);
        } else if (action === 'delete') {
            Modal.confirm({
                title: 'Are you sure you want to delete this record?',
                content: `This action cannot be undone. Record: ${record?.name}`,
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
        if (action?.startsWith('add_')) {
            openDrawer();
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

    // const filteredData = useMemo(() => {
    //     if (!searchText) return data;
    //     return data.filter((item) => {
    //         return Object.values(item).some((value) =>
    //             String(value).toLowerCase().includes(searchText.toLowerCase())
    //         );
    //     });
    // }, [data, searchText]);

    // const columns = useMemo(() => {
    //     return viewConfig?.tableview?.fields?.map((fieldConfig) => ({
    //         title: snakeCaseToTitleCase(fieldConfig?.fieldName),
    //         dataIndex: fieldConfig?.fieldName,
    //         key: fieldConfig?.fieldName,
    //         sorter: (a, b) =>
    //             typeof a[fieldConfig?.fieldName] === 'string'
    //                 ? a[fieldConfig?.fieldName].localeCompare(b[fieldConfig?.fieldName])
    //                 : a[fieldConfig?.fieldName] - b[fieldConfig?.fieldName],
    //         render: (text, record) => {
    //             if (!visibleColumns?.includes(fieldConfig?.fieldName)) {
    //                 return null; // If column is not visible, return null
    //             }

    //             // Check if fieldName exists in fetchConfig
    //             if (fetchConfig[fieldConfig?.fieldName]) {
    //                 const relatedDataKey = fieldConfig?.fieldName;
    //                 const relatedData = record?.related_data?.[relatedDataKey];
    //                 const column = fetchConfig[relatedDataKey]?.column;

    //                 // If related data and the specified column exist, return the value
    //                 return relatedData?.[column] ?? '-'; // Default to '-' if value is unavailable
    //             }

    //             return text
    //             // const truncatedText = text?.length > 20 ? `${text?.substring(0, 20)}...` : text;
    //             // console.log(truncatedText, text)
    //             // return (
    //             //     <Tooltip title={(truncatedText !== text) ? text : ''}>
    //             //         <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>
    //             //             {truncatedText}
    //             //         </div>
    //             //     </Tooltip>
    //             // );
    //         },
    //         ellipsis: true,
    //     })).filter((column) => visibleColumns?.includes(column?.key)); // Filter out invisible columns
    // }, [viewConfig, visibleColumns, fetchConfig]);

    // const getNestedValue = (object, path) => {
    //     return path.split('-').reduce((value, key) => (value ? value[key] : undefined), object);
    // };

    // const columns = useMemo(() => {
    //     return viewConfig?.tableview?.fields?.map((fieldConfig) => ({
    //         title: snakeCaseToTitleCase(fieldConfig?.fieldName),
    //         dataIndex: fieldConfig?.fieldName,
    //         key: fieldConfig?.fieldName,
    //         sorter: (a, b) => {
    //             const aValue = getNestedValue(a, fieldConfig?.fieldName);
    //             const bValue = getNestedValue(b, fieldConfig?.fieldName);

    //             if (typeof aValue === 'string' && typeof bValue === 'string') {
    //                 return aValue.localeCompare(bValue);
    //             }
    //             return aValue - bValue;
    //         },
    //         render: (text, record) => {
    //             if (!visibleColumns?.includes(fieldConfig?.fieldName)) {
    //                 return null; // If column is not visible, return null
    //             }

    //             const value = getNestedValue(record, fieldConfig?.fieldName);
    //             return value !== undefined ? value : null;
    //         },
    //         ellipsis: true,
    //     })).filter((column) => visibleColumns?.includes(column?.key)); // Filter out invisible columns
    // }, [viewConfig, visibleColumns, fetchConfig]);

    // const getNestedValue = (object, path) => {
    //     return path.split('-').reduce((value, key) => (value ? value[key] : undefined), object);
    // };

    // const getNestedValue = (object, path) => {
    //     if (!object || !path) return undefined;

    //     const keys = path?.split('-');

    //     return keys.reduce((result, key, index) => {
    //         if (!result) return undefined;

    //         // If `result` is an array, map over it and extract the next key
    //         if (Array.isArray(result)) {
    //             return result.map(item => ({
    //                 value: item[key],
    //                 id: item.id, // Include the id from the object
    //             })).filter(Boolean); // Remove undefined values
    //         }

    //         const value = result[key];

    //         // Return the value and id if it's the last key
    //         if (index === keys.length - 1) {
    //             return { value, id: result.id };
    //         }

    //         return value;
    //     }, object);
    // };

    const getNestedValue = (obj, path) => {
        if (!obj || !path) return undefined;

        const keys = path.split('-');

        return keys.reduce((result, key) => {
            if (!result) return undefined;

            // If result is an array, map over it and extract the next key
            if (Array.isArray(result)) {
                return result.map(item => item[key]).filter(Boolean); // Remove undefined values
            }

            return result[key];
        }, obj);
    };

    // const getNestedValue = (object, path) => {
    //     if (!object || !path) return undefined;

    //     const keys = path.split('-');

    //     const extractValues = (obj, keyIndex) => {
    //         if (keyIndex >= keys.length) return obj;

    //         const key = keys[keyIndex];

    //         if (Array.isArray(obj)) {
    //             // If it's an array, process each element recursively and flatten the results
    //             return obj.map(item => extractValues(item, keyIndex)).flat().filter(Boolean);
    //         }

    //         return extractValues(obj?.[key], keyIndex + 1);
    //     };

    //     return extractValues(object, 0);
    // };


    const formatColumnTitle = (fieldName) => {
        // Extract the part after the last underscore
        const cleanFieldName = fieldName.includes('_')
            ? fieldName.split('_').pop()  // Get the last part after '_'
            : fieldName;

        return snakeCaseToTitleCase(cleanFieldName);
    };
    console.log("tyu", data);



    const columns = useMemo(() => {
        return viewConfig?.tableview?.fields?.map((fieldConfig) => ({
            title: formatColumnTitle(fieldConfig?.fieldName), // Label always uses fieldName
            dataIndex: fieldConfig?.fieldPath || fieldConfig?.fieldName, // Use fieldPath if available
            key: fieldConfig?.fieldName, // Unique key from fieldName
            sorter: (a, b) => {
                const aValue = getNestedValue(a, fieldConfig?.fieldPath || fieldConfig?.fieldName);
                const bValue = getNestedValue(b, fieldConfig?.fieldPath || fieldConfig?.fieldName);

                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return aValue.localeCompare(bValue);
                }
                return aValue - bValue;
            },
            render: (text, record) => {
                if (!visibleColumns?.includes(fieldConfig?.fieldName)) {
                    return null; // If column is not visible, return null
                }

                const value = getNestedValue(record, fieldConfig?.fieldPath || fieldConfig?.fieldName);
                // If value is an array, render as Tags
                if (Array.isArray(value)) {
                    return (
                        <div>
                            {value.map((item, index) => (
                                <Tag key={index} color="blue">{item}</Tag>
                            ))}
                        </div>
                    );
                } else {
                    // If value is not an array, render as is
                    return value ?? null;
                }
                // // If value is an array, join values with commas
                // Array.isArray(value) ? console.log("vl", value, value.join(', ')) : console.log("vw", value)
                // return Array.isArray(value) ? value.join(', ') : value ?? null;
                // // return value !== undefined ? value : null;
            },
            ellipsis: true,
        })).filter((column) => visibleColumns?.includes(column?.key)); // Filter out invisible columns
    }, [viewConfig, visibleColumns, fetchConfig]);

    const filteredData = useMemo(() => {
        console.log("Filtering data with searchText:", searchText);
        if (!searchText) {
            console.log("No searchText, returning full data.");
            return data;
        }
        const filtered = data?.filter(item =>
            fields?.some(field => {
                // const value = getFieldValue(item, field);
                const value1 = getNestedValue(item, field?.fieldPath || field?.fieldName);
                const value = Array.isArray(value1) ? value1?.map(item => item.value)?.join(', ') : value1 ?? null;
                return String(value).toLowerCase().includes(searchText?.toLowerCase());
            })
        );
        console.log("Filtered Data:", filtered);
        return filtered;
    }, [data, searchText, fields]);

    // Grouping data by the selected field
    const groupedTableData = useMemo(() => {
        if (!selectedGroupBy) return filteredData; // If no selectedGroupBy selected, return flat data

        const groups = {};
        filteredData?.forEach((item) => {
            const groupKey = item[selectedGroupBy] || 'Ungrouped';
            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(item);
        });

        setGroupedData(groups);
        return groups;
    }, [filteredData, selectedGroupBy]);

    const canEditOrDelete = (item, rules) => {
        return rules?.some(rule => {
            const sessionValue = getNestedValue(session?.user, rule?.a);
            const itemValue = Array.isArray(rule.b) ? rule?.b : getNestedValue(item, rule?.b);

            if (rule?.op === "eq") {
                return sessionValue === itemValue;
            }
            if (rule?.op === "in") {
                return rule?.b?.includes(sessionValue);
            }
            return false;
        });
    };


    const actionMenu = (record) => (
        <Menu>
            {viewConfig?.tableview?.actions?.row?.map((action) => (
                <>
                    {!canEditOrDelete(record, viewConfig?.access_config?.[action === 'edit' ? 'canEdit' : 'canDelete']) &&
                        <Menu.Item key={action} onClick={() => handleRowAction(action, record)}>
                            {action.charAt(0).toUpperCase() + action.slice(1)}
                        </Menu.Item>}
                </>
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
                <Table size={"small"} dataSource={groupedData[group]} columns={columns} rowKey="id" pagination={pagination}
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
            // <Dropdown overlay={actionMenu(record)} trigger={['click']}>
            //     <Button>Actions</Button>
            // </Dropdown>
            <Space>
                {/* Existing Actions */}
                <Dropdown overlay={actionMenu(record)} trigger={['click']}>
                    <Button>Actions</Button>
                </Dropdown>
            </Space>
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
                    {/* {showFeatures.includes('basicSearch') && <Space style={{ marginLeft: 16 }}>
                        <Input
                            placeholder="Search"
                            value={searchText}
                            onChange={handleSearchChange}
                            prefix={<SearchOutlined />}
                            style={{ width: 200 }}
                        />
                    </Space>} */}
                    {viewConfig?.tableview.showFeatures?.includes('basicSearch') && (
                        <Space >
                            {/* <Space style={{ marginBottom: gridViewConfig.layout.spacing }}> */}
                            <Input
                                placeholder="Search"
                                prefix={<SearchOutlined />}
                                value={searchText}
                                onChange={e => setSearchText(e.target.value)}
                            />
                        </Space>
                    )}
                </div>

                {/* Right Section */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {/* Bulk Actions */}
                    {[
                        ...(viewConfig?.tableview?.actions?.bulk || [])//?.filter(action => !action.includes("add_new_"))
                        // ...(dynamicBulkActions || []), 
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
                <Table size={'small'} dataSource={filteredData} columns={allColumns} rowKey="id" pagination={pagination} />
            )}
        </div>
    );
};

export default TableView;
