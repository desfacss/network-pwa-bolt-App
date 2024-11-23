import { Button, Card, notification, Table, Drawer, Form, Input, Divider } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { PlusOutlined, EditFilled, DeleteOutlined } from "@ant-design/icons";
import { supabase } from "configs/SupabaseConfig";
import DynamicForm from "../DynamicForm";
import { useSelector } from "react-redux";

const LeaveApplications = () => {
    const componentRef = useRef(null);
    const [leaveApplications, setLeaveApplications] = useState([]);
    const [editItem, setEditItem] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [schema, setSchema] = useState();
    const [applicationSchema, setApplicationSchema] = useState();
    const [leaves, setLeaves] = useState([]);

    const { session } = useSelector((state) => state.auth);

    const [form] = Form.useForm();

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

    const getApprovalForm = async () => {
        const { data, error } = await supabase.from('forms').select('*').eq('name', "leave_approval_form").single()
        // console.log("A", data)
        if (data) {
            console.log(data)
            setSchema(data)
        }
    }
    const getApplicationForm = async () => {
        const { data, error } = await supabase.from('forms').select('*').eq('name', "leave_add_edit_form").single()
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
        fetchLeaveApplications();
    }, []);

    const fetchLeaveApplications = async () => {
        let { data, error } = await supabase.from('leave_applications').select('*,user:user_id(*)').neq('status', 'Approved');
        if (data) {
            setLeaveApplications(data);
        }
        if (error) {
            notification.error({ message: error?.message || "Failed to fetch leave Applications" });
        }
    };

    const handleAddOrEdit = async (values) => {
        // const { service_name, cost, duration, description } = values;
        console.log("Pyload", values)
        if (editItem) {
            // Update existing service
            const { data, error } = await supabase
                .from('leave_applications')
                .update({ status: values?.status, manager_details: { ...values, id: session?.user?.id } })
                .eq('id', editItem.id);
            if (values?.status === 'Approved') {
                console.log("T", values?.status);
                const leaveType = editItem?.details?.leaveType//?.split(" ")[0]?.toLowerCase(); // Extract first word and convert to lowercase
                var leaveDetails = session?.user?.leave_details
                var leaveTypeId = leaves?.find(i => i?.leave_type === leaveType)?.id
                if (leaveDetails[leaveTypeId]) {
                    leaveDetails = {
                        // leaves: {
                        ...leaveDetails,
                        [leaveTypeId]: {
                            ...leaveDetails[leaveTypeId],
                            taken: leaveDetails[leaveTypeId]?.taken + editItem?.details?.daysTaken
                        }
                        // }
                    };
                    const { data: data2, error: error2 } = await supabase.from('users')
                        .update({ leave_details: leaveDetails })
                        .eq('id', editItem?.user_id);
                    // console.log("T", data2, leaveDetails, editItem?.user_id);
                }

                notification.success({ message: "Leave Application updated successfully" });
                setEditItem(null);
            } else if (error) {
                notification.error({ message: error?.message || "Failed to update leave Application" });
            }
        } else {
            // Add new leaveApplication
            const { data, error } = await supabase
                .from('leave_applications')
                .insert([{ details: values, job_name: values?.job_name, organization_id: session?.user?.organization_id, organization_name: session?.user?.details?.orgName }]);

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
            title: 'Reason',
            dataIndex: ['details', 'reason'],
            key: 'reason',
        },
        {
            title: 'Days',
            dataIndex: ['details', 'daysTaken'],
            key: 'daysTaken',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            // render: (status) => (status === 'Approved' ? 'Yes' : 'No'),
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
                title={editItem ? "Leave Approval" : "Add Leave Approval"}
                open={isDrawerOpen} maskClosable={false}
                onClose={() => { setIsDrawerOpen(false); setEditItem() }}
                onOk={() => form.submit()}
                okText="Save"
            >
                <DynamicForm schemas={applicationSchema}
                    // onFinish={handleAddOrEdit}
                    formData={editItem && editItem?.details} />
                <Divider />
                <DynamicForm schemas={schema}
                    onFinish={handleAddOrEdit}
                    formData={editItem && editItem?.manager_details} />
            </Drawer>
        </Card>
    );
};

export default LeaveApplications;
