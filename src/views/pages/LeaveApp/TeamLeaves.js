import { Button, Card, notification, Table, Drawer, Form, Input, Divider, Modal, Tooltip } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { PlusOutlined, EditFilled, DeleteOutlined } from "@ant-design/icons";
import { supabase } from "configs/SupabaseConfig";
import DynamicForm from "../DynamicForm";
import { useSelector } from "react-redux";
import LeaveDetails from "./LeaveDetails";
import { generateEmailData, sendEmail } from "components/common/SendEmail";

const LeaveApplications = ({ startDate, endDate }) => {
    const componentRef = useRef(null);
    const [leaveApplications, setLeaveApplications] = useState([]);
    const [editItem, setEditItem] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [schema, setSchema] = useState();
    const [applicationSchema, setApplicationSchema] = useState();
    const [leaves, setLeaves] = useState([]);
    const [isApproveModal, setIsApproveModal] = useState(false);
    const [isRejectModal, setIsRejectModal] = useState(false);
    const [rejectComment, setRejectComment] = useState('');
    const [users, setUsers] = useState();

    const { session } = useSelector((state) => state.auth);

    const [form] = Form.useForm();

    useEffect(() => {
        const fetchUsers = async () => {
            const { data, error } = await supabase.from('users').select('*');
            if (error) {
                console.error('Error fetching users:', error);
            } else {
                setUsers(data || []);
            }
        };
        fetchUsers();
    }, []);

    const fetchLeaves = async () => {
        let { data, error } = await supabase.from('projects_leaves').select('*');
        if (data) {
            setLeaves(data);
            console.log("Leaves", data)
        }
        if (error) {
            notification.error({ message: error?.message || "Failed to fetch Leaves" });
        }
    };

    const getApprovalForm = async () => {
        const { data, error } = await supabase.from('forms').select('*').eq('name', "leave_approval_form").single()
        // console.log("A", data)
        if (data) {
            console.log(data)
            setSchema(data)
        }
    }
    const getApplicationForm = async () => {
        const { data, error } = await supabase.from('forms').select('*').eq('name', "leave_app_add_edit_form").single()
        console.log("A", data)
        if (data) {
            console.log(data)
            const updatedSchema = {
                ...data,
                ui_schema: {
                    ...data?.ui_schema,
                    "ui:readonly": true,
                    "ui:submitButtonOptions": {
                        "norender": true
                    }
                }
            }
            setApplicationSchema(updatedSchema)
        }
    }

    useEffect(() => {
        fetchLeaves();
        getApprovalForm()
        getApplicationForm()
    }, []);

    useEffect(() => {
        if (startDate && endDate) {
            fetchLeaveApplications();
        }
    }, [startDate, endDate]);

    const fetchLeaveApplications = async () => {
        let { data, error } = await supabase.from('leave_applications').select('*,user:user_id(*)').neq('status', 'Approved')
            .gte('submitted_time', startDate).lte('submitted_time', endDate).order('submitted_time', { ascending: false });
        if (data) {
            setLeaveApplications(data);
        }
        if (error) {
            notification.error({ message: error?.message || "Failed to fetch leave Applications" });
        }
    };

    const handleSubmit = async (status) => {
        // const { service_name, cost, duration, description } = values;
        const comment = isApproveModal ? "" : rejectComment;
        const { toDate, fromDate, leaveType } = editItem?.details
        const emailPayload = generateEmailData("Leave Application", status, {
            approverUsername: session?.user?.user_name,
            comment,
            userEmail: users?.find(user => user?.id === editItem?.user_id)?.details?.email,
            applicationDate: `for ${leaveType} from ${fromDate} to ${toDate}`,
            reviewedTime: new Date(new Date)?.toISOString()?.slice(0, 19)?.replace("T", " "),
        })
        // console.log("Payload", emailPayload)
        if (editItem) {
            // Update existing service
            const { data, error } = await supabase
                .from('leave_applications')
                .update({
                    approved_by_id: session?.user?.id,
                    status,
                    approver_details: { approved_time: new Date(), comment },
                })
                .eq('id', editItem.id);
            if (!error && status === 'Approved') {
                const leaveType = editItem?.details?.leaveType//?.split(" ")[0]?.toLowerCase(); // Extract first word and convert to lowercase
                var leaveDetails = session?.user?.leave_details
                var leaveTypeId = leaves?.find(i => i?.project_name === leaveType)?.id
                console.log("T", leaveDetails, leaveTypeId);
                // if (leaveDetails[leaveTypeId]) {
                leaveDetails = {
                    // leaves: {
                    ...leaveDetails,
                    [leaveTypeId]: {
                        ...leaveDetails[leaveTypeId],
                        taken: Number(leaveDetails[leaveTypeId]?.taken || 0) + Number(editItem?.details?.daysTaken)
                    }
                    // }
                };
                const { data: data2, error: error2 } = await supabase.from('users')
                    .update({ leave_details: leaveDetails })
                    .eq('id', editItem?.user_id);
                console.log("T", data2, leaveDetails, editItem?.user_id);
                // }
                notification.success({ message: `Leave Application ${isApproveModal ? "Approved" : "Rejected"}` });
                setEditItem(null);
                await sendEmail(emailPayload)
            } else if (error) {
                notification.error({ message: error?.message || `Failed to ${isApproveModal ? "Approve" : "Rejecte"} Leave Application` });
            }
        }
        if (isApproveModal) {
            setIsApproveModal(false);
        } else {
            setIsRejectModal(false);
            setRejectComment("");
        }
        fetchLeaveApplications();
        setIsDrawerOpen(false);
        form.resetFields();
        setEditItem()
    };

    const handleCancel = () => {
        setIsApproveModal(false);
        setIsRejectModal(false);
        setRejectComment('');
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

    // const handleDelete = async (id) => {
    //     const { error } = await supabase.from('leave_applications').delete().eq('id', id);
    //     if (!error) {
    //         notification.success({ message: "Leave Application deleted successfully" });
    //         fetchLeaveApplications();
    //     } else {
    //         notification.error({ message: error?.message || "Failed to delete Leave Application" });
    //     }
    // };

    const columns = [
        {
            title: 'Name',
            dataIndex: ['user', 'user_name'],
            key: 'user_name',
        },
        {
            title: 'Leave Type',
            dataIndex: ['details', 'leaveType'],
            key: 'leaveType',
        },
        {
            title: 'Leave Days',
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
        },
        {
            title: 'Days Away',
            dataIndex: ['details', 'daysAway'],
            key: 'daysAway',
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
            // render: (status) => (status === 'Approved' ? 'Yes' : 'No'),
        },
        {
            title: 'Review Comment',
            key: 'approver_id',
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
                    <Button
                        type="primary"
                        // icon={<EditFilled />}
                        size="small"
                        className="mr-2"
                        onClick={() => handleEdit(record)}
                        disabled={(record?.approver_id !== session?.user?.id && new Date() < new Date(record?.last_date))}
                    >Approve / Reject</Button>
                    {/* <Button
                        type="primary" ghost
                        icon={<DeleteOutlined />}
                        size="small"
                        onClick={() => handleDelete(record.id)}
                    /> */}
                </div>
            ),
        },
    ];

    return (
        <Card bodyStyle={{ padding: "0px" }}>
            {(isApproveModal || isRejectModal) &&
                <Modal
                    title={"Confirm " + (isApproveModal ? "Approval" : "Rejection")}
                    visible={isApproveModal || isRejectModal}
                    onOk={() => handleSubmit(isApproveModal ? "Approved" : "Rejected")}
                    onCancel={handleCancel}
                >
                    <p>{`Are you sure you want to ${isApproveModal ? "Approve" : "Reject"}?`}</p>
                    {isRejectModal && <Input.TextArea
                        rows={4}
                        value={rejectComment}
                        onChange={(e) => setRejectComment(e.target.value)}
                        placeholder="Please provide a reason for rejection"
                    />}
                </Modal>
            }
            <div className="d-flex p-2 justify-content-between align-items-center" style={{ marginBottom: "16px" }}>
                {/* <h2 style={{ margin: 0 }}>Leave Application</h2> */}
                {/* <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsDrawerOpen(true)}
                >
                    Add Leave Application
                </Button> */}
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
            <Drawer footer={null} width='100%' //size="large"
                // title={editItem ? "Leave Approval" : "Add Leave Approval"}
                title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <span>{editItem ? "Leave Approval for " + editItem?.user?.user_name : "Add Leave Approval"}</span>
                        <div>
                            <Button type="primary" className="mr-2" onClick={() => setIsApproveModal(true)}>
                                Approve
                            </Button>
                            <Button onClick={() => setIsRejectModal(true)}>
                                Reject
                            </Button>
                        </div>
                    </div>
                }
                open={isDrawerOpen} maskClosable={false}
                onClose={() => { setIsDrawerOpen(false); setEditItem() }}
                onOk={() => form.submit()}
                okText="Save"
            >
                {/* <Button type="primary" className="mr-2" onClick={() => setIsApproveModal(true)}>Approve</Button>
                <Button type="primary" onClick={() => setIsRejectModal(true)} >Reject</Button> */}
                <LeaveDetails userId={editItem?.user_id} />
                <DynamicForm schemas={applicationSchema}
                    // onFinish={handleAddOrEdit}
                    formData={editItem && editItem?.details} />
                <Divider />
                {/* <DynamicForm schemas={schema}
                    onFinish={handleAddOrEdit}
                    formData={editItem && editItem?.manager_details} /> */}
            </Drawer>
        </Card>
    );
};

export default LeaveApplications;
