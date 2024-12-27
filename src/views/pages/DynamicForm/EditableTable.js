// #EditableTable.js
import React, { useState, useEffect } from 'react';
import { Table, Input, InputNumber, Select, DatePicker, Button } from 'antd';
import { supabase } from 'configs/SupabaseConfig';
import dayjs from 'dayjs';

const EditableTable = ({ value = [], onChange, schema, formContext }) => {
    const { fullSchema, formData } = formContext;

    console.log("Full Schema:", fullSchema); // Logs the entire schema object
    console.log("Form Data:", formData);
    const [data, setData] = useState([]);
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const dateFormat = 'DD/MM/YYYY';

    // Fetch projects and users from Supabase
    useEffect(() => {
        const fetchData = async () => {
            const { data: projectsData, error: projectsError } = await supabase
                .from('projects')
                .select('id, project_name');
            if (projectsError) {
                console.error(projectsError);
            } else {
                setProjects(projectsData);
            }

            const { data: usersData, error: usersError } = await supabase
                .from('users')
                .select('id, user_name');
            if (usersError) {
                console.error(usersError);
            } else {
                setUsers(usersData);
            }
        };

        fetchData();
    }, []);

    const handleUserChange = (index, field, value) => {
        const newData = [...data];
        // Ensure user_id is treated as a string
        newData[index][field] = String(value);  // Explicitly convert to string
        setData(newData);
        onChange(newData); // Communicate changes to the parent
    };

    const showUserDeleteConfirm = (index, record) => {
        const newData = data?.filter((item) => item?.key !== record?.key);
        setData(newData);
        onChange(newData); // Communicate changes to the parent
    };

    const generateColumns = () => {
        return schema?.items?.map((item) => {
            const { title, field, type } = item;

            switch (type) {
                case 'string':
                    if (field === 'user_id' || field === 'project_id') {
                        return {
                            title,
                            dataIndex: field,
                            render: (text, record, index) => (
                                <Select
                                    placeholder={`Select ${title}`}
                                    style={{ minWidth: '120px', width: '100%' }}
                                    value={String(text)} // Ensure the value is treated as a string
                                    onChange={(value) => handleUserChange(index, field, value)}
                                >
                                    {(field === 'user_id' ? users : projects)?.map((item) => (
                                        <Select.Option key={item.id} value={String(item.id)}> {/* Convert to string */}
                                            {field === 'user_id' ? item.user_name : item.project_name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            ),
                        };
                    }
                    return {
                        title,
                        dataIndex: field,
                        render: (text, record, index) => (
                            <Input
                                value={String(text)} // Ensure the input value is treated as a string
                                onChange={(e) => handleUserChange(index, field, e.target.value)}
                            />
                        ),
                    };

                case 'number':
                    if (field === 'expensed_hours') {
                        return {
                            title,
                            dataIndex: field,
                            render: (text) => <Input value={String(text)} disabled />, // Ensure number is treated as string
                        };
                    }
                    return {
                        title,
                        dataIndex: field,
                        render: (text, record, index) => (
                            <InputNumber
                                value={text}
                                style={{ width: '100%' }}
                                onChange={(value) => handleUserChange(index, field, value)}
                            />
                        ),
                    };

                default:
                    return null;
            }
        }).concat([
            {
                title: 'Actions',
                key: 'actions',
                render: (text, record, index) => (
                    <Button danger onClick={() => showUserDeleteConfirm(index, record)}>
                        X
                    </Button>
                ),
            }
        ]);
    };

    const addRow = () => {
        const newRow = {
            key: `new-${Date.now()}`,
            userId: String(users[0]?.id), // Ensure the default user_id is a string
            projectId: String(projects[0]?.id), // Ensure the default project_id is a string
            time: 0,
        };
        setData([...data, newRow]);
        onChange([...data, newRow]); // Communicate changes to the parent
    };

    return (
        <div>
            <Button type="primary" onClick={addRow} style={{ marginBottom: 16 }}>
                Add Row
            </Button>
            {/* Conditionally render User or Project Select based on schema */}
            {schema?.viewBy === "users" && (
                <Select placeholder="Select User" style={{ width: '200px', marginBottom: '16px' }}>
                    {users?.map((user) => (
                        <Select.Option key={user.id} value={String(user.id)}> {/* Convert to string */}
                            {user.user_name}
                        </Select.Option>
                    ))}
                </Select>
            )}
            {schema?.viewBy === "projects" && (
                <Select placeholder="Select Project" style={{ width: '200px', marginBottom: '16px' }}>
                    {projects?.map((project) => (
                        <Select.Option key={project.id} value={String(project.id)}> {/* Convert to string */}
                            {project.project_name}
                        </Select.Option>
                    ))}
                </Select>
            )}
            <Table
                bordered
                dataSource={data}
                columns={generateColumns()}
                rowClassName="editable-row"
                pagination={false}
                style={{ marginTop: '20px' }}
            />
        </div>
    );
};

export default EditableTable;
