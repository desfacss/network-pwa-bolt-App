import { Button, Card, notification, Table, Drawer, Form, Input, Select, Checkbox, DatePicker, InputNumber, Modal, Tooltip, Empty } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { PlusOutlined, EditFilled, DeleteOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import { supabase } from "configs/SupabaseConfig";
import { useSelector } from "react-redux";
import dayjs from 'dayjs';
import DynamicTable from "./DynamicTable";
import ProjectForm from "./DynamicTable3";
import App from "./A";
// import App from "./CustomTemplate";
// import DynamicForm from "../DynamicForm";
const { confirm } = Modal;


const { Option } = Select;

const Project = () => {
    const componentRef = useRef(null);
    const [projects, setProjects] = useState([]);
    const [editItem, setEditItem] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isInvalid, setIsInvalid] = useState(false);
    const [projectUsers, setProjectUsers] = useState([]);
    const [users, setUsers] = useState([]);
    const [clients, setClients] = useState([]);
    const dateFormat = 'YYYY/MM/DD';
    const dateFormatList = ['DD/MM/YYYY', 'DD/MM/YY', 'DD-MM-YYYY', 'DD-MM-YY'];
    // const [schema, setSchema] = useState();

    const getFormattedDate = (date) => {
        return date.toISOString().split('T')[0];
    };

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const formattedToday = getFormattedDate(today);  // "2024-11-12"
    const formattedTomorrow = getFormattedDate(tomorrow);  // "2024-11-13"

    const { session } = useSelector((state) => state.auth);
    const [form] = Form.useForm();


    // const getForms = async () => {
    //     const { data, error } = await supabase.from('forms').select('*').eq('name', "x_project_form_array").single()
    //     console.log("A", data)
    //     if (data) {
    //         console.log(data)
    //         setSchema(data)
    //     }
    // }

    // useEffect(() => {
    //     getForms()
    // }, []);

    useEffect(() => {
        const fetchUsers = async () => {
            const { data, error } = await supabase.from('users').select('id, user_name,role_type,details');
            if (error) {
                console.error('Error fetching users:', error);
            } else {
                console.log("Users", data)
                setUsers(data || []);
            }
        };
        const fetchClients = async () => {
            const { data, error } = await supabase.from('clients').select('id, name').neq('default', true);
            if (error) {
                console.error('Error fetching users:', error);
            } else {
                console.log("US", data)
                setClients(data || []);
            }
        };
        fetchClients();
        fetchUsers();
    }, []);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        let { data, error } = await supabase.from('x_projects').select('*').neq('is_non_project', true);
        if (data) {
            setProjects(data);
        }
        if (error) {
            notification.error({ message: error?.message || "Failed to fetch projects" });
        }
    };

    const handleAddOrEdit = async (values) => {
        setIsInvalid(false);

        const isValid = validateData(projectUsers);
        if (!isValid) {
            setIsInvalid(true);
            return;
        }

        const projectData = {
            details: {
                ...values,
                start_date: values?.start_date.format(dateFormat),
                end_date: values?.end_date.format(dateFormat),
                project_users: projectUsers
            },
            allocation_tracking: true,
            is_non_project: false,
            status: values?.status,
            is_closed: values?.status === 'Completed' || values?.status === 'Cancelled',
            project_users: projectUsers?.map(item => item?.user_id),
            project_name: values?.project_name,
            client_id: values?.client_id,
            hrpartner_id: values?.hrpartner_id,
            manager_id: values?.manager_id
        };

        const { data, error } = editItem
            ? await supabase.from('x_projects').update(projectData).eq('id', editItem?.id)
            : await supabase.from('x_projects').insert([projectData]);

        if (error) {
            notification.error({ message: error?.message || editItem ? "Failed to update project" : "Failed to add project" });
        } else {
            notification.success({ message: editItem ? "Project updated successfully" : "Project added successfully" });
            fetchProjects();
        }

        setIsDrawerOpen(false);
        form.resetFields();
        setProjectUsers([]);
        setEditItem(null);
    };


    // const handleAddOrEdit = async (values) => {
    //     setIsInvalid(false)
    //     console.log("PU", projectUsers)
    //     const validData = validateData(projectUsers)
    //     if (!validData) {
    //         setIsInvalid(true)
    //         return
    //     }
    //     const updatedDetails = {
    //         ...values,
    //         start_date: values?.start_date?.format(dateFormat),
    //         end_date: values?.end_date?.format(dateFormat),
    //         project_users: projectUsers
    //     };
    //     console.log(updatedDetails);
    //     if (editItem) {
    //         const { data, error } = await supabase
    //             .from('x_projects')
    //             .update({ details: updatedDetails, allocation_tracking: true, is_non_project: false, status: values?.status, project_users: projectUsers?.map(item => item?.user_id), project_name: values?.project_name, client_id: updatedDetails?.client_id, hrpartner_id: values?.hrpartner_id, manager_id: values?.manager_id })
    //             .eq('id', editItem.id);

    //         if (data) {
    //             notification.success({ message: "Project updated successfully" });
    //             setEditItem(null);
    //         } else if (error) {
    //             notification.error({ message: "Failed to update project" });
    //         }
    //         console.log("Resp", supabase, data, error)
    //     } else {
    //         const { data, error } = await supabase
    //             .from('x_projects')
    //             .insert([{ details: updatedDetails, allocation_tracking: true, is_non_project: false, status: values?.status, project_users: projectUsers?.map(item => item?.user_id), project_name: values?.project_name, client_id: updatedDetails?.client_id, hrpartner_id: values?.hrpartner_id, manager_id: values?.manager_id }]);

    //         if (data) {
    //             notification.success({ message: "Project added successfully" });
    //         } else if (error) {
    //             notification.error({ message: "Failed to add project" });
    //         }
    //         console.log("Resp", supabase, data, error)
    //     }
    //     fetchProjects();
    //     setIsDrawerOpen(false);
    //     form.resetFields();
    //     setProjectUsers()
    //     setEditItem(null);
    // };

    const handleEdit = (record) => {
        setEditItem(record);
        form.setFieldsValue({
            project_name: record?.details?.project_name,
            description: record?.details?.description,
            project_hours: record?.details?.project_hours,
            is_closed: record?.details?.is_closed,
            status: record?.details?.status,
            hrpartner_id: record?.details?.hrpartner_id,
            client_id: record?.details?.client_id,
            manager_id: record?.details?.manager_id,
            start_date: dayjs(record?.details?.start_date, dateFormat),
            end_date: dayjs(record?.details?.end_date, dateFormat),
        });
        setProjectUsers(record.details.project_users || []);
        setIsDrawerOpen(true);
    };

    const handleUserChange = (index, field, value) => {
        console.log("PD", projectUsers)
        setIsInvalid(false)
        const updatedUsers = [...projectUsers];
        updatedUsers[index][field] = value;

        if (field === "user_id") {
            const selectedUser = users.find(user => user.id === value);
            if (selectedUser && selectedUser.details?.rate) {
                updatedUsers[index].rate = selectedUser.details.rate;
            } else {
                updatedUsers[index].rate = "0"; // Default rate if not found
            }
        }

        setProjectUsers(updatedUsers);
    };

    const addUser = () => {
        const formStartDate = form.getFieldValue('start_date')?.format(dateFormat);
        const formEndDate = form.getFieldValue('end_date')?.format(dateFormat);
        setProjectUsers([...projectUsers || [], { user_id: "", expensed_hours: "0", allocated_hours: "", start_date: formStartDate || formattedToday, end_date: formEndDate || formattedTomorrow, rate: '0' }]);
    };

    const removeUser = (index) => {
        const updatedUsers = projectUsers?.filter((_, i) => i !== index);
        setProjectUsers(updatedUsers);
    };

    function validateData(data) {
        const requiredFields = ['user_id', 'allocated_hours', 'start_date', 'end_date', 'rate'];
        const errors = [];
        console.log("users", data)
        data?.forEach((item, index) => {
            // Check and update expensed_hours if empty
            if (item.expensed_hours === "") {
                item.expensed_hours = "0";
            }
            requiredFields?.forEach(field => {
                if (!item[field]) {
                    errors.push(`Error: Field "${field}" is missing or empty in record ${index + 1}`);
                }
            });

        });

        // if (errors.length > 0) {
        //     console.log(errors.join('\n'));
        // } else {
        //     console.log('Data is valid.');
        // }

        return !(errors.length > 0);
    }

    const showDeleteConfirm = async (record) => {
        confirm({
            title: `Are you sure delete  - ${record.project_name} ?`,
            icon: <ExclamationCircleFilled />,
            //   content: 'Some descriptions',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                const { error } = await supabase.from('x_projects').delete().eq('id', record?.id);
                if (!error) {
                    notification.success({ message: "Project deleted successfully" });
                    fetchProjects();
                } else {
                    notification.error({ message: error?.message || "Failed to delete Project" });
                }
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: ['details', 'project_name'],
            key: 'project_name',
        },
        {
            title: 'Hours',
            dataIndex: ['details', 'project_hours'],
            key: 'project_hours',
        },
        {
            title: 'Description',
            dataIndex: ['details', 'description'],
            key: 'description',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <div className="d-flex">
                    <Tooltip title="Edit">
                        <Button
                            type="primary"
                            icon={<EditFilled />}
                            size="small"
                            className="mr-2"
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Button
                            type="primary" ghost
                            icon={<DeleteOutlined />}
                            size="small"
                            // onClick={() => handleDelete(record.id)}
                            onClick={() => showDeleteConfirm(record)}
                        />
                    </Tooltip>
                </div>
            ),
        },
    ];

    const userColumns = [
        {
            title: 'User ID',
            dataIndex: 'user_id',
            render: (text, record, index) => (
                // <Input
                //     value={text}
                //     onChange={(e) => handleUserChange(index, 'user_id', e.target.value)}
                // />
                <Select placeholder="Select users" style={{ minWidth: '120px', width: "100%" }} value={text} onChange={(e) => handleUserChange(index, 'user_id', e)}>
                    {/* {users?.map((user) => (
                        <Select.Option key={user?.id} value={user?.id}>
                            {user?.user_name}
                        </Select.Option>
                    ))} */}
                    {users?.map((user) => {
                        const isDisabled = projectUsers?.some((projectUser) => projectUser.user_id === user.id);
                        return (
                            <Select.Option key={user?.id} value={user?.id} disabled={isDisabled}>
                                {user?.user_name}
                            </Select.Option>
                        );
                    })}
                </Select>
            ),
        },
        {
            title: 'Expensed Hours',
            dataIndex: 'expensed_hours',
            render: (text, record, index) => (
                <Input
                    value={text} disabled
                    onChange={(e) => handleUserChange(index, 'expensed_hours', e.target.value)}
                />
            ),
        },
        {
            title: 'Allocated Hours',
            dataIndex: 'allocated_hours',
            render: (text, record, index) => (
                <Input
                    value={text}
                    onChange={(e) => handleUserChange(index, 'allocated_hours', e.target.value)}
                />
            ),
        },
        {
            title: 'Start',
            dataIndex: 'start_date',
            render: (text, record, index) => (
                <DatePicker
                    value={dayjs(text?.replace('/', '-'), dateFormat)}
                    style={{ width: '100%' }} allowClear={false}
                    format={dateFormat} maxDate={dayjs(projectUsers[index].end_date, dateFormat) || null}
                    onChange={(e) => handleUserChange(index, 'start_date', e?.format(dateFormat))} />
            ),
        },
        {
            title: 'End',
            dataIndex: 'end_date',
            render: (text, record, index) => (
                <DatePicker
                    value={dayjs(text?.replace('/', '-'), dateFormat)}
                    style={{ width: '100%' }} allowClear={false}
                    // format="DD/MM/YYYY"
                    format={dateFormat} minDate={dayjs(projectUsers[index].start_date, dateFormat) || null}
                    onChange={(e) => handleUserChange(index, 'end_date', e?.format(dateFormat))} />
            ),
        },
        {
            title: 'Rate/hr',
            dataIndex: 'rate',
            render: (text, record, index) => (
                <InputNumber value={text} style={{ width: '100%' }} onChange={(e) => handleUserChange(index, 'rate', e)} />
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

    return (
        <Card bodyStyle={{ padding: "0px" }}>
            {/* <div className="d-flex p-2 justify-content-between align-items-center">
                <h2 style={{ margin: 0 }}> </h2> */}
            <Button
                type="primary"
                // icon={<PlusOutlined />}
                onClick={() => setIsDrawerOpen(true)}
            >
                Add Project
            </Button>
            {/* </div> */}
            <div className="table-responsive" ref={componentRef}>
                <Table size={'small'}
                    locale={{
                        emptyText: <Empty description="No Data!" />,
                    }}
                    columns={columns}
                    dataSource={projects}
                    rowKey={(record) => record.id}
                    loading={!projects}
                    pagination={false}
                />
            </div>
            <Drawer //size="large"
                footer={null}
                width={1000}
                title={editItem ? "Edit Project" : "Add Project"}
                open={isDrawerOpen}
                onClose={() => { setEditItem(null); form.resetFields(); setIsDrawerOpen(false); setProjectUsers() }}
                onOk={() => form.submit()}
                okText="Save"
            >
                <Form form={form} layout="vertical" onFinish={handleAddOrEdit}>
                    <Form.Item name="project_name" label="Project Name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="description" label="Description">
                        <Input.TextArea />
                    </Form.Item>
                    <Form.Item name="start_date" label="start_date" format={dateFormat} rules={[{ required: true, message: 'Please select the Start date' }]}>
                        <DatePicker style={{ width: '100%' }}
                            disabledDate={(current) => {
                                const endDate = form.getFieldValue('end_date');
                                return current && endDate && current.isAfter(dayjs(endDate, dateFormat));
                            }}
                        />
                    </Form.Item>
                    <Form.Item name="end_date" label="end_date" format={dateFormat} rules={[{ required: true, message: 'Please select the End date' }]}>
                        <DatePicker style={{ width: '100%' }}
                            disabledDate={(current) => {
                                const startDate = form.getFieldValue('start_date');
                                return current && startDate && current.isBefore(dayjs(startDate, dateFormat));
                            }}
                        />
                    </Form.Item>
                    {/* <Form.Item name="project_hours" label="Project Hours">
                        <Input type="number" />
                    </Form.Item> */}
                    <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                        <Select>
                            <Option value="Pending">Pending</Option>
                            <Option value="In Progress">In Progress</Option>
                            <Option value="Completed">Completed</Option>
                            <Option value="Cancelled">Cancelled</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="client_id" label="Client ID" rules={[{ required: true }]}>
                        <Select placeholder="Select users">
                            {clients?.map((user) => (
                                <Select.Option key={user?.id} value={user?.id}>
                                    {user?.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    {/* <Form.Item name="is_closed" label="Is Closed" valuePropName="checked">
                        <Checkbox />
                    </Form.Item> */}
                    <Form.Item name="manager_id" label="Manager ID">
                        <Select placeholder="Select Manager">
                            {users?.filter(user => ["hr", "manager", "admin"]?.includes(user.role_type))?.map((user) => (
                                <Select.Option key={user?.id} value={user?.id}>
                                    {user?.user_name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="hrpartner_id" label="HR Partner ID">
                        <Select placeholder="Select HR partner">
                            {users?.filter(user => ["hr", "admin"]?.includes(user.role_type))?.map((user) => (
                                <Select.Option key={user?.id} value={user?.id}>
                                    {user?.user_name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <h3>Project Users</h3>
                    <Table size={'small'}
                        columns={userColumns}
                        dataSource={projectUsers}
                        pagination={false}
                        rowKey={(record, index) => index}
                    />
                    <Button type="dashed" onClick={addUser} style={{ width: '100%', marginTop: 16 }}>
                        <PlusOutlined /> Add User
                    </Button>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={{ marginTop: "16px" }}>
                            {editItem ? "Update Project" : "Add Project"}
                        </Button>
                        <div className='mt-2' style={{ color: 'red' }}>
                            {isInvalid && "All Fields are Required"}
                        </div>
                    </Form.Item>
                </Form>
            </Drawer>
            {/* <DatePicker /> */}

            {/* <App /> */}


            {/* {schema && <ProjectForm schema={schema?.data_schema} />} */}


            {/* {schema && <DynamicTable schema={schema?.dataSchema} />} */}
            {/* {schema && <DynamicForm schemas={schema}
                onFinish={handleAddOrEdit}
                formData={editItem && editItem?.details} />} */}
        </Card>
    );
};

export default Project;
