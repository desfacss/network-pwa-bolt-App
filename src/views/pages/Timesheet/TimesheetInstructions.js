import React from 'react';
import { Card, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';

const TimesheetInstructions = () => {
    const { session } = useSelector((state) => state.auth);
    const { timesheet_settings } = session?.user?.organization

    const instructions = (
        <Card
            style={{
                // marginBottom: 0,
                backgroundColor: '#f0f5ff',
                // borderColor: '#adc6ff',
                // minWidth: 400, // To control the tooltip size
            }}
        >
            <h3 style={{ marginBottom: 10 }}>Please Note:</h3>
            <ul style={{ paddingLeft: 20 }}>
                <li>
                    <strong>Workday Time:</strong> The minimum time logged per workday should be <strong>greater than {timesheet_settings?.workingHours?.standardDailyHours || 8} hours</strong> and <strong>less than {timesheet_settings?.overtimeTracking?.maxOvertimeHours || 16} hours</strong>.
                </li>
                <li>
                    <strong>Workweek Time:</strong> The total minimum time logged per workweek should be <strong>greater than {timesheet_settings?.workingHours?.standardWeeklyHours || 40} hours</strong>.
                </li>
                <li>
                    <strong>Balance Allocation:</strong> The balance time allocation should be <strong>less than {timesheet_settings?.workingHours?.projectFinalHours || 80}% of the allocated time</strong>.
                </li>
            </ul>
            {/* <p>Ensure you follow these guidelines while filling your timesheet to avoid submission errors.</p> */}
        </Card>
    );

    return (
        <Tooltip style={{ minWidth: 400, }}
            title={instructions}
            color="#f0f5ff" // Matches the card background
            placement="leftBottom"
        >
            <QuestionCircleOutlined style={{ fontSize: 20, cursor: 'pointer' }} />
        </Tooltip>
    );
};

export default TimesheetInstructions;
