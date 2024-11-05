import { Button, Card, Drawer, Tabs } from 'antd'
import React, { useState } from 'react'
// import Timesheet from './AntDTable-v'
import Timesheet from './timeMain'
import MyTimesheetTable from './MyTimesheetTable';
import TeamTimesheetTable from './TeamTimesheetTable';

const { TabPane } = Tabs;

const Index = () => {

    const [drawerVisible, setDrawerVisible] = useState(false);

    // Function to open the drawer
    const showDrawer = () => {
        setDrawerVisible(true);
    };

    // Function to close the drawer
    const closeDrawer = () => {
        setDrawerVisible(false);
    };

    return (
        // <Card>
        //     <Timesheet />
        // </Card>
        // <Card>
        //     <Tabs defaultActiveKey="1">
        //         <TabPane tab="My Timesheets" key="1">
        //         <Timesheet />
        //         </TabPane>
        //          <TabPane tab="Team Timesheets" key="2">

        //         </TabPane>
        //     </Tabs>
        // </Card>
        <Card>
            <Tabs defaultActiveKey="1">
                <TabPane tab="My Timesheets" key="1">
                    {/* Add Timesheet button */}
                    <Button type="primary" onClick={showDrawer} style={{ marginBottom: 16 }}>
                        Add Timesheet
                    </Button>
                    <MyTimesheetTable />
                    {/* Drawer to display Timesheet component */}
                    <Drawer
                        title="Add Timesheet"
                        width={'100%'}
                        onClose={closeDrawer}
                        visible={drawerVisible}
                    >
                        <Timesheet />
                    </Drawer>
                </TabPane>
                <TabPane tab="Team Timesheets" key="2">
                    <TeamTimesheetTable />
                </TabPane>
            </Tabs>
        </Card>
    )
}

export default Index