import React, { useRef, useState } from 'react';
import { Button, Card, DatePicker, Tabs } from 'antd';
import { useSelector } from 'react-redux';
import MyExpenses from './MyExpenses';
import TeamExpenses from './TeamExpenses';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const Expenses = () => {
    const defaultStartDate = dayjs().subtract(30, 'days');
    const defaultEndDate = dayjs().add(1, 'days');
    const [dateRange, setDateRange] = useState([defaultStartDate, defaultEndDate]);
    const [activeKey, setActiveKey] = useState('1');

    const expensesheetRef = useRef();
    const handleAddExpensesheet = () => {
        expensesheetRef.current?.showDrawer();
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
            label: 'My Expenses',
            key: '1',
            children: (
                activeKey === '1' && <MyExpenses ref={expensesheetRef} key={activeKey}
                    startDate={dateRange[0]?.format('YYYY-MM-DD')} endDate={dateRange[1]?.format('YYYY-MM-DD')} />
            ),
        },
        session?.user?.features?.feature?.teamExpenses && {
            label: 'Team Expenses',
            key: '2',
            children: (
                activeKey === '2' && <TeamExpenses key={activeKey}
                    startDate={dateRange[0]?.format('YYYY-MM-DD')} endDate={dateRange[1]?.format('YYYY-MM-DD')} />
            ),
        },
    ].filter(Boolean);

    return (
        <Card>
            <Tabs defaultActiveKey="1" activeKey={activeKey} onChange={(key) => setActiveKey(key)} items={tabItems}
                tabBarExtraContent={
                    <>
                        {activeKey === '1' && <Button type="primary" className='mr-2' onClick={handleAddExpensesheet} >
                            Add Expenses Claim
                        </Button>}
                        <RangePicker value={dateRange} allowClear={false} onChange={onDateRangeChange} format="YYYY-MM-DD" />
                    </>
                }
            />
        </Card>
    );
};

export default Expenses;
