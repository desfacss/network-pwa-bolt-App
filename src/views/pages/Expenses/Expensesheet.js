import React, { useEffect, useState } from 'react';
import { Table, Input, Button, Space, Typography, Select, message, Tree, Row, Col, InputNumber, DatePicker } from 'antd';
import { supabase } from 'configs/SupabaseConfig';
import { useSelector } from 'react-redux';
import './timesheet.css';
import dayjs from 'dayjs'

const { Option } = Select;

const Expensesheet = ({ editItem, onAdd, viewMode }) => {

    const [types, setTypes] = useState();
    const [data, setData] = useState([]);
    const [projects, setProjects] = useState();
    const [selectedProject, setSelectedProject] = useState();

    const { session } = useSelector((state) => state.auth);

    const { timesheet_settings } = session?.user?.organization

    const fetchProjects = async () => {
        // const { data, error } = await supabase.from('projects').select('*').eq('is_non_project', false); // Call the stored function
        const { data, error } = await supabase.rpc('get_projects_with_allocation', {
            userid: session?.user?.id,
            include_leaves: false,
            include_non_project: false
        }); // Call the stored function
        if (error) {
            console.error('Error fetching projects:', error);
        } else {
            setProjects(data); // Set the fetched project data
            setSelectedProject(data[0]?.id); // Set the fetched project data
            console.log('Project data:', data);
        }
    };

    useEffect(() => {
        fetchProjects();
        getTypes()
    }, []);

    const getTypes = async () => {
        const { data, error } = await supabase.from('expense_type').select('*')
        if (data) {
            console.log("d", data)
            setTypes(data)
        }
    }

    useEffect(() => {
        setData(editItem?.details)
    }, [editItem])

    const handleAddRow = () => {
        const totalKeySum = data ? data?.reduce((sum, row) => sum + Number(row.key || 0), 0) : 0;
        const newRow = {
            // key: `${(data?.length || 0) + 1}`,
            key: `${(totalKeySum || 0) + 1}`,
        };
        if (data) {
            setData([...data, newRow]);
        } else {
            setData([newRow]);
        }
    };

    const handleInputChange = (rowIndex, field, value) => {
        const newData = [...data];
        value = value < 0 ? 0 : value
        newData[rowIndex][field] = value;
        // Recalculate the total for the row
        const rowTotal = types.reduce((sum, type) => {
            const key = type.name.toLowerCase().replace(/\s+/g, '');
            return sum + (Number(newData[rowIndex][key]) || 0);
        }, 0);

        newData[rowIndex].total = rowTotal;
        setData(newData);
    };

    const handleDeleteRow = (rowIndex) => {
        const newData = [...data];
        newData?.splice(rowIndex, 1); // Remove the row at the given index
        setData(newData); // Update the data
    };

    const generateColumns = (types) => {
        // Static columns
        const staticColumns = [
            {
                title: 'Date',
                dataIndex: 'date',
                render: (_, record, rowIndex) => (
                    <>
                        {!viewMode ? <DatePicker value={record?.date ? dayjs(record.date, 'YYYY-MM-DD') : null} format='YYYY-MM-DD' allowClear={false}
                            onChange={(date, dateString) => handleInputChange(rowIndex, 'date', dateString)} />
                            : <Typography.Text>{record?.date || "-"}</Typography.Text>}
                    </>
                ),
            },
            {
                title: 'Description',
                dataIndex: 'description',
                render: (_, record, rowIndex) => (
                    <>
                        {!viewMode ? <Input.TextArea value={record?.description} onChange={(e) => handleInputChange(rowIndex, 'description', e.target.value)} />
                            : <Typography.Text>{record?.description || "-"}</Typography.Text>}
                    </>
                ),
            },
        ];

        // Ensure `types` is an array
        if (!Array.isArray(types)) {
            console.error("Expected `types` to be an array but received:", types);
            return staticColumns; // Return only static columns if `types` is invalid
        }

        // Dynamic columns based on `types`
        const dynamicColumns = types.map((type) => ({
            title: type.name,
            dataIndex: type.name.toLowerCase().replace(/\s+/g, ''), // Generate a suitable key
            render: (_, record, rowIndex) => (
                <>
                    {!viewMode ? <InputNumber
                        value={record[type.name.toLowerCase().replace(/\s+/g, '')]}
                        onChange={(e) =>
                            handleInputChange(rowIndex, type.name.toLowerCase().replace(/\s+/g, ''), e)
                        }
                    />
                        : <Typography.Text>{record[type.name.toLowerCase().replace(/\s+/g, '')] || "-"}</Typography.Text>}
                </>
            ),
        }));

        const totalColumn = [
            {
                title: 'Total',
                dataIndex: 'total',
                render: (_, record) => <Typography.Text>{record.total || "-"}</Typography.Text>,
            },
            {
                title: '',
                render: (_, record, rowIndex) => (
                    <>
                        {!viewMode ? <Button onClick={() => handleDeleteRow(rowIndex)}>X</Button>
                            : <></>}
                    </>
                ),
            },
        ];

        // Combine all columns
        return [...staticColumns, ...dynamicColumns, ...totalColumn];
    };

    // Usage
    const columns = generateColumns(types);

    const handleSubmit = async () => {
        if (!data) {
            message.error(`Empty Data`);
            return
        }
        let emptyDate = false
        data?.forEach((row, index) => {
            if (!row.date) { // Check if date is empty, null, or undefined
                message.error(`Row with Empty date`);
                emptyDate = true
            }
        });
        if (emptyDate) { return }

        if (!session?.user?.id) {
            message.error('User is not authenticated.');
            return;
        }

        const today = new Date();
        const lastDate = new Date(today.setDate(today.getDate() + (timesheet_settings?.approvalWorkflow?.timeLimitForApproval || 0)));

        const timesheetData = {
            user_id: session.user.id,
            details: data,
            status: 'Submitted',
            project_id: selectedProject,
            approver_id: session?.user[timesheet_settings?.approvalWorkflow?.defaultApprover || 'manager_id']?.id,
            last_date: lastDate.toISOString(),
            submitted_time: new Date()
        };

        let result;
        if (editItem) {  // Update the existing timesheet
            console.log("update", editItem);
            result = await supabase.from('expensesheet').update(timesheetData).eq('id', editItem?.id);
        } else {         // Insert a new timesheet
            console.log("create");
            result = await supabase.from('expensesheet').insert([timesheetData]);
        }
        const { data, error } = result;
        if (error) {
            message.error(`Failed to submit timesheet: ${error.message}`);
        } else {
            message.success('Timesheet submitted successfully.');
            onAdd()
        }
    };

    const getSummary = () => {
        if (!types) return null;

        const totals = types?.reduce((acc, type) => {
            const key = type?.name?.toLowerCase().replace(/\s+/g, '');
            acc[key] = data?.reduce((sum, row) => sum + (Number(row[key]) || 0), 0);
            return acc;
        }, {});

        return (
            <Table.Summary.Row>
                <Table.Summary.Cell>Total</Table.Summary.Cell>
                <Table.Summary.Cell></Table.Summary.Cell>
                {types?.map((type) => {
                    const key = type?.name?.toLowerCase().replace(/\s+/g, '');
                    return (<Table.Summary.Cell key={key}> {totals[key]} </Table.Summary.Cell>);
                })}
                <Table.Summary.Cell>
                    {Object.values(totals)?.reduce((sum, val) => sum + val, 0)}
                </Table.Summary.Cell>
            </Table.Summary.Row>
        );
    }

    return (
        <>
            {!viewMode && <Row justify="space-between" align="middle">
                <Col>
                    <Button onClick={handleAddRow}>Add Row</Button>
                    <Select style={{ width: 200 }} className='ml-2' placeholder="Select an option"
                        value={selectedProject} onChange={(project) => setSelectedProject(project)} >
                        {projects?.map((option) => (
                            <Option key={option?.id} value={option?.id}>
                                {option.project_name}
                            </Option>
                        ))}
                    </Select>
                </Col>
                <Col>
                    <Button onClick={handleSubmit} disabled={!data}>Save Draft</Button>
                    <Button type="primary" onClick={handleSubmit} className='ml-2'>Submit</Button>
                </Col>
            </Row>}
            <Table dataSource={data} columns={columns} pagination={false} summary={getSummary} />
        </>
    );
};

export default Expensesheet;
