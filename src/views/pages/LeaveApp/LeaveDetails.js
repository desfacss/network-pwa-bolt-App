import React, { useEffect, useState } from 'react';
import { Card, Col, notification, Row, Table } from 'antd';
import { supabase } from 'configs/SupabaseConfig';
import { useSelector } from 'react-redux';

const LeaveDetails = ({ leave_details }) => {

    const [projects, setProjects] = useState([]);

    const { session } = useSelector((state) => state.auth);
    const standardDailyHours = session?.user?.organization?.timesheet_settings?.workingHours?.standardDailyHours
    const fetchProjects = async () => {
        let { data, error } = await supabase.from('x_projects').select('*').eq('is_non_project', true).eq('linked_leave', true);
        if (data) {
            setProjects(data);
            console.log("Projects", data)
        }
        if (error) {
            notification.error({ message: error?.message || "Failed to fetch projects" });
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const dataSource = leave_details && Object.keys(leave_details)?.map((key, index) => {
        const leave = leave_details[key];
        return {
            key: index,
            type: key.charAt(0).toUpperCase() + key.slice(1),
            taken: leave.taken,
            min: leave.min !== null ? leave.min : 'N/A',
            remaining: leave.min !== null ? Math.max(leave.min - leave.taken, 0) : 'N/A'
        };
    });

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
            {projects?.map((leave) => {
                const filteredUser = leave?.details?.project_users?.filter(
                    (i) => i?.user_id === session?.user?.id
                )[0];
                console.log("TT")
                return (<Col key={leave.id} xs={24} sm={12} md={8} lg={6}>
                    <Card>
                        <div>
                            <strong>{leave.project_name}</strong>
                        </div>
                        <div>
                            {Number(filteredUser?.allocated_hours / standardDailyHours) - Number(filteredUser?.expensed_hours / standardDailyHours)} of {filteredUser?.allocated_hours / standardDailyHours} available
                            {/* {leave.remaining !== 'N/A' ? (
                                `${leave.remaining} of ${leave.min} available`
                            ) : (
                                'Not Applicable'
                            )} */}
                        </div>
                    </Card>
                </Col>
                )
            })}
        </Row>
    );
};

export default LeaveDetails;
