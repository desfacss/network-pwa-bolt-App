import { Card, Tabs } from 'antd'
import React from 'react'
import Locations from '../Locations';
import Organization from './Organization'
import RoleFeatureEdit from './Roles'
import TimesheetSettings from './Timesheet';

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
                <TabPane tab="Region & Holidays" key="3" disabled>
                    <Locations />
                </TabPane>
                <TabPane tab="Timesheet Settings" key="4">
                    <TimesheetSettings />
                </TabPane>
                {/* <TabPane tab="Leave Policy" key="5">
                    <Locations />
                </TabPane>
                <TabPane tab="Expense Policy" key="6">
                    <Locations />
                </TabPane> */}
            </Tabs>
        </Card>
    )
}

export default index