import { Button, Card, DatePicker, Drawer, Tabs } from 'antd'
import React, { useRef, useState } from 'react'
// import Timesheet from './AntDTable-v'
import Timesheet from './timesheet'
// import MyTimesheetTable from './MyTimesheetTable';
import TeamTimesheetTable from './TeamTimesheetTable';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
const { RangePicker } = DatePicker;

const { TabPane } = Tabs;

const Index = () => {

    const defaultStartDate = dayjs().subtract(30, 'days');
    const defaultEndDate = dayjs();
    const [dateRange, setDateRange] = useState([defaultStartDate, defaultEndDate]);
    const [activeKey, setActiveKey] = useState('1');

    const timesheetRef = useRef();
    const handleAddTimesheet = () => {
        timesheetRef.current?.showDrawer();
    };

    const { session } = useSelector((state) => state.auth);

    const onDateRangeChange = (dates) => {
        if (dates) {
            const [start, end] = dates;
            setDateRange([start, end]);
        } else {
            setDateRange([]);;
        }
    };

    return (
        <Card>
            <Tabs defaultActiveKey="1" activeKey={activeKey} onChange={(key) => setActiveKey(key)}
                tabBarExtraContent={
                    <>
                        {activeKey === '1' && <Button type="primary" className='mr-2' onClick={handleAddTimesheet} >
                            Add Timesheet
                        </Button>}
                        <RangePicker value={dateRange} allowClear={false}
                            onChange={onDateRangeChange}
                            format="YYYY-MM-DD"
                        />
                    </>
                }
            >
                <TabPane tab="My Timesheets" key="1">
                    {activeKey === '1' && <Timesheet ref={timesheetRef} key={activeKey} startDate={dateRange[0]?.format('YYYY-MM-DD')} endDate={dateRange[1]?.format('YYYY-MM-DD')} />}
                </TabPane>
                {session?.user?.features?.feature?.viewTeamTimesheet && (
                    <TabPane tab="Team Timesheets" key="2">
                        {activeKey === '2' && <TeamTimesheetTable key={activeKey} startDate={dateRange[0]?.format('YYYY-MM-DD')} endDate={dateRange[1]?.format('YYYY-MM-DD')} />}
                    </TabPane>
                )}
            </Tabs>
        </Card>
    )
}

export default Index