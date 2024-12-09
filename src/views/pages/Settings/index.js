import { Card, Tabs } from 'antd'
import React, { useState } from 'react'
import Locations from '../Locations';
import Organization from './Organization'
import RoleFeatureEdit from './Roles'
import TimesheetSettings from './Timesheet';
import EnumEditor from './enumeditor';
import LeaveSettings from '../LeaveSettings';
import LeaveTypes from '../LeaveSettings/LeaveTypes';

const Index = () => {

    const [activeKey, setActiveKey] = useState('1');

    const handleTabChange = (key) => {
        setActiveKey(key);
    };

    const tabItems = [
        {
            label: 'Organization', key: '1',
            children: activeKey === '1' && <Organization />,
        },
        {
            label: 'Roles & Permission', key: '2',
            children: activeKey === '2' && <RoleFeatureEdit />,
        },
        {
            label: 'Location & Holidays', key: '3',
            children: activeKey === '3' && <Locations />,
        },
        {
            label: 'Workflow Settings', key: '4',
            children: activeKey === '4' && <TimesheetSettings />,
        },
        {
            label: 'Types', key: '5',
            children: activeKey === '5' && <LeaveTypes />,
        },
        {
            label: 'Leave Settings', key: '6',
            children: activeKey === '6' && <LeaveSettings />,
        },
        // {
        //     label: 'Enum Editor', key: '7',
        //     children: activeKey === '7' && <EnumEditor />,
        // },
        // {
        //     label: 'Leave Policy', key: '8',
        //     children: activeKey === '8' && <Locations />,
        // },
        // {
        //     label: 'Expense Policy', key: '9',
        //     children: activeKey === '9' && <Locations />,
        // },
    ];

    return (
        <Card>
            <Tabs activeKey={activeKey} onChange={handleTabChange} items={tabItems} />
        </Card>
    )
}

export default Index