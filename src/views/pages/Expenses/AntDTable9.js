import React, { useEffect, useState } from 'react';
import { Table, Input, Button, Space, Typography, Select, message, Tree, Row, Col, InputNumber, DatePicker } from 'antd';
import { supabase } from 'configs/SupabaseConfig';
import { useSelector } from 'react-redux';
import './timesheet.css';

const { Option } = Select;

const Timesheet = ({ editItem, setEditItem }) => {

    const [types, setTypes] = useState();
    const [existingTimesheetId, setExistingTimesheetId] = useState(null);
    const [dataSource, setDataSource] = useState([]);
    const [hideNext, SetHideNext] = useState(true);
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
        setDataSource(editItem?.details)
    }, [editItem])

    const handleAddRow = () => {
        const newRow = {
            key: `${dataSource.length + 1}`,
        };

        setDataSource([...dataSource, newRow]);
    };

    // Calculate daily totals as an object
    // const dailyTotals = {};
    // dataSource.forEach(row => {
    //     Object.keys(row.dailyEntries).forEach(dateKey => {
    //         dailyTotals[dateKey] = (dailyTotals[dateKey] || 0) + Number(row.dailyEntries[dateKey].hours);
    //     });
    // });

    // // Convert dailyTotals object to an array if needed
    // const dailyTotalsArray = Object.entries(dailyTotals).map(([date, total]) => ({
    //     date,
    //     total,
    // }));
    // const startDate = new Date(currentDate);
    // const daysInMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();

    const handleInputChange = (rowIndex, field, value) => {
        const newData = [...dataSource];
        newData[rowIndex][field] = value;
        setDataSource(newData);
    };

    const generateColumns = (types) => {
        // Static columns
        const staticColumns = [
            {
                title: 'Date',
                dataIndex: 'date',
                render: (_, record, rowIndex) => (
                    // <DatePicker
                    <Input
                        value={record.date}
                        onChange={(e) => handleInputChange(rowIndex, 'date', e.target.value)}
                    />
                ),
            },
            {
                title: 'Description',
                dataIndex: 'description',
                render: (_, record, rowIndex) => (
                    <Input.TextArea
                        value={record.description}
                        onChange={(e) => handleInputChange(rowIndex, 'description', e.target.value)}
                    />
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
                <InputNumber
                    value={record[type.name.toLowerCase().replace(/\s+/g, '')]}
                    onChange={(e) =>
                        handleInputChange(rowIndex, type.name.toLowerCase().replace(/\s+/g, ''), e)
                    }
                />
            ),
        }));

        // Currency column
        const currencyColumn = [
            {
                title: 'Total',
                dataIndex: 'total',
                render: (_, record, rowIndex) => (
                    <InputNumber
                        value={record.total}
                        onChange={(e) => handleInputChange(rowIndex, 'total', e)}
                    />
                ),
            }]

        // Combine all columns
        return [...staticColumns, ...dynamicColumns, ...currencyColumn];
    };

    // Usage
    const columns = generateColumns(types);

    const handleSubmit = async () => {
        if (!session?.user?.id) {
            message.error('User is not authenticated.');
            return;
        }

        const today = new Date();
        const lastDate = new Date(today.setDate(today.getDate() + (timesheet_settings?.approvalWorkflow?.timeLimitForApproval || 0)));

        const timesheetData = {
            user_id: session.user.id,
            details: dataSource,
            status: 'Submitted',
            project_id: selectedProject,
            approver_id: session?.user[timesheet_settings?.approvalWorkflow?.defaultApprover || 'manager_id']?.id,
            last_date: lastDate.toISOString(),
            submitted_time: new Date()
        };

        let result;
        // console.log(currentDate, timesheetData);
        if (existingTimesheetId) {
            // Update the existing timesheet
            console.log("update", existingTimesheetId);
            result = await supabase
                .from('expensesheet')
                .update(timesheetData)
                .eq('id', existingTimesheetId);
        } else {
            console.log("create");
            // Insert a new timesheet
            result = await supabase
                .from('expensesheet')
                .insert([timesheetData]);
        }

        const { data, error } = result;

        if (error) {
            message.error(`Failed to submit timesheet: ${error.message}`);
        } else {
            message.success('Timesheet submitted successfully.');
            console.log('Submitted data:', data);
            if (data?.length > 0) {
                setExistingTimesheetId(data[0].id); // Update the ID in case of new insertion
            }
        }
    };

    return (
        <>
            <Row justify="space-between" align="middle">
                <Col>
                    <Button onClick={handleAddRow}>Add Row</Button>
                    <Select
                        style={{ width: 200 }}
                        className='ml-2'
                        placeholder="Select an option"
                        value={selectedProject}
                        onChange={(project) => setSelectedProject(project)}
                    >
                        {projects?.map((option) => (
                            <Option key={option?.id} value={option?.id}>
                                {option.project_name}
                            </Option>
                        ))}
                    </Select>
                </Col>
                <Col>
                    <Button type="primary" onClick={handleSubmit}>Save Draft</Button>
                    <Button type="primary" onClick={handleSubmit} className='ml-2'>Submit</Button>
                </Col>
            </Row>
            <Table
                dataSource={dataSource}
                columns={columns}
                pagination={false}
                summary={() => (
                    <Table.Summary.Row>
                        <Table.Summary.Cell>Total</Table.Summary.Cell>
                        {/* {Array.from({ length: 7 }, (_, dayIndex) => {
                            const dateKey = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + dayIndex));
                            return <Table.Summary.Cell key={dayIndex}>{dailyTotalsArray[dateKey] || 0}</Table.Summary.Cell>;
                        })} */}
                        <Table.Summary.Cell></Table.Summary.Cell>
                        <Table.Summary.Cell></Table.Summary.Cell>
                    </Table.Summary.Row>
                )}
            />
        </>
    );
};

export default Timesheet;
