import { Button, Card, Tabs } from 'antd';
import React, { useState } from 'react';
// import { useSelector } from 'react-redux';
import NonProject from './NonProject';
import Project from './Project';

const { TabPane } = Tabs;

const Index = () => {
    const [activeKey, setActiveKey] = useState('1');
    const [isProjectDrawerOpen, setIsProjectDrawerOpen] = useState(false);
    const [isNonProjectDrawerOpen, setIsNonProjectDrawerOpen] = useState(false);
    // const { session } = useSelector((state) => state.auth);

    const handleAddButtonClick = () => {
        if (activeKey === '1') {
            setIsProjectDrawerOpen(true);
        } else if (activeKey === '2') {
            setIsNonProjectDrawerOpen(true);
        }
    };

    return (
        <Card>
            <Tabs
                defaultActiveKey="1"
                tabBarExtraContent={
                    <Button type='primary' onClick={handleAddButtonClick}>
                        {`Add ${activeKey === '1' ? "Project" : "Non Project"}`}
                    </Button>
                }
                activeKey={activeKey}
                onChange={(key) => setActiveKey(key)}
            >
                <TabPane tab="Projects" key="1">
                    <Project isDrawerOpen={isProjectDrawerOpen} setIsDrawerOpen={setIsProjectDrawerOpen} />
                </TabPane>
                {/* {session?.user?.features?.feature?.viewTeamTimesheet && */}
                <TabPane tab="Non Projects" key="2">
                    <NonProject isDrawerOpen={isNonProjectDrawerOpen} setIsDrawerOpen={setIsNonProjectDrawerOpen} />
                </TabPane>
                {/* } */}
            </Tabs>
        </Card>
    );
};

export default Index;
