import React, { useEffect, useState } from 'react';
import { Button, Select, Table, Space, Checkbox, Row, Col, Input, Modal, Form } from 'antd';
import { PlusOutlined, UpOutlined, DownOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';

const { Option } = Select;

const GridViewConfig = ({ configData, onSave, availableColumns, masterObject }) => {
    const [groups, setGroups] = useState(configData?.groups || []);
    const [actions, setActions] = useState({
        row: configData?.actions?.row || [],
        bulk: configData?.actions?.bulk || [],
    });
    const [groupBy, setGroupBy] = useState(configData?.groupBy || []);
    const [exportOptions, setExportOptions] = useState(configData?.exportOptions || ['pdf', 'csv']);
    const [showFeatures, setShowFeatures] = useState(configData?.showFeatures || ["search", "enable_view", "columnVisibility", "pagination", "groupBy", "sorting"]);
    const [layout, setLayout] = useState(configData?.layout || {
        size: 'small',
        spacing: 16,
        maxWidth: '100%',
        cardStyle: { _boxShadow: '0 1px 4px rgba(0,0,0,0.1)', _borderRadius: '20px' },
        cardsPerRow: 3
    });
    const [viewLink, setViewLink] = useState(configData?.viewLink || '/gridview/');
    const [viewName, setViewName] = useState(configData?.viewName || 'GridView');
    const [styleModalVisible, setStyleModalVisible] = useState(false);
    const [subFieldsModalVisible, setSubFieldsModalVisible] = useState(false);
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
                    subFields: field?.subFields || [],
                    style: field?.style || {},
                    label: field?.label !== undefined ? field?.label : '',
                    linkParam: field?.linkParam !== undefined ? field?.linkParam : '',
                    mode: field?.mode || 'navigate', // Ensure mode defaults if not provided
                })),
            }));
            setGroups(initializedGroups);
            setActions({ row: configData.actions?.row || [], bulk: configData?.actions?.bulk || [] });
            setGroupBy(configData?.groupBy || []);
            setExportOptions(configData?.exportOptions || ['csv']);
            setShowFeatures(configData?.showFeatures || ["search", "enable_view"]);
            setLayout(configData?.layout || {
                size: 'small',
                spacing: 16,
                maxWidth: '100%',
                cardStyle: { _boxShadow: '0 1px 4px rgba(0,0,0,0.1)', _borderRadius: '20px' },
                cardsPerRow: 3,
            });
            setViewLink(configData?.viewLink || '/tableview/');
            setViewName(configData?.viewName || 'GridView');
        }
    }, [configData]);

    const transformedColumns = masterObject?.map(col => col.key) || [];

    // Group Management
    const handleAddGroup = () => {
        setGroups([...groups, { name: `Group ${groups.length + 1}`, order: groups.length + 1, fields: [] }]);
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
            fieldName: '',
            fieldPath: '',
            icon: '',
            link: '',
            cardSection: '',
            style: {},
            subFields: [],
            linkParam: '',
            mode: 'navigate',
        });
        setGroups(updatedGroups);
    };

    const handleFieldChange = (groupIndex, fieldIndex, key, value) => {
        const updatedGroups = [...groups];
        updatedGroups[groupIndex].fields[fieldIndex][key] = value;
        if (key === 'fieldPath') {
            const selectedColumn = masterObject?.find(col => col.key === value);
            if (selectedColumn) {
                updatedGroups[groupIndex].fields[fieldIndex].fieldName = selectedColumn?.display_name;
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

    // SubFields Modal
    const openSubFieldsModal = (groupIndex, fieldIndex) => {
        setCurrentGroupIndex(groupIndex);
        setCurrentFieldIndex(fieldIndex);
        setSubFieldsModalVisible(true);
    };

    const handleAddSubField = () => {
        const updatedGroups = [...groups];
        updatedGroups[currentGroupIndex].fields[currentFieldIndex]?.subFields?.push({ fieldName: '', fieldPath: '', icon: '', style: {}, webLink: false });
        setGroups(updatedGroups);
    };

    const handleSubFieldChange = (subIndex, key, value) => {
        const updatedGroups = [...groups];
        updatedGroups[currentGroupIndex].fields[currentFieldIndex].subFields[subIndex][key] = value;
        if (key === 'fieldPath') {
            const selectedColumn = masterObject?.find(col => col?.key === value);
            if (selectedColumn) {
                updatedGroups[currentGroupIndex].fields[currentFieldIndex].subFields[subIndex].fieldName = selectedColumn?.display_name;
            }
        }
        setGroups(updatedGroups);
    };

    const handleRemoveSubField = (subIndex) => {
        const updatedGroups = [...groups];
        updatedGroups[currentGroupIndex].fields[currentFieldIndex].subFields = updatedGroups[currentGroupIndex].fields[currentFieldIndex]?.subFields?.filter((_, i) => i !== subIndex);
        setGroups(updatedGroups);
    };

    // Save Configuration
    const handleSaveConfig = () => {
        const updatedGroups = groups.map(group => ({
            ...group,
            fields: group.fields.map(field => {
                if (field?.subFields && field?.subFields?.length > 0) {
                    return { ...field, fieldPath: "", display: "comma_separated" };
                }
                return field;
            }),
        }));
        onSave({ groups: updatedGroups, actions, groupBy, exportOptions, showFeatures, layout, viewLink, viewName });
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
            title: 'Name',
            dataIndex: 'fieldName',
            key: 'fieldName',
            render: (text, record, index) => (
                <Input value={record.fieldName} onChange={(e) => handleFieldChange(groupIndex, index, 'fieldName', e.target.value)} placeholder="Field Name" />
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
            title: 'Link Param',
            dataIndex: 'linkParam',
            key: 'linkParam',
            render: (text, record, index) => (
                <Input value={record.linkParam} onChange={(e) => handleFieldChange(groupIndex, index, 'linkParam', e.target.value)} placeholder="Link Param" />
            ),
        },
        {
            title: 'Mode',
            dataIndex: 'mode',
            key: 'mode',
            render: (text, record, index) => (
                <Select value={record.mode} onChange={(value) => handleFieldChange(groupIndex, index, 'mode', value)} style={{ width: '100%' }}>
                    <Option value="navigate">Navigate</Option>
                    <Option value="drawer">Drawer</Option>
                </Select>
            ),
        },
        {
            title: 'Card Section',
            dataIndex: 'cardSection',
            key: 'cardSection',
            render: (text, record, index) => (
                <Select value={record.cardSection} onChange={(value) => handleFieldChange(groupIndex, index, 'cardSection', value)} style={{ width: '100%' }}>
                    <Option value="">None</Option>
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
                    <Button icon={<UpOutlined />} onClick={() => moveField(groupIndex, index, -1)} disabled={index === 0} />
                    <Button icon={<DownOutlined />} onClick={() => moveField(groupIndex, index, 1)} disabled={index === groups[groupIndex].fields.length - 1} />
                    <Button icon={<EditOutlined />} onClick={() => openStyleModal(groupIndex, index)} />
                    <Button icon={<EditOutlined />} onClick={() => openSubFieldsModal(groupIndex, index)} />
                    <Button icon={<DeleteOutlined />} danger onClick={() => handleRemoveField(groupIndex, index)} />
                </Space>
            ),
        },
    ];

    const subFieldColumns = [
        {
            title: 'Field Path',
            dataIndex: 'fieldPath',
            key: 'fieldPath',
            render: (text, record, index) => (
                <Select value={record.fieldPath} onChange={(value) => handleSubFieldChange(index, 'fieldPath', value)} style={{ width: '100%', minWidth: '150px' }}>
                    {transformedColumns.map(col => <Option key={col} value={col}>{col}</Option>)}
                </Select>
            ),
        },
        {
            title: 'Name',
            dataIndex: 'fieldName',
            key: 'fieldName',
            render: (text, record, index) => (
                <Input value={record.fieldName} onChange={(e) => handleSubFieldChange(index, 'fieldName', e.target.value)} placeholder="Field Name" />
            ),
        },
        {
            title: 'Icon',
            dataIndex: 'icon',
            key: 'icon',
            render: (text, record, index) => (
                <Input value={record.icon} onChange={(e) => handleSubFieldChange(index, 'icon', e.target.value)} placeholder="Icon Name" />
            ),
        },
        {
            title: 'Web Link',
            dataIndex: 'webLink',
            key: 'webLink',
            render: (text, record, index) => (
                <Checkbox checked={record.webLink} onChange={(e) => handleSubFieldChange(index, 'webLink', e.target.checked)} />
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, __, index) => <Button icon={<DeleteOutlined />} danger onClick={() => handleRemoveSubField(index)} />,
        },
    ];

    // Action Management
    const handleAddAction = (type) => {
        setActions(prev => ({ ...prev, [type]: [...prev[type], { form: '', name: '' }] }));
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
                <Input value={action.form} onChange={(e) => handleActionChange(type, index, 'form', e.target.value)} placeholder="Form" />
            </Col>
            <Col span={10}>
                <Input value={action.name} onChange={(e) => handleActionChange(type, index, 'name', e.target.value)} placeholder="Name" />
            </Col>
            <Col span={4}>
                <Button icon={<DeleteOutlined />} onClick={() => handleRemoveAction(type, index)} danger />
            </Col>
        </Row>
    );

    return (
        <div>
            <h2>Grid View Configuration</h2>

            {/* Groups Section */}
            <h3>Groups</h3>
            {groups.map((group, groupIndex) => (
                <div key={groupIndex} style={{ marginBottom: '20px', border: '1px solid #f0f0f0', padding: '16px', borderRadius: '8px' }}>
                    <Row gutter={16} align="middle">
                        <Col span={10}>
                            <Input value={group.name} onChange={(e) => handleGroupChange(groupIndex, 'name', e.target.value)} placeholder="Group Name" />
                        </Col>
                        <Col span={4}>
                            <Input value={group.order} onChange={(e) => handleGroupChange(groupIndex, 'order', e.target.value)} type="number" placeholder="Order" />
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

            {/* SubFields Modal */}
            <Modal
                title="Manage SubFields"
                visible={subFieldsModalVisible}
                onOk={() => setSubFieldsModalVisible(false)}
                onCancel={() => setSubFieldsModalVisible(false)}
                width={600}
            >
                <Table
                    dataSource={currentGroupIndex !== null && currentFieldIndex !== null ? groups[currentGroupIndex]?.fields[currentFieldIndex]?.subFields || [] : []}
                    columns={subFieldColumns}
                    rowKey={(record, index) => index}
                    pagination={false}
                />
                <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddSubField} style={{ marginTop: '10px' }}>
                    Add SubField
                </Button>
            </Modal>

            {/* Layout Configuration */}
            <h3>Layout Configuration</h3>
            <Row gutter={[16, 16]}>
                <Col span={8}>
                    <p>Size:</p>
                    <Select value={layout.size} onChange={(value) => setLayout(prev => ({ ...prev, size: value }))} style={{ width: '100%' }}>
                        <Option value="small">Small</Option>
                        <Option value="medium">Medium</Option>
                        <Option value="large">Large</Option>
                    </Select>
                </Col>
                <Col span={8}>
                    <p>Spacing:</p>
                    <Input value={layout.spacing} onChange={(e) => setLayout(prev => ({ ...prev, spacing: Number(e.target.value) }))} type="number" />
                </Col>
                <Col span={8}>
                    <p>Cards Per Row:</p>
                    <Input value={layout.cardsPerRow} onChange={(e) => setLayout(prev => ({ ...prev, cardsPerRow: Number(e.target.value) }))} type="number" />
                </Col>
                <Col span={12}>
                    <p>Max Width:</p>
                    <Input value={layout.maxWidth} onChange={(e) => setLayout(prev => ({ ...prev, maxWidth: e.target.value }))} />
                </Col>
                <Col span={12}>
                    <p>Box Shadow:</p>
                    <Input value={layout.cardStyle._boxShadow} onChange={(e) => setLayout(prev => ({ ...prev, cardStyle: { ...prev.cardStyle, _boxShadow: e.target.value } }))} />
                </Col>
                <Col span={12}>
                    <p>Border Radius:</p>
                    <Input value={layout.cardStyle._borderRadius} onChange={(e) => setLayout(prev => ({ ...prev, cardStyle: { ...prev.cardStyle, _borderRadius: e.target.value } }))} />
                </Col>
            </Row>

            {/* Actions */}
            <h3>Actions</h3>
            <Row gutter={[16, 16]}>
                <Col span={12}>
                    <h4>Row Actions:</h4>
                    {actions.row.map((action, index) => renderActionRow(action, index, 'row'))}
                    <Button type="dashed" icon={<PlusOutlined />} onClick={() => handleAddAction('row')} style={{ marginTop: '10px' }}>
                        Add Row Action
                    </Button>
                </Col>
                <Col span={12}>
                    <h4>Bulk Actions:</h4>
                    {actions.bulk.map((action, index) => renderActionRow(action, index, 'bulk'))}
                    <Button type="dashed" icon={<PlusOutlined />} onClick={() => handleAddAction('bulk')} style={{ marginTop: '10px' }}>
                        Add Bulk Action
                    </Button>
                </Col>
            </Row>

            {/* Group By */}
            <h3>Group By</h3>
            <Select mode="tags" value={groupBy} onChange={setGroupBy} style={{ width: '100%' }} placeholder="Select groupBy options">
                <Option value="state">State</Option>
                <Option value="priority">Priority</Option>
                <Option value="assignee">Assignee</Option>
            </Select>

            {/* Export Options */}
            <h3>Export Options</h3>
            <Select mode="tags" value={exportOptions} onChange={setExportOptions} style={{ width: '100%' }} placeholder="Select export options">
                <Option value="pdf">PDF</Option>
                <Option value="csv">CSV</Option>
            </Select>

            {/* Show Features */}
            <h3>Show Features</h3>
            <Checkbox.Group
                options={[
                    { label: 'Search', value: 'search' },
                    { label: 'Column Visibility', value: 'columnVisibility' },
                    { label: 'Pagination', value: 'pagination' },
                    { label: 'Group By', value: 'groupBy' },
                    { label: 'Sorting', value: 'sorting' },
                    { label: 'Enable View', value: 'enable_view' },
                ]}
                value={showFeatures}
                onChange={setShowFeatures}
            />

            {/* View Settings */}
            <h3>View Settings</h3>
            <Row gutter={[16, 16]}>
                <Col span={12}>
                    <p>View Link:</p>
                    <Input value={viewLink} onChange={(e) => setViewLink(e.target.value)} placeholder="/tableview/" />
                </Col>
                <Col span={12}>
                    <p>View Name:</p>
                    <Input value={viewName} onChange={(e) => setViewName(e.target.value)} placeholder="GridView" />
                </Col>
            </Row>

            {/* Save Button */}
            <Button type="primary" onClick={handleSaveConfig} style={{ marginTop: '20px' }}>
                Save Configuration
            </Button>
        </div>
    );
};

export default GridViewConfig;