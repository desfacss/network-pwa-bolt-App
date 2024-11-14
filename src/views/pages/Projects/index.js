import { Card, Tabs } from 'antd'
import React from 'react'
import { useSelector } from 'react-redux';
import NonProject from './NonProject';
import Project from './Project';

const { TabPane } = Tabs;

const Index = () => {
    const { session } = useSelector((state) => state.auth);
    return (
        <Card>
            <Tabs defaultActiveKey="1">
                <TabPane tab="Projects" key="1">
                    <Project />
                </TabPane>
                {/* {session?.user?.features?.feature?.viewTeamTimesheet && */}
                <TabPane tab="Non Projects" key="2">
                    <NonProject />
                </TabPane>
                {/* } */}
            </Tabs>
        </Card>
    )
}

export default Index