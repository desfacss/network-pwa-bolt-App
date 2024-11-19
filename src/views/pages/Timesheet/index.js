import { Button, Card, Drawer, Tabs } from 'antd'
import React, { useState } from 'react'
// import Timesheet from './AntDTable-v'
import Timesheet from './timeMain'
// import MyTimesheetTable from './MyTimesheetTable';
import TeamTimesheetTable from './TeamTimesheetTable';
import { useSelector } from 'react-redux';

const { TabPane } = Tabs;

const Index = () => {
    const { session } = useSelector((state) => state.auth);
    const [activeKey, setActiveKey] = useState('1');

    return (
        <Card>
            <Tabs
                defaultActiveKey="1"
                activeKey={activeKey}
                onChange={(key) => setActiveKey(key)}
            >
                <TabPane tab="My Timesheets" key="1">
                    {activeKey === '1' && <Timesheet key={activeKey} />}
                </TabPane>
                {session?.user?.features?.feature?.viewTeamTimesheet && (
                    <TabPane tab="Team Timesheets" key="2">
                        {activeKey === '2' && <TeamTimesheetTable key={activeKey} />}
                    </TabPane>
                )}
            </Tabs>
        </Card>
    )
}

export default Index