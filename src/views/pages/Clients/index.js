import { Button, Card, notification, Table, Drawer, Form, Input } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { PlusOutlined, EditFilled, DeleteFilled } from "@ant-design/icons";
import { supabase } from "configs/SupabaseConfig";
import DynamicForm from "../DynamicForm";
import { useSelector } from "react-redux";

const Clients = () => {
    const componentRef = useRef(null);
    const [clients, setClients] = useState([]);
    const [editItem, setEditItem] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [schema, setSchema] = useState();

    const { session } = useSelector((state) => state.auth);

    const [form] = Form.useForm();

    const getForms = async () => {
        const { data, error } = await supabase.from('forms').select('*').eq('name', "add_edit_clients_form").single()
        console.log("A", data)
        if (data) {
            console.log(data)
            setSchema(data)
        }
    }

    useEffect(() => {
        getForms()
        fetchClients();
    }, []);

    const fetchClients = async () => {
        let { data, error } = await supabase.from('clients').select('*').eq('is_static', false);
        if (data) {
            setClients(data);
        }
        if (error) {
            notification.error({ message: "Failed to fetch clients" });
        }
    };

    const handleAddOrEdit = async (values) => {
        // const { service_name, cost, duration, description } = values;
        console.log("Pyload", values)
        if (editItem) {
            // Update existing service
            const { data, error } = await supabase
                .from('clients')
                .update({ details: values, name: values?.name, organization_id: session?.user?.organization_id, organization_name: session?.user?.details?.orgName })
                .eq('id', editItem.id);

            if (data) {
                notification.success({ message: "Client updated successfully" });
                setEditItem(null);
            } else if (error) {
                notification.error({ message: "Failed to update client" });
            }
        } else {
            // Add new client
            const { data, error } = await supabase
                .from('clients')
                .insert([{ details: values, name: values?.name, organization_id: session?.user?.organization_id, organization_name: session?.user?.details?.orgName }]);

            if (data) {
                notification.success({ message: "Client added successfully" });
            } else if (error) {
                notification.error({ message: "Failed to add client" });
            }
        }
        fetchClients();
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
        const { error } = await supabase.from('clients').delete().eq('id', id);
        if (!error) {
            notification.success({ message: "Client deleted successfully" });
            fetchClients();
        } else {
            notification.error({ message: "Failed to delete Client" });
        }
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: ['details', 'name'],
            key: 'name',
        },
        {
            title: 'Contact Person',
            dataIndex: ['details', 'primary_contact_name'],
            key: 'primary_contact_name',
        },
        {
            title: 'Phone',
            dataIndex: ['details', 'phone'],
            key: 'phone',
        },
        {
            title: 'Email',
            dataIndex: ['details', 'email'],
            key: 'email',
        },
        {
            title: 'Zip',
            dataIndex: ['details', 'zip'],
            key: 'zip',
        },
        {
            title: 'State',
            dataIndex: ['details', 'state'],
            key: 'state',
        },
        {
            title: 'Address',
            dataIndex: ['details', 'address'],
            key: 'address',
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
            <div className="d-flex p-2 justify-content-between align-items-center" style={{ marginBottom: "16px" }}>
                <h2 style={{ margin: 0 }}>Clients</h2>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsDrawerOpen(true)}
                >
                    Add Client
                </Button>
            </div>
            <div className="table-responsive" ref={componentRef}>
                <Table
                    columns={columns}
                    dataSource={clients}
                    rowKey={(record) => record.id}
                    loading={!clients}
                    pagination={false}
                />
            </div>
            <Drawer footer={null} width={500} //size="large"
                title={editItem ? "Edit Client" : "Add Client"}
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

export default Clients;
