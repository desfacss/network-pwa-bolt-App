import { Button, Card, notification, Table, Drawer, Form, Input, Modal } from "antd";
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { EditFilled, ExclamationCircleFilled, DeleteOutlined } from "@ant-design/icons";
import { supabase } from "configs/SupabaseConfig";
import { useSelector } from "react-redux";
import Expensesheet from "./Expensesheet";
// import ExpenseDetails from "./ExpenseDetails";
const { confirm } = Modal;

const MyExpenses = forwardRef(({ startDate, endDate }, ref) => {
    const componentRef = useRef(null);
    const [expenses, setExpenses] = useState([]);
    const [editItem, setEditItem] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const { session } = useSelector((state) => state.auth);

    useImperativeHandle(ref, () => ({
        showDrawer,
    }));

    const showDrawer = () => {
        setIsDrawerOpen(true)
    }

    useEffect(() => {
        if (startDate && endDate) {
            fetchExpenses();
        }
    }, [startDate, endDate])

    const fetchExpenses = async () => {
        let { data, error } = await supabase.from('expensesheet').select('*,project:project_id(*)').eq('user_id', session?.user?.id)
            .gte('submitted_time', startDate).lte('submitted_time', endDate).order('created_at', { ascending: false });
        if (data) {
            console.log("expenses", data);
            setExpenses(data);
        }
        if (error) {
            notification.error({ message: error?.message || "Failed to fetch expense s" });
        }
    };

    const handleEdit = (record) => {
        setEditItem(record);
        setIsDrawerOpen(true);
    };

    const onAdd = () => {
        setEditItem()
        setIsDrawerOpen()
        fetchExpenses();
    }

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
            key: 'submitted_time',
            render: (record) => (
                <div>
                    {record?.submitted_time?.replace("T", " ")?.replace(/\.\d+\+\d+:\d+$/, "")}
                </div>
            )
        },
        {
            title: 'Project',
            dataIndex: ['project', 'project_name'],
            key: 'project_name',
        },
        {
            title: 'Amount (GBP)',
            dataIndex: ['grand_total'],
            key: 'grand_total',
        },
        {
            title: 'status',
            dataIndex: 'status',
            key: 'status',
        },
        {
            title: 'Review Date',
            key: 'approved_time',
            render: (record) => (
                <div>
                    {record?.approver_details?.approved_time?.replace("T", " ").replace(/\.\d+Z$/, "")}
                </div>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <div className="d-flex">
                    {record?.status !== 'Approved' && <Button type="primary" icon={<EditFilled />}
                        size="small" className="mr-2" onClick={() => handleEdit(record)} />}
                    {record?.status !== 'Approved' && <Button type="primary" ghost icon={<DeleteOutlined />}
                        size="small" onClick={() => showDeleteConfirm(record)} />}
                </div>
            ),
        },
    ];

    return (
        <Card bodyStyle={{ padding: "0px" }}>
            {/* <div className="d-flex p-2 justify-content-between align-items-center" style={{ marginBottom: "16px" }}>
                <Button type="primary" onClick={() => setIsDrawerOpen(true)} >
                    Add Expense
                </Button>
            </div> */}
            <div className="table-responsive" ref={componentRef}>
                <Table size={'small'} columns={columns} dataSource={expenses}
                    rowKey={(record) => record.id} loading={!expenses} pagination={false} />
            </div>
            <Drawer footer={null} width="100%" //size="large"
                title={editItem ? "Edit Expense" : "Add Expense"} open={isDrawerOpen} maskClosable={false}
                onClose={() => { setIsDrawerOpen(false); setEditItem(); }}
                onOk={() => { }} okText="Save" >
                <Expensesheet editItem={editItem} onAdd={onAdd} />
            </Drawer>
        </Card>
    );
});

export default MyExpenses;
