import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
    Button, Form, Input, message, Spin, Table, Switch, InputNumber, Space
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { supabase } from 'configs/SupabaseConfig';

const OrganizationProfileSettings = () => {
    const { session } = useSelector((state) => state.auth);
    const [organization, setOrganization] = useState(null);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchOrganization();
    }, []);

    const fetchOrganization = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('organizations')
                .select('*')
                .eq('id', "20e899a5-6261-40d9-8c9a-00666248d91a" || session.user.organization.id)
                .single();

            if (error) throw error;

            setOrganization(data);
            // Ensure the form is initialized with the full user_profile_settings
            form.setFieldsValue({ user_profile_settings: data.user_profile_settings });
            console.log('Form initialized with:', data.user_profile_settings); // Debug
        } catch (error) {
            message.error('Error fetching organization: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const onFinish = async (values) => {
        try {
            setLoading(true);
            const { error } = await supabase
                .from('organizations')
                .update({ user_profile_settings: values.user_profile_settings })
                .eq('id', session.user.organization.id);

            if (error) throw error;

            message.success('Profile settings updated successfully');
        } catch (error) {
            message.error('Error updating settings: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Columns for Groups Table
    const groupColumns = [
        {
            title: 'Name',
            dataIndex: 'name',
            render: (_, record) => (
                <Form.Item
                    name={['user_profile_settings', 'groups', record.key, 'name']}
                    noStyle
                    rules={[{ required: true, message: 'Name is required' }]}
                >
                    <Input style={{ width: 120 }} placeholder="Name" />
                </Form.Item>
            ),
        },
        {
            title: 'Order',
            dataIndex: 'order',
            render: (_, record) => (
                <Form.Item
                    name={['user_profile_settings', 'groups', record.key, 'order']}
                    noStyle
                    rules={[{ required: true, message: 'Order is required' }]}
                >
                    <InputNumber min={1} style={{ width: 60 }} placeholder="Order" />
                </Form.Item>
            ),
        },
        {
            title: 'Private',
            dataIndex: 'private',
            render: (_, record) => (
                <Form.Item
                    name={['user_profile_settings', 'groups', record.key, 'private']}
                    valuePropName="checked"
                    noStyle
                >
                    <Switch size="small" />
                </Form.Item>
            ),
        },
        {
            title: 'Show Name',
            dataIndex: 'show_group_name',
            render: (_, record) => (
                <Form.Item
                    name={['user_profile_settings', 'groups', record.key, 'show_group_name']}
                    valuePropName="checked"
                    noStyle
                >
                    <Switch size="small" />
                </Form.Item>
            ),
        },
        {
            title: 'Privacy Ctrl',
            dataIndex: 'privacy_control',
            render: (_, record) => (
                <Form.Item
                    name={['user_profile_settings', 'groups', record.key, 'privacy_control']}
                    valuePropName="checked"
                    noStyle
                >
                    <Switch size="small" />
                </Form.Item>
            ),
        },
        {
            title: 'Actions',
            render: (_, record) => (
                <Form.List name={['user_profile_settings', 'groups']}>
                    {(_, { remove }) => (
                        <Button
                            icon={<DeleteOutlined />}
                            size="small"
                            danger
                            onClick={() => remove(record.key)}
                        />
                    )}
                </Form.List>
            ),
        },
    ];

    // Columns for Fields Table
    const fieldColumns = [
        {
            title: 'Label',
            dataIndex: 'label',
            render: (_, record) => (
                <Form.Item
                    name={['fields', record.key, 'label']}
                    noStyle
                    rules={[{ required: true, message: 'Label is required' }]}
                >
                    <Input style={{ width: 100 }} placeholder="Label" />
                </Form.Item>
            ),
        },
        {
            title: 'Order',
            dataIndex: 'order',
            render: (_, record) => (
                <Form.Item
                    name={['fields', record.key, 'order']}
                    noStyle
                    rules={[{ required: true, message: 'Order is required' }]}
                >
                    <InputNumber min={1} style={{ width: 60 }} placeholder="Order" />
                </Form.Item>
            ),
        },
        {
            title: 'Value',
            dataIndex: 'value',
            render: (_, record) => (
                <Form.Item
                    name={['fields', record.key, 'value']}
                    noStyle
                    rules={[{ required: true, message: 'Value is required' }]}
                >
                    <Input style={{ width: 100 }} placeholder="Value" />
                </Form.Item>
            ),
        },
        {
            title: 'Path',
            dataIndex: 'path',
            render: (_, record) => (
                <Form.Item name={['fields', record.key, 'path']} noStyle>
                    <Input style={{ width: 120 }} placeholder="Path" />
                </Form.Item>
            ),
        },
        {
            title: 'Actions',
            render: (_, record, groupIndex) => (
                <Form.List name={['user_profile_settings', 'groups', groupIndex, 'fields']}>
                    {(_, { remove }) => (
                        <Button
                            icon={<DeleteOutlined />}
                            size="small"
                            danger
                            onClick={() => remove(record.key)}
                        />
                    )}
                </Form.List>
            ),
        },
    ];

    // Columns for Dividers Table
    const dividerColumns = [
        {
            title: 'Divider',
            dataIndex: 'divider',
            render: (_, record) => (
                <Form.Item
                    name={['user_profile_settings', 'dividers', record.key]}
                    noStyle
                    rules={[{ required: true, message: 'Divider is required' }]}
                >
                    <Input style={{ width: 200 }} placeholder="Divider" />
                </Form.Item>
            ),
        },
        {
            title: 'Actions',
            render: (_, record) => (
                <Form.List name={['user_profile_settings', 'dividers']}>
                    {(_, { remove }) => (
                        <Button
                            icon={<DeleteOutlined />}
                            size="small"
                            danger
                            onClick={() => remove(record.key)}
                        />
                    )}
                </Form.List>
            ),
        },
    ];

    if (loading && !organization) return <Spin tip="Loading..." />;
    if (!organization) return <div>No data found</div>;

    return (
        <div style={{ padding: 16 }}>
            <h3 style={{ marginBottom: 16 }}>Profile Settings</h3>
            <Form
                form={form}
                onFinish={onFinish}
                initialValues={{ user_profile_settings: organization.user_profile_settings }}
            >
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Form.Item label="Organization Name">
                        <Input value={organization.name} disabled style={{ width: 200 }} />
                    </Form.Item>

                    {/* Groups Table */}
                    <Form.List name={['user_profile_settings', 'groups']}>
                        {(fields, { add }) => (
                            <Table
                                columns={groupColumns}
                                dataSource={fields.map((field) => ({
                                    key: field.name, // Unique key from Form.List
                                    name: field.name, // This ensures the field is recognized
                                }))}
                                expandable={{
                                    expandedRowRender: (record, groupIndex) => (
                                        <Form.List name={['user_profile_settings', 'groups', groupIndex, 'fields']}>
                                            {(subFields, { add: addField }) => (
                                                <Table
                                                    columns={fieldColumns.map(col => ({
                                                        ...col,
                                                        render: col.render ? (text, rec) => col.render(text, rec, groupIndex) : undefined,
                                                    }))}
                                                    dataSource={subFields.map((subField) => ({
                                                        key: subField.name, // Unique key from Form.List
                                                    }))}
                                                    pagination={false}
                                                    size="small"
                                                    footer={() => (
                                                        <Button
                                                            icon={<PlusOutlined />}
                                                            size="small"
                                                            onClick={() => addField()}
                                                        />
                                                    )}
                                                />
                                            )}
                                        </Form.List>
                                    ),
                                }}
                                pagination={false}
                                size="small"
                                footer={() => (
                                    <Button
                                        icon={<PlusOutlined />}
                                        size="small"
                                        onClick={() => add()}
                                    />
                                )}
                            />
                        )}
                    </Form.List>

                    {/* Dividers Table */}
                    <Form.List name={['user_profile_settings', 'dividers']}>
                        {(fields, { add }) => (
                            <Table
                                columns={dividerColumns}
                                dataSource={fields.map((field) => ({
                                    key: field.name, // Unique key from Form.List
                                }))}
                                pagination={false}
                                size="small"
                                footer={() => (
                                    <Button
                                        icon={<PlusOutlined />}
                                        size="small"
                                        onClick={() => add()}
                                    />
                                )}
                            />
                        )}
                    </Form.List>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} icon={<PlusOutlined />}>
                            Save
                        </Button>
                    </Form.Item>
                </Space>
            </Form>
        </div>
    );
};

export default OrganizationProfileSettings;