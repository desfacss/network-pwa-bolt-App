import React, { useEffect, useState } from 'react';
import { Card, Col, notification, Row, Table } from 'antd';
import { supabase } from 'configs/SupabaseConfig';
import { useSelector } from 'react-redux';

const LeaveDetails = () => {

    const [projects, setProjects] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [leaveDetails, setLeaveDetails] = useState();
    const [data, setData] = useState();

    const { session } = useSelector((state) => state.auth);
    const standardDailyHours = session?.user?.organization?.timesheet_settings?.workingHours?.standardDailyHours

    const fetchLeaveDetails = async () => {
        console.log("Repor", session?.user?.id)

        const { data, error } = await supabase.rpc('get_leave_details_for_user', { userid: session?.user?.id });
        if (error) {
            console.error("Error fetching report data:", error);
        } else {
            console.log("Report Data", data)
            setLeaveDetails(data);
        }
    };

    const fetchProjects = async () => {
        let { data, error } = await supabase.from('projects_leaves').select('*').eq('is_non_project', true).eq('linked_leave', true);
        if (data) {
            setProjects(data);
            console.log("Projects", data)
        }
        if (error) {
            notification.error({ message: error?.message || "Failed to fetch projects" });
        }
    };
    const fetchLeaves = async () => {
        let { data, error } = await supabase.from('leaves').select('*');
        if (data) {
            setLeaves(data);
            console.log("Leaves", data)
        }
        if (error) {
            notification.error({ message: error?.message || "Failed to fetch Leaves" });
        }
    };

    useEffect(() => {
        fetchProjects();
        fetchLeaves();
        fetchLeaveDetails();
    }, []);

    useEffect(() => {
        // const dataSource = leaveDetails && Object.keys(leaveDetails)?.map((key, index) => {
        //     const leave = leaveDetails[key];
        //     return {
        //         key: index,
        //         // type: key.charAt(0).toUpperCase() + key.slice(1),
        //         type: leaves.find(i => i?.id === key)?.leave_type || "",
        //         taken: leave.taken,
        //         allocated: leave.allocated !== null ? leave.allocated : 'N/A',
        //         remaining: leave.allocated !== null ? Math.max(leave.allocated - leave.expensed, 0) : 'N/A',
        //         expensed: leave.expensed
        //     };
        // });

        // const dataSource = leaveDetails?.map((key, index) => {
        //     return {
        //         key: index,
        //         type: leaves.find((i) => i?.id === key)?.leave_type || "Unknown Leave Type",
        //         taken: leave?.details?.taken || leave.taken || 0, // Adjust based on new structure
        //         allocated: leave?.details?.allocated || leave.allocated || 'N/A',
        //         remaining: leave?.details?.allocated
        //             ? Math.max(leave.details.allocated - leave.details.expensed, 0)
        //             : 'N/A',
        //         expensed: leave?.details?.expensed || leave.expensed || 0,
        //         min: leave?.min || 'N/A', // Include other fields from the new format as needed
        //     };
        // });

        // setData(dataSource)
    }, [leaveDetails, leaves])

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
                            {/* {leave.remaining !== 'N/A' ? ( */}
                            {leave?.details?.allocated_hours - leave?.details?.expensed_hours} of {leave?.details?.allocated_hours} available
                            {/* ) : (
                                'Not Applicable'
                            )} */}
                        </div>
                    </Card>
                </Col>
            ))}
        </Row>
    );
};

export default LeaveDetails;
