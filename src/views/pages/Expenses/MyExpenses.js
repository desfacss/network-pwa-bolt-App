import { Button, Card, notification, Table, Drawer, Form, Input, Modal } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { PlusOutlined, EditFilled, ExclamationCircleFilled, DeleteOutlined } from "@ant-design/icons";
import { supabase } from "configs/SupabaseConfig";
import DynamicForm from "../DynamicForm";
import { useSelector } from "react-redux";
import EditExpense from "./EditExpense";
import Timesheet from "./AntDTable9";
// import ExpenseDetails from "./ExpenseDetails";
const { confirm } = Modal;

const MyExpenses = () => {
    const componentRef = useRef(null);
    const [expenses, setExpenses] = useState([]);
    const [editItem, setEditItem] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [expensePolicy, setExpensePolicy] = useState();

    const { session } = useSelector((state) => state.auth);

    const { timesheet_settings } = session?.user?.organization

    const [form] = Form.useForm();


    const getLocationDetails = async () => {
        const { data, error } = await supabase.from('locations').select('*').eq('id', session?.user?.location?.id).single()
        if (data) {
            // console.log(data)
            setExpensePolicy(data?.details?.expense_policy)
        }
    }

    useEffect(() => {
        getLocationDetails()
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        let { data, error } = await supabase.from('expensesheet').select('*,project:project_id(*)').eq('user_id', session?.user?.id).order('created_at', { ascending: true });
        if (data) {
            console.log("expenses", data);
            setExpenses(data);
            // setRemainingSickExpenses(policy.sickexpenses - totalSickExpenseTaken);
        }
        if (error) {
            notification.error({ message: error?.message || "Failed to fetch expense s" });
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
                .from('expensesheet')
                .update(payload)
                .eq('id', editItem.id);

            if (data) {
                notification.success({ message: "Expense  updated successfully" });
                setEditItem(null);
            } else if (error) {
                notification.error({ message: error?.message || "Failed to update expense " });
            }
        } else {
            // Add new expense
            const { data, error } = await supabase
                .from('expensesheet')
                .insert([payload]);

            if (data) {
                notification.success({ message: "Expense  added successfully" });
            } else if (error) {
                notification.error({ message: error?.message || "Failed to add expense " });
            }
        }
        fetchExpenses();
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

    const showDeleteConfirm = async (record) => {
        confirm({
            title: `Are you sure delete ${record?.expense_date} for ${record?.project?.project_name} ?`,
            icon: <ExclamationCircleFilled />,
            //   content: 'Some descriptions',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                const { error } = await supabase.from('expensesheet').delete().eq('id', record?.id);
                if (!error) {
                    notification.success({ message: "Expense  deleted successfully" });
                    fetchExpenses();
                } else {
                    notification.error({ message: error?.message || "Failed to delete Expense " });
                }
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    };

    const columns = [
        {
            title: 'Application',
            // dataIndex: ['submitted_time'],
            key: 'submitted_time',
            render: (record) => (
                <div>
                    {record?.submitted_time?.replace("T", " ")?.replace(/\.\d+\+\d+:\d+$/, "")}
                </div>
            )
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
            title: 'Expense Type',
            dataIndex: ['details', 'expenseType'],
            key: 'expenseType',
        },
        {
            title: 'status',
            dataIndex: 'status',
            key: 'status',
            // render: (status) => (status === 'Approved' ? 'Yes' : 'No'),
        },
        {
            title: 'Review Date',
            // dataIndex: ['approver_details', 'approved_time'],
            key: 'approved_time',
            render: (record) => (
                <div>
                    {/* {record?.approver_details?.approved_time?.replace("T", " ")?.replace(/\.\d+\+\d+:\d+$/, "")} */}
                    {record?.approver_details?.approved_time?.replace("T", " ").replace(/\.\d+Z$/, "")}
                </div>
            )
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
                        onClick={() => showDeleteConfirm(record)}
                    />}
                </div>
            ),
        },
    ];

    return (
        <Card bodyStyle={{ padding: "0px" }}>
            {/* <ExpenseDetails userId={session?.user?.id} /> */}
            <div className="d-flex p-2 justify-content-between align-items-center" style={{ marginBottom: "16px" }}>
                {/* <h2 style={{ margin: 0 }}>Expense </h2> */}
                <div>
                    {/* <p>
                        {remainingExpenses?.expenses} Expenses Remaining
                    </p>
                    <p>
                        {remainingExpenses?.sickExpenses} Sick Expenses Remaining
                    </p> */}
                </div>
                <Button
                    type="primary"
                    // icon={<PlusOutlined />}
                    onClick={() => setIsDrawerOpen(true)}
                >
                    Add Expense
                </Button>
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
            <Drawer footer={null} width="100%" //size="large"
                title={editItem ? "Edit Expense" : "Add Expense"}
                open={isDrawerOpen} maskClosable={false}
                onClose={() => { setIsDrawerOpen(false); setEditItem(); form.resetFields(); }}
                onOk={() => form.submit()}
                okText="Save"
            >
                <Timesheet editItem={editItem} setEditItem={setEditItem} />
                {/* <EditExpense /> */}
                {/* <DynamicForm schemas={schema}
                    onFinish={handleAddOrEdit}
                    formData={editItem && editItem?.details} /> */}
            </Drawer>
        </Card>
    );
};

export default MyExpenses;
