import { Button, Card, notification, Table, Drawer, Form, Input } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { PlusOutlined, EditFilled, DeleteFilled } from "@ant-design/icons";
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
        const { data, error } = await supabase.from('forms').select('*').eq('name', "add_edit_tasks_form").single()
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
            setTasks(data);
        }
        if (error) {
            notification.error({ message: "Failed to fetch tasks" });
        }
    };

    const handleAddOrEdit = async (values) => {
        // const { service_name, cost, duration, description } = values;
        if (editItem) {
            console.log("Pyload", values)
            // Update existing service
            const { data, error } = await supabase
                .from('tasks')
                .update({ details: values, organization_id: session?.user?.organization_id, organization_name: session?.user?.details?.orgName })
                .eq('id', editItem.id);

            if (data) {
                notification.success({ message: "Task updated successfully" });
                setEditItem(null);
            } else if (error) {
                notification.error({ message: "Failed to update task" });
            }
        } else {
            // Add new task
            const { data, error } = await supabase
                .from('tasks')
                .insert([{ details: values, organization_id: session?.user?.organization_id, organization_name: session?.user?.details?.orgName }]);

            if (data) {
                notification.success({ message: "Task added successfully" });
            } else if (error) {
                notification.error({ message: "Failed to add task" });
            }
        }
        fetchTasks();
        setIsDrawerOpen(false);
        form.resetFields();
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
        const { error } = await supabase.from('tasks').delete().eq('id', id);
        if (!error) {
            notification.success({ message: "Task deleted successfully" });
            fetchTasks();
        } else {
            notification.error({ message: "Failed to delete Task" });
        }
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: ['details', 'task_name'],
            key: 'task_name',
        },
        {
            title: 'Client Name',
            dataIndex: ['details', 'client_name'],
            key: 'client_name',
        },
        {
            title: 'Cost',
            dataIndex: ['details', 'task_cost'],
            key: 'task_cost',
        },
        {
            title: 'Manager',
            dataIndex: ['details', 'task_head'],
            key: 'task_head',
        },
        {
            title: 'Users',
            dataIndex: ['details', 'task_users'],
            key: 'task_users',
        },
        {
            title: 'Description',
            dataIndex: ['details', 'description'],
            key: 'description',
        },
        {
            title: 'Service',
            dataIndex: ['details', 'service_id'],
            key: 'service_id',
        },
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
                        type="danger"
                        icon={<DeleteFilled />}
                        size="small"
                        onClick={() => handleDelete(record.id)}
                    />
                </div>
            ),
        },
    ];

    return (
        <Card bodyStyle={{ padding: "0px" }}>
            <div className="table-responsive" ref={componentRef}>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsDrawerOpen(true)}
                    style={{ marginBottom: "16px" }}
                >
                    Add Task
                </Button>
                <Table
                    columns={columns}
                    dataSource={tasks}
                    rowKey={(record) => record.id}
                    loading={!tasks}
                    pagination={false}
                />
            </div>
            <Drawer footer={null} width={500} //size="large"
                title={editItem ? "Edit Task" : "Add Task"}
                open={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
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
