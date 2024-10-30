import React, { useEffect, useState } from 'react';
import { Table, Form, Input, Button, Select, DatePicker, Checkbox } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { supabase } from 'configs/SupabaseConfig';


const dateFormat = 'YYYY/MM/DD';

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

const ProjectForm = ({ schema }) => {
    const [form] = Form.useForm();
    const [projectUsers, setProjectUsers] = useState([]);
    const [users, setUsers] = useState([]);

    const handleAddOrEdit = (values) => {
        // Handle form submission here
        console.log(values);
    };

    useEffect(() => {
        const fetchUsers = async () => {
            const { data, error } = await supabase.from('users').select('id, user_name');
            if (error) {
                console.error('Error fetching users:', error);
            } else {
                console.log("US", data)
                setUsers(data || []);
            }
        };
        fetchUsers();
    }, []);

    const handleUserChange = (index, key, value) => {
        const newUsers = [...projectUsers];
        newUsers[index][key] = value;
        setProjectUsers(newUsers);
    };

    const removeUser = (index) => {
        const newUsers = projectUsers.filter((_, i) => i !== index);
        setProjectUsers(newUsers);
    };

    const addUser = () => {
        setProjectUsers([...projectUsers, { id: Date.now(), emp_name: '', start_date: '', end_date: '', hours: '', resource_cost: '', rate_model: '', allocation_status: '' }]);
    };

    // Function to determine the appropriate input component
    const getInputComponent = (fieldType, value, onChange) => {
        switch (fieldType) {
            case 'text':
                return <Input value={value} onChange={onChange} />;
            case 'number':
                return <Input type="number" value={value} onChange={onChange} />;
            case 'select':
                return (
                    <Select value={value} onChange={onChange}>
                        {users.map((user) => (
                            <Select.Option key={user.id} value={user.id}>
                                {user.user_name}
                            </Select.Option>
                        ))}
                    </Select>
                );
            case 'date':
                return <DatePicker style={{ width: '100%' }} value={value ? dayjs(value, dateFormat) : null} onChange={onChange} />;
            case 'checkbox':
                return <Checkbox checked={value} onChange={onChange} />;
            default:
                return <Input value={value} onChange={onChange} />;
        }
    };

    // Modify userColumns to use getInputComponent function
    const userColumns = [
        {
            title: 'User ID',
            dataIndex: 'user_id',
            render: (text, record, index) => (
                getInputComponent('select', text, (value) => handleUserChange(index, 'user_id', value))
            ),
        },
        {
            title: 'Expensed Hours',
            dataIndex: 'expensed_hours',
            render: (text, record, index) => (
                getInputComponent('number', text, (e) => handleUserChange(index, 'expensed_hours', e.target.value))
            ),
        },
        {
            title: 'Allocated Hours',
            dataIndex: 'allocated_hours',
            render: (text, record, index) => (
                getInputComponent('number', text, (e) => handleUserChange(index, 'allocated_hours', e.target.value))
            ),
        },
        {
            title: 'Start Date',
            dataIndex: 'start_date',
            render: (text, record, index) => (
                getInputComponent('date', text, (date) => handleUserChange(index, 'start_date', date?.format(dateFormat)))
            ),
        },
        {
            title: 'End Date',
            dataIndex: 'end_date',
            render: (text, record, index) => (
                getInputComponent('date', text, (date) => handleUserChange(index, 'end_date', date?.format(dateFormat)))
            ),
        },
        {
            title: 'Actions',
            render: (_, __, index) => (
                <Button
                    type="link"
                    danger
                    onClick={() => removeUser(index)}
                >
                    Remove
                </Button>
            ),
        },
    ];


    // const userColumns = Object.entries(schema?.properties?.allocation?.items?.properties)?.map(([key, field]) => ({
    //     title: field?.title,
    //     dataIndex: key,
    //     render: (text, record, index) => {
    //         switch (field?.type) {
    //             case 'string':
    //                 return (
    //                     <Input
    //                         value={record[key]}
    //                         onChange={(e) => {
    //                             const newUsers = [...projectUsers];
    //                             newUsers[index][key] = e.target.value;
    //                             setProjectUsers(newUsers);
    //                         }}
    //                     />
    //                 );
    //             case 'number':
    //                 return (
    //                     <Input
    //                         type="number"
    //                         value={record[key]}
    //                         onChange={(e) => {
    //                             const newUsers = [...projectUsers];
    //                             newUsers[index][key] = e.target.value;
    //                             setProjectUsers(newUsers);
    //                         }}
    //                     />
    //                 );
    //             case 'object':
    //                 if (field.enum) { // Assuming enums are defined for selects
    //                     return (
    //                         <Select
    //                             value={record[key]}
    //                             onChange={(value) => {
    //                                 const newUsers = [...projectUsers];
    //                                 newUsers[index][key] = value;
    //                                 setProjectUsers(newUsers);
    //                             }}
    //                         >
    //                             {field.enum.map(option => (
    //                                 <Option key={option} value={option}>{option}</Option>
    //                             ))}
    //                         </Select>
    //                     );
    //                 }
    //                 return null; // Handle other object types if needed
    //             case 'array':
    //                 return null; // Handle nested arrays if necessary
    //             default:
    //                 return null;
    //         }
    //     },
    // }));

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
