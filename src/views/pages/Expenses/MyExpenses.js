import { Button, Card, notification, Table, Drawer, Modal } from "antd";
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { EditFilled, ExclamationCircleFilled, DeleteOutlined } from "@ant-design/icons";
import { supabase } from "configs/SupabaseConfig";
import { useSelector } from "react-redux";
import Expensesheet from "./Expensesheet";
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
        let { data, error } = await supabase.from('expensesheet').select('*,project:project_id(*)').eq('user_id', session?.user?.id).eq('organization_id', session?.user?.organization_id)
            .gte('submitted_time', startDate).lte('submitted_time', endDate).order('created_at', { ascending: false });
        if (data) {
            // console.log("expenses", data);
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
            title: `Confirm deletion of Expenses Claim - ${(record?.submitted_time || record?.created_at)?.replace("T", " ")?.replace(/\.\d+\+\d+:\d+$/, "")?.slice(0, 10)} for ${record?.project?.project_name} ?`,
            icon: <ExclamationCircleFilled />,
            //   content: 'Some descriptions',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                const { error } = await supabase.from('expensesheet').delete().eq('id', record?.id);
                if (!error) {
                    notification.success({ message: "Expenses Claim deleted successfully" });
                    fetchExpenses();
                } else {
                    notification.error({ message: error?.message || "Failed to delete Expenses Claim" });
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
            sorter: (a, b) => a?.submitted_time?.localeCompare(b?.submitted_time),
            render: (record) => (
                <div>
                    {(record?.submitted_time || record?.created_at)?.replace("T", " ")?.replace(/\.\d+\+\d+:\d+$/, "")?.slice(0, 10)}
                </div>
            )
        },
        {
            title: 'Project',
            dataIndex: ['project', 'project_name'],
            key: 'project_name',
            sorter: (a, b) => a?.project?.project_name?.localeCompare(b?.project?.project_name),
        },
        {
            title: 'Amount (GBP)',
            dataIndex: ['grand_total'],
            key: 'grand_total',
            sorter: (a, b) => (a?.grand_total || 0) - (b?.grand_total || 0),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            sorter: (a, b) => a?.status?.localeCompare(b?.status),
        },
        {
            title: 'Review Date',
            key: 'approved_time',
            sorter: (a, b) => a?.approver_details?.approved_time?.localeCompare(b?.approver_details?.approved_time),
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
        <Card styles={{ body: { padding: "0px" } }}>
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
