import { Button, Card, notification, Table, Drawer, Form, Input, Modal } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { PlusOutlined, EditFilled, DeleteOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import { supabase } from "configs/SupabaseConfig";
import DynamicForm from "../DynamicForm";
import { useSelector } from "react-redux";
const { confirm } = Modal;

const LeaveSettings = () => {
    const componentRef = useRef(null);
    const [leaves, setLeaves] = useState([]);
    const [editItem, setEditItem] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [schema, setSchema] = useState();

    const { session } = useSelector((state) => state.auth);

    const [form] = Form.useForm();

    const getForms = async () => {
        const { data, error } = await supabase.from('forms').select('*').eq('name', "leaves_add_edit_form").single()
        console.log("A", data)
        if (data) {
            console.log(data)
            setSchema(data)
        }
    }

    useEffect(() => {
        getForms()
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        let { data, error } = await supabase.from('leaves').select('*,location:location_id (*)');
        if (data) {
            setLeaves(data);
        }
        if (error) {
            notification.error({ message: error?.message || "Failed to fetch leaves" });
        }
    };

    const handleAddOrEdit = async (values) => {
        // const { service_name, cost, duration, description } = values;
        // if (values.level !== "location") {
        //     const { location_id, ...updatedData } = values; // Remove location_id if level is not 'location'
        //     values = updatedData;
        // }
        const payload = { ...values, location_id: values.level === "location" ? values?.location_id : null, organization_id: session?.user?.organization?.id };
        // console.log("Pyload", payload)
        if (editItem) {
            // Update existing service
            delete payload?.id
            const { data, error } = await supabase
                .from('leaves')
                .update(payload) //, organization_id: session?.user?.organization_id, organization_name: session?.user?.details?.orgName 
                .eq('id', editItem.id);

            if (data) {
                notification.success({ message: "Leave updated successfully" });
                setEditItem(null);
            } else if (error) {
                notification.error({ message: error?.message || "Failed to update leave" });
            }
        } else {
            // Add new leave
            const { data, error } = await supabase
                .from('leaves')
                .insert([payload]) //, organization_id: session?.user?.organization_id, organization_name: session?.user?.details?.orgName }]);

            if (data) {
                notification.success({ message: "Leave added successfully" });
            } else if (error) {
                notification.error({ message: error?.message || "Failed to add leave" });
            }
        }
        fetchLeaves();
        setIsDrawerOpen(false);
        form.resetFields();
        setEditItem()
    };

    const handleEdit = (record) => {
        const item = {
            id: record?.id,
            name: record?.name,
            description: record?.description,
            min: record?.min,
            max: record?.max,
            leave_type: record?.leave_type,
            level: record?.level,
            location_id: record?.location_id,
        }
        form.setFieldsValue(item);
        setEditItem(item);
        setIsDrawerOpen(true);
    };

    const showDeleteConfirm = async (record) => {
        confirm({
            title: `Are you sure delete  - ${record.leave_type} ?`,
            icon: <ExclamationCircleFilled />,
            //   content: 'Some descriptions',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                const { error } = await supabase.from('leaves').delete().eq('id', record?.id);
                if (!error) {
                    notification.success({ message: "Leave deleted successfully" });
                    fetchLeaves();
                } else {
                    notification.error({ message: error?.message || "Failed to delete Leave" });
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
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Type',
            dataIndex: 'leave_type',
            key: 'leave_type',
        },
        {
            title: 'Level',
            dataIndex: 'level',
            key: 'level',
            render: (_, record) => (
                <div>
                    {record.level} {record.level === 'location' && `( ${record?.location?.name} )`}
                </div>
            ),
        },
        {
            title: 'Min',
            dataIndex: 'min',
            key: 'min',
        },
        {
            title: 'Max',
            dataIndex: 'max',
            key: 'max',
        },
        // {
        //     title: 'Users',
        //     dataIndex: ['details', 'leave_users'],
        //     key: 'leave_users',
        //     render: (leave_users) => leave_users?.join(', '),
        // },
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
                        onClick={() => showDeleteConfirm(record)}
                    />
                </div>
            ),
        },
    ];

    return (
        <Card bodyStyle={{ padding: "0px" }}>
            <div className="d-flex p-2 justify-content-between align-items-center" style={{ marginBottom: "16px" }}>
                <h2 style={{ margin: 0 }}>Leaves</h2>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsDrawerOpen(true)}
                >
                    Add Leave
                </Button>
            </div>
            <div className="table-responsive" ref={componentRef}>
                <Table size={'small'}
                    columns={columns}
                    dataSource={leaves}
                    rowKey={(record) => record.id}
                    loading={!leaves}
                    pagination={false}
                />
            </div>
            <Drawer footer={null} width={'100%'} //size="large"
                title={editItem ? "Edit Leave" : "Add Leave"}
                open={isDrawerOpen} maskClosable={false}
                onClose={() => { setIsDrawerOpen(false); setEditItem() }}
                onOk={() => form.submit()}
                okText="Save"
            >
                <DynamicForm schemas={schema}
                    onFinish={handleAddOrEdit}
                    formData={editItem && editItem} />
            </Drawer>
        </Card>
    );
};

export default LeaveSettings;
