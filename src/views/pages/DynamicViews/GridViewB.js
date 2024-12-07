import React, { useState } from 'react';
import { Row, Col, Card, Button, Dropdown, Menu, Input } from 'antd';
import { DownOutlined, SaveOutlined } from '@ant-design/icons';

const GridView = ({ data, viewConfig, updateRow, deleteRow }) => {
    const { fields, actions } = viewConfig;
    const [editingCard, setEditingCard] = useState(null);
    const [cardChanges, setCardChanges] = useState({});

    const handleEdit = (record) => {
        setEditingCard(record.id);
        setCardChanges(record);
    };

    const handleSave = async () => {
        await updateRow(cardChanges);
        setEditingCard(null);
    };

    const handleInputChange = (key, value) => {
        setCardChanges((prev) => ({ ...prev, [key]: value }));
    };

    const actionMenu = (record) => (
        <Menu>
            <Menu.Item key="edit" onClick={() => handleEdit(record)}>
                Edit
            </Menu.Item>
            <Menu.Item key="delete" onClick={() => deleteRow(record.id)}>
                Delete
            </Menu.Item>
        </Menu>
    );

    return (
        <div>
            <Row gutter={[16, 16]}>
                {data.map((item) => (
                    <Col key={item.id} xs={24} sm={12} md={8} lg={6}>
                        <Card
                            title={
                                editingCard === item.id ? (
                                    <Input
                                        value={cardChanges.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                    />
                                ) : (
                                    item.name
                                )
                            }
                            extra={
                                editingCard === item.id ? (
                                    <Button
                                        type="primary"
                                        icon={<SaveOutlined />}
                                        onClick={handleSave}
                                    >
                                        Save
                                    </Button>
                                ) : (
                                    <Dropdown overlay={actionMenu(item)} trigger={['click']}>
                                        <Button type="text">
                                            Actions <DownOutlined />
                                        </Button>
                                    </Dropdown>
                                )
                            }
                            bordered
                        >
                            {fields.map((fieldConfig) => (
                                <div key={fieldConfig.fieldName}>
                                    <strong>{fieldConfig.fieldName}: </strong>
                                    {editingCard === item.id ? (
                                        <Input
                                            value={cardChanges[fieldConfig.fieldName]}
                                            onChange={(e) =>
                                                handleInputChange(fieldConfig.fieldName, e.target.value)
                                            }
                                        />
                                    ) : (
                                        item[fieldConfig.fieldName]
                                    )}
                                </div>
                            ))}
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default GridView;
