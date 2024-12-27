import React, { useRef, useState } from 'react';
import { Button, Card, DatePicker, Space, Tabs } from 'antd';
import MyLeaves from './MyLeaves';
import TeamLeaves from './TeamLeaves';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import HolidaysDrawer from 'components/common/Holidays';

const { RangePicker } = DatePicker;

const LeaveApp = () => {
    const defaultStartDate = dayjs().subtract(30, 'days');
    const defaultEndDate = dayjs().add(1, 'days');
    const [dateRange, setDateRange] = useState([defaultStartDate, defaultEndDate]);
    const [activeKey, setActiveKey] = useState('1');

    const leaveApplicationRef = useRef();
    const handleAddLeaveApplication = () => {
        leaveApplicationRef.current?.showDrawer();
    };

    const { session } = useSelector((state) => state.auth);

    const onDateRangeChange = (dates) => {
        if (dates) {
            const [start, end] = dates;
            setDateRange([start, end]);
            console.log(dates)
        } else {
            setDateRange([]);;
        }
    };

    const tabItems = [
        {
            label: 'My Leaves',
            key: '1',
            children: (
                activeKey === '1' && <MyLeaves ref={leaveApplicationRef} key={activeKey}
                    startDate={dateRange[0]?.format('YYYY-MM-DD')} endDate={dateRange[1]?.format('YYYY-MM-DD')} />
            ),
        },
        session?.user?.features?.feature?.teamLeaves && {
            label: 'Team Leaves',
            key: '2',
            children: (
                activeKey === '2' && <TeamLeaves key={activeKey}
                    startDate={dateRange[0]?.format('YYYY-MM-DD')} endDate={dateRange[1]?.format('YYYY-MM-DD')} />
            ),
        },
    ].filter(Boolean);

    return (
        <Card>
            <Tabs defaultActiveKey="1" activeKey={activeKey} onChange={(key) => setActiveKey(key)} items={tabItems}
                tabBarExtraContent={
                    <Space>
                        {activeKey === '1' &&
                            <>
                                <HolidaysDrawer />
                                <Button type="primary" className='mr-2' onClick={handleAddLeaveApplication} >
                                    Add Leave Application
                                </Button>
                            </>
                        }
                        <RangePicker value={dateRange} allowClear={false} onChange={onDateRangeChange} format="YYYY-MM-DD" />
                    </Space>
                }
            />
        </Card>
    );
};

export default LeaveApp;
