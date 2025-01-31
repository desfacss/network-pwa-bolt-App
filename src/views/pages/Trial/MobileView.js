import React, { useState } from 'react';
import { Layout, Button, Input, Card, Row, Col, Menu } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Header, Content, Footer } = Layout;

const MobileView = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    window.addEventListener('resize', () => {
        setIsMobile(window.innerWidth <= 768);
    });

    const desktopLayout = (
        <Layout>
            <Header style={{ display: 'flex', justifyContent: 'space-between', padding: '0 20px', background: '#fff' }}>
                <div>
                    <Button>I am looking for</Button>
                    <Button>I can offer</Button>
                </div>
                <Button type="primary" style={{ marginRight: '20px' }}>Interests</Button>
            </Header>
            <Content style={{ padding: '20px' }}>
                <Row gutter={16}>
                    <Col span={16}>
                        <Input placeholder="Search" prefix={<SearchOutlined />} />
                    </Col>
                    <Col span={8}>
                        <Button type="primary" block>Add Post</Button>
                    </Col>
                </Row>
                <Row gutter={16} style={{ marginTop: '20px' }}>
                    <Col span={24}>
                        <Card title="Connect with a consultant for succession planning">
                            <p>Hi, would like to connect with consultants/advisors in this space. More details on call. Let me know who can help...</p>
                            <p><strong>Palaniappan Cho</strong></p>
                            <p><em>Family Business Transition, Succession Planning Advice</em></p>
                        </Card>
                        {/* More cards here */}
                    </Col>
                </Row>
            </Content>
            <Footer style={{ textAlign: 'center' }}>Footer</Footer>
        </Layout>
    );

    const mobileLayout = (
        <Layout>
            <Content style={{ padding: '20px' }}>
                <Input placeholder="Search" prefix={<SearchOutlined />} />
                <div style={{ marginTop: '20px' }}>
                    <Card title="Connect with a consultant for succession planning">
                        <p>Hi, would like to connect with consultants/advisors in this space. More details on call. Let me know who can help...</p>
                        <p><strong>Palaniappan Cho</strong></p>
                        <p><em>Family Business Transition, Succession Planning Advice</em></p>
                    </Card>
                    {/* More cards here */}
                </div>
            </Content>
            <Footer style={{ position: 'fixed', bottom: 0, width: '100%', background: '#fff', padding: '10px 0', boxShadow: '0 -2px 5px rgba(0,0,0,0.1)' }}>
                <Row justify="space-around">
                    <Col><Button>I am looking for</Button></Col>
                    <Col><Button>I can offer</Button></Col>
                    <Col><Button type="primary">Interests</Button></Col>
                    <Col><Button type="primary">Add Post</Button></Col>
                </Row>
            </Footer>
            <Content style={{ padding: '20px' }}>
                <Input placeholder="Search" prefix={<SearchOutlined />} />
                <div style={{ marginTop: '20px' }}>
                    <Card title="Connect with a consultant for succession planning">
                        <p>Hi, would like to connect with consultants/advisors in this space. More details on call. Let me know who can help...</p>
                        <p><strong>Palaniappan Cho</strong></p>
                        <p><em>Family Business Transition, Succession Planning Advice</em></p>
                    </Card>
                    {/* More cards here */}
                </div>
            </Content>
            <Footer style={{ position: 'fixed', bottom: 0, width: '100%', background: '#fff', padding: '10px 0', boxShadow: '0 -2px 5px rgba(0,0,0,0.1)' }}>
                <Row justify="space-around">
                    <Col><Button>I am looking for</Button></Col>
                    <Col><Button>I can offer</Button></Col>
                    <Col><Button type="primary">Interests</Button></Col>
                    <Col><Button type="primary">Add Post</Button></Col>
                </Row>
            </Footer>
        </Layout>
    );

    return isMobile ? mobileLayout : desktopLayout;
};

export default MobileView;