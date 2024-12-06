import React from 'react';
import { Row, Col, Card, Button, Dropdown, Menu } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import './GridView.css'; // Optional for spacing tweaks if necessary

const GridView = ({ data, viewConfig }) => {
    const { fields, actions } = viewConfig;

    // Render Card Content
    const renderCardContent = (item) => {
        return fields.map((fieldConfig) => (
            <div key={fieldConfig.fieldName}>
                <strong>{fieldConfig.fieldName}: </strong>
                {item[fieldConfig.fieldName]}
            </div>
        ));
    };

    // Render Actions Dropdown
    const actionMenu = (record) => (
        <Menu>
            {actions.row.map((action) => (
                <Menu.Item key={action} onClick={() => handleRowAction(action, record)}>
                    {action.charAt(0).toUpperCase() + action.slice(1)}
                </Menu.Item>
            ))}
        </Menu>
    );

    const handleRowAction = (action, record) => {
        console.log(`Action "${action}" triggered for:`, record);
        // Implement your action logic here
    };

    const handleBulkAction = (action) => {
        console.log(`Bulk action "${action}" triggered for all cards.`);
        // Implement your bulk action logic here
    };

    return (
        <div>
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
        </div>
    );
};

export default GridView;
