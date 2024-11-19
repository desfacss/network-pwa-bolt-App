import { Button, Card, notification, Table, Drawer, Modal, Form } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { PlusOutlined, EditFilled, DeleteOutlined, UnorderedListOutlined, AppstoreOutlined } from "@ant-design/icons";
import { supabase } from "configs/SupabaseConfig";
import DynamicForm from "../DynamicForm";
import { useSelector } from "react-redux";
import './Services.css'; // Add a CSS file to style the cards grid

const Services = () => {
    const componentRef = useRef(null);
    const [services, setServices] = useState([]);
    const [editItem, setEditItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [schema, setSchema] = useState();
    const [viewMode, setViewMode] = useState('card'); // Toggle between 'card' and 'list' view

    const { session } = useSelector((state) => state.auth);

    const [form] = Form.useForm();

    const getForms = async () => {
        const { data, error } = await supabase.from('forms').select('*').eq('name', "service_add_edit_form").single()
        if (data) {
            setSchema(data)
        }
    }

    useEffect(() => {
        getForms();
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
        if (editItem) {
            const { data, error } = await supabase
                .from('services')
                .update({
                    details: values,
                    service_name: values?.service_name,
                    organization_id: session?.user?.organization_id,
                    organization_name: session?.user?.details?.orgName
                })
                .eq('id', editItem.id);

            if (data) {
                notification.success({ message: "Service updated successfully" });
                setEditItem(null);
            } else if (error) {
                notification.error({ message: "Failed to update service" });
            }
        } else {
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
        setEditItem();
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
        {
            title: 'Description',
            dataIndex: ['details', 'description'],
            key: 'description',
        },
        {
            title: 'Availability',
            dataIndex: ['details', 'availability'],
            key: 'availability',
            render: (availability) => availability?.join(', '),
        },
        {
            title: 'Special Offers',
            dataIndex: ['details', 'special_offers'],
            key: 'special_offers',
            render: (specialOffers) => specialOffers?.discount,
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
                <h2 style={{ margin: 0 }}>Services</h2>
                <div>
                    <Button
                        icon={viewMode === 'card' ? <UnorderedListOutlined /> : <AppstoreOutlined />}
                        style={{ marginRight: "10px" }}
                        onClick={() => setViewMode(viewMode === 'card' ? 'list' : 'card')}
                    />
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsModalOpen(true)}
                    >
                        Add Service
                    </Button>
                </div>
            </div>
            <div ref={componentRef}>
                {viewMode === 'card' ? (
                    <div className="services-card-grid">
                        {services?.map((service) => (
                            <Card
                                key={service?.id}
                                title={service?.details?.service_name}
                                className="service-card"
                                extra={
                                    <div className="card-actions">
                                        <Button
                                            type="primary"
                                            icon={<EditFilled />}
                                            size="small"
                                            className="mr-2"
                                            onClick={() => handleEdit(service)}
                                        />
                                        <Button
                                            type="primary" ghost
                                            icon={<DeleteOutlined />}
                                            size="small"
                                            onClick={() => handleDelete(service?.id)}
                                        />
                                    </div>
                                }
                            >
                                <p><b>Cost/Hr:</b> {service?.details?.cost}</p>
                                <p><b>Duration:</b> {service?.details?.duration}</p>
                                <p><b>Description:</b> {service?.details?.description}</p>
                                <p><b>Availability:</b> {service?.details?.availability?.join(', ')}</p>
                                <p><b>Special Offers:</b> {service?.details?.special_offers?.discount}</p>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Table size={'small'}
                        columns={columns}
                        dataSource={services}
                        rowKey={(record) => record.id}
                        loading={!services}
                        pagination={false}
                    />
                )}
            </div>
            <Drawer
                width={600}
                footer={null}
                title={editItem ? "Edit Service" : "Add Service"}
                open={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditItem() }}
                onOk={() => form.submit()}
                okText="Save"
            >
                <DynamicForm schemas={schema} onFinish={handleAddOrEdit} formData={editItem && editItem?.details} />
            </Drawer>
        </Card>
    );
};

export default Services;
