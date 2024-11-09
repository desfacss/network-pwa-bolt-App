import { Button, Card, Drawer, Tabs } from 'antd'
import React, { useState } from 'react'
// import Timesheet from './AntDTable-v'
import Timesheet from './timeMain'
// import MyTimesheetTable from './MyTimesheetTable';
import TeamTimesheetTable from './TeamTimesheetTable';

const { TabPane } = Tabs;

const Index = () => {

    return (
        <Card>
            <Tabs defaultActiveKey="1">
                <TabPane tab="My Timesheets" key="1">
                    <Timesheet />
                </TabPane>
                <TabPane tab="Team Timesheets" key="2">
                    <TeamTimesheetTable />
                </TabPane>
            </Tabs>
        </Card>
    )
}

export default Index