import { Button, Card, notification, Table, Drawer, Form, Input, Select, Checkbox, DatePicker, InputNumber, Modal, Tooltip, Row, Col } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { PlusOutlined, EditFilled, DeleteOutlined, ExclamationCircleFilled, CopyFilled } from "@ant-design/icons";
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

const NonProject = ({ isDrawerOpen, setIsDrawerOpen }) => {
    const componentRef = useRef(null);
    const [projects, setProjects] = useState([]);
    const [editItem, setEditItem] = useState(null);
    // const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isInvalid, setIsInvalid] = useState(false);
    const [projectUsers, setProjectUsers] = useState([]);
    const [users, setUsers] = useState([]);
    const [clients, setClients] = useState([]);
    const dateFormat = 'YYYY/MM/DD';
    const dateFormatList = ['DD/MM/YYYY', 'DD/MM/YY', 'DD-MM-YYYY', 'DD-MM-YY'];
    const [schema, setSchema] = useState();
    const [allocationTracking, setAllocationTracking] = useState(false);
    const [clone, setClone] = useState();
    const [leaves, setLeaves] = useState([]);

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

    const fetchUsers = async () => {
        const { data, error } = await supabase.from('users').select('id, user_name,role_type,details').eq('organization_id', session?.user?.organization_id);
        if (error) {
            console.error('Error fetching users:', error);
        } else {
            console.log("Users", data)
            setUsers(data || []);
        }
    };
    const fetchClients = async () => {
        const { data, error } = await supabase.from('clients').select('id, name').eq('organization_id', session?.user?.organization_id).eq('default', true);
        if (error) {
            console.error('Error fetching users:', error);
        } else {
            console.log("US", data)
            setClients(data || []);
        }
    };

    const fetchLeaves = async () => {
        let { data, error } = await supabase.from('leaves').select('*').eq('organization_id', session?.user?.organization_id);
        if (data) {
            setLeaves(data);
            console.log("B", data)
        }
        if (error) {
            notification.error({ message: error?.message || "Failed to fetch leaves" });
        }
    };

    useEffect(() => {
        fetchClients();
        fetchUsers();
        fetchProjects();
        fetchLeaves()
    }, []);

    const fetchProjects = async () => {
        let { data, error } = await supabase.from('projects').select('*').eq('organization_id', session?.user?.organization_id).eq('is_non_project', true).order('project_name', { ascending: true });
        if (data) {
            setProjects(data);
        }
        if (error) {
            notification.error({ message: error?.message || "Failed to fetch projects" });
        }
    };

    const handleAllocationChange = (checked) => {
        setAllocationTracking(checked);
        if (!checked) {
            setProjectUsers()
        }
    };

    const handleAddOrEdit = async (values) => {
        setIsInvalid(false);

        if (allocationTracking && !validateData(projectUsers)) {
            setIsInvalid(true);
            return;
        }

        const updatedDetails = {
            ...values,
            start_date: values?.start_date?.format(dateFormat),
            end_date: values?.end_date?.format(dateFormat),
            // project_users: allocationTracking ? projectUsers : []
        };

        if (!allocationTracking) {
            delete updatedDetails.projectUsers;
        }

        const commonPayload = {
            details: updatedDetails,
            status: 'in progress',
            allocation_tracking: allocationTracking,
            is_non_project: true,
            status: values?.status,
            // project_users: allocationTracking ? projectUsers?.map(item => item?.user_id) : null,
            project_name: values?.project_name,
            client_id: clients[0]?.id,
            hrpartner_id: session?.user?.id,
            manager_id: session?.user?.id,
            start_date: values?.start_date?.format(dateFormat),
            end_date: values?.end_date?.format(dateFormat),
            organization_id: session?.user?.organization_id,
        };

        try {
            const { data, error } = (editItem && !clone)
                ? await supabase.from('projects').update(commonPayload).eq('id', editItem?.id).select('id')
                : await supabase.from('projects').insert([commonPayload]).select('id');

            if (data) {
                try {
                    // const details = projectUsers
                    const projectId = data[0]?.id
                    const payload = projectUsers.map((user) => {
                        const { rate, user_id, end_date, start_date, expensed_hours, allocated_hours } = user;

                        // Find user_name if provided in userNames object
                        const user_name = users?.find(user => user?.id === user_id)?.user_name || null;

                        return {
                            user_id,
                            project_id: projectId,
                            user_name,
                            details: {
                                rate,
                                end_date,
                                start_date,
                                project_id: projectId,
                                expensed_hours: parseFloat(expensed_hours), // Ensure numeric value
                                allocated_hours: parseFloat(allocated_hours) // Ensure numeric value
                            }
                        };
                    });

                    const { error } = await supabase
                        .from('allocations')
                        .upsert(payload, { onConflict: ['project_id', 'user_id'] });

                    if (error) {
                        console.error('Error upserting allocation:', error.message);
                    } else {
                        notification.success({ message: (editItem && !clone) ? "Project updated successfully" : "Project added successfully" });
                        setEditItem(null);
                    }
                } catch (err) {
                    console.error('Unexpected error:', err);
                }
            } else if (error) {
                notification.error({ message: error?.message || ((editItem && !clone) ? "Failed to update project" : "Failed to add project") });
            }
        } catch (err) {
            console.error("Error saving project:", err);
        }

        fetchProjects();
        setIsDrawerOpen(false);
        form.resetFields();
        setProjectUsers();
        setEditItem(null);
        setClone(null);
    };


    // const handleAddOrEdit = async (values) => {
    //     setIsInvalid(false)
    //     console.log("PU", values, projectUsers)
    //     const validData = allocationTracking && validateData(projectUsers)
    //     if (allocationTracking && !validData) {
    //         setIsInvalid(true)
    //         return
    //     }

    //     const updatedDetails = {
    //         ...values,
    //         start_date: values?.start_date?.format(dateFormat),
    //         end_date: values?.end_date?.format(dateFormat),
    //         project_users: allocationTracking ? projectUsers : []
    //     };

    //     !allocationTracking && delete updatedDetails?.projectUsers

    //     console.log(updatedDetails);
    //     if (editItem) {
    //         const { data, error } = await supabase
    //             .from('projects')
    //             .update({ details: updatedDetails, status: 'in progress', allocation_tracking: allocationTracking, is_non_project: true, status: values?.status, project_users: allocationTracking ? projectUsers?.map(item => item?.user_id) : null, project_name: values?.project_name, client_id: clients[0]?.id, hrpartner_id: session?.user?.id, manager_id: session?.user?.id })
    //             .eq('id', editItem?.id);

    //         if (data) {
    //             notification.success({ message: "Project updated successfully" });
    //             setEditItem(null);
    //         } else if (error) {
    //             notification.error({ message: "Failed to update project" });
    //         }
    //     } else {
    //         const { data, error } = await supabase
    //             .from('projects')
    //             .insert([{ details: updatedDetails, status: 'in progress', allocation_tracking: allocationTracking, is_non_project: true, status: values?.status, project_users: allocationTracking ? projectUsers?.map(item => item?.user_id) : null, project_name: values?.project_name, client_id: clients[0]?.id, hrpartner_id: session?.user?.id, manager_id: session?.user?.id }]);

    //         if (data) {
    //             notification.success({ message: "Project added successfully" });
    //         } else if (error) {
    //             notification.error({ message: "Failed to add project" });
    //         }
    //     }
    //     fetchProjects();
    //     setIsDrawerOpen(false);
    //     form.resetFields();
    //     setProjectUsers()
    //     setEditItem(null);
    // };

    const showUserDeleteConfirm = async (index, record) => {
        console.log("UU", projectUsers, record)
        confirm({
            title: `Are you sure you want to remove the allocation ?`,
            icon: <ExclamationCircleFilled />,
            //   content: 'Some descriptions',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                if (record?.id) {
                    const { error } = await supabase.from('allocations').delete().eq('id', record?.id);
                    if (!error) {
                        notification.success({ message: "User Deleted" });
                        const updatedUsers = projectUsers?.filter((_, i) => i !== index);
                        setProjectUsers(updatedUsers);
                    } else {
                        notification.error({ message: error?.message || "Failed to Delete User" });
                    }
                } else {
                    const updatedUsers = projectUsers?.filter((_, i) => i !== index);
                    setProjectUsers(updatedUsers);
                }
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    };

    const handleEdit = async (record, copy) => {
        let { data, error } = await supabase.rpc('get_project_details_with_project_users_v2', { projectid: record?.id });

        console.log("RPC data", data)
        if (data) {
            const item = {
                id: record?.id,
                project_name: record?.project_name,
                description: record?.details?.description,
                project_hours: record?.details?.project_hours,
                is_closed: record?.details?.is_closed,
                status: record?.details?.status,
                allocation_tracking: record?.details?.allocation_tracking,
                hrpartner_id: record?.details?.hrpartner_id,
                client_id: record?.details?.client_id,
                manager_id: record?.details?.manager_id,
                start_date: dayjs(record?.start_date, dateFormat),
                end_date: dayjs(record?.end_date, dateFormat),
                linked_leave: record?.linked_leave
            }
            if (copy) {
                delete item.id;
                delete item.project_name;
                delete item.description;
            }
            setEditItem(item);
            form.setFieldsValue(item);

            const updatedProjectUsers = (copy
                ? data?.details?.project_users?.map(user => ({
                    ...user,
                    expensed_hours: "0", // Reset expensed_hours if needed
                }))
                : data?.details?.project_users) || [];
            setProjectUsers(updatedProjectUsers || []);
            setIsDrawerOpen(true);
            setAllocationTracking(record?.details?.allocation_tracking);
            if (copy) {
                setClone(true)
            }
        }
        if (error) {
            notification.error({ message: error?.message || "Failed to fetch project users" });
        };
    }

    const handleUserChange = (index, field, value) => {
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
            // const leaveDays=leaves?.find(i => i?.leave_type === editItem?.project_name)?.min 
            // updatedUsers[index].allocated_hours = editItem?.linked_leave ? leaveDays* session?.user?.organization?.timesheet_settings?.workingHours?.standardDailyHours : "0"; // Default rate if not found
            // Determine leaveDays based on the given logic
            let leaveDays = 0;
            const matchingLeaves = leaves.filter(i => i.leave_type === editItem?.project_name);

            if (matchingLeaves.length > 1) {
                // Check for row with matching location_id
                const locationSpecificLeave = matchingLeaves.find(i => i.location_id === session?.user?.location?.id);
                leaveDays = locationSpecificLeave ? locationSpecificLeave.min : 0;
            }

            if (leaveDays === 0) {
                // Fall back to row where level === 'organization'
                const orgSpecificLeave = matchingLeaves.find(i => i.level === 'organization');
                leaveDays = orgSpecificLeave ? orgSpecificLeave.min : 0;
            }

            // Calculate allocated hours
            updatedUsers[index].allocated_hours = editItem?.linked_leave
                ? leaveDays * session?.user?.organization?.timesheet_settings?.workingHours?.standardDailyHours
                : "0";
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

        data?.forEach((item, index) => {
            // Check and update expensed_hours if empty
            if (item?.expensed_hours === "") {
                item.expensed_hours = "0";
            }
            requiredFields?.forEach(field => {
                if (!item[field]) {
                    errors?.push(`Error: Field "${field}" is missing or empty in record ${index + 1}`);
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
            title: `Confirm deletion of ${record.project_name} ?`,
            icon: <ExclamationCircleFilled />,
            //   content: 'Some descriptions',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                const { error } = await supabase.from('projects').delete().eq('id', record?.id);
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
            // dataIndex: ['details', 'project_name'],
            dataIndex: 'project_name',
            key: 'project_name',
        },
        {
            title: 'Description',
            dataIndex: ['details', 'description'],
            key: 'description',
        },
        {
            title: 'Start Date',
            dataIndex: ['details', 'start_date'],
            key: 'start_date',
        },
        {
            title: 'End Date',
            dataIndex: ['details', 'end_date'],
            key: 'end_date',
        },
        {
            title: 'Allocation Tracking',
            dataIndex: 'allocation_tracking',
            key: 'allocation_tracking',
            render: (_, record) => (
                <div className="d-flex">
                    {record?.allocation_tracking ? 'True' : 'False'}
                </div>
            ),
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
                    <Tooltip title="Copy">
                        <Button
                            type="primary"
                            icon={<CopyFilled />}
                            size="small"
                            className="mr-2"
                            onClick={() => handleEdit(record, true)}
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
            title: 'User Name',
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
            title: 'Expensed Hr',
            dataIndex: 'expensed_hours',
            width: 120,
            render: (text, record, index) => (
                <Input
                    value={text} disabled
                    onChange={(e) => handleUserChange(index, 'expensed_hours', e.target.value)}
                />
            ),
        },
        {
            title: 'Allocated Hr',
            dataIndex: 'allocated_hours',
            width: 120,
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
            width: 150,
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
            width: 150,
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
            title: 'Rate/Hr',
            dataIndex: 'rate',
            width: 120,
            render: (text, record, index) => (
                <InputNumber value={text} style={{ width: '100%' }} onChange={(e) => handleUserChange(index, 'rate', e)} />
            ),
        },
        {
            title: '',
            render: (_, record, index) => (
                <>
                    {Number(projectUsers[index].expensed_hours) === 0 && <Button
                        danger onClick={() => showUserDeleteConfirm(index, record)} >
                        X
                    </Button>}
                </>
            ),
        },
    ];

    return (
        <Card bodyStyle={{ padding: "0px" }}>
            {/* <div className="d-flex p-2 justify-content-between align-items-center"> */}
            {/* <h2 style={{ margin: 0 }}> </h2> */}
            {/* <Button
                type="primary"
                // icon={<PlusOutlined />}
                onClick={() => setIsDrawerOpen(true)}
            >
                Add Non Project
            </Button> */}
            {/* </div> */}
            <div className="table-responsive" ref={componentRef}>
                <Table size={'small'}
                    columns={columns}
                    dataSource={projects}
                    rowKey={(record) => record.id}
                    loading={!projects}
                    pagination={true}
                />
            </div>
            <Drawer //size="large"
                footer={null}
                width={1000}
                title={(editItem && !clone) ? "Edit Non Project" : "Add Non Project"}
                open={isDrawerOpen} maskClosable={false}
                onClose={() => { setEditItem(null); form.resetFields(); setAllocationTracking(false); setIsDrawerOpen(false); setProjectUsers(); setClone(false) }}
                onOk={() => form.submit()}
                okText="Save"
            >
                <Form form={form} layout="vertical" onFinish={handleAddOrEdit}>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item name="project_name" label="Project Name" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item name="description" label="Description">
                                <Input.TextArea />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item name="start_date" label="start_date" format={dateFormat} rules={[{ required: true, message: 'Please select the Start date' }]}>
                                <DatePicker style={{ width: '100%' }}
                                    disabledDate={(current) => {
                                        const endDate = form.getFieldValue('end_date');
                                        return current && endDate && current.isAfter(dayjs(endDate, dateFormat));
                                    }}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item name="end_date" label="end_date" format={dateFormat} rules={[{ required: true, message: 'Please select the End date' }]}>
                                <DatePicker style={{ width: '100%' }}
                                    disabledDate={(current) => {
                                        const startDate = form.getFieldValue('start_date');
                                        return current && startDate && current.isBefore(dayjs(startDate, dateFormat));
                                    }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item name="allocation_tracking" label="Allocation Tracking" valuePropName="checked">
                                <Checkbox onChange={(e) => handleAllocationChange(e.target.checked)} />
                            </Form.Item>
                        </Col>
                        {/* <Col xs={24} md={12}>
                            {allocationTracking && (<Form.Item name="project_hours" label="Project Hours">
                                <Input type="number" />
                            </Form.Item>)}
                        </Col> */}
                    </Row>
                    {allocationTracking && (<>
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
                    </>
                    )}
                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={{ marginTop: "16px" }}>
                            {(editItem && !clone) ? "Update Project" : "Add Project"}
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

export default NonProject;
