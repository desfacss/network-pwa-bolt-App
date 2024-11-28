import React from 'react';
import { Card, Tabs } from 'antd';
import { useSelector } from 'react-redux';
import MyExpenses from './MyExpenses';
import TeamExpenses from './TeamExpenses';

const { TabPane } = Tabs;

const Expenses = () => {
    const { session } = useSelector((state) => state.auth);

    return (
        <Card>
            <Tabs defaultActiveKey="1">
                <TabPane tab="My Expenses" key="1">
                    <MyExpenses />
                </TabPane>
                {session?.user?.features?.feature?.viewTeamExpenses && <TabPane tab="Team Expenses" key="2">
                    <TeamExpenses />
                </TabPane>}
            </Tabs>
        </Card>
    );
};

export default Expenses;
