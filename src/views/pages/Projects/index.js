import { Button, Card, notification, Table, Drawer, Form, Input } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { PlusOutlined, EditFilled, DeleteOutlined } from "@ant-design/icons";
import { supabase } from "configs/SupabaseConfig";
import DynamicForm from "../DynamicForm";
import { useSelector } from "react-redux";

const Projects = () => {
    const componentRef = useRef(null);
    const [projects, setProjects] = useState([]);
    const [editItem, setEditItem] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [schema, setSchema] = useState();

    const { session } = useSelector((state) => state.auth);

    const [form] = Form.useForm();

    const getForms = async () => {
        const { data, error } = await supabase.from('forms').select('*').eq('name', "add_edit_projects_form_trial").single()
        console.log("A", data)
        if (data) {
            console.log(data)
            setSchema(data)
        }
    }

    useEffect(() => {
        getForms()
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
        // const { service_name, cost, duration, description } = values;
        console.log("Pyload", values)
        if (editItem) {
            // Update existing service
            const { data, error } = await supabase
                .from('projects')
                .update({ details: values, project_name: values?.project_name, organization_id: session?.user?.organization_id, organization_name: session?.user?.details?.orgName })
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
                .insert([{ details: values, project_name: values?.project_name, organization_id: session?.user?.organization_id, organization_name: session?.user?.details?.orgName }]);

            if (data) {
                notification.success({ message: "Project added successfully" });
            } else if (error) {
                notification.error({ message: "Failed to add project" });
            }
        }
        fetchProjects();
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

    const handleDelete = async (id) => {
        const { error } = await supabase.from('projects').delete().eq('id', id);
        if (!error) {
            notification.success({ message: "Project deleted successfully" });
            fetchProjects();
        } else {
            notification.error({ message: "Failed to delete Project" });
        }
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: ['details', 'project_name'],
            key: 'project_name',
        },
        {
            title: 'Client Name',
            dataIndex: ['details', 'client_name'],
            key: 'client_name',
        },
        {
            title: 'Cost',
            dataIndex: ['details', 'project_cost'],
            key: 'project_cost',
        },
        {
            title: 'Manager',
            dataIndex: ['details', 'project_head'],
            key: 'project_head',
        },
        {
            title: 'Users',
            dataIndex: ['details', 'project_users'],
            key: 'project_users',
            render: (project_users) => project_users?.join(', '),
        },
        {
            title: 'Description',
            dataIndex: ['details', 'description'],
            key: 'description',
        },
        // {
        //     title: 'Service',
        //     dataIndex: ['details', 'service_name'],
        //     key: 'service_name',
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
                <h2 style={{ margin: 0 }}>Projects</h2>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsDrawerOpen(true)}
                >
                    Add Project
                </Button>
            </div>
            <div className="table-responsive" ref={componentRef}>
                <Table
                    columns={columns}
                    dataSource={projects}
                    rowKey={(record) => record.id}
                    loading={!projects}
                    pagination={false}
                />
            </div>
            <Drawer footer={null} width={500} //size="large"
                title={editItem ? "Edit Project" : "Add Project"}
                open={isDrawerOpen}
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

export default Projects;
