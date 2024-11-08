import React, { useState } from 'react';
import { Table, Form, Input, Button, Select, DatePicker } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Option } = Select;

const EditableTable = ({ columns, dataSource, onAdd }) => {
    return (
        <Table
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            rowKey="id" // Use a unique key for each row
        />
    );
};

const ProjectForm = ({ schema = { properties: {} } }) => {
    const [form] = Form.useForm();
    const [projectUsers, setProjectUsers] = useState([]);

    const handleAddOrEdit = (values) => {
        // Handle form submission here
        console.log(values);
    };

    const addUser = () => {
        setProjectUsers([...projectUsers, { id: Date.now(), emp_name: '', start_date: '', end_date: '', hours: '', resource_cost: '', rate_model: '', allocation_status: '' }]);
    };

    const userColumns = Object.entries(schema?.properties?.allocation?.items?.properties)?.map(([key, field]) => ({
        title: field?.title,
        dataIndex: key,
        render: (text, record, index) => {
            switch (field?.type) {
                case 'string':
                    return (
                        <Input
                            value={record[key]}
                            onChange={(e) => {
                                const newUsers = [...projectUsers];
                                newUsers[index][key] = e.target.value;
                                setProjectUsers(newUsers);
                            }}
                        />
                    );
                case 'number':
                    return (
                        <Input
                            type="number"
                            value={record[key]}
                            onChange={(e) => {
                                const newUsers = [...projectUsers];
                                newUsers[index][key] = e.target.value;
                                setProjectUsers(newUsers);
                            }}
                        />
                    );
                case 'object':
                    if (field.enum) { // Assuming enums are defined for selects
                        return (
                            <Select
                                value={record[key]}
                                onChange={(value) => {
                                    const newUsers = [...projectUsers];
                                    newUsers[index][key] = value;
                                    setProjectUsers(newUsers);
                                }}
                            >
                                {field.enum.map(option => (
                                    <Option key={option} value={option}>{option}</Option>
                                ))}
                            </Select>
                        );
                    }
                    return null; // Handle other object types if needed
                case 'array':
                    return null; // Handle nested arrays if necessary
                default:
                    return null;
            }
        },
    }));

    return (
        <Form form={form} layout="vertical" onFinish={handleAddOrEdit}>
            <Form.Item name="project_name" label="Project Name" rules={[{ required: true }]}>
                <Input />
            </Form.Item>
            <Form.Item name="description" label="Description">
                <Input.TextArea />
            </Form.Item>
            <h3>Project Users</h3>
            <EditableTable
                columns={userColumns}
                dataSource={projectUsers}
                onAdd={addUser}
            />
            <Button type="dashed" onClick={addUser} style={{ width: '100%', marginTop: 16 }}>
                <PlusOutlined /> Add User
            </Button>
            <Form.Item>
                <Button type="primary" htmlType="submit" style={{ marginTop: "16px" }}>
                    {/* {editItem ? "Update Project" : "Add Project"} */}
                </Button>
            </Form.Item>
        </Form>
    );
};

export default ProjectForm;
