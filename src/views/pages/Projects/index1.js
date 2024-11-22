import { Button, Card, notification, Table, Drawer, Form, Input, Select } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { PlusOutlined, EditFilled, DeleteOutlined } from "@ant-design/icons";
import { supabase } from "configs/SupabaseConfig";
import { useSelector } from "react-redux";

const { Option } = Select;

const Projects = () => {
    const componentRef = useRef(null);
    const [projects, setProjects] = useState([]);
    const [editItem, setEditItem] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [projectUsers, setProjectUsers] = useState([]);
    const { session } = useSelector((state) => state.auth);
    const [form] = Form.useForm();
    const [userForm] = Form.useForm();

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        let { data, error } = await supabase.from('projects').select('*');
        if (data) {
            setProjects(data);
        }
        if (error) {
            notification.error({ message: "Failed to fetch projects" });
        }
    };

    const handleAddOrEdit = async (values) => {
        const projectDetails = { ...values, project_users: projectUsers };
        if (editItem) {
            // Update existing project
            const { data, error } = await supabase
                .from('projects')
                .update({ details: projectDetails, project_name: values.project_name })
                .eq('id', editItem.id);

            if (data) {
                notification.success({ message: "Project updated successfully" });
                setEditItem(null);
            } else if (error) {
                notification.error({ message: "Failed to update project" });
            }
        } else {
            // Add new project
            const { data, error } = await supabase
                .from('projects')
                .insert([{ details: projectDetails, project_name: values.project_name }]);

            if (data) {
                notification.success({ message: "Project added successfully" });
            } else if (error) {
                notification.error({ message: "Failed to add project" });
            }
        }
        fetchProjects();
        setIsDrawerOpen(false);
        form.resetFields();
        setEditItem(null);
        setProjectUsers([]);
    };

    const handleEdit = (record) => {
        setEditItem(record);
        form.setFieldsValue(record.details);
        setProjectUsers(record.details.project_users || []);
        setIsDrawerOpen(true);
    };

    const handleDelete = async (id) => {
        const { error } = await supabase.from('projects').delete().eq('id', id);
        if (!error) {
            notification.success({ message: "Project deleted successfully" });
            fetchProjects();
        } else {
            notification.error({ message: "Failed to delete Project" });
        }
    };

    const addUserToProject = () => {
        userForm.validateFields().then((values) => {
            setProjectUsers([...projectUsers, values]);
            userForm.resetFields();
        });
    };

    const deleteUserFromProject = (index) => {
        const updatedUsers = [...projectUsers];
        updatedUsers.splice(index, 1);
        setProjectUsers(updatedUsers);
    };

    const columns = [
        { title: 'Name', dataIndex: ['details', 'project_name'], key: 'project_name' },
        { title: 'Client Name', dataIndex: ['details', 'client_id'], key: 'client_id' },
        { title: 'Cost', dataIndex: ['details', 'project_cost'], key: 'project_cost' },
        { title: 'Description', dataIndex: ['details', 'description'], key: 'description' },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <div className="d-flex">
                    <Button type="primary" icon={<EditFilled />} size="small" onClick={() => handleEdit(record)} />
                    <Button type="primary" danger icon={<DeleteOutlined />} size="small" onClick={() => handleDelete(record.id)} />
                </div>
            ),
        },
    ];

    const userColumns = [
        { title: 'User ID', dataIndex: 'user_id', key: 'user_id' },
        { title: 'Allocated Hours', dataIndex: 'allocated_hours', key: 'allocated_hours' },
        { title: 'Expensed Hours', dataIndex: 'expensed_hours', key: 'expensed_hours' },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, __, index) => (
                <Button type="primary" danger icon={<DeleteOutlined />} size="small" onClick={() => deleteUserFromProject(index)} />
            ),
        },
    ];

    return (
        <Card bodyStyle={{ padding: "0px" }}>
            <div className="d-flex p-2 justify-content-between align-items-center" style={{ marginBottom: "16px" }}>
                <h2 style={{ margin: 0 }}>Projects2</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsDrawerOpen(true)}>Add Project</Button>
            </div>
            <div className="table-responsive" ref={componentRef}>
                <Table columns={columns} dataSource={projects} rowKey={(record) => record.id} loading={!projects} pagination={false} />
            </div>
            <Drawer
                width={500}
                title={editItem ? "Edit Project" : "Add Project"}
                open={isDrawerOpen}
                onClose={() => { setIsDrawerOpen(false); setEditItem(null); }}
            >
                <Form form={form} layout="vertical" onFinish={handleAddOrEdit}>
                    <Form.Item name="project_name" label="Project Name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="client_id" label="Client ID" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="project_cost" label="Project Cost" rules={[{ required: true }]}>
                        <Input type="number" />
                    </Form.Item>
                    <Form.Item name="description" label="Description" rules={[{ required: true }]}>
                        <Input.TextArea />
                    </Form.Item>
                    <div className="project-users">
                        <h4>Project Users</h4>
                        <Table columns={userColumns} dataSource={projectUsers} rowKey="user_id" pagination={false} />
                        <Form form={userForm} layout="inline" onFinish={addUserToProject}>
                            <Form.Item name="user_id" label="User ID" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item name="allocated_hours" label="Allocated Hours" rules={[{ required: true }]}>
                                <Input type="number" />
                            </Form.Item>
                            <Form.Item name="expensed_hours" label="Expensed Hours" rules={[{ required: true }]}>
                                <Input type="number" />
                            </Form.Item>
                            <Button type="primary" onClick={addUserToProject}>Add User</Button>
                        </Form>
                    </div>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={{ marginTop: "16px" }}>
                            {editItem ? "Update Project" : "Add Project"}
                        </Button>
                    </Form.Item>
                </Form>
            </Drawer>
        </Card>
    );
};

export default Projects;
