import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, message, Select } from "antd";
import { supabase } from "configs/SupabaseConfig";
import { useSelector } from "react-redux";
import { EditFilled } from "@ant-design/icons";
const { Option } = Select

const LeaveTypes = () => {
    const [types, setTypes] = useState();
    const [selectedType, setSelectedType] = useState();
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRow, setEditingRow] = useState(null);
    const [form] = Form.useForm();

    const { session } = useSelector((state) => state.auth);
    const organizationId = session?.user?.organization?.id

    const formatTitle = (str) => {
        return str?.split('_')?.map(word => word.charAt(0).toUpperCase() + word.slice(1))?.join(' '); // Join the words with a space
    };

    const fetchLeaveTypes = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from(selectedType).select("id, name").eq("organization_id", organizationId);

            if (error) throw error;
            setLeaveTypes(data);
        } catch (error) {
            message.error(`Failed to fetch ${selectedType} types.`);
        } finally {
            setLoading(false);
        }
    };

    const fetchTypes = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from("enums").select("options").eq("name", 'types_crud').eq('organization_id', session?.user?.organization_id);
            if (error) throw error;
            // console.log("dt", data[0]?.options)
            setTypes(data[0]?.options);
        } catch (error) {
            message.error("Failed to fetch leave types.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTypes();
    }, []);
    useEffect(() => {
        if (selectedType) {
            fetchLeaveTypes();
        }
    }, [selectedType]);

    const handleAdd = () => {
        setEditingRow(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (record) => {
        setEditingRow(record);
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            const { error } = await supabase
                .from(selectedType)
                .delete()
                .eq("id", id);

            if (error) throw error;
            message.success("Leave type deleted successfully.");
            fetchLeaveTypes();
        } catch (error) {
            message.error("Failed to delete leave type.");
        }
    };

    const handleSave = async (values) => {
        try {
            if (editingRow) {
                // Update existing leave type
                const { error } = await supabase
                    .from(selectedType)
                    .update({ name: values.name })
                    .eq("id", editingRow.id);

                if (error) throw error;
                message.success("Leave type updated successfully.");
            } else {
                // Add new leave type
                const { error } = await supabase.from(selectedType).insert({
                    name: values.name,
                    organization_id: organizationId,
                });

                if (error) throw error;
                message.success(`${formatTitle(selectedType)} added successfully.`);
            }

            fetchLeaveTypes();
            setIsModalOpen(false);
        } catch (error) {
            message.error(`Failed to save ${formatTitle(selectedType)}.`);
        }
    };

    const columns = [
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Actions",
            key: "actions",
            render: (text, record) => (
                <>
                    <Button
                        icon={<EditFilled />}
                        type="primary"
                        onClick={() => handleEdit(record)}
                    >
                        {/* Edit */}
                    </Button>
                    {/* <Popconfirm
                        title="Are you sure you want to delete this leave type?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="link" danger>
                            Delete
                        </Button>
                    </Popconfirm> */}
                </>
            ),
        },
    ];

    return (
        <div>
            {types && <Select placeholder='Select Type' style={{ width: 200 }} onChange={(e) => setSelectedType(e)} value={selectedType}>
                {types?.map(type =>
                    <Option value={type} key={type}>
                        {formatTitle(type)}
                    </Option>
                )}
            </Select>}
            {selectedType && <div>
                <Button type="primary" onClick={handleAdd} style={{ marginBottom: 16, marginTop: 10 }}>
                    Add {formatTitle(selectedType)}
                </Button>
                <Table dataSource={leaveTypes} columns={columns} rowKey="id" loading={loading} />
                <Modal
                    title={editingRow ? `Edit ${formatTitle(selectedType)}` : `Add ${formatTitle(selectedType)}`}
                    open={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={() => form.submit()} >
                    <Form form={form} layout="vertical" onFinish={handleSave} >
                        <Form.Item name="name" label={`${formatTitle(selectedType)} Name`}
                            rules={[{ required: true, message: `Please enter the ${formatTitle(selectedType)} name.` }]}
                        >
                            <Input />
                        </Form.Item>
                    </Form>
                </Modal>
            </div>}
        </div>
    );
};

export default LeaveTypes;
