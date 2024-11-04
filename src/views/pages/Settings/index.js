import { Card, Tabs } from 'antd'
import React from 'react'
import Locations from '../Locations';
import Organization from './Organization'
import RoleFeatureEdit from './Roles'

const { TabPane } = Tabs;

const index = () => {
    return (
        <Card>
            <Tabs defaultActiveKey="1">
                <TabPane tab="Organization" key="1">
                    <Organization />
                </TabPane>
                <TabPane tab="Roles" key="2">
                    <RoleFeatureEdit />
                </TabPane>
                <TabPane tab="Locations" key="3">
                    <Locations />
                </TabPane>
                <TabPane tab="Timesheet" key="4">
                    <Locations />
                </TabPane>
                <TabPane tab="Leave Mgmt" key="5">
                    <Locations />
                </TabPane>
                <TabPane tab="Expense Mgmt" key="6">
                    <Locations />
                </TabPane>
            </Tabs>
        </Card>
    )
}

export default index