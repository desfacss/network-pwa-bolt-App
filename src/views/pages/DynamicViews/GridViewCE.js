import React, { useState } from 'react';
import { Row, Col, Card, Button, Dropdown, Menu, Input, Modal } from 'antd';
import { DownOutlined, EditOutlined, SaveOutlined, DeleteOutlined } from '@ant-design/icons';
import './GridView.css'; // Optional for styling tweaks

const GridView = ({ data, viewConfig, updateData, deleteData }) => {
    const { fields, actions } = viewConfig;
    const [editingRow, setEditingRow] = useState(null); // Keeps track of the row being edited
    const [editingValues, setEditingValues] = useState({}); // Stores the edited values

    // Handle editing of a card
    const startEdit = (record) => {
        setEditingRow(record.id);
        setEditingValues(record);
    };

    const saveEdit = () => {
        updateData(editingValues);
        setEditingRow(null);
        setEditingValues({});
    };

    const cancelEdit = () => {
        setEditingRow(null);
        setEditingValues({});
    };

    const handleChange = (fieldName, value) => {
        setEditingValues((prev) => ({ ...prev, [fieldName]: value }));
    };

    // Render Card Content
    const renderCardContent = (item) => {
        return fields.map((fieldConfig) => {
            const isEditing = editingRow === item.id;
            return (
                <div key={fieldConfig.fieldName} style={{ marginBottom: 8 }}>
                    <strong>{fieldConfig.fieldName}: </strong>
                    {isEditing ? (
                        <Input
                            value={editingValues[fieldConfig.fieldName]}
                            onChange={(e) => handleChange(fieldConfig.fieldName, e.target.value)}
                        />
                    ) : (
                        item[fieldConfig.fieldName]
                    )}
                </div>
            );
        });
    };

    // Render Actions Dropdown
    const actionMenu = (record) => (
        <Menu>
            <Menu.Item key="edit" onClick={() => startEdit(record)}>
                <EditOutlined /> Edit
            </Menu.Item>
            <Menu.Item key="delete"
                // onClick={() => deleteData(record.id)}
                onClick={() => {
                    Modal.confirm({
                        title: 'Are you sure you want to delete this record?',
                        content: `This action cannot be undone. Record Name: ${record.name}`,
                        okText: 'Yes, Delete',
                        okType: 'danger',
                        cancelText: 'Cancel',
                        onOk: () => deleteData(record),
                    });
                }}
            >
                <DeleteOutlined /> Delete
            </Menu.Item>
        </Menu>
    );

    // Render Save/Cancel buttons for editing
    const renderEditActions = (item) => {
        return (
            <div style={{ marginTop: 16 }}>
                <Button type="primary" icon={<SaveOutlined />} onClick={saveEdit} style={{ marginRight: 8 }}>
                    Save
                </Button>
                <Button onClick={cancelEdit}>Cancel</Button>
            </div>
        );
    };

    const handleBulkAction = (action) => {
        console.log(`Bulk action "${action}" triggered for all cards.`);
        // Implement your bulk action logic here
    };

    return (
        <div>
            {/* Bulk Actions */}
            <div style={{ marginBottom: 16 }}>
                {actions.bulk.map((action) => (
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

            {/* Grid Layout */}
            <Row gutter={[16, 16]}>
                {data.map((item) => (
                    <Col key={item.id} xs={24} sm={12} md={8} lg={6}>
                        <Card
                            title={editingRow === item.id ? 'Editing...' : item.name}
                            extra={
                                editingRow === item.id ? null : (
                                    <Dropdown overlay={actionMenu(item)} trigger={['click']}>
                                        <Button type="text">
                                            Actions <DownOutlined />
                                        </Button>
                                    </Dropdown>
                                )
                            }
                            bordered
                        >
                            {renderCardContent(item)}
                            {editingRow === item.id && renderEditActions(item)}
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default GridView;
