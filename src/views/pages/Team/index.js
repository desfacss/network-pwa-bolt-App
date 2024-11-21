import { Button, Card, notification, Table, Drawer, Modal, Form, Avatar, message, Spin, Tooltip, Menu, Dropdown } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { PlusOutlined, EditFilled, DeleteOutlined, SendOutlined, UnorderedListOutlined, MoreOutlined, AppstoreOutlined, CopyFilled, ExclamationCircleFilled } from "@ant-design/icons";
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
            .select(`*,location (*), hr:hr_id (*), manager:manager_id (*)`)
            .eq('organization_id', session?.user?.organization_id);
        if (data) {
            setUsers(data);
            console.log("users1", data);
        }
        if (error) {
            notification.error({ message: error?.message || "Failed to fetch users" });
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
        form.setFieldsValue(item);
        setIsModalOpen(true);
        if (copy) {
            setClone(true)
        }
    };

    const showDeleteConfirm = async (record) => {
        confirm({
            title: `Are you sure delete - ${record?.user_name} ?`,
            icon: <ExclamationCircleFilled />,
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    const { error } = await supabase.from('users').delete().eq('id', record?.id);
                    if (!error) {
                        // const { data, error: rpcError } =
                        //     await supabase.rpc('auth.delete_user_if_no_linked_data',
                        //  { user_id: record?.id }
                        //  );

                        // if (!rpcError) {
                        //     notification.success({ message: "User deleted successfully" });
                        // } else {
                        //     notification.error({ message: rpcError?.message || "Failed to delete user due to linked data" });
                        // }
                        notification.success({ message: "User deleted successfully" });
                        fetchUsers();
                    } else {
                        // console.log("EE", error)
                        notification.error({ message: error?.message || "Failed to delete user" });
                    }
                } catch (e) {
                    // console.log("EEE", e)
                    notification.error({ message: e.message || "Unexpected error occurred" });
                }
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    };

    const showResendLoginLinkConfirm = async (record) => {
        confirm({
            title: `Do you want to resend Login Link to ${record?.user_name} ?`,
            icon: <ExclamationCircleFilled />,
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    const { error } = await supabase.auth.resetPasswordForEmail(record?.details?.email);
                    if (error) {
                        throw error;
                    }
                    // setIsOtpSent(true);
                    message.success(`Login Link sent to ${record?.user_name}`);
                } catch (error) {
                    message.error(error.message || 'Failed to send Login Link.');
                }
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'user_name',
            key: 'user_name',
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
            title: 'Cost/Hr',
            dataIndex: ['details', 'rate'],
            key: 'rate',
        },
        {
            title: 'Role',
            dataIndex: ['details', 'role_type'],
            key: 'role',
        },
        {
            title: 'Manager',
            dataIndex: ['manager', 'user_name'],
            key: 'manager',
        },
        {
            title: 'Location',
            dataIndex: ['location', 'name'],
            key: 'location',
        },
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
                    <Tooltip title="Resend Login Link">
                        <Button //disabled={true}
                            type="primary"
                            icon={<SendOutlined />}
                            size="small"
                            className="mr-2"
                            onClick={() => showResendLoginLinkConfirm(record)}
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

    const actionsMenu = (user) => (
        <Menu>
            <Menu.Item key="edit" onClick={() => handleEdit(user)}>
                {/* <Tooltip title="Edit"> */}
                <Button
                    type="link"
                    // icon={<EditFilled />}
                    size="small"
                    onClick={() => handleEdit(user)}
                >Edit</Button>
                {/* </Tooltip> */}
            </Menu.Item>
            <Menu.Item key="copy" onClick={() => handleEdit(user, true)}>
                {/* <Tooltip title="Copy"> */}
                <Button
                    type="link"
                    // icon={<CopyFilled />}
                    size="small"
                // onClick={() => handleEdit(user, true)}
                >Copy</Button>
                {/* </Tooltip> */}
            </Menu.Item>
            <Menu.Item key="resend" onClick={() => showResendLoginLinkConfirm(user)}>
                {/* <Tooltip title="Resend Login Link"> */}
                <Button
                    type="link"
                    // icon={<SendOutlined />}
                    size="small"
                // onClick={() => showResendLoginLinkConfirm(user)}
                >Resend Link</Button>
                {/* </Tooltip> */}
            </Menu.Item>
            <Menu.Item key="delete" onClick={() => showDeleteConfirm(user)}>
                {/* <Tooltip title="Delete"> */}
                <Button
                    type="link"
                    ghost
                    // icon={<DeleteOutlined />}
                    size="small"
                // onClick={() => showDeleteConfirm(user)}
                >Delete</Button>
                {/* </Tooltip> */}
            </Menu.Item>
        </Menu>
    );

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
                    <div className="services-card-grid p-2">
                        {users?.map((user) => (
                            <Card
                                key={user?.id}
                                // extra={
                                //     <div className="card-actions">
                                //         <Tooltip title="Edit">
                                //             <Button //disabled={true}
                                //                 type="primary"
                                //                 icon={<EditFilled />}
                                //                 size="small"
                                //                 className="mr-2"
                                //                 onClick={() => handleEdit(user)}
                                //             />
                                //         </Tooltip>
                                //         <Tooltip title="Copy">
                                //             <Button //disabled={true}
                                //                 type="primary"
                                //                 icon={<CopyFilled />}
                                //                 size="small"
                                //                 className="mr-2"
                                //                 onClick={() => handleEdit(user, true)}
                                //             />
                                //         </Tooltip>
                                //         <Tooltip title="Resend Login Link">
                                //             <Button //disabled={true}
                                //                 type="primary"
                                //                 icon={<SendOutlined />}
                                //                 size="small"
                                //                 className="mr-2"
                                //                 onClick={() => showResendLoginLinkConfirm(user)}
                                //             />
                                //         </Tooltip>
                                //         <Tooltip title="Delete">
                                //             <Button
                                //                 type="primary" ghost
                                //                 icon={<DeleteOutlined />}
                                //                 size="small"
                                //                 onClick={() => showDeleteConfirm(user)}
                                //             // onClick={() => handleDelete(user?.id)}
                                //             />
                                //         </Tooltip>
                                //     </div>
                                // }

                                extra={
                                    <Dropdown overlay={actionsMenu(user)} trigger={['click']}>
                                        <Button icon={<MoreOutlined />} shape="circle" />
                                    </Dropdown>
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
                            >
                                <p><b>Name:</b> {user.user_name}</p>
                                <p><b>Email:</b> {user.details?.email}</p>
                                <p><b>Mobile:</b> {user.details?.mobile}</p>
                                <p><b>Role:</b> {user.details?.role_type}</p>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="pl-3 pr-3">
                        <Table size={'small'}
                            columns={columns}
                            dataSource={users}
                            rowKey={(record) => record.id}
                            loading={!users}
                            pagination={false}
                        />
                    </div>
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
