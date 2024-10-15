import { Button, Card, notification, Table, Modal, Form, Input, Drawer } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { PlusOutlined, EditFilled, DeleteFilled } from "@ant-design/icons";
import { supabase } from "configs/SupabaseConfig";
import DynamicForm from "../DynamicForm";
import { useSelector } from "react-redux";

const Services = () => {
    const componentRef = useRef(null);
    const [services, setServices] = useState([]);
    const [editItem, setEditItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [schema, setSchema] = useState();

    const { session } = useSelector((state) => state.auth);

    const [form] = Form.useForm();

    const getForms = async () => {
        const { data, error } = await supabase.from('forms').select('*').eq('name', "add_edit_services_form").single()
        console.log("A", data)
        if (data) {
            console.log(data)
            setSchema(data)
        }
    }

    useEffect(() => {
        getForms()
        fetchServices();
    }, []);

    const fetchServices = async () => {
        let { data, error } = await supabase.from('services').select('*');
        if (data) {
            setServices(data);
        }
        if (error) {
            notification.error({ message: "Failed to fetch services" });
        }
    };

    const handleAddOrEdit = async (values) => {
        console.log("Pyload", values)
        // const { service_name, cost, duration, description } = values;
        if (editItem) {
            // Update existing service
            const { data, error } = await supabase
                .from('services')
                .update({ details: values, service_name: values?.service_name, organization_id: session?.user?.organization_id, organization_name: session?.user?.details?.orgName })
                .eq('id', editItem.id);

            if (data) {
                notification.success({ message: "Service updated successfully" });
                setEditItem(null);
            } else if (error) {
                notification.error({ message: "Failed to update service" });
            }
        } else {
            // Add new service
            const { data, error } = await supabase
                .from('services')
                .insert([{ details: values, service_name: values?.service_name, organization_id: session?.user?.organization_id, organization_name: session?.user?.details?.orgName }]);

            if (data) {
                notification.success({ message: "Service added successfully" });
            } else if (error) {
                notification.error({ message: "Failed to add service" });
            }
        }
        fetchServices();
        setIsModalOpen(false);
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
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        const { error } = await supabase.from('services').delete().eq('id', id);
        if (!error) {
            notification.success({ message: "Service deleted successfully" });
            fetchServices();
        } else {
            notification.error({ message: "Failed to delete service" });
        }
    };

    const columns = [
        {
            title: 'Service Name',
            dataIndex: ['details', 'service_name'],
            key: 'service_name',
        },
        {
            title: <>Cost/Hr{'\u00A0'}(INR)</>,
            dataIndex: ['details', 'cost'],
            key: 'cost',
        },
        {
            title: 'Duration',
            dataIndex: ['details', 'duration'],
            key: 'duration',
        },
        // {
        //     title: 'Equipment',
        //     dataIndex: ['details', 'equipment'],
        //     key: 'equipment',
        //     render: (equipment) => equipment?.join(', '), // Display as a comma-separated list
        // },
        // {
        //     title: 'Materials',
        //     dataIndex: ['details', 'materials'],
        //     key: 'materials',
        //     render: (materials) => materials?.join(', '), // Display as a comma-separated list
        // },
        {
            title: 'Description',
            dataIndex: ['details', 'description'],
            key: 'description',
        },
        {
            title: 'Availability',
            dataIndex: ['details', 'availability'],
            key: 'availability',
            render: (availability) => availability?.join(', '), // Display as a comma-separated list
        },
        // {
        //     title: 'Target Areas',
        //     dataIndex: ['details', 'target_areas'],
        //     key: 'target_areas',
        //     render: (targetAreas) => targetAreas?.join(', '), // Display as a comma-separated list
        // },
        {
            title: 'Special Offers',
            dataIndex: ['details', 'special_offers'],
            key: 'special_offers',
            render: (specialOffers) => specialOffers?.discount, // Display the discount detail
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

    const onFinish = () => {

    }

    return (
        <Card bodyStyle={{ padding: "0px" }}>
            <div className="d-flex p-2 justify-content-between align-items-center" style={{ marginBottom: "16px" }}>
                <h2 style={{ margin: 0 }}>Services</h2>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsModalOpen(true)}
                >
                    Add Service
                </Button>
            </div>
            <div className="table-responsive" ref={componentRef}>
                <Table
                    columns={columns}
                    dataSource={services}
                    rowKey={(record) => record.id}
                    loading={!services}
                    pagination={false}
                />
            </div>
            <Drawer width={600} footer={null}
                title={editItem ? "Edit Service" : "Add Service"}
                open={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditItem() }}
                onOk={() => form.submit()}
                okText="Save"
            >
                {/* <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleAddOrEdit}
                > */}
                <DynamicForm schemas={schema}
                    onFinish={handleAddOrEdit}
                    formData={editItem && editItem?.details} />
                {/* <Form.Item
                        name="service_name"
                        label="Service Name"
                        rules={[{ required: true, message: "Please enter service name" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="cost"
                        label="Cost"
                        rules={[{ required: true, message: "Please enter cost" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="duration"
                        label="Duration"
                        rules={[{ required: true, message: "Please enter duration" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[{ required: true, message: "Please enter description" }]}
                    >
                        <Input.TextArea />
                    </Form.Item> */}
                {/* </Form> */}
            </Drawer>
        </Card>
    );
};

export default Services;
