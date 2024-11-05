import { Button, Card, notification, Table, Drawer, Form, Input } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { PlusOutlined, EditFilled, DeleteOutlined } from "@ant-design/icons";
import { supabase } from "configs/SupabaseConfig";
import DynamicForm from "../DynamicForm";
import { useSelector } from "react-redux";

const Locations = () => {
    const componentRef = useRef(null);
    const [locations, setLocations] = useState([]);
    const [editItem, setEditItem] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [schema, setSchema] = useState();

    const { session } = useSelector((state) => state.auth);

    const [form] = Form.useForm();

    const getForms = async () => {
        const { data, error } = await supabase.from('forms').select('*').eq('name', "location_form").single()
        console.log("A", data)
        if (data) {
            console.log(data)
            setSchema(data)
        }
    }

    useEffect(() => {
        getForms()
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        let { data, error } = await supabase.from('locations').select('*');
        if (data) {
            setLocations(data);
        }
        if (error) {
            notification.error({ message: "Failed to fetch locations" });
        }
    };

    const handleAddOrEdit = async (values) => {
        // const { service_name, cost, duration, description } = values;
        console.log("Pyload", values)
        if (editItem) {
            // Update existing service
            const { data, error } = await supabase
                .from('locations')
                .update({ details: values, name: values?.name }) //, organization_id: session?.user?.organization_id, organization_name: session?.user?.details?.orgName 
                .eq('id', editItem.id);

            if (data) {
                notification.success({ message: "Location updated successfully" });
                setEditItem(null);
            } else if (error) {
                notification.error({ message: "Failed to update location" });
            }
        } else {
            // Add new location
            const { data, error } = await supabase
                .from('locations')
                .insert([{ details: values, name: values?.name }]) //, organization_id: session?.user?.organization_id, organization_name: session?.user?.details?.orgName }]);

            if (data) {
                notification.success({ message: "Location added successfully" });
            } else if (error) {
                notification.error({ message: "Failed to add location" });
            }
        }
        fetchLocations();
        setIsDrawerOpen(false);
        form.resetFields();
        setEditItem()
    };

    const handleEdit = (record) => {
        setEditItem(record);
        form.setFieldsValue({
            service_name: record?.details?.service_name,
            cost: record?.details?.cost,
            duration: record?.details?.duration,
            description: record?.details?.description,
            name: record?.details?.name,
        });
        setIsDrawerOpen(true);
    };

    const handleDelete = async (id) => {
        const { error } = await supabase.from('locations').delete().eq('id', id);
        if (!error) {
            notification.success({ message: "Location deleted successfully" });
            fetchLocations();
        } else {
            notification.error({ message: "Failed to delete Location" });
        }
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Address',
            dataIndex: ['details', 'address'],
            key: 'address',
        },
        {
            title: 'Pin',
            dataIndex: ['details', 'pin'],
            key: 'pin',
        },
        // {
        //     title: 'Users',
        //     dataIndex: ['details', 'location_users'],
        //     key: 'location_users',
        //     render: (location_users) => location_users?.join(', '),
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
                        onClick={() => handleDelete(record.id)}
                    />
                </div>
            ),
        },
    ];

    return (
        <Card bodyStyle={{ padding: "0px" }}>
            <div className="d-flex p-2 justify-content-between align-items-center" style={{ marginBottom: "16px" }}>
                <h2 style={{ margin: 0 }}>Locations</h2>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsDrawerOpen(true)}
                >
                    Add Location
                </Button>
            </div>
            <div className="table-responsive" ref={componentRef}>
                <Table
                    columns={columns}
                    dataSource={locations}
                    rowKey={(record) => record.id}
                    loading={!locations}
                    pagination={false}
                />
            </div>
            <Drawer footer={null} width={'100%'} //size="large"
                title={editItem ? "Edit Location" : "Add Location"}
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

export default Locations;
