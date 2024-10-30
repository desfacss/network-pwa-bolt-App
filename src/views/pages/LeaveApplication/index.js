import React from 'react';
import { Card, Tabs } from 'antd';
import MyLeaves from './MyLeaves';
import TeamLeaves from './TeamLeaves';

const { TabPane } = Tabs;

const LeaveApplications = () => {
    return (
        <Card>
            <Tabs defaultActiveKey="1">
                <TabPane tab="My Leaves" key="1">
                    <MyLeaves />
                </TabPane>
                <TabPane tab="Team Leaves" key="2">
                    <TeamLeaves />
                </TabPane>
            </Tabs>
        </Card>
    );
};

export default LeaveApplications;
