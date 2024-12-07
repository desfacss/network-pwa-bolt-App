import React, { useState } from 'react';
import { Row, Col, Card, Button, Dropdown, Menu, Modal } from 'antd';
import { DownOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import './GridView.css'; // Optional for styling tweaks
import DynamicForm from '../DynamicForm';

const GridView = ({ data, viewConfig, updateData, deleteData, onFinish }) => {
    const { fields, actions } = viewConfig?.gridview;
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editItem, setEditItem] = useState(null);

    const openModal = (item = null) => {
        setEditItem(item);
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
        setEditItem(null);
    };

    const handleBulkAction = (action) => {
        console.log(`Bulk action "${action}" triggered for all cards.`);
        // Implement bulk action logic here
    };

    // Render Card Content
    const renderCardContent = (item) => {
        return fields.map((fieldConfig) => (
            <div key={fieldConfig.fieldName} style={{ marginBottom: 8 }}>
                <strong>{fieldConfig.fieldName}: </strong>
                {item[fieldConfig.fieldName]}
            </div>
        ));
    };

    // Render Actions Dropdown
    const actionMenu = (record) => (
        <Menu>
            <Menu.Item key="edit" onClick={() => openModal(record)}>
                Edit
            </Menu.Item>
            <Menu.Item key="delete"
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

    return (
        <div>
            {/* Bulk Actions and Add Button */}
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
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => openModal()}
                >
                    Add New Task
                </Button>
            </div>

            {/* Grid Layout */}
            <Row gutter={[16, 16]}>
                {data.map((item) => (
                    <Col key={item.id} xs={24} sm={12} md={8} lg={6}>
                        <Card
                            title={item.name}
                            extra={
                                <Dropdown overlay={actionMenu(item)} trigger={['click']}>
                                    <Button type="text">
                                        Actions <DownOutlined />
                                    </Button>
                                </Dropdown>
                            }
                            bordered
                        >
                            {renderCardContent(item)}
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Modal for Add/Edit */}
            <Modal
                title={editItem ? 'Edit Task' : 'Add New Task'}
                visible={isModalVisible}
                onCancel={closeModal}
                footer={null}
            >
                <DynamicForm
                    schemas={viewConfig}
                    formData={editItem?.details || {}}
                    onFinish={(formData) => {
                        onFinish(formData, editItem);
                        closeModal();
                    }}
                />
            </Modal>
        </div>
    );
};

export default GridView;
