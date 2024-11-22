import React, { useEffect, useState } from 'react';
import { Table, Input, Button, Space, Typography, Select, message } from 'antd';
import { supabase } from 'configs/SupabaseConfig';
import { useSelector } from 'react-redux';
import './timesheet.css'; // For custom styles

const { Text } = Typography;

const Timesheet = () => {
    const getMonday = (date) => {
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        return new Date(date.setDate(diff));
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1);
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
    };

    const [viewMode, setViewMode] = useState('Weekly');
    const [disabled, setDisabled] = useState(false);
    const [currentDate, setCurrentDate] = useState(getMonday(new Date()));
    const [existingTimesheetId, setExistingTimesheetId] = useState(null);
    const [expandedRows, setExpandedRows] = useState({});
    const [dataSource, setDataSource] = useState([]);
    const [projectCounter, setProjectCounter] = useState(1);

    const { session } = useSelector((state) => state.auth);

    useEffect(() => {
        checkExistingTimesheet();
        setDisabled(isCurrentDateDisabled());
    }, [currentDate, viewMode]);

    useEffect(() => {
        getProjects();
    }, []);

    const isCurrentDateDisabled = () => {
        const today = new Date();
        const currentMonday = getMonday(today);
        const firstDayOfCurrentMonth = getFirstDayOfMonth(today);

        if (viewMode === 'Weekly') {
            return currentDate.getTime() > currentMonday.getTime();
        } else if (viewMode === 'Monthly') {
            return currentDate.getTime() > firstDayOfCurrentMonth.getTime();
        }
        return false;
    };

    const checkExistingTimesheet = async () => {
        if (!session?.user?.id) {
            message.error('User is not authenticated.');
            return;
        }

        const { data, error } = await supabase
            .from('x_timesheet')
            .select('*')
            .eq('user_id', session.user.id)
            .eq('timesheet_date', currentDate.toISOString())
            .eq('timesheet_type', viewMode);

        if (error) {
            console.log('Error fetching timesheet:', error.message);
            setExistingTimesheetId(null);
        } else if (data && data.length > 0) {
            console.log('Existing timesheet:', data[0]);
            setDataSource(data[0]?.details);
            setExistingTimesheetId(data[0]?.id);
            setDisabled(['Submitted', 'Approved'].includes(data[0]?.status));
        } else {
            console.log('No existing timesheet found');
            setExistingTimesheetId(null);
        }
    };

    const goToPrevious = () => {
        const previousDate = new Date(currentDate);
        if (viewMode === 'Weekly') {
            previousDate.setDate(currentDate.getDate() - 7);
        } else {
            previousDate.setMonth(currentDate.getMonth() - 1);
        }
        setCurrentDate(viewMode === 'Weekly' ? getMonday(previousDate) : getFirstDayOfMonth(previousDate));
    };

    const goToNext = () => {
        const nextDate = new Date(currentDate);
        if (viewMode === 'Weekly') {
            nextDate.setDate(currentDate.getDate() + 7);
        } else {
            nextDate.setMonth(currentDate.getMonth() + 1);
        }
        setCurrentDate(viewMode === 'Weekly' ? getMonday(nextDate) : getFirstDayOfMonth(nextDate));
    };

    const handleViewModeChange = (value) => {
        setViewMode(value);
        const newDate = value === 'Weekly' ? getMonday(new Date()) : getFirstDayOfMonth(new Date());
        setCurrentDate(newDate);
    };

    const getProjects = async () => {
        const { data, error } = await supabase
            .from('projects')
            .select(`
                *,
                clients (*)
            `)
            .contains('project_users', [session?.user?.userId]);

        if (error) {
            return console.log("Error fetching projects:", error.message);
        }

        if (data) {
            const projectsData = data.map((project, index) => {
                const userDetail = project.details.project_users.find(
                    (user) => user.user_id === session?.user?.id
                );

                return {
                    key: `${index + 1}`,
                    project: project.details.project_name || '',
                    hours: [0, 0, 0, 0, 0, 0, 0], // Initialize hours
                    descriptions: ['', '', '', '', '', '', ''], // Initialize descriptions
                    allocatedHours: userDetail ? Number(userDetail.allocated_hours) : 0,
                    balanceHours: userDetail
                        ? Number(userDetail.allocated_hours) - Number(userDetail.expensed_hours)
                        : 0,
                };
            });

            setDataSource(projectsData);
        }
    };

    const handleHoursChange = (rowIndex, dayIndex, value) => {
        const newData = [...dataSource];
        newData[rowIndex].hours[dayIndex] = value;
        setDataSource(newData);
    };

    const handleDescriptionChange = (rowIndex, dayIndex, value) => {
        const newData = [...dataSource];
        newData[rowIndex].descriptions[dayIndex] = value;
        setDataSource(newData);
    };
    const handleAddRow = () => {
        const newRow = {
            key: `project-${projectCounter}`, // Unique key for each project
            project: '', // Placeholder for project name
            hours: [0, 0, 0, 0, 0, 0, 0], // Initialize hours
            descriptions: ['', '', '', '', '', '', ''], // Initialize descriptions
            allocatedHours: 0,
            balanceHours: 0,
        };
        setDataSource([...dataSource, newRow]);
        setProjectCounter(projectCounter + 1); // Increment project counter
    };
    // const handleAddRow = () => {
    //     const newRow = {
    //         key: `${dataSource.length + 1}`,
    //         project: '',
    //         hours: [0, 0, 0, 0, 0, 0, 0],
    //         descriptions: ['', '', '', '', '', '', ''],
    //         allocatedHours: 0,
    //         balanceHours: 0,
    //     };
    //     setDataSource([...dataSource, newRow]);
    // };

    const dailyTotals = Array(7).fill(0);
    dataSource?.forEach(row => {
        row.hours.forEach((hour, index) => {
            dailyTotals[index] += Number(hour);
        });
    });

    const handleProjectChange = (rowIndex, value) => {
        const newData = [...dataSource];
        newData[rowIndex].project = value; // Update project name based on dropdown selection
        setDataSource(newData);
    };

    const columns = [
        ...dataSource.map((row) => ({
            title: row.project,
            dataIndex: row.project,
            render: (_, record, rowIndex) => (
                <div>
                    <Input
                        disabled={disabled}
                        type="number"
                        value={record.hours[rowIndex]}
                        onChange={(e) => handleHoursChange(rowIndex, rowIndex, e.target.value)}
                    />
                    <br />
                    {expandedRows[record.key] && (
                        <Input.TextArea
                            disabled={disabled}
                            value={record.descriptions[rowIndex]}
                            onChange={(e) => handleDescriptionChange(rowIndex, rowIndex, e.target.value)}
                            placeholder="Description"
                        />
                    )}
                </div>
            ),
        })),
        {
            title: 'Total Hours',
            dataIndex: 'total',
            render: (_, record) => (
                <Text>{record.hours.reduce((acc, hour) => acc + Number(hour), 0)}{" ("}{(record.hours.reduce((acc, hour) => acc + Number(hour), 0) / 8).toFixed(2)}{"d)"}</Text>
            ),
        },
        {
            title: 'Balance Hours',
            render: ({ balanceHours, allocatedHours }) => <Text>{balanceHours + " of " + allocatedHours}</Text>,
        },
    ];

    const handleSubmit = async () => {
        if (!session?.user?.id) {
            message.error('User is not authenticated.');
            return;
        }

        const timesheetData = {
            user_id: session.user.id,
            details: dataSource,
            status: 'Submitted',
            timesheet_date: currentDate,
            timesheet_type: viewMode,
            approver: null,
            submitted_time: new Date(),
        };

        let result;
        if (existingTimesheetId) {
            // Update the existing timesheet
            result = await supabase
                .from('x_timesheet')
                .update(timesheetData)
                .eq('id', existingTimesheetId);
        } else {
            // Insert a new timesheet
            result = await supabase
                .from('x_timesheet')
                .insert([timesheetData]);
        }

        const { data, error } = result;

        if (error) {
            message.error(`Failed to submit timesheet: ${error.message}`);
        } else {
            message.success('Timesheet submitted successfully.');
            if (data?.length > 0) {
                setExistingTimesheetId(data[0].id); // Update the ID in case of new insertion
            }
        }
    };

    return (
        <div>
            <Button onClick={handleAddRow}>Add Project</Button>
            <h2>Weekly Timesheet Layout</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Select
                    defaultValue="Weekly"
                    style={{ width: 120 }}
                    onChange={handleViewModeChange}
                >
                    <Select.Option value="Weekly">Weekly</Select.Option>
                    <Select.Option value="Monthly">Monthly</Select.Option>
                </Select>
                <Button onClick={goToPrevious} disabled={disabled}>Previous</Button>
                <Text>{`${formatDate(currentDate)}`}</Text>
                <Button onClick={goToNext} disabled={disabled}>Next</Button>
                <Button onClick={handleAddRow} disabled={disabled}>Add Project</Button>
                <Button onClick={handleSubmit} disabled={disabled}>Submit</Button>
            </div>
            <Table
                dataSource={dataSource}
                columns={columns}
                pagination={false}
                rowClassName={(record) => expandedRows[record.key] ? 'expanded-row' : ''}
            // expandable={{
            //     expandedRowRender: record => <p style={{ margin: 0 }}>More details...</p>,
            //     onExpand: (expanded, record) => {
            //         setExpandedRows((prev) => ({
            //             ...prev,
            //             [record.key]: expanded,
            //         }));
            //     },
            // }}
            />
            <div>
                <Text strong>Daily Total:</Text> {dailyTotals.join(', ')}
            </div>
        </div>
    );
};

export default Timesheet;
