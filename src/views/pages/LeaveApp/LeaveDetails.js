import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Tooltip } from 'antd';
import { supabase } from 'configs/SupabaseConfig';
import { useSelector } from 'react-redux';
import { QuestionCircleOutlined } from "@ant-design/icons";

const LeaveDetails = ({ userId }) => {

    const [leaveDetails, setLeaveDetails] = useState();
    const [user, setUser] = useState();
    const [standardDailyHours, setStandardDailyHours] = useState();

    const { session } = useSelector((state) => state.auth);
    // const standardDailyHours = session?.user?.organization?.timesheet_settings?.workingHours?.standardDailyHours || 8

    const fetchLeaveDetails = async () => {
        const { data, error } = await supabase.rpc('get_leave_details_for_user', { userid: userId });
        if (error) {
            console.error("Error fetching report data:", error);
        } else {
            // console.log("Report Data", data)
            setLeaveDetails(data);
        }
    };

    const fetchUsers = async () => {
        const { data, error } = await supabase.from('users').select('*,organization:organization_id(*)').eq('organization_id', session?.user?.organization_id).eq('id', userId).eq('is_active', true);
        if (error) {
            console.error('Error fetching users:', error);
        } else {
            const currentUser = data && data[0]
            setUser(currentUser || []);
            setStandardDailyHours(currentUser?.organization?.timesheet_settings?.workingHours?.standardDailyHours || 8);
        }
    };

    useEffect(() => {
        fetchUsers();
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
                            <h4>{leave?.project_name}</h4>
                        </div>
                        <strong>{Number(leave?.details?.allocated_hours / standardDailyHours) - Number(leave?.details?.expensed_hours / standardDailyHours)}</strong> of <strong>{leave?.details?.allocated_hours / standardDailyHours}</strong> available
                        <Tooltip title={"Balance after timesheet approval"} placement="rightBottom" >
                            <QuestionCircleOutlined className='ml-2' />
                        </Tooltip>
                        {/* <div>
                            Allocated Leaves: {leave?.details?.allocated_hours / standardDailyHours} Days
                        </div> */}
                        <div>Leave Approved: <strong>{(user && user?.leave_details && user?.leave_details[leave?.project_id]?.taken) || 0}</strong> days
                            <Tooltip title={"Leave application approved"} placement="rightBottom" >
                                <QuestionCircleOutlined className='ml-2' />
                            </Tooltip>
                        </div>
                        {/* <div> Timesheet Approved: {leave?.details?.expensed_hours / standardDailyHours} days
                        </div> */}
                    </Card>
                </Col>
            ))}
        </Row>
    );
};

export default LeaveDetails;
