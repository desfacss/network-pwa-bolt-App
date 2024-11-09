import React from 'react';
import { Card, Tabs } from 'antd';
import MyLeaves from './MyLeaves';
import TeamLeaves from './TeamLeaves';
import { useSelector } from 'react-redux';

const { TabPane } = Tabs;

const LeaveApplications = () => {
    const { session } = useSelector((state) => state.auth);

    return (
        <Card>
            <Tabs defaultActiveKey="1">
                <TabPane tab="My Leaves" key="1">
                    <MyLeaves />
                </TabPane>
                {session?.user?.features?.feature?.viewTeamLeaves && <TabPane tab="Team Leaves" key="2">
                    <TeamLeaves />
                </TabPane>}
            </Tabs>
        </Card>
    );
};

export default LeaveApplications;
