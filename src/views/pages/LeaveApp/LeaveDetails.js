import React, { useEffect, useState } from 'react';
import { Card, Col, notification, Row, Table } from 'antd';
import { supabase } from 'configs/SupabaseConfig';
import { useSelector } from 'react-redux';

const LeaveDetails = ({ userId }) => {

    const [leaveDetails, setLeaveDetails] = useState();

    const { session } = useSelector((state) => state.auth);
    const standardDailyHours = session?.user?.organization?.timesheet_settings?.workingHours?.standardDailyHours || 8

    const fetchLeaveDetails = async () => {

        const { data, error } = await supabase.rpc('get_leave_details_for_user', { userid: userId });
        if (error) {
            console.error("Error fetching report data:", error);
        } else {
            console.log("Report Data", data)
            setLeaveDetails(data);
        }
    };

    useEffect(() => {
        fetchLeaveDetails();
    }, []);

    const columns = [
        {
            title: 'Leave Type',
            dataIndex: 'type',
            key: 'type',
        },
        {
            title: 'Taken Leaves',
            dataIndex: 'taken',
            key: 'taken',
        },
        {
            title: 'Minimum Allowed',
            dataIndex: 'min',
            key: 'min',
        },
        {
            title: 'Remaining Leaves',
            dataIndex: 'remaining',
            key: 'remaining',
        },
    ];

    return (
        <Row gutter={[16, 16]}>
            {leaveDetails?.map((leave) => (
                <Col key={leave.key} xs={24} sm={12} md={8} lg={6}>
                    <Card>
                        <div>
                            <strong>{leave.project_name}</strong>
                        </div>
                        <div>
                            Allocated Leaves: {leave?.details?.allocated_hours / standardDailyHours} Days
                        </div>
                        <div>Application Approved: {session?.user?.leave_details[leave?.project_id]?.taken || 0} days
                        </div>
                        <div> Timesheet Approved: {leave?.details?.expensed_hours / standardDailyHours} days
                        </div>
                    </Card>
                </Col>
            ))}
        </Row>
    );
};

export default LeaveDetails;
