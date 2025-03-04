import React, { useEffect, useState } from 'react';
import { Button, Select, Table, Space, Checkbox, Row, Col, Input } from 'antd';
import { PlusOutlined, UpOutlined, DownOutlined, DeleteOutlined } from '@ant-design/icons';
import { snakeCaseToTitleCase, toSnakeCase } from 'components/util-components/utils';

const { Option } = Select;

const TableViewConfig = ({ configData, onSave, availableColumns, masterObject }) => {
    const [fields, setFields] = useState(configData?.fields || []);
    const [actions, setActions] = useState({
        row: configData?.actions?.row || [],
        bulk: configData?.actions?.bulk || [],
    });
    const [groupBy, setGroupBy] = useState(configData?.groupBy || []);
    const [exportOptions, setExportOptions] = useState(configData?.exportOptions || ['pdf', 'csv']);
    const [showFeatures, setShowFeatures] = useState(configData?.showFeatures || ["search", "enable_view", "columnVisibility", "pagination", "groupBy", "sorting"]);

    useEffect(() => {
        if (configData) {
            setActions({
                row: configData?.actions?.row || [],
                bulk: configData?.actions?.bulk || [],
            });
            setFields(configData?.fields || []);
            setGroupBy(configData?.groupBy || []);
            setExportOptions(configData?.exportOptions || ['pdf', 'csv']);
            setShowFeatures(configData?.showFeatures || ["search", "enable_view", "columnVisibility", "pagination", "groupBy", "sorting"]);
        }
    }, [configData]);

    // Transform availableColumns to an array of column names (strings)
    // const transformedColumns = availableColumns?.map(col => col.columnname);
    const transformedColumns = masterObject?.map(col => col.key);
    console.log("tre", availableColumns, transformedColumns, masterObject);
    const handleAddField = () => {
        setFields([...fields, { order: fields.length + 1, fieldName: '', fieldPath: '' }]);
    };

    const handleFieldChange = (index, key, value) => {
        const updatedFields = [...fields];
        updatedFields[index][key] = value;

        // Find the corresponding object in masterObject to get the display_name
        const selectedColumn = masterObject?.find(col => col?.key === value);
        if (selectedColumn) {
            updatedFields[index].fieldName = selectedColumn?.display_name;
        } else {
            updatedFields[index].fieldName = value; // If not found, reset to empty string
        }

        // // Keep fieldPath in sync with fieldName
        // if (key === 'fieldPath') {
        //     updatedFields[index]['fieldPath'] = value;
        // }
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
        onSave({ fields, actions, groupBy, exportOptions, showFeatures });
    };

    const handleChangeActions = (actionType, value) => {
        setActions((prevActions) => ({
            ...prevActions,
            [actionType]: value,
        }));
    };

    const columns = [
        {
            title: 'Order',
            dataIndex: 'order',
            key: 'order',
        },
        {
            title: 'Field',
            dataIndex: 'fieldPath',
            key: 'fieldPath',
            render: (text, record, index) => (
                <Select
                    value={record?.fieldPath || ''}  // Ensure that the value passed is a string
                    onChange={(value) => handleFieldChange(index, 'fieldPath', value)}
                    style={{ width: '100%' }}
                >
                    {transformedColumns?.map((col) => (
                        <Option key={col} value={col}>
                            {col}
                        </Option>
                    ))}
                </Select>
            ),
        },
        {
            title: 'Name',
            dataIndex: 'fieldName',
            key: 'fieldName',
            render: (text, record, index) => (
                // <Input placeholder="Display Name" defaultValue={record.fieldName || ''}
                //     onChange={(value) => handleFieldChange(index, 'fieldName', value)}
                // />
                <Input
                    value={record?.fieldName || ''}
                    onChange={(e) => handleFieldChange(index, 'fieldName', e.target.value)}
                    placeholder="Display Name"
                />
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

    const handleAddAction = (type) => {
        const newAction = { form: '', name: '' };
        setActions(prev => ({
            ...prev,
            [type]: [...prev[type], newAction]
        }));
    };

    const handleActionChange = (type, index, key, value) => {
        const updatedActions = [...actions[type]];
        updatedActions[index][key] = value;
        setActions(prev => ({
            ...prev,
            [type]: updatedActions
        }));
    };

    const handleRemoveAction = (type, index) => {
        const updatedActions = actions[type]?.filter((_, i) => i !== index);
        setActions(prev => ({
            ...prev,
            [type]: updatedActions
        }));
    };

    const renderActionRow = (action, index, type) => (
        <Row gutter={8} key={index}>
            <Col span={10}>
                <Input
                    value={action?.form}
                    onChange={(e) => handleActionChange(type, index, 'form', e.target.value)}
                    placeholder="Form"
                />
            </Col>
            <Col span={10}>
                <Input
                    value={action?.name}
                    onChange={(e) => handleActionChange(type, index, 'name', e.target.value)}
                    placeholder="Name"
                />
            </Col>
            <Col span={4}>
                <Button
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveAction(type, index)}
                    danger
                />
            </Col>
        </Row>
    );



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
                    <h4>Row Actions:</h4>
                    {actions?.row?.map((action, index) => renderActionRow(action, index, 'row'))}
                    <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        onClick={() => handleAddAction('row')}
                        style={{ marginTop: '10px' }}
                    >
                        Add Row Action
                    </Button>
                </Col>
                <Col span={12}>
                    <h4>Bulk Actions:</h4>
                    {actions?.bulk?.map((action, index) => renderActionRow(action, index, 'bulk'))}
                    <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        onClick={() => handleAddAction('bulk')}
                        style={{ marginTop: '10px' }}
                    >
                        Add Bulk Action
                    </Button>
                </Col>
            </Row>



            {/* <h3>Actions</h3> */}
            {/* <Row gutter={[16, 16]}>
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
                        value={actions?.bulk?.map(item => snakeCaseToTitleCase(item?.name))}
                        onChange={(value) => handleChangeActions('bulk', value?.map(item => toSnakeCase(item)))}
                        style={{ width: '100%' }}
                        placeholder="Select bulk actions"
                    >
                        <Option value="assign">Assign</Option>
                        <Option value="mark_complete">Mark Complete</Option>
                        <Option value="add_new_task">Add New Task</Option>
                    </Select>
                </Col>
            </Row> */}

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
                    { label: 'ENABLE VIEW', value: 'enable_view' },
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
