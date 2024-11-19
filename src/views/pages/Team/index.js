import { Button, Card, notification, Table, Drawer, Modal, Form, Avatar, message, Spin, Tooltip } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { PlusOutlined, EditFilled, DeleteOutlined, UnorderedListOutlined, AppstoreOutlined, CopyFilled, ExclamationCircleFilled } from "@ant-design/icons";
import { supabase } from "configs/SupabaseConfig";
import DynamicForm from "../DynamicForm";
import { useSelector } from "react-redux";
import './Services.css'; // Add a CSS file to style the cards grid
import axios from "axios";
const { confirm } = Modal;

const Users = () => {
    const componentRef = useRef(null);
    const [users, setUsers] = useState([]);
    const [editItem, setEditItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [schema, setSchema] = useState();
    const [clone, setClone] = useState();
    const [locations, setLocations] = useState();
    const [viewMode, setViewMode] = useState('card'); // Toggle between 'card' and 'list' view
    const [loading, setLoading] = useState(false);
    const [roles, setRoles] = useState([])

    const { session } = useSelector((state) => state.auth);

    const [form] = Form.useForm();

    const getForms = async () => {
        const { data, error } = await supabase.from('forms').select('*').eq('name', "user_add_edit_form").single()
        if (data) {
            setSchema(data)
        }
    }
    const getLocations = async () => {
        const { data, error } = await supabase.from('locations').select('*')
        if (data) {
            setLocations(data)
            console.log("Locations", data)
        }
    }

    // Fetch all roles from the database
    const fetchRoles = async () => {
        const { data, error } = await supabase.from('roles').select('*');
        if (error) {
            console.error('Error fetching roles:', error);
        } else {
            console.log("roles", data)
            setRoles(data);
        }
    };

    useEffect(() => {
        getForms();
        getLocations();
        fetchUsers();
        fetchRoles();
    }, []);

    const fetchUsers = async () => {
        let { data, error } = await supabase.from('users')
            // .select(`*,location (name), hr:users (user_name), manager:users (user_name)`);
            .select(`*,location (*), hr:hr_id (id), manager:manager_id (id)`)
            .eq('organization_id', session?.user?.organization_id);
        if (data) {
            setUsers(data);
            console.log("users1", data);
        }
        if (error) {
            notification.error({ message: "Failed to fetch users" });
        }
    };

    const handleAddOrEdit = async (values) => {
        setLoading(true);

        const {
            email, mobile, firstName, lastName, role_id, manager, hr_contact,
            location, has_resigned, last_date, rate
        } = values;

        const role_type = roles?.find((r) => r.id === role_id)?.role_name

        const userName = `${firstName} ${lastName}`;
        const payload = {
            organization_id: session?.user?.organization_id,
            role_id,
            role_type,
            details: {
                rate, role_id, role_type, email, mobile, lastName, userName, firstName,
                has_resigned, last_date,
                // orgName: session?.user?.details?.orgName,
            },
            user_name: userName,
            is_active: true,
            location,
            leave_details: locations?.find((item) => item?.id === location)?.leave_settings,
            manager_id: manager,
            hr_id: hr_contact,
            // password_confirmed: false,
        };

        try {
            if (editItem && !clone) {
                // Update user logic
                const { data, error } = await supabase
                    .from('users')
                    .update(payload)
                    .eq('id', editItem.id);

                if (error) throw new Error("Failed to update user.");
                notification.success({ message: "User updated successfully" });
                setEditItem(null);
            } else {
                // Check if user already exists
                const { data: existingUser, error: checkError } = await supabase
                    .from('users')
                    .select('id')
                    .eq('details->>email', email);

                if (checkError && checkError.code !== 'PGRST116') throw checkError;

                if (existingUser?.length > 0) {
                    message.warning('User with this email already exists.');
                    return;
                }

                // Invite user and insert into database
                const { data: inviteResponse, error: inviteError } = await axios.post(
                    'https://azzqopnihybgniqzrszl.functions.supabase.co/invite_users',
                    { email },
                    { headers: { 'Content-Type': 'application/json' } }
                );

                if (inviteError) throw inviteError;

                const inviteId = inviteResponse?.id;
                const insertPayload = { ...payload, id: inviteId };

                const { error: insertError } = await supabase.from('users').insert([insertPayload]);
                if (insertError) throw insertError;

                message.success(<>
                    User invited successfully. Users can accept the invite sent from Inbox/Spam folder!
                </>);
                // message.success(
                //     <div style={{ textAlign: 'center' }}>
                //         <p style={{ marginBottom: 4, fontWeight: 500 }}>
                //             User invited and added successfully!
                //         </p>
                //         <span style={{ fontSize: 14 }}>
                //             Please check your Inbox/Spam folder to accept the invite and set your password.
                //         </span>
                //     </div>
                // );
            }
        } catch (error) {
            message.error(error.message || 'An error occurred.');
        } finally {
            setLoading(false);
            fetchUsers();
            setIsModalOpen(false);
            form.resetFields();
            setEditItem(null);
            setClone(null);
        }
    };

    // FOR TESTING ERROR MESSAGE
    // message.success(<>
    //     User invited and added successfully. <br />
    //     User can accept the invite from Inbox/Spam folder and set the password!
    // </>);


    // message.success('User invited and added successfully .   User can accept invite from Inbox / Spam folder and set the password!');
    // const handleAddOrEdit = async (values) => {
    //     setLoading(true);
    //     const {
    //         email,
    //         mobile,
    //         firstName,
    //         lastName,
    //         role_type, manager, hr_contact, location, has_resigned, last_date, rate
    //     } = values;

    //     const userName = `${firstName} ${lastName}`;
    //     if (editItem && !clone) {
    //         const payload = {
    //             organization_id: session?.user?.organization_id,
    //             role_type,
    //             details: {
    //                 rate,
    //                 role_type,
    //                 email,
    //                 mobile,
    //                 orgName: session?.user?.details?.orgName,
    //                 lastName,
    //                 userName,
    //                 firstName, has_resigned, last_date
    //             },
    //             user_name: userName,
    //             // is_manager: role_type === 'manager'||role_type === 'manager'||role_type === 'manager',
    //             is_active: true,
    //             location: location,
    //             leave_details: locations?.find(item => item?.id === location)?.leave_settings,
    //             manager_id: manager,
    //             hr_id: hr_contact,
    //             password_confirmed: false,
    //         };
    //         console.log("payload", payload);
    //         const { data, error } = await supabase
    //             .from('users')
    //             .update(payload)
    //             .eq('id', editItem.id);

    //         if (data) {
    //             notification.success({ message: "User updated successfully" });
    //             setEditItem(null);
    //         } else if (error) {
    //             notification.error({ message: "Failed to update user" });
    //         }
    //         setLoading(false);
    //     } else {
    //         try {
    //             // Step 1: Check if the user already exists
    //             const { data: existingUser, error: checkError } = await supabase
    //                 .from('users')
    //                 .select('id')
    //                 .eq('details->>email', email)
    //             // .single();

    //             if (checkError && checkError.code !== 'PGRST116') {
    //                 // If the error is not related to "No rows found" (PGRST116), throw the error
    //                 throw checkError;
    //             }

    //             if (existingUser?.length > 0) {
    //                 // User already exists
    //                 message.warning('User with this email already exists.');
    //                 // setLoading(false);
    //                 return;
    //             }

    //             // Step 2: Send user invite link
    //             const { data, error: inviteError } = await axios.post(
    //                 'https://azzqopnihybgniqzrszl.functions.supabase.co/invite_users',
    //                 { email },
    //                 { headers: { 'Content-Type': 'application/json' } }
    //             );

    //             if (inviteError) {
    //                 throw inviteError;
    //             }

    //             // Step 3: Insert new row in the users table
    //             const payload = {
    //                 organization_id: session?.user?.organization_id,
    //                 role_type,
    //                 details: {
    //                     rate,
    //                     role_type,
    //                     email,
    //                     mobile,
    //                     orgName: session?.user?.details?.orgName,
    //                     lastName,
    //                     userName,
    //                     firstName, has_resigned, last_date
    //                 },
    //                 id: data?.id,
    //                 user_name: userName,
    //                 // is_manager: role_type === 'manager'||role_type === 'manager'||role_type === 'manager',
    //                 is_active: true,
    //                 location: location,
    //                 leave_details: locations?.find(item => item?.id === location)?.leave_settings,
    //                 manager_id: manager,
    //                 hr_id: hr_contact,
    //                 password_confirmed: false,
    //             };
    //             console.log("Payload", payload);
    //             const { error: insertError } = await supabase.from('users').insert([payload]);

    //             if (insertError) {
    //                 throw insertError;
    //             }

    //             message.success('User invited and added successfully!');
    //         } catch (error) {
    //             message.error(error.message || 'An error occurred.');
    //         } finally {
    //             setLoading(false);
    //         }
    //     }

    //     fetchUsers();
    //     setIsModalOpen(false);
    //     form.resetFields();
    //     setEditItem();
    //     setClone();
    // };

    const handleEdit = (record, copy) => {
        const item = {
            ...record?.details,
            // manager: record?.manager?.id,
            // hr_contact: record?.hr?.id,
            // location: record?.location?.id,
            id: record?.id,
            manager: record?.manager?.id,
            hr_contact: record?.hr?.id,
            location: record?.location?.id,
        }
        copy && (delete item?.email)
        copy && (delete item?.firstName)
        copy && (delete item?.lastName)
        copy && (delete item?.mobile)
        console.log("Up", item, record);
        setEditItem(item);
        form.setFieldsValue(item
            // ...record?.details,
            // // manager: record?.manager?.id,
            // // hr_contact: record?.hr?.id,
            // // location: record?.location?.id,

            // manager: record?.manager?.user_name,
            // hr_contact: record?.hr?.user_name,
            // location: record?.location?.name,

            // // role_type: record?.role_type,
            // // user_name: record.details.user_name,
            // // cost: record.details.cost,
            // // duration: record.details.duration,
            // // description: record.details.description,
        );
        setIsModalOpen(true);
        if (copy) {
            setClone(true)
        }
    };

    // const handleDelete = async (id) => {
    //     const { error } = await supabase.from('users').delete().eq('id', id);
    //     if (!error) {
    //         notification.success({ message: "User deleted successfully" });
    //         fetchUsers();
    //     } else {
    //         notification.error({ message: "Failed to delete user" });
    //     }
    // };

    const showDeleteConfirm = async (record) => {
        confirm({
            title: `Are you sure delete - ${record?.user_name} ?`,
            icon: <ExclamationCircleFilled />,
            //   content: 'Some descriptions',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                const { error } = await supabase.from('users').delete().eq('id', record?.id);
                if (!error) {
                    notification.success({ message: "User deleted successfully" });
                    fetchUsers();
                } else {
                    notification.error({ message: "Failed to delete user" });
                }
            },
            onCancel() {
                console.log('Cancel');
            },
        });
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
                    <Tooltip title="Edit">
                        <Button
                            type="primary"
                            icon={<EditFilled />}
                            size="small"
                            className="mr-2"
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Copy">
                        <Button
                            type="primary"
                            icon={<CopyFilled />}
                            size="small"
                            className="mr-2"
                            onClick={() => handleEdit(record, true)}
                        />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Button
                            type="primary" ghost
                            icon={<DeleteOutlined />}
                            size="small"
                            // onClick={() => handleDelete(record.id)}
                            onClick={() => showDeleteConfirm(record)}
                        />
                    </Tooltip>
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
                        onClick={() => { setEditItem(); setIsModalOpen(true) }}
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
                                        <Tooltip title="Edit">
                                            <Button //disabled={true}
                                                type="primary"
                                                icon={<EditFilled />}
                                                size="small"
                                                className="mr-2"
                                                onClick={() => handleEdit(user)}
                                            />
                                        </Tooltip>
                                        <Tooltip title="Copy">
                                            <Button //disabled={true}
                                                type="default"
                                                icon={<CopyFilled />}
                                                size="small"
                                                className="mr-2"
                                                onClick={() => handleEdit(user, true)}
                                            />
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <Button
                                                type="primary" ghost
                                                icon={<DeleteOutlined />}
                                                size="small"
                                                onClick={() => showDeleteConfirm(user)}
                                            // onClick={() => handleDelete(user?.id)}
                                            />
                                        </Tooltip>
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
                                <p><b>Role:</b> {user.details?.role_type}</p>
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
                title={(editItem && !clone) ? "Edit User Details" : "Invite User"}
                open={isModalOpen}
                closable={!loading}
                maskClosable={!loading}
                onClose={() => { setIsModalOpen(false); setEditItem(); setClone(false) }}
                onOk={() => form.submit()}
                okText="Save"
            >
                <Spin spinning={loading}>
                    <DynamicForm schemas={schema} onFinish={handleAddOrEdit} formData={editItem && editItem} />
                </Spin>
            </Drawer>
        </Card>
    );
};

export default Users;
