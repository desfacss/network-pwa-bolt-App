import React, { useEffect, useState } from 'react';
import { Button, Select, Table, Space, Checkbox, Row, Col, Input, Modal, Form } from 'antd';
import { PlusOutlined, UpOutlined, DownOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';

const { Option } = Select;

const DetailsOverviewConfig = ({ configData, onSave, availableColumns, masterObject }) => {
    const [groups, setGroups] = useState(configData?.groups || []);
    const [actions, setActions] = useState(configData?.actions || []);
    const [dividers, setDividers] = useState(configData?.dividers || []);
    const [styleModalVisible, setStyleModalVisible] = useState(false);
    const [currentGroupIndex, setCurrentGroupIndex] = useState(null);
    const [currentFieldIndex, setCurrentFieldIndex] = useState(null);
    const [form] = Form.useForm();

    // Initialize state with configData
    useEffect(() => {
        if (configData) {
            const initializedGroups = (configData?.groups || []).map(group => ({
                ...group,
                fields: group.fields.map(field => ({
                    ...field,
                    style: field?.style || {},
                    label: field?.label !== undefined ? field?.label : '',
                    webLink: field?.webLink || false,
                    link: field?.link || '',
                })),
                private: group?.private || false,
                privacy_control: group?.privacy_control || false,
                show_group_name: group?.show_group_name !== undefined ? group?.show_group_name : true,
            }));
            setGroups(initializedGroups);
            setActions(configData?.actions || []);
            setDividers(configData?.dividers || []);
        }
    }, [configData]);

    const transformedColumns = masterObject?.map(col => col.key) || [];

    // Group Management
    const handleAddGroup = () => {
        setGroups([...groups, { name: `Group ${groups.length + 1}`, order: groups.length + 1, fields: [], show_group_name: true }]);
    };

    const handleGroupChange = (index, key, value) => {
        const updatedGroups = [...groups];
        updatedGroups[index][key] = key === 'order' ? Number(value) : value;
        setGroups(updatedGroups);
    };

    const handleRemoveGroup = (index) => {
        setGroups(groups.filter((_, i) => i !== index));
    };

    // Field Management
    const handleAddField = (groupIndex) => {
        const updatedGroups = [...groups];
        updatedGroups[groupIndex].fields.push({
            order: updatedGroups[groupIndex].fields.length + 1,
            fieldPath: '',
            label: '',
            icon: '',
            link: '',
            style: {},
            webLink: false,
        });
        setGroups(updatedGroups);
    };

    const handleFieldChange = (groupIndex, fieldIndex, key, value) => {
        const updatedGroups = [...groups];
        updatedGroups[groupIndex].fields[fieldIndex][key] = value;
        if (key === 'fieldPath') {
            const selectedColumn = masterObject?.find(col => col.key === value);
            if (selectedColumn) {
                updatedGroups[groupIndex].fields[fieldIndex].label = selectedColumn?.display_name || updatedGroups[groupIndex].fields[fieldIndex].label;
            }
        }
        setGroups(updatedGroups);
    };

    const handleRemoveField = (groupIndex, fieldIndex) => {
        const updatedGroups = [...groups];
        updatedGroups[groupIndex].fields = updatedGroups[groupIndex].fields.filter((_, i) => i !== fieldIndex);
        setGroups(updatedGroups);
    };

    const moveField = (groupIndex, fieldIndex, direction) => {
        const updatedGroups = [...groups];
        const fields = [...updatedGroups[groupIndex].fields];
        const [movedField] = fields.splice(fieldIndex, 1);
        fields.splice(fieldIndex + direction, 0, movedField);
        updatedGroups[groupIndex].fields = fields.map((field, i) => ({ ...field, order: i + 1 }));
        setGroups(updatedGroups);
    };

    // Style Modal
    const openStyleModal = (groupIndex, fieldIndex) => {
        setCurrentGroupIndex(groupIndex);
        setCurrentFieldIndex(fieldIndex);
        form.setFieldsValue(groups[groupIndex].fields[fieldIndex].style || {});
        setStyleModalVisible(true);
    };

    const handleStyleOk = () => {
        const styleValues = form.getFieldsValue();
        const updatedGroups = [...groups];
        updatedGroups[currentGroupIndex].fields[currentFieldIndex].style = styleValues;
        setGroups(updatedGroups);
        setStyleModalVisible(false);
    };

    const handleAddStyle = () => {
        const updatedGroups = [...groups];
        if (!updatedGroups[currentGroupIndex].fields[currentFieldIndex]?.style) {
            updatedGroups[currentGroupIndex].fields[currentFieldIndex].style = {};
        }
        const styleArray = Object.entries(updatedGroups[currentGroupIndex].fields[currentFieldIndex]?.style)?.map(([key, value]) => ({ key, value }));
        styleArray.push({ key: '', value: '' });
        updatedGroups[currentGroupIndex].fields[currentFieldIndex].style = Object.fromEntries(styleArray.map(item => [item.key, item.value]));
        setGroups(updatedGroups);
    };

    const handleStyleChange = (styleIndex, keyOrValue, value) => {
        const updatedGroups = [...groups];
        const styleArray = Object.entries(updatedGroups[currentGroupIndex].fields[currentFieldIndex]?.style || {}).map(([key, val]) => ({ key, value: val }));
        styleArray[styleIndex][keyOrValue] = value;
        updatedGroups[currentGroupIndex].fields[currentFieldIndex].style = Object.fromEntries(styleArray.map(item => [item.key, item.value]));
        setGroups(updatedGroups);
    };

    const handleRemoveStyle = (styleIndex) => {
        const updatedGroups = [...groups];
        const styleArray = Object.entries(updatedGroups[currentGroupIndex].fields[currentFieldIndex]?.style).map(([key, value]) => ({ key, value }));
        styleArray.splice(styleIndex, 1);
        updatedGroups[currentGroupIndex].fields[currentFieldIndex].style = Object.fromEntries(styleArray.map(item => [item.key, item.value]));
        setGroups(updatedGroups);
    };

    const getStyleDataSource = () => {
        if (currentGroupIndex === null || currentFieldIndex === null || !groups[currentGroupIndex]?.fields[currentFieldIndex]?.style) return [];
        return Object.entries(groups[currentGroupIndex].fields[currentFieldIndex]?.style).map(([key, value]) => ({ key, value }));
    };

    // Action Management
    const handleAddAction = () => {
        setActions([...actions, { form: '', name: '' }]);
    };

    const handleActionChange = (index, key, value) => {
        const updatedActions = [...actions];
        updatedActions[index][key] = value;
        setActions(updatedActions);
    };

    const handleRemoveAction = (index) => {
        setActions(actions.filter((_, i) => i !== index));
    };

    // Divider Management
    const handleDividerChange = (value) => {
        setDividers(value);
    };

    // Save Configuration
    const handleSaveConfig = () => {
        onSave({ groups, actions, dividers });
    };

    // Table Columns
    const styleColumns = [
        { title: 'Style Key', dataIndex: 'key', key: 'key', render: (text, record, index) => <Input value={text} onChange={(e) => handleStyleChange(index, 'key', e.target.value)} placeholder="e.g., fontSize" /> },
        { title: 'Value', dataIndex: 'value', key: 'value', render: (text, record, index) => <Input value={text} onChange={(e) => handleStyleChange(index, 'value', e.target.value)} placeholder="e.g., 16px" /> },
        { title: 'Actions', key: 'actions', render: (_, __, index) => <Button icon={<DeleteOutlined />} danger onClick={() => handleRemoveStyle(index)} /> },
    ];

    const fieldColumns = (groupIndex) => [
        { title: 'Order', dataIndex: 'order', key: 'order', width: 80 },
        {
            title: 'Field Path',
            dataIndex: 'fieldPath',
            key: 'fieldPath',
            render: (text, record, index) => (
                <Select value={record.fieldPath} onChange={(value) => handleFieldChange(groupIndex, index, 'fieldPath', value)} style={{ width: '100%' }}>
                    {transformedColumns.map(col => <Option key={col} value={col}>{col}</Option>)}
                </Select>
            ),
        },
        {
            title: 'Label',
            dataIndex: 'label',
            key: 'label',
            render: (text, record, index) => (
                <Input value={record.label} onChange={(e) => handleFieldChange(groupIndex, index, 'label', e.target.value)} placeholder="Label" />
            ),
        },
        {
            title: 'Icon',
            dataIndex: 'icon',
            key: 'icon',
            render: (text, record, index) => (
                <Input value={record.icon} onChange={(e) => handleFieldChange(groupIndex, index, 'icon', e.target.value)} placeholder="Icon Name" />
            ),
        },
        {
            title: 'Link',
            dataIndex: 'link',
            key: 'link',
            render: (text, record, index) => (
                <Input value={record.link} onChange={(e) => handleFieldChange(groupIndex, index, 'link', e.target.value)} placeholder="Link URL" />
            ),
        },
        {
            title: 'Web Link',
            dataIndex: 'webLink',
            key: 'webLink',
            render: (text, record, index) => (
                <Checkbox checked={record.webLink} onChange={(e) => handleFieldChange(groupIndex, index, 'webLink', e.target.checked)} />
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, __, index) => (
                <Space>
                    <Button icon={<UpOutlined />} onClick={() => moveField(groupIndex, index, -1)} disabled={index === 0} />
                    <Button icon={<DownOutlined />} onClick={() => moveField(groupIndex, index, 1)} disabled={index === groups[groupIndex].fields.length - 1} />
                    <Button icon={<EditOutlined />} onClick={() => openStyleModal(groupIndex, index)} />
                    <Button icon={<DeleteOutlined />} danger onClick={() => handleRemoveField(groupIndex, index)} />
                </Space>
            ),
        },
    ];

    const renderActionRow = (action, index) => (
        <Row gutter={8} key={index}>
            <Col span={10}>
                <Input value={action.form} onChange={(e) => handleActionChange(index, 'form', e.target.value)} placeholder="Form" />
            </Col>
            <Col span={10}>
                <Input value={action.name} onChange={(e) => handleActionChange(index, 'name', e.target.value)} placeholder="Name" />
            </Col>
            <Col span={4}>
                <Button icon={<DeleteOutlined />} onClick={() => handleRemoveAction(index)} danger />
            </Col>
        </Row>
    );

    return (
        <div>
            <h2>Details Overview Configuration</h2>

            {/* Groups Section */}
            <h3>Groups</h3>
            {groups.map((group, groupIndex) => (
                <div key={groupIndex} style={{ marginBottom: '20px', border: '1px solid #f0f0f0', padding: '16px', borderRadius: '8px' }}>
                    <Row gutter={16} align="middle">
                        <Col span={8}>
                            <Input value={group.name} onChange={(e) => handleGroupChange(groupIndex, 'name', e.target.value)} placeholder="Group Name" />
                        </Col>
                        <Col span={4}>
                            <Input value={group.order} onChange={(e) => handleGroupChange(groupIndex, 'order', e.target.value)} type="number" placeholder="Order" />
                        </Col>
                        <Col span={4}>
                            <Checkbox checked={group.private} onChange={(e) => handleGroupChange(groupIndex, 'private', e.target.checked)}>
                                Private
                            </Checkbox>
                        </Col>
                        <Col span={4}>
                            <Checkbox checked={group.privacy_control} onChange={(e) => handleGroupChange(groupIndex, 'privacy_control', e.target.checked)}>
                                Privacy Control
                            </Checkbox>
                        </Col>
                        <Col span={4}>
                            <Checkbox checked={group.show_group_name} onChange={(e) => handleGroupChange(groupIndex, 'show_group_name', e.target.checked)}>
                                Show Group Name
                            </Checkbox>
                        </Col>
                        <Col span={4}>
                            <Button icon={<DeleteOutlined />} danger onClick={() => handleRemoveGroup(groupIndex)} />
                        </Col>
                    </Row>
                    <Table
                        dataSource={group.fields}
                        columns={fieldColumns(groupIndex)}
                        rowKey="order"
                        pagination={false}
                        style={{ marginTop: '10px' }}
                    />
                    <Button type="dashed" icon={<PlusOutlined />} onClick={() => handleAddField(groupIndex)} style={{ marginTop: '10px' }}>
                        Add Field
                    </Button>
                </div>
            ))}
            <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddGroup} style={{ marginBottom: '20px' }}>
                Add Group
            </Button>

            {/* Style Modal */}
            <Modal
                title="Manage Styles"
                visible={styleModalVisible}
                onOk={handleStyleOk}
                onCancel={() => setStyleModalVisible(false)}
                width={600}
            >
                <Table
                    dataSource={getStyleDataSource()}
                    columns={styleColumns}
                    rowKey={(record, index) => index}
                    pagination={false}
                />
                <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddStyle} style={{ marginTop: '10px' }}>
                    Add Style
                </Button>
            </Modal>

            {/* Actions */}
            <h3>Actions</h3>
            {actions.map((action, index) => renderActionRow(action, index))}
            <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddAction} style={{ marginTop: '10px' }}>
                Add Action
            </Button>

            {/* Dividers */}
            <h3>Dividers</h3>
            <Select
                mode="tags"
                value={dividers}
                onChange={handleDividerChange}
                style={{ width: '100%' }}
                placeholder="Select or type divider group names"
            >
                {groups.map(group => (
                    <Option key={group.name} value={group.name}>
                        {group.name}
                    </Option>
                ))}
            </Select>

            {/* Save Button */}
            <Button type="primary" onClick={handleSaveConfig} style={{ marginTop: '20px' }}>
                Save Configuration
            </Button>
        </div>
    );
};

export default DetailsOverviewConfig;