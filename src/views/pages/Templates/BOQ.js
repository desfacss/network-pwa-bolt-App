import React, { useState } from 'react';
import { Table, InputNumber, Select, Input, Form, Button, Space, Popconfirm, message } from 'antd';
import { DeleteOutlined, EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';

const { Option } = Select;

const BillOfQuantity = ({ initialData }) => {
    const [data, setData] = useState(initialData.items);
    const [editingKey, setEditingKey] = useState('');
    const [form] = Form.useForm();

    const isEditing = (record) => record.sno === editingKey;

    const edit = (record) => {
        form.setFieldsValue({ ...record });
        setEditingKey(record.sno);
    };

    const save = async (key) => {
        try {
            const row = await form.validateFields();
            const newData = [...data];
            const index = newData.findIndex((item) => key === item.sno);

            if (index > -1) {
                newData.splice(index, 1, { ...newData[index], ...row });
                setData(newData);
                setEditingKey('');
            } else {
                newData.push(row);
                setData(newData);
                setEditingKey('');
            }
            message.success('Saved successfully!');

        } catch (errInfo) {
            console.log('Validate Failed:', errInfo);
        }
    };

    const cancel = (key) => {
        setEditingKey('');
        form.setFieldsValue(data.find(item => item.sno === key)); // Restore values
    };

    const handleDelete = (key) => {
        const newData = data.filter((item) => item.sno !== key);
        setData(newData);
        message.success('Deleted successfully!');
    };

    const columns = [
        {
            title: 'SNO',
            dataIndex: 'sno',
            key: 'sno',
            width: 60,
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            width: 100,
            render: (text, record) => {
                if (isEditing(record)) {
                    return (
                        <Form.Item name="category">
                            <Select defaultValue={text}>
                                <Option value="steel">Steel</Option>
                                <Option value="fabric">Fabric</Option>
                                <Option value="fixtures">Fixtures</Option>
                                {/* Add more categories as needed */}
                            </Select>
                        </Form.Item>
                    );
                } else {
                    return text;
                }
            },
        },
        {
            title: 'Material ID',
            dataIndex: 'material_id',
            key: 'material_id',
            width: 120,
            render: (text, record) => <Input disabled={!isEditing(record)} defaultValue={text} />,
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            width: 200,
            render: (text, record) => <Input disabled={!isEditing(record)} defaultValue={text} />,
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 80,
            render: (text, record) => (
                <Form.Item name="quantity">
                    <InputNumber min={0} disabled={!isEditing(record)} defaultValue={text} />
                </Form.Item>
            ),
        },
        {
            title: 'Unit',
            dataIndex: 'unit',
            key: 'unit',
            width: 80,
            render: (text, record) => <Input disabled={!isEditing(record)} defaultValue={text} />,
        },
        {
            title: 'Length',
            dataIndex: 'length',
            key: 'length',
            width: 80,
            render: (text, record) => (
                <Form.Item name="length">
                    <InputNumber min={0} disabled={!isEditing(record)} defaultValue={text} />
                </Form.Item>
            ),
        },
        {
            title: 'Weight',
            dataIndex: 'weight',
            key: 'weight',
            width: 80,
            render: (text, record) => (
                <Form.Item name="weight">
                    <InputNumber min={0} disabled={!isEditing(record)} defaultValue={text} />
                </Form.Item>
            ),
        },
        {
            title: 'Area',
            dataIndex: 'area',
            key: 'area',
            width: 80,
            render: (text, record) => (
                <Form.Item name="area">
                    <InputNumber min={0} disabled={!isEditing(record)} defaultValue={text} />
                </Form.Item>
            ),
        },

        {
            title: 'Action',
            key: 'action',
            render: (_, record) => {
                const editable = isEditing(record);
                return editable ? (
                    <Space>
                        <Button onClick={() => save(record.sno)} type="primary" icon={<SaveOutlined />} size="small" />
                        <Button onClick={() => cancel(record.sno)} icon={<CloseOutlined />} size="small" />
                    </Space>
                ) : (
                    <Space>
                        <Button onClick={() => edit(record)} icon={<EditOutlined />} size="small" />
                        <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record.sno)}>
                            <Button icon={<DeleteOutlined />} size="small" danger />
                        </Popconfirm>
                    </Space>
                );
            },
        },
    ];

    return (
        <Form form={form} component={false}>
            <Table
                components={{
                    body: {
                        cell: ({ children, dataIndex, record, ...rest }) => {
                            if (dataIndex === 'quantity' || dataIndex === 'length' || dataIndex === 'weight' || dataIndex === 'area') {
                                return <td {...rest}>{children}</td>; // Render InputNumber directly within <td>
                            }
                            return <td {...rest}>{children}</td>;
                        },
                    },
                }}
                bordered
                dataSource={data}
                columns={columns}
                rowKey="sno"
            />
        </Form>
    );
};


export default BillOfQuantity;