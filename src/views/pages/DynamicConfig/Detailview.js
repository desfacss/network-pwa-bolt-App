import React, { useEffect } from 'react';
import { Table, Button, Form, Space, Input } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { supabase } from 'api/supabaseClient';
import { Select } from 'antd';

const { Option } = Select;

const ConfigEditor = ({ detailView, entityType }) => {
    const [form] = Form.useForm();

    // Predefined static tab options
    const staticTabOptions = ["files", "notes", "status"];

    useEffect(() => {
        form.setFieldsValue({
            staticTabs: detailView.staticTabs || [],
            dynamicTabs: detailView.dynamicTabs || []
        });
    }, [detailView, form]);

    const columnsStatic = [
        {
            title: 'Tab',
            dataIndex: 'tab',
            key: 'tab',
            render: (_, record, index) => (
                <Form.Item
                    name={[index, 'tab']}
                    rules={[{ required: true, message: 'Please select a tab!' }]}
                >
                    <Select placeholder="Select tab">
                        {staticTabOptions.map(option => (
                            <Option key={option} value={option}>{option}</Option>
                        ))}
                    </Select>
                </Form.Item>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record, index) => (
                <Button
                    onClick={() => {
                        const staticTabs = form.getFieldValue('staticTabs');
                        staticTabs.splice(index, 1);
                        form.setFieldsValue({ staticTabs });
                    }}
                    icon={<DeleteOutlined />}
                    danger
                />
            ),
        },
    ];

    const columnsDynamic = [
        {
            title: 'Label',
            dataIndex: 'label',
            key: 'label',
            render: (_, record, index) => (
                <Form.Item
                    name={[index, 'label']}
                    rules={[{ required: true, message: 'Please input the label!' }]}
                >
                    <Input placeholder="Label" />
                </Form.Item>
            ),
        },
        {
            title: 'Entity Type',
            dataIndex: ['props', 'entityType'],
            key: 'entityType',
            render: (_, record, index) => (
                <Form.Item
                    name={[index, 'props', 'entityType']}
                    rules={[{ required: true, message: 'Please input the entity type!' }]}
                >
                    <Input placeholder="Entity Type" />
                </Form.Item>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record, index) => (
                <Button
                    onClick={() => {
                        const dynamicTabs = form.getFieldValue('dynamicTabs');
                        dynamicTabs.splice(index, 1);
                        form.setFieldsValue({ dynamicTabs });
                    }}
                    icon={<DeleteOutlined />}
                    danger
                />
            ),
        },
    ];

    const handleAddStatic = () => {
        const staticTabs = form.getFieldValue('staticTabs') || [];
        form.setFieldsValue({ staticTabs: [...staticTabs, ''] });
    };

    const handleAddDynamic = () => {
        const dynamicTabs = form.getFieldValue('dynamicTabs') || [];
        form.setFieldsValue({ dynamicTabs: [...dynamicTabs, { label: '', props: { entityType: '' } }] });
    };

    const onFinish = async (values) => {
        console.log("nn", entityType);
        try {
            const { data, error } = await supabase.from('y_view_config')
                .update({
                    detailview: {
                        staticTabs: values.staticTabs,
                        dynamicTabs: values.dynamicTabs
                    }
                })
                .eq('entity_type', entityType).select('*');

            if (error) throw error;
            console.log('Config saved successfully!', data);
        } catch (error) {
            console.error('Error saving config:', error.message);
        }
    };

    return (
        <Form form={form} onFinish={onFinish}>
            <h3>Static Tabs</h3>
            <Form.List name="staticTabs">
                {(fields, { add, remove }) => (
                    <>
                        <Table
                            columns={columnsStatic}
                            dataSource={fields.map((field, index) => ({ ...field, key: `static-${index}` }))}
                            pagination={false}
                        />
                        <Button onClick={handleAddStatic} icon={<PlusOutlined />} style={{ marginBottom: 16 }}>Add Static Tab</Button>
                    </>
                )}
            </Form.List>

            <h3>Dynamic Tabs</h3>
            <Form.List name="dynamicTabs">
                {(fields, { add, remove }) => (
                    <>
                        <Table
                            columns={columnsDynamic}
                            dataSource={fields.map((field, index) => ({ ...field, key: `dynamic-${index}` }))}
                            pagination={false}
                        />
                        <Button onClick={handleAddDynamic} icon={<PlusOutlined />} style={{ marginBottom: 16 }}>Add Dynamic Tab</Button>
                    </>
                )}
            </Form.List>

            <Form.Item>
                <Button type="primary" htmlType="submit">Save Configuration</Button>
            </Form.Item>
        </Form>
    );
};

export default ConfigEditor;