import { Card, Tabs } from 'antd'
import React from 'react'
import Locations from '../Locations';
import Organization from './Organization'
import RoleFeatureEdit from './Roles'
import TimesheetSettings from './Timesheet';
import EnumEditor from './enumeditor';
import LeaveSettings from '../LeaveSettings';
import LeaveTypes from '../LeaveSettings/LeaveTypes';

const index = () => {

    const tabItems = [
        {
            label: 'Organization', key: '1',
            children: <Organization />,
        },
        {
            label: 'Roles & Permission', key: '2',
            children: <RoleFeatureEdit />,
        },
        {
            label: 'Location & Holidays', key: '3',
            children: <Locations />,
        },
        {
            label: 'Workflow Settings', key: '4',
            children: <TimesheetSettings />,
        },
        {
            label: 'Types', key: '5',
            children: <LeaveTypes />,
        },
        {
            label: 'Leave Settings', key: '6',
            children: <LeaveSettings />,
        },
        // {
        //     label: 'Enum Editor', key: '7',
        //     children: <EnumEditor />,
        // },
        // {
        //     label: 'Leave Policy', key: '8',
        //     children: <Locations />,
        // },
        // {
        //     label: 'Expense Policy', key: '9',
        //     children: <Locations />,
        // },
    ];

    return (
        <Card>
            <Tabs defaultActiveKey="1" items={tabItems} />
        </Card>
    )
}

export default index