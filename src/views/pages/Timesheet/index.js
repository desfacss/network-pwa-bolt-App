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
    return (
        <Card>
            <Tabs defaultActiveKey="1">
                <TabPane tab="My Timesheets" key="1">
                    <Timesheet />
                </TabPane>
                {session?.user?.features?.feature?.viewTeamTimesheet &&
                    <TabPane tab="Team Timesheets" key="2">
                        <TeamTimesheetTable />
                    </TabPane>}
            </Tabs>
        </Card>
    )
}

export default Index