import React, { useEffect, useState } from 'react';
import { Button, Select, Table, Space, Checkbox, Row, Col, Input } from 'antd';
import { PlusOutlined, UpOutlined, DownOutlined, DeleteOutlined } from '@ant-design/icons';

const { Option } = Select;

const GridViewConfig = ({ configData, onSave, availableColumns, masterObject }) => {
    const [fields, setFields] = useState(configData?.fields || []);
    const [actions, setActions] = useState({
        row: configData?.actions?.row || [],
        bulk: configData?.actions?.bulk || [],
    });
    const [groupBy, setGroupBy] = useState(configData?.groupBy || []);
    const [exportOptions, setExportOptions] = useState(configData?.exportOptions || []);
    const [showFeatures, setShowFeatures] = useState(configData?.showFeatures || []);
    const [layout, setLayout] = useState(configData?.layout || {
        size: 'small',
        spacing: 16,
        maxWidth: '100%',
        cardStyle: {
            _boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            _borderRadius: '20px'
        },
        cardsPerRow: 1
    });
    const [viewLink, setViewLink] = useState(configData?.viewLink || '/gridview/');
    const [viewName, setViewName] = useState(configData?.viewName || 'GridView');

    useEffect(() => {
        if (configData) {
            setFields(configData.fields || []);
            setActions({
                row: configData.actions?.row || [],
                bulk: configData.actions?.bulk || [],
            });
            setGroupBy(configData.groupBy || []);
            setExportOptions(configData.exportOptions || []);
            setShowFeatures(configData.showFeatures || []);
            setLayout(configData.layout || {
                size: 'small',
                spacing: 16,
                maxWidth: '100%',
                cardStyle: {
                    _boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                    _borderRadius: '20px'
                },
                cardsPerRow: 1
            });
            setViewLink(configData.viewLink || '/gridview/');
            setViewName(configData.viewName || 'GridView');
        }
    }, [configData]);

    const transformedColumns = masterObject?.map(col => col.key);

    const handleAddField = () => {
        setFields([...fields, {
            order: fields.length + 1,
            fieldName: '',
            fieldPath: '',
            icon: '',
            _link: '',
            cardSection: '',
            display_name: ''
        }]);
    };

    const handleFieldChange = (index, key, value) => {
        const updatedFields = [...fields];
        updatedFields[index][key] = value;

        if (key === 'fieldPath') {
            const selectedColumn = masterObject?.find(col => col.key === value);
            if (selectedColumn) {
                updatedFields[index].fieldName = selectedColumn.display_name;
                updatedFields[index].display_name = selectedColumn.display_name;
            }
        }
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
        setFields(newFields.map((field, i) => ({ ...field, order: i + 1 })));
    };

    const handleSaveConfig = () => {
        onSave({
            fields,
            actions,
            groupBy,
            exportOptions,
            showFeatures,
            layout,
            viewLink,
            viewName
        });
    };

    const columns = [
        { title: 'Order', dataIndex: 'order', key: 'order' },
        {
            title: 'Field',
            dataIndex: 'fieldPath',
            key: 'fieldPath',
            render: (text, record, index) => (
                <Select
                    value={record.fieldPath}
                    onChange={(value) => handleFieldChange(index, 'fieldPath', value)}
                    style={{ width: '100%' }}
                >
                    {transformedColumns?.map(col => (
                        <Option key={col} value={col}>{col}</Option>
                    ))}
                </Select>
            ),
        },
        {
            title: 'Display Name',
            dataIndex: 'display_name',
            key: 'display_name',
            render: (text, record, index) => (
                <Input
                    value={record.display_name}
                    onChange={(e) => handleFieldChange(index, 'display_name', e.target.value)}
                    placeholder="Display Name"
                />
            ),
        },
        {
            title: 'Icon',
            dataIndex: 'icon',
            key: 'icon',
            render: (text, record, index) => (
                <Input
                    value={record.icon}
                    onChange={(e) => handleFieldChange(index, 'icon', e.target.value)}
                    placeholder="Icon Name"
                />
            ),
        },
        {
            title: 'Link',
            dataIndex: '_link',
            key: '_link',
            render: (text, record, index) => (
                <Input
                    value={record._link}
                    onChange={(e) => handleFieldChange(index, '_link', e.target.value)}
                    placeholder="Link URL"
                />
            ),
        },
        {
            title: 'Card Section',
            dataIndex: 'cardSection',
            key: 'cardSection',
            render: (text, record, index) => (
                <Select
                    value={record.cardSection}
                    onChange={(value) => handleFieldChange(index, 'cardSection', value)}
                    style={{ width: '100%' }}
                >
                    <Option value="title">Title</Option>
                    <Option value="body">Body</Option>
                    <Option value="footer">Footer</Option>
                </Select>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, __, index) => (
                <Space>
                    <Button icon={<UpOutlined />} onClick={() => moveField(index, -1)} disabled={index === 0} />
                    <Button icon={<DownOutlined />} onClick={() => moveField(index, 1)} disabled={index === fields.length - 1} />
                    <Button icon={<DeleteOutlined />} danger onClick={() => handleRemoveField(index)} />
                </Space>
            ),
        },
    ];

    const handleAddAction = (type) => {
        setActions(prev => ({
            ...prev,
            [type]: [...prev[type], { form: '', name: '' }]
        }));
    };

    const handleActionChange = (type, index, key, value) => {
        const updatedActions = [...actions[type]];
        updatedActions[index][key] = value;
        setActions(prev => ({ ...prev, [type]: updatedActions }));
    };

    const handleRemoveAction = (type, index) => {
        const updatedActions = actions[type].filter((_, i) => i !== index);
        setActions(prev => ({ ...prev, [type]: updatedActions }));
    };

    const renderActionRow = (action, index, type) => (
        <Row gutter={8} key={index}>
            <Col span={10}>
                <Input
                    value={action.form}
                    onChange={(e) => handleActionChange(type, index, 'form', e.target.value)}
                    placeholder="Form"
                />
            </Col>
            <Col span={10}>
                <Input
                    value={action.name}
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
            <h2>Grid View Configuration</h2>

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

            <h3>Layout Configuration</h3>
            <Row gutter={[16, 16]}>
                <Col span={8}>
                    <p>Size:</p>
                    <Select
                        value={layout.size}
                        onChange={(value) => setLayout(prev => ({ ...prev, size: value }))}
                        style={{ width: '100%' }}
                    >
                        <Option value="small">Small</Option>
                        <Option value="medium">Medium</Option>
                        <Option value="large">Large</Option>
                    </Select>
                </Col>
                <Col span={8}>
                    <p>Spacing:</p>
                    <Input
                        value={layout.spacing}
                        onChange={(e) => setLayout(prev => ({ ...prev, spacing: Number(e.target.value) }))}
                        type="number"
                    />
                </Col>
                <Col span={8}>
                    <p>Cards Per Row:</p>
                    <Input
                        value={layout.cardsPerRow}
                        onChange={(e) => setLayout(prev => ({ ...prev, cardsPerRow: Number(e.target.value) }))}
                        type="number"
                    />
                </Col>
                <Col span={12}>
                    <p>Max Width:</p>
                    <Input
                        value={layout.maxWidth}
                        onChange={(e) => setLayout(prev => ({ ...prev, maxWidth: e.target.value }))}
                    />
                </Col>
                <Col span={12}>
                    <p>Box Shadow:</p>
                    <Input
                        value={layout.cardStyle._boxShadow}
                        onChange={(e) => setLayout(prev => ({
                            ...prev,
                            cardStyle: { ...prev.cardStyle, _boxShadow: e.target.value }
                        }))}
                    />
                </Col>
            </Row>

            <h3>Actions</h3>
            <Row gutter={[16, 16]}>
                <Col span={12}>
                    <h4>Row Actions:</h4>
                    {actions.row.map((action, index) => renderActionRow(action, index, 'row'))}
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
                    {actions.bulk.map((action, index) => renderActionRow(action, index, 'bulk'))}
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

            <h3>Group By</h3>
            <Select
                mode="tags"
                value={groupBy}
                onChange={setGroupBy}
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
                onChange={setExportOptions}
                style={{ width: '100%' }}
                placeholder="Select export options"
            >
                <Option value="pdf">PDF</Option>
                <Option value="csv">CSV</Option>
            </Select>

            <h3>Show Features</h3>
            <Checkbox.Group
                options={[
                    { label: 'Search', value: 'search' },
                    { label: 'Column Visibility', value: 'columnVisibility' },
                    { label: 'Pagination', value: 'pagination' },
                    { label: 'Group By', value: 'groupBy' },
                    { label: 'Sorting', value: 'sorting' },
                    { label: 'Enable View', value: 'enable_view' }
                ]}
                value={showFeatures}
                onChange={setShowFeatures}
            />

            <h3>View Settings</h3>
            <Row gutter={[16, 16]}>
                <Col span={12}>
                    <p>View Link:</p>
                    <Input
                        value={viewLink}
                        onChange={(e) => setViewLink(e.target.value)}
                        placeholder="/gridview/"
                    />
                </Col>
                <Col span={12}>
                    <p>View Name:</p>
                    <Input
                        value={viewName}
                        onChange={(e) => setViewName(e.target.value)}
                        placeholder="GridView"
                    />
                </Col>
            </Row>

            <Button
                type="primary"
                onClick={handleSaveConfig}
                style={{ marginTop: '20px' }}
            >
                Save Configuration
            </Button>
        </div>
    );
};

export default GridViewConfig;