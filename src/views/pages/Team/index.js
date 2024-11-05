import { Button, Card, notification, Table, Drawer, Modal, Form, Avatar, message } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { PlusOutlined, EditFilled, DeleteOutlined, UnorderedListOutlined, AppstoreOutlined } from "@ant-design/icons";
import { supabase } from "configs/SupabaseConfig";
import DynamicForm from "../DynamicForm";
import { useSelector } from "react-redux";
import './Services.css'; // Add a CSS file to style the cards grid
import axios from "axios";

const Users = () => {
    const componentRef = useRef(null);
    const [users, setUsers] = useState([]);
    const [editItem, setEditItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [schema, setSchema] = useState();
    const [viewMode, setViewMode] = useState('card'); // Toggle between 'card' and 'list' view

    const { session } = useSelector((state) => state.auth);

    const [form] = Form.useForm();

    const getForms = async () => {
        const { data, error } = await supabase.from('forms').select('*').eq('name', "users_invite_form").single()
        if (data) {
            setSchema(data)
        }
    }

    useEffect(() => {
        getForms();
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        let { data, error } = await supabase.from('users').select('*');
        if (data) {
            setUsers(data);
        }
        if (error) {
            notification.error({ message: "Failed to fetch users" });
        }
    };

    const handleAddOrEdit = async (values) => {
        const {
            email,
            mobile,
            firstName,
            lastName,
            role_type, manager, hr_contact
        } = values;

        const userName = `${firstName} ${lastName}`;

        try {
            // Step 1: Check if the user already exists
            const { data: existingUser, error: checkError } = await supabase
                .from('users')
                .select('id')
                .eq('details->>email', email)
            // .single();

            if (checkError && checkError.code !== 'PGRST116') {
                // If the error is not related to "No rows found" (PGRST116), throw the error
                throw checkError;
            }

            if (existingUser?.length > 0) {
                // User already exists
                message.warning('User with this email already exists.');
                // setLoading(false);
                return;
            }

            // Step 2: Send user invite link
            const { data, error: inviteError } = await axios.post(
                'https://azzqopnihybgniqzrszl.functions.supabase.co/invite_users',
                { email },
                { headers: { 'Content-Type': 'application/json' } }
            );

            if (inviteError) {
                throw inviteError;
            }

            // Step 3: Insert new row in the users table
            const payload = {
                organization_id: session?.user?.organization_id,
                role_type,
                details: {
                    role_type,
                    email,
                    mobile,
                    orgName: session?.user?.details?.orgName,
                    lastName,
                    userName,
                    firstName,
                },
                id: data?.id,
                user_name: userName,
                is_manager: role_type === 'manager',
                is_active: true,
                manager_id: manager,
                hr_id: hr_contact,
                password_confirmed: false,
            };
            console.log("Payload", payload);
            const { error: insertError } = await supabase.from('users').insert([payload]);

            if (insertError) {
                throw insertError;
            }

            message.success('User invited and added successfully!');
        } catch (error) {
            message.error(error.message || 'An error occurred.');
        } finally {
            // setLoading(false);
        }



        // if (editItem) {
        //     const { data, error } = await supabase
        //         .from('users')
        //         .update({
        //             details: values,
        //             user_name: values?.user_name,
        //             organization_id: session?.user?.organization_id,
        //             organization_name: session?.user?.details?.orgName
        //         })
        //         .eq('id', editItem.id);

        //     if (data) {
        //         notification.success({ message: "User updated successfully" });
        //         setEditItem(null);
        //     } else if (error) {
        //         notification.error({ message: "Failed to update user" });
        //     }
        // } else {
        //     const { data, error } = await supabase
        //         .from('users')
        //         .insert([{ details: values, user_name: values?.user_name, organization_id: session?.user?.organization_id, organization_name: session?.user?.details?.orgName }]);

        //     if (data) {
        //         notification.success({ message: "User added successfully" });
        //     } else if (error) {
        //         notification.error({ message: "Failed to add user" });
        //     }
        // }



        fetchUsers();
        setIsModalOpen(false);
        form.resetFields();
        setEditItem();
    };

    const handleEdit = (record) => {
        setEditItem(record);
        form.setFieldsValue({
            user_name: record.details.user_name,
            cost: record.details.cost,
            duration: record.details.duration,
            description: record.details.description,
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        const { error } = await supabase.from('users').delete().eq('id', id);
        if (!error) {
            notification.success({ message: "User deleted successfully" });
            fetchUsers();
        } else {
            notification.error({ message: "Failed to delete user" });
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
                        {users?.map((user) => (
                            <Card
                                key={user?.id}
                                extra={
                                    <div className="card-actions">
                                        <Button disabled={true}
                                            type="primary"
                                            icon={<EditFilled />}
                                            size="small"
                                            className="mr-2"
                                            onClick={() => handleEdit(user)}
                                        />
                                        <Button disabled={true}
                                            type="primary" ghost
                                            icon={<DeleteOutlined />}
                                            size="small"
                                        // onClick={() => handleDelete(user?.id)}
                                        />
                                    </div>
                                }

                                title={
                                    <div className="service-card-title">
                                        <Avatar size={80}
                                            src={user?.details?.profileImage}
                                            alt={user && user?.details?.firstName[0] || ""}
                                        >{user && user?.details?.firstName[0] || ""}</Avatar>
                                        {/* {user.details?.firstName} */}
                                    </div>
                                }
                                // title={user.details?.user_name}
                                className="service-card"
                            // extra={
                            //     <div className="card-actions">
                            //         <Button
                            //             type="primary"
                            //             icon={<EditFilled />}
                            //             size="small"
                            //             className="mr-2"
                            //             onClick={() => handleEdit(user)}
                            //         />
                            //         <Button
                            //             type="primary" ghost
                            // icon={<DeleteOutlined />}
                            // size="small"
                            //             onClick={() => handleDelete(user.id)}
                            //         />
                            //     </div>
                            // }
                            >
                                <p><b>First Name:</b> {user.details?.firstName}</p>
                                <p><b>Last Name:</b> {user.details?.lastName}</p>
                                <p><b>Email:</b> {user.details?.email}</p>
                                <p><b>Mobile:</b> {user.details?.mobile}</p>
                                <p><b>Role:</b> {user.details?.role}</p>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Table
                        columns={columns}
                        dataSource={users}
                        rowKey={(record) => record.id}
                        loading={!users}
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

export default Users;
