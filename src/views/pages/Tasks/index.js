import { Button, Card, notification, Table, Drawer, Form, Input } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { PlusOutlined, EditFilled, DeleteOutlined } from "@ant-design/icons";
import { supabase } from "configs/SupabaseConfig";
import DynamicForm from "../DynamicForm";
import { useSelector } from "react-redux";

const Tasks = () => {
    const componentRef = useRef(null);
    const [tasks, setTasks] = useState([]);
    const [editItem, setEditItem] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [schema, setSchema] = useState();

    const { session } = useSelector((state) => state.auth);

    const [form] = Form.useForm();

    const getForms = async () => {
        const { data, error } = await supabase.from('forms').select('*').eq('name', "task_add_edit_form").single()
        console.log("A", data)
        if (data) {
            console.log(data)
            setSchema(data)
        }
    }

    useEffect(() => {
        getForms()
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        let { data, error } = await supabase.from('tasks').select('*');
        if (data) {
            console.log("Tasks", tasks)
            setTasks(data);
        }
        if (error) {
            notification.error({ message: error?.message || "Failed to fetch tasks" });
        }
    };

    const handleAddOrEdit = async (values) => {
        // const { service_name, cost, duration, description } = values;
        console.log("Pyload", values)
        if (editItem) {
            // Update existing service
            const { data, error } = await supabase
                .from('tasks')
                .update({ details: { ...values, user_id: editItem?.details.user_id, user_name: editItem?.details?.user_name }, organization_id: session?.user?.organization_id, organization_name: session?.user?.details?.orgName })
                .eq('id', editItem.id);

            if (data) {
                notification.success({ message: "Task updated successfully" });
                setEditItem(null);
            } else if (error) {
                notification.error({ message: error?.message || "Failed to update task" });
            }
        } else {
            // Add new task
            const { data, error } = await supabase
                .from('tasks')
                .insert([{ details: { ...values, user_id: session?.user?.id, user_name: session?.user?.details?.firstName + " " + session?.user?.details?.lastName }, organization_id: session?.user?.organization_id, organization_name: session?.user?.details?.orgName }]);

            if (data) {
                notification.success({ message: "Task added successfully" });
            } else if (error) {
                notification.error({ message: error?.message || "Failed to add task" });
            }
        }
        fetchTasks();
        setIsDrawerOpen(false);
        form.resetFields();
        setEditItem()
    };

    const handleEdit = (record) => {
        // console.log("Edit item", record)
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
        const { error } = await supabase.from('tasks').delete().eq('id', id);
        if (!error) {
            notification.success({ message: "Task deleted successfully" });
            fetchTasks();
        } else {
            notification.error({ message: error?.message || "Failed to delete Task" });
        }
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: ['details', 'task_name'],
            key: 'task_name',
        },
        {
            title: 'Date',
            dataIndex: ['details', 'date'],
            key: 'date',
        },
        {
            title: 'From Time',
            dataIndex: ['details', 'from_time'],
            key: 'from_time',
        },
        {
            title: 'To Time',
            dataIndex: ['details', 'to_time'],
            key: 'to_time',
        },
        {
            title: 'project',
            dataIndex: ['details', 'project_id'],
            key: 'project_id',
        },
        {
            title: 'Job',
            dataIndex: ['details', 'job_id'],
            key: 'job_id',
        },
        {
            title: 'Billable',
            dataIndex: ['details', 'billable'],
            key: 'billable',
            render: (billable) => (billable ? 'Yes' : 'No'),
        },
        {
            title: 'User',
            dataIndex: ['details', 'user_name'],
            key: 'user_name',
        },
        // {
        //     title: 'Description',
        //     dataIndex: ['details', 'description'],
        //     key: 'description',
        // },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <div className="d-flex">
                    <Button
                        type="primary"
                        icon={<EditFilled />}
                        size="small"
                        className="mr-2"
                        onClick={() => handleEdit(record)}
                    />
                    <Button
                        type="primary" ghost
                        icon={<DeleteOutlined />}
                        size="small"
                        onClick={() => handleDelete(record.id)}
                    />
                </div>
            ),
        },
    ];

    return (
        <Card bodyStyle={{ padding: "0px" }}>
            <div className="d-flex p-2 justify-content-between align-items-center" style={{ marginBottom: "16px" }}>
                <h2 style={{ margin: 0 }}>Tasks</h2>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsDrawerOpen(true)}
                >
                    Add Task
                </Button>
            </div>
            <div className="table-responsive" ref={componentRef}>
                <Table size={'small'}
                    columns={columns}
                    dataSource={tasks}
                    rowKey={(record) => record.id}
                    loading={!tasks}
                    pagination={false}
                />
            </div>
            <Drawer footer={null} width={500} //size="large"
                title={editItem ? "Edit Task" : "Add Task"}
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

export default Tasks;
