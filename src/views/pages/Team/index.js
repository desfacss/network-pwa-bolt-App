import { Button, Card, notification, Table, Drawer, Modal, Form, Avatar } from "antd";
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
        const { data, error } = await supabase.from('forms').select('*').eq('name', "add_edit_users_form").single()
        if (data) {
            setSchema(data)
        }
    }

    useEffect(() => {
        getForms();
        fetchServices();
    }, []);

    const fetchServices = async () => {
        let { data, error } = await supabase.from('users').select('*');
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
            title: 'First Name',
            dataIndex: ['details', 'firstName'],
            key: 'firstName',
        },
        {
            title: 'Last Name',
            dataIndex: ['details', 'lastName'],
            key: 'lastName',
        },
        {
            title: 'Email',
            dataIndex: ['details', 'email'],
            key: 'email',
        },
        {
            title: 'Mobile',
            dataIndex: ['details', 'mobile'],
            key: 'mobile',
        },
        {
            title: 'Role',
            dataIndex: ['details', 'role'],
            key: 'role',
        },
        // {
        //     title: <>Cost/Hr{'\u00A0'}(INR)</>,
        //     dataIndex: ['details', 'cost'],
        //     key: 'cost',
        // },
        // {
        //     title: 'Duration',
        //     dataIndex: ['details', 'duration'],
        //     key: 'duration',
        // },
        // {
        //     title: 'Description',
        //     dataIndex: ['details', 'description'],
        //     key: 'description',
        // },
        // {
        //     title: 'Availability',
        //     dataIndex: ['details', 'availability'],
        //     key: 'availability',
        //     render: (availability) => availability?.join(', '),
        // },
        // {
        //     title: 'Special Offers',
        //     dataIndex: ['details', 'special_offers'],
        //     key: 'special_offers',
        //     render: (specialOffers) => specialOffers?.discount,
        // },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <div className="d-flex">
                    <Button disabled={true}
                        type="primary"
                        icon={<EditFilled />}
                        size="small"
                        className="mr-2"
                    // onClick={() => handleEdit(record)}
                    />
                    <Button disabled={true}
                        type="primary" ghost
                        icon={<DeleteOutlined />}
                        size="small"
                    // onClick={() => handleDelete(record.id)}
                    />
                </div>
            ),
        },
    ];

    return (
        <Card bodyStyle={{ padding: "0px" }}>
            <div className="d-flex p-2 justify-content-between align-items-center" style={{ marginBottom: "16px" }}>
                <h2 style={{ margin: 0 }}>Manage Team</h2>
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
                        Invite User
                    </Button>
                </div>
            </div>
            <div ref={componentRef}>
                {viewMode === 'card' ? (
                    <div className="services-card-grid">
                        {services?.map((service) => (
                            <Card
                                key={service?.id}
                                title={
                                    <div className="service-card-title">
                                        <Avatar size={80}
                                            src={service?.details?.profileImage}
                                            alt={service && service?.details?.firstName[0] || ""}
                                        >{service && service?.details?.firstName[0] || ""}</Avatar>
                                        {/* {service.details?.firstName} */}
                                    </div>
                                }
                                // title={service.details?.service_name}
                                className="service-card"
                            // extra={
                            //     <div className="card-actions">
                            //         <Button
                            //             type="primary"
                            //             icon={<EditFilled />}
                            //             size="small"
                            //             className="mr-2"
                            //             onClick={() => handleEdit(service)}
                            //         />
                            //         <Button
                            //             type="primary" ghost
                            // icon={<DeleteOutlined />}
                            // size="small"
                            //             onClick={() => handleDelete(service.id)}
                            //         />
                            //     </div>
                            // }
                            >
                                <p><b>First Name:</b> {service.details?.firstName}</p>
                                <p><b>Last Name:</b> {service.details?.lastName}</p>
                                <p><b>Email:</b> {service.details?.email}</p>
                                <p><b>Mobile:</b> {service.details?.mobile}</p>
                                <p><b>Role:</b> {service.details?.role}</p>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Table
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
                title={editItem ? "Edit User Details" : "Invite User"}
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
