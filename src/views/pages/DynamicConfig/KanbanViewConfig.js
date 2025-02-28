import React, { useEffect, useState } from 'react';
import { Button, Row, Col, Input, Space, Select, Drawer, Checkbox } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { Option } = Select;

const KanbanViewConfigEditor = ({ configData, onSave }) => {
    const [actions, setActions] = useState({
        row: configData?.actions?.row || [],
        bulk: configData?.actions?.bulk || [],
    });
    const [groupBy, setGroupBy] = useState(configData?.groupBy || '');
    const [exportOptions, setExportOptions] = useState(configData?.exportOptions || []);
    const [types, setTypes] = useState(
        configData?.types || {
            priority: [
                { name: 'Low', sequence: 1, color: '' },
                { name: 'Medium', sequence: 2, color: '' },
                { name: 'High', sequence: 3, color: '' },
                { name: 'Critical', sequence: 4, color: '' },
            ],
            status: [
                { name: 'New', sequence: 1, color: '' },
                { name: 'Pending', sequence: 2, color: '' },
                { name: 'Completed', sequence: 3, color: '' },
                { name: 'Halted', sequence: 4, color: '' },
            ],
        }
    );
    const [isTypesDrawerVisible, setIsTypesDrawerVisible] = useState(false);
    const [newTypeName, setNewTypeName] = useState('');
    const [showFeatures, setShowFeatures] = useState(configData?.showFeatures || []);

    useEffect(() => {
        if (configData) {
            setActions({
                row: configData?.actions?.row || [],
                bulk: configData?.actions?.bulk || [],
            });
            setGroupBy(configData?.groupBy || '');
            setExportOptions(configData?.exportOptions || []);
            setTypes(configData?.types || types);
            setShowFeatures(configData?.showFeatures || []);
        }
    }, [configData]);

    const handleSaveConfig = () => {
        const updatedConfig = {
            actions: {
                row: actions.row,
                bulk: actions.bulk,
            },
            groupBy,
            exportOptions,
            types,
            showFeatures,
        };
        onSave(updatedConfig);
    };

    // Action Handlers
    const handleAddAction = (type) => {
        const newAction = { form: '', name: '' };
        setActions((prev) => ({
            ...prev,
            [type]: [...prev[type], newAction],
        }));
    };

    const handleActionChange = (type, index, key, value) => {
        const updatedActions = [...actions[type]];
        updatedActions[index][key] = value;
        setActions((prev) => ({
            ...prev,
            [type]: updatedActions,
        }));
    };

    const handleRemoveAction = (type, index) => {
        const updatedActions = actions[type].filter((_, i) => i !== index);
        setActions((prev) => ({
            ...prev,
            [type]: updatedActions,
        }));
    };

    const renderActionRow = (action, index, type) => (
        <Row gutter={8} key={index} style={{ marginBottom: 8 }}>
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

    // Type Handlers
    const handleAddNewType = () => {
        if (newTypeName && !types[newTypeName]) {
            setTypes((prev) => ({
                ...prev,
                [newTypeName]: [{ name: '', sequence: 1, color: '' }],
            }));
            setNewTypeName('');
        }
    };

    const handleAddTypeItem = (typeKey) => {
        const updatedTypes = { ...types };
        updatedTypes[typeKey].push({ name: '', sequence: updatedTypes[typeKey].length + 1, color: '' });
        setTypes(updatedTypes);
    };

    const handleTypeChange = (typeKey, index, key, value) => {
        const updatedTypes = { ...types };
        updatedTypes[typeKey][index][key] = value;
        setTypes(updatedTypes);
    };

    const handleRemoveTypeItem = (typeKey, index) => {
        const updatedTypes = { ...types };
        updatedTypes[typeKey] = updatedTypes[typeKey].filter((_, i) => i !== index);
        setTypes(updatedTypes);
    };

    const handleRemoveType = (typeKey) => {
        const updatedTypes = { ...types };
        delete updatedTypes[typeKey];
        setTypes(updatedTypes);
        if (groupBy === typeKey) setGroupBy('');
    };

    const renderTypeRow = (item, index, typeKey) => (
        <Row gutter={8} key={index} style={{ marginBottom: 8 }}>
            <Col span={8}>
                <Input
                    value={item.name}
                    onChange={(e) => handleTypeChange(typeKey, index, 'name', e.target.value)}
                    placeholder="Name"
                />
            </Col>
            <Col span={4}>
                <Input
                    type="number"
                    value={item.sequence}
                    onChange={(e) => handleTypeChange(typeKey, index, 'sequence', e.target.value)}
                    placeholder="Sequence"
                />
            </Col>
            <Col span={8}>
                <Input
                    type="color"
                    value={item.color || '#000000'}
                    onChange={(e) => handleTypeChange(typeKey, index, 'color', e.target.value)}
                    placeholder="Color"
                />
            </Col>
            <Col span={4}>
                <Button
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveTypeItem(typeKey, index)}
                    danger
                />
            </Col>
        </Row>
    );

    const renderTypeSection = (typeKey) => (
        <div key={typeKey} style={{ marginBottom: 16 }}>
            <Row justify="space-between" align="middle">
                <h4>{typeKey.charAt(0).toUpperCase() + typeKey.slice(1)}</h4>
                <Button
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveType(typeKey)}
                    danger
                    size="small"
                />
            </Row>
            {types[typeKey].map((item, index) => renderTypeRow(item, index, typeKey))}
            <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => handleAddTypeItem(typeKey)}
                style={{ marginTop: '10px' }}
            >
                Add Item
            </Button>
        </div>
    );

    return (
        <div>
            <h2>Kanban View Configuration</h2>

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

            <h3>Default Group By</h3>
            <Select
                value={groupBy}
                onChange={(value) => setGroupBy(value)}
                style={{ width: '100%' }}
                placeholder="Select default groupBy"
            >
                {Object.keys(types).map((typeKey) => (
                    <Option key={typeKey} value={typeKey}>
                        {typeKey.charAt(0).toUpperCase() + typeKey.slice(1)}
                    </Option>
                ))}
            </Select>

            <h3>Export Options</h3>
            <Select
                mode="multiple"
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
                    { label: 'Enable View', value: 'enable_view' },
                ]}
                value={showFeatures}
                onChange={setShowFeatures}
            />

            <Button
                type="link"
                onClick={() => setIsTypesDrawerVisible(true)}
                style={{ marginTop: '10px' }}
            >
                Edit Types
            </Button>

            <Button
                type="primary"
                onClick={handleSaveConfig}
                style={{ marginTop: '20px' }}
            >
                Save Configuration
            </Button>

            {/* Drawer for Types Editing */}
            <Drawer
                title="Edit Kanban Types"
                visible={isTypesDrawerVisible}
                onClose={() => setIsTypesDrawerVisible(false)}
                width={500}
            >
                <h4>Add New Type</h4>
                <Space style={{ marginBottom: 16 }}>
                    <Input
                        value={newTypeName}
                        onChange={(e) => setNewTypeName(e.target.value)}
                        placeholder="New type name (e.g., 'category')"
                    />
                    <Button type="primary" onClick={handleAddNewType}>
                        Add
                    </Button>
                </Space>

                {Object.keys(types).map((typeKey) => renderTypeSection(typeKey))}
            </Drawer>
        </div>
    );
};

export default KanbanViewConfigEditor;