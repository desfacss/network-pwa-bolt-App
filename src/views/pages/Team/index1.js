import React, { useRef, useState, useEffect } from 'react';
import { Form, Card, Drawer, notification, message } from 'antd';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { supabase } from 'configs/SupabaseConfig';
import DynamicForm from '../DynamicForm';

const Services = () => {
    const componentRef = useRef(null);
    const [services, setServices] = useState([]);
    const [editItem, setEditItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [schema, setSchema] = useState();
    const [viewMode, setViewMode] = useState('card'); // Toggle between 'card' and 'list' view

    const { session } = useSelector((state) => state.auth);

    const [form] = Form.useForm();

    const getForms = async (formName = "invite_users_form") => {
        const { data, error } = await supabase
            .from('forms')
            .select('*')
            .eq('name', formName)
            .single();
        if (data) {
            setSchema(data);
        }
    };

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
        const {
            email,
            mobile,
            firstName,
            lastName,
            role_type,
            manager,
            hr_contact
        } = values;

        const userName = `${firstName} ${lastName}`;

        try {
            if (editItem) {
                // Update existing user
                const payload = {
                    role_type,
                    details: {
                        ...editItem.details, // retain existing details
                        email,
                        mobile,
                        firstName,
                        lastName,
                        role_type,
                        userName,
                    },
                    is_manager: role_type === 'manager',
                    manager_id: manager,
                    hr_id: hr_contact,
                };

                const { error: updateError } = await supabase
                    .from('users')
                    .update(payload)
                    .eq('id', editItem.id);

                if (updateError) {
                    throw updateError;
                }

                message.success("User updated successfully!");
            } else {
                // Step 1: Check if the user already exists
                const { data: existingUser, error: checkError } = await supabase
                    .from('users')
                    .select('id')
                    .eq('details->>email', email);

                if (checkError && checkError.code !== 'PGRST116') {
                    throw checkError;
                }

                if (existingUser?.length > 0) {
                    message.warning("User with this email already exists.");
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

                const { error: insertError } = await supabase.from('users').insert([payload]);

                if (insertError) {
                    throw insertError;
                }

                message.success("User invited and added successfully!");
            }
        } catch (error) {
            message.error(error.message || "An error occurred.");
        } finally {
            fetchServices();
            setIsModalOpen(false);
            form.resetFields();
            setEditItem(null);
        }
    };

    const handleEdit = (record) => {
        setEditItem(record);
        getForms("edit_users_form"); // Load the edit form schema
        form.setFieldsValue({
            firstName: record.details.firstName,
            lastName: record.details.lastName,
            email: record.details.email,
            mobile: record.details.mobile,
            role_type: record.details.role_type,
        });
        setIsModalOpen(true);
    };

    // ... rest of your component

    return (
        <Card bodyStyle={{ padding: "0px" }}>
            {/* Rest of the component code */}
            <Drawer
                width={600}
                footer={null}
                title={editItem ? "Edit User Details" : "Invite User"}
                open={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditItem(null);
                }}
                onOk={() => form.submit()}
                okText="Save"
            >
                <DynamicForm
                    schemas={schema}
                    onFinish={handleAddOrEdit}
                    formData={editItem && editItem.details}
                />
            </Drawer>
        </Card>
    );
};

export default Services;
