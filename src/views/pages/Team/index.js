import { Button, Card, notification, Table, Drawer, Modal, Form, Avatar, message, Spin, Tooltip, Menu, Dropdown, Col, Row, Input } from "antd";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { PlusOutlined, EditFilled, DeleteOutlined, SendOutlined, UnorderedListOutlined, MoreOutlined, AppstoreOutlined, SearchOutlined, CopyFilled, ExclamationCircleFilled } from "@ant-design/icons";
import { supabase } from "configs/SupabaseConfig";
import DynamicForm from "../DynamicForm";
import { useSelector } from "react-redux";
import './Services.css'; // Add a CSS file to style the cards grid
import axios from "axios";
import { serverErrorParsing } from "components/util-components/serverErrorParsing";
import { camelCaseToTitleCase } from "components/util-components/utils";
import { getAllValues } from "components/common/utils";
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
    const [searchText, setSearchText] = useState('');

    // const filteredUsers = useMemo(() => {
    //     if (!searchText) return users;
    //     return users?.filter((item) => {
    //         return Object.values(item).some((value) =>
    //             String(value).toLowerCase().includes(searchText.toLowerCase())
    //         );
    //     });
    // }, [users, searchText]);

    const filteredUsers = useMemo(() => {
        if (!searchText) return users;
        return users?.filter((item) => {
            // Use getAllValues to retrieve all values from the object
            return getAllValues(item).some((value) =>
                String(value).toLowerCase().includes(searchText?.toLowerCase())
            );
        });
    }, [users, searchText]);

    const { session } = useSelector((state) => state.auth);

    const [form] = Form.useForm();

    const getForms = async () => {
        const { data, error } = await supabase.from('forms').select('*').eq('name', "user_add_edit_form").single()
        if (data) {
            setSchema(data)
        }
    }
    const getLocations = async () => {
        const { data, error } = await supabase.from('locations').select('*').eq('organization_id', session?.user?.organization_id).order('name', { ascending: true })
        if (data) {
            setLocations(data)
            // console.log("Locations", data)
        }
    }

    // Fetch all roles from the database
    const fetchRoles = async () => {
        const { data, error } = await supabase.from('roles').select('*').eq('organization_id', session?.user?.organization_id).order('role_name', { ascending: true });
        if (error) {
            console.error('Error fetching roles:', error);
        } else {
            // console.log("roles", data)
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
            .select(`*,location:location_id (*), hr:hr_id (*), manager:manager_id (*)`)
            .eq('organization_id', session?.user?.organization_id).order('user_name', { ascending: true });
        if (data) {
            setUsers(data);
            // console.log("users1", data);
        }
        if (error) {
            notification.error({ message: error?.message || "Failed to fetch users" });
        }
    };

    const handleAddOrEdit = async (values) => {
        setLoading(true);

        const {
            email, mobile, firstName, lastName, role_id, manager, hr_contact,
            location_id, has_resigned, last_date, rate, designation, department, joiningDate, birthDate, address, emergencyContact
        } = values;

        const role_type = roles?.find((r) => r.id === role_id)?.role_name

        const userName = `${firstName} ${lastName}`;
        const payload = {
            organization_id: session?.user?.organization_id,
            role_id,
            role_type,
            details: {

                rate, role_id, role_type, email, mobile, lastName, userName, firstName,
                has_resigned, last_date, designation, department, joiningDate, birthDate, address, emergencyContact
                // orgName: session?.user?.details?.orgName,
            },
            user_name: userName,
            is_active: true,
            location_id,
            leave_details: locations?.find((item) => item?.id === location_id)?.leave_settings,
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
                notification.success({ message: `${payload?.user_name} updated successfully` });
                setEditItem(null);
            } else {
                // Check if user already exists
                const { data: existingUser, error: checkError } = await supabase
                    .from('users')
                    .select('id')
                    .eq('details->>email', email).eq('organization_id', session?.user?.organization_id);

                if (checkError && checkError?.code !== 'PGRST116') throw checkError;

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
                    {payload?.user_name} invited successfully. {payload?.user_name} can accept the invite sent from Inbox/Spam folder!
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
            has_resigned: record?.details?.has_resigned,
            department: record?.details?.department,
            designation: record?.details?.designation,
            joiningDate: record?.details?.joiningDate,
            id: record?.id,
            manager: record?.manager?.id,
            hr_contact: record?.hr?.id,
            location_id: record?.location?.id,
        }
        copy && (delete item?.email)
        copy && (delete item?.firstName)
        copy && (delete item?.lastName)
        copy && (delete item?.mobile)
        // console.log("Up", item, record);
        setEditItem(item);
        form.setFieldsValue(item);
        setIsModalOpen(true);
        if (copy) {
            setClone(true)
        }
    };

    const showDeleteConfirm = async (record) => {
        confirm({
            title: `Confirm deletion of ${record?.user_name} ?`,
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
                        notification.error({ message: serverErrorParsing(error?.message) || "Failed to delete user" });
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
        { title: 'Name', dataIndex: 'user_name', key: 'user_name', sorter: (a, b) => a?.user_name?.localeCompare(b?.user_name) },
        { title: 'Email', dataIndex: ['details', 'email'], key: 'email', sorter: (a, b) => a?.details?.email?.localeCompare(b?.details?.email) },
        { title: 'Mobile', dataIndex: ['details', 'mobile'], key: 'mobile' },
        { title: 'Cost/Hr', dataIndex: ['details', 'rate'], key: 'rate', sorter: (a, b) => String(a?.details?.rate)?.localeCompare(String(b?.details?.rate)) },
        {
            title: 'Role', dataIndex: ['details', 'role_type'], key: 'role', sorter: (a, b) => a?.details?.role_type?.localeCompare(b?.details?.role_type),
            render: (text) => camelCaseToTitleCase(text)
        },
        { title: 'Manager', dataIndex: ['manager', 'user_name'], key: 'manager', sorter: (a, b) => a?.manager?.user_name?.localeCompare(b?.manager?.user_name) },
        { title: 'Location', dataIndex: ['location', 'name'], key: 'location', sorter: (a, b) => a?.location?.name?.localeCompare(b?.location?.name) },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <div className="d-flex">
                    <Tooltip title="Edit">
                        <Button type="primary" icon={<EditFilled />} size="small" className="mr-2"
                            onClick={() => handleEdit(record)} />
                    </Tooltip>
                    <Tooltip title="Copy">
                        <Button type="primary" icon={<CopyFilled />} size="small" className="mr-2"
                            onClick={() => handleEdit(record, true)} />
                    </Tooltip>
                    <Tooltip title="Resend Login Link">
                        <Button type="primary" icon={<SendOutlined />} size="small" className="mr-2"
                            onClick={() => showResendLoginLinkConfirm(record)} />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Button type="primary" ghost icon={<DeleteOutlined />} size="small"
                            onClick={() => showDeleteConfirm(record)} />
                    </Tooltip>
                </div>
            ),
        },
    ];

    const actionsMenu = (user) => (
        <Menu>
            <Menu.Item key="edit" onClick={() => handleEdit(user)}>
                <Button type="link" size="small" onClick={() => handleEdit(user)} >Edit</Button>
            </Menu.Item>
            <Menu.Item key="copy" onClick={() => handleEdit(user, true)}>
                <Button type="link" size="small" >Copy</Button>
            </Menu.Item>
            <Menu.Item key="resend" onClick={() => showResendLoginLinkConfirm(user)}>
                <Button type="link" size="small" >Resend Link</Button>
            </Menu.Item>
            <Menu.Item key="delete" onClick={() => showDeleteConfirm(user)}>
                <Button type="link" ghost size="small" >Delete</Button>
            </Menu.Item>
        </Menu>
    );

    return (
        <Card styles={{ body: { padding: "0px" } }}>
            <div className="d-flex p-2 justify-content-between align-items-center" style={{ marginBottom: "16px" }}>
                <h2 style={{ margin: 0 }}>Manage Team</h2>
                <div>
                    <Input className="mr-2" placeholder="Search" value={searchText} onChange={(e) => setSearchText(e.target.value)} prefix={<SearchOutlined />} style={{ width: 200 }} />
                    <Button icon={viewMode === 'card' ? <UnorderedListOutlined /> : <AppstoreOutlined />}
                        style={{ marginRight: "10px" }} onClick={() => setViewMode(viewMode === 'card' ? 'list' : 'card')} />
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditItem(); setIsModalOpen(true) }} >
                        Invite User
                    </Button>
                </div>
            </div>
            <div ref={componentRef}>
                {viewMode === 'card' ? (
                    <div >
                        <Row gutter={[16, 16]}>
                            {filteredUsers?.map((user) => (
                                <Col key={user?.id} xs={24} sm={12} lg={6}>
                                    <Card key={user?.id}
                                        extra={
                                            <Dropdown overlay={actionsMenu(user)} trigger={['click']}>
                                                <Button icon={<MoreOutlined />} shape="circle" />
                                            </Dropdown>
                                        }
                                        title={
                                            <div className="service-card-title">
                                                <Avatar size={80} src={user?.details?.profileImage}
                                                    alt={user && user?.user_name && user?.user_name[0] || ""}
                                                >{user && user?.user_name && user?.user_name[0] || ""}</Avatar>
                                            </div>}
                                        className="service-card" >
                                        <p><b>Name:</b> {user.user_name}</p>
                                        <p><b>Email:</b> {user.details?.email}</p>
                                        <p><b>Mobile:</b> {user.details?.mobile}</p>
                                        <p><b>Role:</b> {camelCaseToTitleCase(user.details?.role_type)}</p>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </div>
                ) : (
                    <div className="pl-3 pr-3">
                        <Table size={'small'} columns={columns} dataSource={filteredUsers} rowKey={(record) => record.id}
                            loading={!filteredUsers} pagination={true} />
                    </div>
                )}
            </div>
            <Drawer width={600} footer={null} title={(editItem && !clone) ? "Edit User Details" : "Invite User"}
                open={isModalOpen} closable={!loading} maskClosable={!loading} onOk={() => form.submit()} okText="Save"
                onClose={() => { setIsModalOpen(false); setEditItem(); setClone(false) }} >
                <Spin spinning={loading}>
                    <DynamicForm schemas={schema} onFinish={handleAddOrEdit} formData={editItem && editItem} />
                </Spin>
            </Drawer>
        </Card>
    );
};

export default Users;
