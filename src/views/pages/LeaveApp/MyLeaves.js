import { Button, Card, notification, Table, Drawer, Form, Input } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { PlusOutlined, EditFilled, DeleteOutlined } from "@ant-design/icons";
import { supabase } from "configs/SupabaseConfig";
import DynamicForm from "../DynamicForm";
import { useSelector } from "react-redux";
import LeaveDetails from "./LeaveDetails";

const LeaveApplications = () => {
    const componentRef = useRef(null);
    const [leaveApplications, setLeaveApplications] = useState([]);
    const [editItem, setEditItem] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [schema, setSchema] = useState();
    const [leavePolicy, setLeavePolicy] = useState();
    const [remainingLeaves, setRemainingLeaves] = useState();

    const { session } = useSelector((state) => state.auth);

    const { timesheet_settings } = session?.user?.organization

    const [form] = Form.useForm();

    const getForms = async () => {
        const { data, error } = await supabase.from('forms').select('*').eq('name', "leave_add_edit_form").single()
        if (data) {
            // console.log(data)
            setSchema(data)
        }
    }

    const getLocationDetails = async () => {
        const { data, error } = await supabase.from('locations').select('*').eq('id', session?.user?.location?.id).single()
        if (data) {
            // console.log(data)
            setLeavePolicy(data?.details?.leave_policy)
        }
    }

    useEffect(() => {
        getForms()
        getLocationDetails()
        fetchLeaveApplications();
    }, []);

    useEffect(() => {
        if (leaveApplications && leavePolicy) {
            const totalPersonalLeaveTaken = leaveApplications?.filter(leave => leave?.details?.leaveType === 'Personal Leave')
                ?.reduce((total, leave) => total + leave?.details?.daysTaken, 0);

            const totalSickLeaveTaken = leaveApplications?.filter(leave => leave?.details?.leaveType === 'Sick Leave')
                ?.reduce((total, leave) => total + leave?.details?.daysTaken, 0);

            setRemainingLeaves({ leaves: leavePolicy?.leaves - totalPersonalLeaveTaken, sickLeaves: leavePolicy?.sickleaves - totalSickLeaveTaken });
        }
    }, [leaveApplications, leavePolicy]);

    const fetchLeaveApplications = async () => {
        let { data, error } = await supabase.from('leave_applications').select('*').eq('user_id', session?.user?.id).order('created_at', { ascending: true });
        if (data) {
            console.log("leaves", data);
            setLeaveApplications(data);
            // setRemainingSickLeaves(policy.sickleaves - totalSickLeaveTaken);
        }
        if (error) {
            notification.error({ message: error?.message || "Failed to fetch leave Applications" });
        }
    };

    const handleAddOrEdit = async (values) => {
        const today = new Date();
        const lastDate = new Date(today.setDate(today.getDate() + (timesheet_settings?.approvalWorkflow?.timeLimitForApproval || 0)));

        const payload = {
            details: values,
            user_id: session?.user?.id,
            status: "Submitted",
            approver_id: session?.user[timesheet_settings?.approvalWorkflow?.defaultApprover || 'manager_id']?.id,
            last_date: lastDate.toISOString(),
            submitted_time: new Date()
        }

        if (editItem) {
            // Update existing service
            const { data, error } = await supabase
                .from('leave_applications')
                .update(payload)
                .eq('id', editItem.id);

            if (data) {
                notification.success({ message: "Leave Application updated successfully" });
                setEditItem(null);
            } else if (error) {
                notification.error({ message: error?.message || "Failed to update leave Application" });
            }
        } else {
            // Add new leaveApplication
            const { data, error } = await supabase
                .from('leave_applications')
                .insert([payload]);

            if (data) {
                notification.success({ message: "Leave Application added successfully" });
            } else if (error) {
                notification.error({ message: error?.message || "Failed to add leave Application" });
            }
        }
        fetchLeaveApplications();
        setIsDrawerOpen(false);
        form.resetFields();
        setEditItem()
    };

    const handleEdit = (record) => {
        setEditItem(record);
        form.setFieldsValue({
            service_name: record.details.service_name,
            cost: record.details.cost,
            duration: record.details.duration,
            description: record.details.description,
        });
        setIsDrawerOpen(true);
    };

    const handleDelete = async (id) => {
        const { error } = await supabase.from('leave_applications').delete().eq('id', id);
        if (!error) {
            notification.success({ message: "Leave Application deleted successfully" });
            fetchLeaveApplications();
        } else {
            notification.error({ message: error?.message || "Failed to delete Leave Application" });
        }
    };

    const columns = [
        {
            title: 'Application',
            dataIndex: ['created_at'],
            key: 'applicationDate',
        },
        {
            title: 'Reason',
            dataIndex: ['details', 'reason'],
            key: 'reason',
            render: (_, record) => (
                <>
                    {record?.details?.reason?.substring(0, 100) + (record?.details?.reason?.length > 100 ? "..." : "")}
                </>
            ),
        },
        {
            title: 'Days',
            dataIndex: ['details', 'daysTaken'],
            key: 'daysTaken',
        },
        {
            title: 'Leave Type',
            dataIndex: ['details', 'leaveType'],
            key: 'leaveType',
        },
        {
            title: 'status',
            dataIndex: 'status',
            key: 'status',
            // render: (status) => (status === 'Approved' ? 'Yes' : 'No'),
        },
        {
            title: 'Review Date',
            dataIndex: ['approver_details', 'approved_time'],
            key: 'applicationDate',
        },
        // {
        //     title: 'Billable',
        //     dataIndex: ['details', 'billable'],
        //     key: 'billable',
        //     render: (billable) => (billable ? 'Yes' : 'No'),
        // },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <div className="d-flex">
                    {record?.status !== 'Approved' && <Button
                        type="primary"
                        icon={<EditFilled />}
                        size="small"
                        className="mr-2"
                        onClick={() => handleEdit(record)}
                    />}
                    {record?.status !== 'Approved' && <Button
                        type="primary" ghost
                        icon={<DeleteOutlined />}
                        size="small"
                        onClick={() => handleDelete(record.id)}
                    />}
                </div>
            ),
        },
    ];

    return (
        <Card bodyStyle={{ padding: "0px" }}>
            <LeaveDetails userId={session?.user?.id}
            // leave_details={session?.user?.leave_details} 
            />
            <div className="d-flex p-2 justify-content-between align-items-center" style={{ marginBottom: "16px" }}>
                {/* <h2 style={{ margin: 0 }}>Leave Application</h2> */}
                <div>
                    {/* <p>
                        {remainingLeaves?.leaves} Leaves Remaining
                    </p>
                    <p>
                        {remainingLeaves?.sickLeaves} Sick Leaves Remaining
                    </p> */}
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsDrawerOpen(true)}
                >
                    Add Leave Application
                </Button>
            </div>
            <div className="table-responsive" ref={componentRef}>
                <Table size={'small'}
                    columns={columns}
                    dataSource={leaveApplications}
                    rowKey={(record) => record.id}
                    loading={!leaveApplications}
                    pagination={false}
                />
            </div>
            <Drawer footer={null} width="100%" //size="large"
                title={editItem ? "Edit Leave Application" : "Add Leave Application"}
                open={isDrawerOpen} maskClosable={false}
                onClose={() => { setIsDrawerOpen(false); setEditItem() }}
                onOk={() => form.submit()}
                okText="Save"
            >
                <DynamicForm schemas={schema}
                    onFinish={handleAddOrEdit}
                    formData={editItem && editItem?.details} />
            </Drawer>
        </Card>
    );
};

export default LeaveApplications;
