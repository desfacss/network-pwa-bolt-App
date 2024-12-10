import React, { useEffect, useState } from 'react';
import { Button, Select, Table, Space, Checkbox, Row, Col } from 'antd';
import { PlusOutlined, UpOutlined, DownOutlined, DeleteOutlined } from '@ant-design/icons';

const { Option } = Select;

const TableViewConfig = ({ configData, onSave, availableColumns }) => {
    const [fields, setFields] = useState(configData.fields || []);
    const [actions, setActions] = useState(configData.actions || {});
    const [groupBy, setGroupBy] = useState(configData.groupBy || []);
    const [exportOptions, setExportOptions] = useState(configData.exportOptions || []);
    const [showFeatures, setShowFeatures] = useState(configData.showFeatures || []);
    const [bulkActions, setBulkActions] = useState(configData.bulkActions || []);

    useEffect(() => {
        if (configData) {
            setFields(configData.fields || []);
            setActions(configData.actions || {});
            setGroupBy(configData.groupBy || []);
            setExportOptions(configData.exportOptions || []);
            setShowFeatures(configData.showFeatures || []);
            setBulkActions(configData.bulkActions || []);
        }
    }, [configData]);

    // Transform availableColumns to an array of column names (strings)
    const transformedColumns = availableColumns.map(col => col.columnname);

    const handleAddField = () => {
        setFields([...fields, { order: fields.length + 1, fieldName: '' }]);
    };

    const handleFieldChange = (index, key, value) => {
        const updatedFields = [...fields];
        updatedFields[index][key] = value;
        setFields(updatedFields);
    };

    const handleRemoveField = (index) => {
        const updatedFields = fields.filter((_, i) => i !== index);
        setFields(updatedFields);
    };

    const moveField = (index, direction) => {
        const newFields = [...fields];
        const [movedField] = newFields.splice(index, 1);
        newFields.splice(index + direction, 0, movedField);
        setFields(newFields.map((field, i) => ({ ...field, order: i + 1 }))); // Update order
    };

    const handleSaveConfig = () => {
        onSave({ fields, actions, groupBy, exportOptions, showFeatures, bulkActions });
    };

    const handleChangeActions = (actionType, value) => {
        setActions({ ...actions, [actionType]: value });
    };

    const columns = [
        {
            title: 'Order',
            dataIndex: 'order',
            key: 'order',
        },
        {
            title: 'Field Name',
            dataIndex: 'fieldName',
            key: 'fieldName',
            render: (text, record, index) => (
                <Select
                    value={record.fieldName || ''}  // Ensure that the value passed is a string
                    onChange={(value) => handleFieldChange(index, 'fieldName', value)}
                    style={{ width: '100%' }}
                >
                    {transformedColumns.map((col) => (
                        <Option key={col} value={col}>
                            {col}
                        </Option>
                    ))}
                </Select>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, __, index) => (
                <Space>
                    <Button
                        icon={<UpOutlined />}
                        onClick={() => moveField(index, -1)}
                        disabled={index === 0}
                    />
                    <Button
                        icon={<DownOutlined />}
                        onClick={() => moveField(index, 1)}
                        disabled={index === fields.length - 1}
                    />
                    <Button
                        icon={<DeleteOutlined />}
                        danger
                        onClick={() => handleRemoveField(index)}
                    />
                </Space>
            ),
        },
    ];

    return (
        <div>
            <h2>Table View Configuration</h2>
            <h3>Fields</h3>
            <Table
                dataSource={fields}
                columns={columns}
                rowKey="order"
                pagination={false}
                style={{ marginBottom: '20px' }}
            />
            <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={handleAddField}
                style={{ marginBottom: '20px' }}
            >
                Add Field
            </Button>

            <h3>Actions</h3>
            <Row gutter={[16, 16]}>
                <Col span={12}>
                    <p>Row Actions:</p>
                    <Select
                        mode="tags"
                        value={actions.row}
                        onChange={(value) => handleChangeActions('row', value)}
                        style={{ width: '100%' }}
                        placeholder="Select row actions"
                    >
                        <Option value="edit">Edit</Option>
                        <Option value="copy">Copy</Option>
                        <Option value="delete">Delete</Option>
                        <Option value="add_assignee">Add Assignee</Option>
                    </Select>
                </Col>
                <Col span={12}>
                    <p>Bulk Actions:</p>
                    <Select
                        mode="tags"
                        value={bulkActions}
                        onChange={(value) => setBulkActions(value)}
                        style={{ width: '100%' }}
                        placeholder="Select bulk actions"
                    >
                        <Option value="assign">Assign</Option>
                        <Option value="mark_complete">Mark Complete</Option>
                        <Option value="add_new_task">Add New Task</Option>
                    </Select>
                </Col>
            </Row>

            <h3>Group By</h3>
            <Select
                mode="tags"
                value={groupBy}
                onChange={(value) => setGroupBy(value)}
                style={{ width: '100%' }}
                placeholder="Select groupBy options"
            >
                <Option value="state">State</Option>
                <Option value="priority">Priority</Option>
                <Option value="assignee">Assignee</Option>
            </Select>

            <h3>Export Options</h3>
            <Select
                mode="tags"
                value={exportOptions}
                onChange={(value) => setExportOptions(value)}
                style={{ width: '100%' }}
                placeholder="Select export options"
            >
                <Option value="pdf">PDF</Option>
                <Option value="csv">CSV</Option>
            </Select>

            <h3>Show Features</h3>
            <Checkbox.Group
                options={[
                    { label: 'Column Visibility', value: 'columnVisibility' },
                    { label: 'Pagination', value: 'pagination' },
                    { label: 'Group By', value: 'groupBy' },
                    { label: 'Basic Search', value: 'basicSearch' },
                    { label: 'Sorting', value: 'sorting' },
                ]}
                value={showFeatures}
                onChange={setShowFeatures}
            />

            <Button type="primary" onClick={handleSaveConfig} style={{ marginTop: '20px' }}>
                Save Configuration
            </Button>
        </div>
    );
};

export default TableViewConfig;
