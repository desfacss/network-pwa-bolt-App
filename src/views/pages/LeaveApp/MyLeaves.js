import { Button, Card, notification, Table, Drawer, Form, Modal, Tooltip } from "antd";
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { EditFilled, ExclamationCircleFilled, DeleteOutlined } from "@ant-design/icons";
import { supabase } from "configs/SupabaseConfig";
import DynamicForm from "../DynamicForm";
import { useSelector } from "react-redux";
import LeaveDetails from "./LeaveDetails";
import dayjs from "dayjs";
import { generateEmailData, sendEmail } from "components/common/SendEmail";
const { confirm } = Modal;

const LeaveApplications = forwardRef(({ startDate, endDate }, ref) => {
    const componentRef = useRef(null);
    const [leaveApplications, setLeaveApplications] = useState([]);
    const [editItem, setEditItem] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [schema, setSchema] = useState();
    const [leavePolicy, setLeavePolicy] = useState();
    const [remainingLeaves, setRemainingLeaves] = useState();
    const [users, setUsers] = useState();

    const { session } = useSelector((state) => state.auth);

    const { timesheet_settings } = session?.user?.organization

    const [form] = Form.useForm();

    useImperativeHandle(ref, () => ({
        showDrawer,
    }));

    const showDrawer = () => {
        form.resetFields();
        setIsDrawerOpen(true)
    }

    useEffect(() => {
        if (startDate && endDate) {
            fetchLeaveApplications();
        }
    }, [startDate, endDate])

    useEffect(() => {
        const fetchUsers = async () => {
            const { data, error } = await supabase.from('users').select('*').eq('organization_id', session?.user?.organization_id);
            if (error) {
                console.error('Error fetching users:', error);
            } else {
                setUsers(data || []);
            }
        };
        fetchUsers();
    }, []);

    const getForms = async () => {
        const { data, error } = await supabase.from('forms').select('*').eq('name', "leave_app_add_edit_form").single()
        if (data) {
            // console.log(data)
            setSchema(data)
        }
    }

    const getLocationDetails = async () => {
        const { data, error } = await supabase.from('locations').select('*').eq('organization_id', session?.user?.organization_id).eq('id', session?.user?.location?.id).single()
        if (data) {
            // console.log(data)
            setLeavePolicy(data?.details?.leave_policy)
        }
    }

    useEffect(() => {
        getForms()
        getLocationDetails()
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
        let { data, error } = await supabase.from('leave_applications').select('*').eq('user_id', session?.user?.id).eq('organization_id', session?.user?.organization_id)
            .gte('submitted_time', startDate).lte('submitted_time', endDate).order('created_at', { ascending: false });
        if (data) {
            // console.log("leaves", data);
            setLeaveApplications(data);
            // setRemainingSickLeaves(policy.sickleaves - totalSickLeaveTaken);
        }
        if (error) {
            notification.error({ message: error?.message || "Failed to fetch leave Applications" });
        }
    };

    const handleAddOrEdit = async (values) => {
        // Parse dates using dayjs
        const { toDate, fromDate, dateReturning } = values;
        const from = dayjs(fromDate);
        const to = dayjs(toDate);
        const returning = dayjs(dateReturning);

        // Validate toDate >= fromDate
        if (to.isBefore(from)) {
            notification.error({ message: "'To Date' should be greater than or equal to 'From Date'." });
            return
        }

        // Validate dateReturning > toDate
        if (!returning.isAfter(to)) {
            notification.error({ message: "'Date Returning' should be greater than 'To Date'." });
            return false;
        }

        const today = new Date();
        const lastDate = new Date(today.setDate(today.getDate() + (timesheet_settings?.approvalWorkflow?.timeLimitForApproval || 0)));

        const approver_id = session?.user[timesheet_settings?.approvalWorkflow?.defaultApprover || 'manager']?.id

        const payload = {
            details: values,
            user_id: session?.user?.id,
            status: "Submitted",
            approver_id,
            last_date: lastDate.toISOString(),
            submitted_time: new Date(),
            organization_id: session?.user?.organization_id,
        }

        const emailPayload = [generateEmailData("leave application", "Submitted", {
            username: session?.user?.user_name,
            approverEmail: users?.find(user => user?.id === approver_id)?.details?.email,
            hrEmails: users?.filter(user => user?.role_type === 'hr')?.map(user => user?.details?.email),
            applicationDate: `for ${values?.leaveType} from ${fromDate} to ${toDate}`,
            submittedTime: new Date(new Date)?.toISOString()?.slice(0, 19)?.replace("T", " "),
        })]

        // console.log("Payload", emailPayload)
        if (editItem) {
            // Update existing service
            const { data, error } = await supabase
                .from('leave_applications')
                .update(payload)
                .eq('id', editItem.id).select('*');

            if (data) {
                notification.success({ message: "Leave Application updated successfully" });
                if (emailPayload[0] !== null) {
                    await sendEmail(emailPayload)
                }
                setEditItem(null);
            } else if (error) {
                notification.error({ message: error?.message || "Failed to update leave Application" });
            }
        } else {
            // Add new leaveApplication
            const { data, error } = await supabase
                .from('leave_applications')
                .insert([payload]).select('*');

            if (data) {
                notification.success({ message: "Leave Application added successfully" });
                if (emailPayload[0] !== null) {
                    await sendEmail(emailPayload)
                }
                setEditItem(null)
            } else if (error) {
                notification.error({ message: error?.message || "Failed to add leave Application" });
            }
        }
        fetchLeaveApplications();
        setIsDrawerOpen(false);
        form.resetFields();
        setEditItem(null)
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

    const showDeleteConfirm = async (record) => {
        confirm({
            title: `Confirm deletion of ${record?.details?.leaveType} from ${record?.details?.fromDate} to ${record?.details?.toDate} ?`,
            icon: <ExclamationCircleFilled />,
            //   content: 'Some descriptions',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                const { error } = await supabase.from('leave_applications').delete().eq('id', record?.id);
                if (!error) {
                    notification.success({ message: `${record?.details?.leaveType} deleted` });
                    fetchLeaveApplications();
                } else {
                    notification.error({ message: error?.message || `Failed to delete ${record?.details?.leaveType}` });
                }
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    };

    const columns = [
        {
            title: 'Leave Type',
            dataIndex: ['details', 'leaveType'],
            key: 'leaveType',
            sorter: (a, b) => a?.details?.leaveType?.localeCompare(b?.details?.leaveType),
        },
        // {
        //     title: 'Application',
        //     // dataIndex: ['submitted_time'],
        //     key: 'submitted_time',
        //     render: (record) => (
        //         <div>
        //             {record?.submitted_time?.replace("T", " ")?.replace(/\.\d+\+\d+:\d+$/, "")}
        //         </div>
        //     )
        // },
        {
            title: 'Leave Period',
            // dataIndex: ['submitted_time'],
            key: 'submitted_time',
            width: 200,
            render: (record) => (
                <div>
                    {record?.details?.fromDate} -- {record?.details?.toDate}
                </div>
            )
        },
        {
            title: 'Days',
            dataIndex: ['details', 'daysTaken'],
            key: 'daysTaken',
            sorter: (a, b) => String(a?.details?.daysTaken)?.localeCompare(String(b?.details?.daysTaken)),
        },
        {
            title: 'Days Away',
            dataIndex: ['details', 'daysAway'],
            key: 'daysAway',
            sorter: (a, b) => String(a?.details?.daysAway)?.localeCompare(String(b?.details?.daysAway)),
        },
        // {
        //     title: 'Reason',
        //     // dataIndex: ['details', 'reason'],
        //     key: 'reason',
        //     render: (record) => {
        //         const comment = record?.details?.reason || '';  // Ensure the comment is defined
        //         const truncatedComment = comment.length > 150 ? `${comment.substring(0, 100)}...` : comment;

        //         return (
        //             <Tooltip title={comment}>  {/* Tooltip will show the full comment */}
        //                 <div style={{
        //                     whiteSpace: 'nowrap',
        //                     overflow: 'hidden',
        //                     textOverflow: 'ellipsis',
        //                     maxWidth: '200px', // You can adjust this based on your table column width
        //                 }}>
        //                     {truncatedComment}  {/* Truncated comment for the table cell */}
        //                 </div>
        //             </Tooltip>
        //         );
        //     }
        // },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            sorter: (a, b) => a?.status?.localeCompare(b?.status),
            // render: (status) => (status === 'Approved' ? 'Yes' : 'No'),
        },
        {
            title: 'Review Date',
            // dataIndex: ['approver_details', 'approved_time'],
            key: 'approved_time',
            sorter: (a, b) => a?.approver_details?.approved_time?.localeCompare(b?.approver_details?.approved_time),
            render: (record) => (
                <div>
                    {/* {record?.approver_details?.approved_time?.replace("T", " ")?.replace(/\.\d+\+\d+:\d+$/, "")} */}
                    {record?.approver_details?.approved_time?.replace("T", " ").replace(/\.\d+Z$/, "")}
                </div>
            )
        },
        {
            title: 'Review Comment',
            key: 'approver_id',
            sorter: (a, b) => a?.approver_details?.comment?.localeCompare(b?.approver_details?.comment),
            render: (record) => {
                const comment = record?.approver_details?.comment || '';  // Ensure the comment is defined
                const truncatedComment = comment.length > 150 ? `${comment.substring(0, 100)}...` : comment;

                return (
                    <Tooltip title={comment}>  {/* Tooltip will show the full comment */}
                        <div style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '150px', // You can adjust this based on your table column width
                        }}>
                            {truncatedComment}  {/* Truncated comment for the table cell */}
                        </div>
                    </Tooltip>
                );
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <div className="d-flex">
                    {record?.status !== 'Approved' && <Button type="primary" icon={<EditFilled />} size="small"
                        className="mr-2" onClick={() => handleEdit(record)} />}
                    {record?.status !== 'Approved' && <Button type="primary" ghost icon={<DeleteOutlined />}
                        size="small" onClick={() => showDeleteConfirm(record)} />}
                </div>
            ),
        },
    ];

    return (
        <Card styles={{ body: { padding: "0px" } }}>
            <LeaveDetails userId={session?.user?.id} />
            {/* <div className="d-flex p-2 justify-content-between align-items-center" style={{ marginBottom: "16px" }}>
            </div> */}
            <div className="table-responsive" ref={componentRef}>
                <Table size={'small'} columns={columns} dataSource={leaveApplications} rowKey={(record) => record.id}
                    loading={!leaveApplications} pagination={false} />
            </div>
            <Drawer footer={null} width="100%" //size="large"
                title={editItem ? "Edit Leave Application" : "Add Leave Application"}
                open={isDrawerOpen} maskClosable={false} onOk={() => form.submit()} okText="Save"
                onClose={() => { setIsDrawerOpen(false); form.resetFields(); setEditItem(); }} >
                <DynamicForm schemas={schema} onFinish={handleAddOrEdit} formData={editItem && editItem?.details} />
            </Drawer>
        </Card>
    );
});

export default LeaveApplications;
