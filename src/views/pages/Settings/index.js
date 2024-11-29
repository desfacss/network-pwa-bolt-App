import { Card, Tabs } from 'antd'
import React from 'react'
import Locations from '../Locations';
import Organization from './Organization'
import RoleFeatureEdit from './Roles'
import TimesheetSettings from './Timesheet';
import EnumEditor from './enumeditor';
import LeaveSettings from '../LeaveSettings';
import LeaveTypes from '../LeaveSettings/LeaveTypes';

const { TabPane } = Tabs;

const index = () => {
    return (
        <Card>
            <Tabs defaultActiveKey="1">
                <TabPane tab="Organization" key="1">
                    <Organization />
                </TabPane>
                <TabPane tab="Roles & Permission" key="2">
                    <RoleFeatureEdit />
                </TabPane>
                <TabPane tab="Region & Holidays" key="3">
                    <Locations />
                </TabPane>
                <TabPane tab="Timesheet Settings" key="4">
                    <TimesheetSettings />
                </TabPane>
                <TabPane tab="Types" key="5">
                    <LeaveTypes />
                </TabPane>
                <TabPane tab="Leave Settings" key="6">
                    <LeaveSettings />
                </TabPane>
                {/* <TabPane tab="Types" key="6">
                    <EnumEditor />
                </TabPane> */}
                {/* <TabPane tab="Leave Policy" key="7">
                    <Locations />
                </TabPane>
                <TabPane tab="Expense Policy" key="8">
                    <Locations />
                </TabPane> */}
            </Tabs>
        </Card>
    )
}

export default index