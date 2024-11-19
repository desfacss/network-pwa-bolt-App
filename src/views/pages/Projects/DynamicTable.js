import React, { useState } from 'react';
import { Table, Form, Input, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const EditableTable = ({ columns, dataSource, onAdd, onDelete }) => {
    return (
        <Table size={'small'}
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            rowKey="id" // Use a unique key
            components={{
                body: {
                    cell: 'EditableCell', // You'll need to implement this if you want inline editing
                },
            }}
            rowClassName="editable-row"
            onRow={(record, index) => ({
                index,
                onClick: () => {
                    // Add your row click logic if needed
                },
            })}
        />
    );
};

const DynamicTable = ({ schema }) => {
    const [form] = Form.useForm();
    const [projectUsers, setProjectUsers] = useState([]);

    const handleAddOrEdit = (values) => {
        // Handle form submission here
        console.log(values);
    };

    const addUser = () => {
        setProjectUsers([...projectUsers, { id: Date.now(), emp_name: '', start_date: '', end_date: '', hours: '', resource_cost: '', rate_model: '', allocation_status: '' }]);
    };

    const userColumns = schema?.properties?.allocation?.items?.properties?.map((field) => ({
        title: field.title,
        dataIndex: field.key,
        render: (text, record, index) => (
            <Input
                value={text}
                onChange={(e) => {
                    const newUsers = [...projectUsers];
                    newUsers[index][field.key] = e.target.value;
                    setProjectUsers(newUsers);
                }}
            />
        ),
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
                onDelete={null} // Implement delete logic if necessary
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

export default DynamicTable;
