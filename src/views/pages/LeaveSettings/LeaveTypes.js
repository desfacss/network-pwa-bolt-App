import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, message, Popconfirm } from "antd";
import { supabase } from "configs/SupabaseConfig";
import { useSelector } from "react-redux";
import { EditFilled } from "@ant-design/icons";

const LeaveTypes = () => {
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRow, setEditingRow] = useState(null);
    const [form] = Form.useForm();

    const { session } = useSelector((state) => state.auth);
    const organizationId = session?.user?.organization?.id
    useEffect(() => {
        fetchLeaveTypes();
    }, []);

    const fetchLeaveTypes = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("leave_type")
                .select("id, name")
                .eq("organization_id", organizationId);

            if (error) throw error;
            setLeaveTypes(data);
        } catch (error) {
            message.error("Failed to fetch leave types.");
        } finally {
            setLoading(false);
        }
    };

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
                .from("leave_type")
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
                    .from("leave_type")
                    .update({ name: values.name })
                    .eq("id", editingRow.id);

                if (error) throw error;
                message.success("Leave type updated successfully.");
            } else {
                // Add new leave type
                const { error } = await supabase.from("leave_type").insert({
                    name: values.name,
                    organization_id: organizationId,
                });

                if (error) throw error;
                message.success("Leave type added successfully.");
            }

            fetchLeaveTypes();
            setIsModalOpen(false);
        } catch (error) {
            message.error("Failed to save leave type.");
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
            <Button type="primary" onClick={handleAdd} style={{ marginBottom: 16 }}>
                Add Leave Type
            </Button>
            <Table
                dataSource={leaveTypes}
                columns={columns}
                rowKey="id"
                loading={loading}
            />
            <Modal
                title={editingRow ? "Edit Leave Type" : "Add Leave Type"}
                visible={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                >
                    <Form.Item
                        name="name"
                        label="Leave Type Name"
                        rules={[{ required: true, message: "Please enter the leave type name." }]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default LeaveTypes;
