import { Button, Card, notification, Table, Drawer, Form, Input, Select, DatePicker, Modal, Tooltip } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { PlusOutlined, EditFilled, DeleteOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import { supabase } from "configs/SupabaseConfig";
import DynamicForm from "../DynamicForm";
import { useSelector } from "react-redux";
import dayjs from 'dayjs';
const { confirm } = Modal;

const Notifications = () => {
    // const [form] = Form.useForm();
    const componentRef = useRef(null);
    const [notifications, setNotifications] = useState([]);
    const [editItem, setEditItem] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [schema, setSchema] = useState();
    const [type, setType] = useState(null);
    const [users, setUsers] = useState([]);
    const [locations, setLocations] = useState([]);
    const dateFormat = 'YYYY/MM/DD';
    // Fetch users from Supabase
    useEffect(() => {
        const fetchUsers = async () => {
            const { data, error } = await supabase.from('users').select('id, user_name').eq('organization_id', session?.user?.organization_id);
            if (error) {
                console.error('Error fetching users:', error);
            } else {
                console.log("US", data)
                setUsers(data || []);
            }
        };
        fetchUsers();
    }, []);

    // Fetch locations from Supabase
    useEffect(() => {
        const fetchLocations = async () => {
            const { data, error } = await supabase.from('locations').select('id, name').eq('organization_id', session?.user?.organization_id);
            if (error) {
                console.error('Error fetching locations:', error);
            } else {
                setLocations(data || []);
            }
        };
        fetchLocations();
    }, []);


    const { session } = useSelector((state) => state.auth);

    const [form] = Form.useForm();

    const getForms = async () => {
        const { data, error } = await supabase.from('forms').select('*').eq('name', "add_edit_notifications_form").single()
        console.log("A", data)
        if (data) {
            console.log(data)
            setSchema(data)
        }
    }

    useEffect(() => {
        getForms()
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        let { data, error } = await supabase.from('notifications').select('*').eq('organization_id', session?.user?.organization_id);
        if (data) {
            console.log("Notifications", data);
            setNotifications(data);
        }
        if (error) {
            notification.error({ message: error?.message || "Failed to fetch notifications" });
        }
    };

    const handleAddOrEdit = async (values) => {
        const { type, start, expiry, ...rest } = values;

        // Construct payload based on type
        const payload = {
            ...rest,
            type,
            start: start,
            expiry: expiry,
            // start: start?.format(dateFormat) || '',
            // expiry: expiry?.format(dateFormat),
            users: type === 'users' ? values?.users : null,
            locations: type === 'location' ? values?.locations : null,
            organization_id: session?.user?.organization_id,
        };

        try {
            let response;

            if (editItem) {
                // Update existing notification
                response = await supabase
                    .from('notifications')
                    .update(payload)
                    .eq('id', editItem.id);

                if (response.error) throw new Error("Failed to update notification");
                notification.success({ message: "Notification updated successfully" });
                setEditItem(null);
            } else {
                // Add new notification
                response = await supabase.from('notifications').insert([payload]);

                if (response.error) throw new Error("Failed to add notification");
                notification.success({ message: "Notification added successfully" });
            }

            // Refresh the data and reset the form
            fetchNotifications();
            form.resetFields();
        } catch (error) {
            notification.error({ message: error.message || "An error occurred" });
        } finally {
            setIsDrawerOpen(false);
            setEditItem(null);
        }
    };


    // const handleAddOrEdit = async (values) => {
    //     const { type, ...rest } = values;
    //     let payload = { ...rest, users: null, locations: null, type: type, expiry: values?.expiry?.format(dateFormat) };

    //     if (type === 'users') {
    //         payload.users = values.users;
    //         // delete payload?.locations
    //     } else if (type === 'location') {
    //         payload.locations = values.locations;
    //     }
    //     // delete payload?.users
    //     // } else if (type === 'public') {
    //     //     delete payload?.locations
    //     //     delete payload?.users
    //     // }
    //     console.log("payload", payload);
    //     // const { service_name, cost, duration, description } = values;
    //     // console.log("Pyload", values)
    //     if (editItem) {
    //         // Update existing service
    //         const { data, error } = await supabase
    //             .from('notifications')
    //             .update(payload)
    //             .eq('id', editItem.id);

    //         if (data) {
    //             notification.success({ message: "Notification updated successfully" });
    //             setEditItem(null);
    //         } else if (error) {
    //             notification.error({ message: "Failed to update notification" });
    //         }
    //     } else {
    //         // Add new notification
    //         const { data, error } = await supabase
    //             .from('notifications')
    //             .insert([payload]);

    //         if (data) {
    //             notification.success({ message: "Notification added successfully" });
    //         } else if (error) {
    //             notification.error({ message: "Failed to add notification" });
    //         }
    //     }
    //     fetchNotifications();
    //     setIsDrawerOpen(false);
    //     form.resetFields();
    //     setEditItem()
    // };

    const handleEdit = (record) => {
        setEditItem(record);
        setType(record?.type)
        form.setFieldsValue({
            title: record?.title,
            message: record?.message,
            // expiry: record?.expiry,
            // start: dayjs(record?.start, dateFormat),
            // expiry: dayjs(record?.expiry, dateFormat),
            start: dayjs(record?.start),
            expiry: dayjs(record?.expiry),
            type: record?.type,
            users: record?.users,
            locations: record?.locations,
        });
        setIsDrawerOpen(true);
    };

    // const handleDelete = async (id) => {
    //     const { error } = await supabase.from('notifications').delete().eq('id', id);
    //     if (!error) {
    //         notification.success({ message: "Notification deleted successfully" });
    //         fetchNotifications();
    //     } else {
    //         notification.error({ message: "Failed to delete Notification" });
    //     }
    // };

    const showDeleteConfirm = async (record) => {
        confirm({
            title: `Are you sure delete this Notification - ${record?.title} ?`,
            icon: <ExclamationCircleFilled />,
            //   content: 'Some descriptions',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                const { error } = await supabase.from('notifications').delete().eq('id', record?.id);
                if (!error) {
                    notification.success({ message: "Notification deleted successfully" });
                    fetchNotifications();
                } else {
                    notification.error({ message: error?.message || "Failed to delete Notification" });
                }
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    };

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Message',
            dataIndex: 'message',
            key: 'message',
        },
        // {
        //     title: 'Expiry',
        //     dataIndex: 'expiry',
        //     key: 'expiry',
        // },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
        },
        // {
        //     title: 'Users',
        //     dataIndex: 'users',
        //     key: 'users',
        //     render: (users) => users?.join(', '),
        // },
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
                    <Tooltip title="Edit">
                        <Button
                            type="primary"
                            icon={<EditFilled />}
                            size="small"
                            className="mr-2"
                            onClick={() => handleEdit(record)}
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
    // const onFinish = (values) => {
    //     const { type, ...rest } = values;
    //     let payload = { ...rest, type: type, expiry: values?.expiry?.format(dateFormat) };

    //     if (type === 'users') {
    //         payload.users = values.users;
    //     } else if (type === 'location') {
    //         payload.locations = values.locations;
    //     }

    //     // Send the payload to your backend or Supabase
    //     console.log('Form submitted:', payload);
    // };
    return (
        <Card bodyStyle={{ padding: "0px" }}>
            <div className="d-flex p-2 justify-content-between align-items-center" style={{ marginBottom: "16px" }}>
                <h2 style={{ margin: 0 }}>Notifications</h2>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsDrawerOpen(true)}
                >
                    Add Notification
                </Button>
            </div>
            <div className="table-responsive" ref={componentRef}>
                <Table size={'small'}
                    columns={columns}
                    dataSource={notifications}
                    rowKey={(record) => record.id}
                    loading={!notifications}
                    pagination={true}
                />
            </div>
            <Drawer footer={null} width={500} //size="large"
                title={editItem ? "Edit Notification" : "Add Notification"}
                open={isDrawerOpen} maskClosable={false}
                onClose={() => { setIsDrawerOpen(false); setEditItem() }}
                // onOk={() => form.submit()}
                okText="Save"
            >
                <Form form={form} layout="vertical" onFinish={handleAddOrEdit}>
                    <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Please enter the Title' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="message" label="Message" rules={[{ required: true, message: 'Please enter the Message' }]}>
                        <Input.TextArea rows={4} />
                    </Form.Item>
                    <Form.Item name="type" label="Type" rules={[{ required: true, message: 'Please select the Type' }]}>
                        <Select onChange={(value) => setType(value)}>
                            <Select.Option value="users">Users</Select.Option>
                            <Select.Option value="public">Public</Select.Option>
                            <Select.Option value="location">Location</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="start" label="Start" rules={[{ required: true, message: 'Please select the Start date' }]}>
                        <DatePicker size={'small'}
                            //  showTime
                            style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="expiry" label="Expiry" format={dateFormat} rules={[{ required: true, message: 'Please select the Expiry date' }]}>
                        <DatePicker size={'small'}
                            //  showTime 
                            style={{ width: '100%' }} />
                    </Form.Item>

                    {/* Conditional inputs based on type */}
                    {type === 'users' && (
                        <Form.Item name="users" label="Select Users" rules={[{ required: true, message: 'Please select Users' }]}>
                            <Select mode="multiple" placeholder="Select users">
                                {users?.map((user) => (
                                    <Select.Option key={user?.id} value={user?.id}>
                                        {user?.user_name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    )}
                    {type === 'location' && (
                        <Form.Item name="locations" label="Select Locations" rules={[{ required: true, message: 'Please select Locations' }]}>
                            <Select mode="multiple" placeholder="Select locations">
                                {locations?.map((location) => (
                                    <Select.Option key={location?.id} value={location?.id}>
                                        {location?.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    )}

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Submit
                        </Button>
                    </Form.Item>
                </Form>
                {/* <DynamicForm schemas={schema}
                    onFinish={handleAddOrEdit}
                    formData={editItem && editItem?.details} /> */}
            </Drawer>
        </Card>
    );
};

export default Notifications;
