import { Button, Card, notification, Table, Drawer, Form, Input } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { PlusOutlined, EditFilled, DeleteFilled } from "@ant-design/icons";
import { supabase } from "configs/SupabaseConfig";
import DynamicForm from "../DynamicForm";
import { useSelector } from "react-redux";

const Jobs = () => {
    const componentRef = useRef(null);
    const [jobs, setJobs] = useState([]);
    const [editItem, setEditItem] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [schema, setSchema] = useState();

    const { session } = useSelector((state) => state.auth);

    const [form] = Form.useForm();

    const getForms = async () => {
        const { data, error } = await supabase.from('forms').select('*').eq('name', "add_edit_jobs_form").single()
        console.log("A", data)
        if (data) {
            console.log(data)
            setSchema(data)
        }
    }

    useEffect(() => {
        getForms()
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        let { data, error } = await supabase.from('jobs').select('*');
        if (data) {
            setJobs(data);
        }
        if (error) {
            notification.error({ message: "Failed to fetch jobs" });
        }
    };

    const handleAddOrEdit = async (values) => {
        // const { service_name, cost, duration, description } = values;
        console.log("Pyload", values)
        if (editItem) {
            // Update existing service
            const { data, error } = await supabase
                .from('jobs')
                .update({ details: values, job_name: values?.job_name, organization_id: session?.user?.organization_id, organization_name: session?.user?.details?.orgName })
                .eq('id', editItem.id);

            if (data) {
                notification.success({ message: "Job updated successfully" });
                setEditItem(null);
            } else if (error) {
                notification.error({ message: "Failed to update job" });
            }
        } else {
            // Add new job
            const { data, error } = await supabase
                .from('jobs')
                .insert([{ details: values, job_name: values?.job_name, organization_id: session?.user?.organization_id, organization_name: session?.user?.details?.orgName }]);

            if (data) {
                notification.success({ message: "Job added successfully" });
            } else if (error) {
                notification.error({ message: "Failed to add job" });
            }
        }
        fetchJobs();
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
        const { error } = await supabase.from('jobs').delete().eq('id', id);
        if (!error) {
            notification.success({ message: "Job deleted successfully" });
            fetchJobs();
        } else {
            notification.error({ message: "Failed to delete Job" });
        }
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: ['details', 'job_name'],
            key: 'job_name',
        },
        {
            title: 'Client Name',
            dataIndex: ['details', 'project'],
            key: 'project',
        },
        {
            title: 'Start Date',
            dataIndex: ['details', 'start_date'],
            key: 'start_date',
        },
        {
            title: 'End Date',
            dataIndex: ['details', 'end_date'],
            key: 'end_date',
        },
        {
            title: 'Hours',
            dataIndex: ['details', 'hours'],
            key: 'hours',
        },
        {
            title: 'Billable',
            dataIndex: ['details', 'billable'],
            key: 'billable',
            render: (billable) => (billable ? 'Yes' : 'No'),
        },
        {
            title: 'Status',
            dataIndex: ['details', 'status'],
            key: 'status',
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
                    Add Job
                </Button>
                <Table
                    columns={columns}
                    dataSource={jobs}
                    rowKey={(record) => record.id}
                    loading={!jobs}
                    pagination={false}
                />
            </div>
            <Drawer footer={null} width={500} //size="large"
                title={editItem ? "Edit Job" : "Add Job"}
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

export default Jobs;
