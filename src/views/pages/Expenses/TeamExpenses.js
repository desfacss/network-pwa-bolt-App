import { Button, Card, notification, Table, Drawer, Form, Input, Modal } from "antd";
import { EditOutlined } from "@ant-design/icons";
import React, { useEffect, useRef, useState } from "react";
import { supabase } from "configs/SupabaseConfig";
// import DynamicForm from "../DynamicForm";
import { useSelector } from "react-redux";
import Expensesheet from "./Expensesheet";
import { generateEmailData, sendEmail } from "components/common/SendEmail";
// import ExpenseDetails from "./ExpenseDetails";

const TeamExpenses = ({ startDate, endDate }) => {
    const componentRef = useRef(null);
    const [expenses, setExpenses] = useState([]);
    const [editItem, setEditItem] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [viewMode, setViewMode] = useState(true);
    const [schema, setSchema] = useState();
    const [applicationSchema, setApplicationSchema] = useState();
    const [leaves, setLeaves] = useState([]);
    const [isApproveModal, setIsApproveModal] = useState(false);
    const [isRejectModal, setIsRejectModal] = useState(false);
    const [rejectComment, setRejectComment] = useState('');
    const [users, setUsers] = useState();
    const [projects, setProjects] = useState();

    const { session } = useSelector((state) => state.auth);

    const [form] = Form.useForm();

    const fetchProjects = async () => {
        const { data, error } = await supabase.rpc('get_projects_with_allocation', {
            userid: session?.user?.id,
            include_leaves: false,
            include_non_project: false
        }); // Call the stored function
        if (error) {
            console.error('Error fetching projects:', error);
        } else {
            setProjects(data);
            console.log('Project data:', data);
        }
    };

    const fetchUsers = async () => {
        const { data, error } = await supabase.from('users').select('*');
        if (error) {
            console.error('Error fetching users:', error);
        } else {
            setUsers(data || []);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchProjects()
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
        const { data, error } = await supabase.from('forms').select('*').eq('name', "expense_app_add_edit_form").single()
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
        getApprovalForm()
        getApplicationForm()
        fetchLeaves();
    }, []);

    useEffect(() => {
        if (startDate && endDate) {
            fetchExpenses();
        }
    }, [startDate, endDate]);

    const fetchExpenses = async () => {
        let { data, error } = await supabase.from('expensesheet').select('*,user:user_id(*)').neq('status', 'Approved')
            .gte('submitted_time', startDate).lte('submitted_time', endDate).order('submitted_time', { ascending: false });
        if (data) {
            setExpenses(data);
        }
        if (error) {
            notification.error({ message: error?.message || "Failed to fetch expenses" });
        }
    };

    const handleSubmit = async (status) => {
        // const { service_name, cost, duration, description } = values;
        const comment = isApproveModal ? "" : rejectComment;
        const emailPayload = [generateEmailData("Expense Sheet", status, {
            approverUsername: session?.user?.user_name,
            comment,
            userEmail: users?.find(user => user?.id === editItem?.user_id)?.details?.email,
            applicationDate: `for ${projects?.find(project => project?.id === editItem?.project_id)?.project_name} - ${editItem?.submitted_time?.slice(0, 10)?.replace("T", " ")}`,
            reviewedTime: new Date(new Date)?.toISOString()?.slice(0, 19)?.replace("T", " "),
        })]
        console.log("Payload", emailPayload, editItem)
        if (editItem) {
            console.log(editItem.id, session?.user?.id)
            const { data, error } = await supabase
                .from('expensesheet')
                .update({
                    approved_by_id: session?.user?.id,
                    status,
                    approver_details: { approved_time: new Date(), comment: (isApproveModal ? "" : rejectComment), },
                })
                .eq('id', editItem.id).select('*');
            if (data && emailPayload[0] !== null) {
                await sendEmail(emailPayload)
            }
            // if (!error && status === 'Approved') {
            //     const expenseType = editItem?.details?.expenseType//?.split(" ")[0]?.toLowerCase(); // Extract first word and convert to lowercase
            //     var expenseDetails = session?.user?.expense_details
            //     var expenseTypeId = expenses?.find(i => i?.project_name === expenseType)?.id
            //     console.log("T", expenseDetails, expenseTypeId);
            //     // if (expenseDetails[expenseTypeId]) {
            //     expenseDetails = {
            //         // expenses: {
            //         ...expenseDetails,
            //         [expenseTypeId]: {
            //             ...expenseDetails[expenseTypeId],
            //             taken: Number(expenseDetails[expenseTypeId]?.taken || 0) + Number(editItem?.details?.daysTaken)
            //         }
            //         // }
            //     };
            //     const { data: data2, error: error2 } = await supabase.from('users')
            //         .update({ expense_details: expenseDetails })
            //         .eq('id', editItem?.user_id);
            //     console.log("T", data2, expenseDetails, editItem?.user_id);
            //     // }
            //     notification.success({ message: `Expense  ${isApproveModal ? "Approved" : "Rejected"}` });
            //     setEditItem(null);
            // } 
            if (error) {
                notification.error({ message: error?.message || `Failed to ${isApproveModal ? "Approve" : "Rejecte"} Expense ` });
            }
        }
        if (isApproveModal) {
            setIsApproveModal(false);
        } else {
            setIsRejectModal(false);
            setRejectComment("");
        }
        fetchExpenses();
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
        console.log("R", record)
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
    //     const { error } = await supabase.from('expenses').delete().eq('id', id);
    //     if (!error) {
    //         notification.success({ message: "Expense  deleted successfully" });
    //         fetchExpenses();
    //     } else {
    //         notification.error({ message: error?.message || "Failed to delete Expense " });
    //     }
    // };

    const columns = [
        {
            title: 'Name',
            dataIndex: ['user', 'user_name'],
            key: 'user_name',
        },
        {
            title: 'Expense Type',
            dataIndex: ['details', 'expenseType'],
            key: 'expenseType',
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

    const onAdd = () => {

    }

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
                {/* <h2 style={{ margin: 0 }}>Expense </h2> */}
                {/* <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsDrawerOpen(true)}
                >
                    Add Expense 
                </Button> */}
            </div>
            <div className="table-responsive" ref={componentRef}>
                <Table size={'small'}
                    columns={columns}
                    dataSource={expenses}
                    rowKey={(record) => record.id}
                    loading={!expenses}
                    pagination={false}
                />
            </div>
            <Drawer footer={null} width='100%' //size="large"
                // title={editItem ? "Expense Approval" : "Add Expense Approval"}
                title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <span>{editItem ? "Expense Approval for " + editItem?.user?.user_name : "Add Expense Approval"}</span>
                        <div>
                            <Button className="mr-2" icon={<EditOutlined />} onClick={() => setViewMode(prev => !prev)}>
                            </Button>
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
                <Expensesheet editItem={editItem} onAdd={onAdd} viewMode={viewMode} />
            </Drawer>
        </Card>
    );
};

export default TeamExpenses;
