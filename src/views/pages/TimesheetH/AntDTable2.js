import React, { useEffect, useState } from 'react';
import { Table, Input, Button, Space, Typography, Select, message } from 'antd';
import { supabase } from 'configs/SupabaseConfig';
import { useSelector } from 'react-redux';
// import 'antd/dist/antd.css'; // Import Ant Design styles

const { Text } = Typography;

const Timesheet = () => {
    const getMonday = (date) => {
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        return new Date(date.setDate(diff));
    };

    // Function to get the first day of the month based on a given date
    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1);
    };

    // Function to format the date as 'MMM DD' (e.g., 'Oct 14' or 'Oct 1')
    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
    };

    const [viewMode, setViewMode] = useState('Weekly'); // Default to Weekly
    const [currentDate, setCurrentDate] = useState(getMonday(new Date()));
    const [existingTimesheetId, setExistingTimesheetId] = useState(null);

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
            setExistingTimesheetId(null); // Set ID to null if there's an error
        } else if (data && data.length > 0) {
            console.log('Existing timesheet:', data[0]);
            setDataSource(data[0].details); // Load existing timesheet details into dataSource
            setExistingTimesheetId(data[0].id); // Store the existing timesheet ID for updating
        } else {
            console.log('No existing timesheet found');
            setExistingTimesheetId(null); // Set ID to null if no rows are returned
        }
    };


    useEffect(() => {
        getProjects();
        checkExistingTimesheet();
    }, [currentDate, viewMode]);

    // Function to navigate to the previous week or month
    const goToPrevious = () => {
        const previousDate = new Date(currentDate);
        if (viewMode === 'Weekly') {
            previousDate.setDate(currentDate.getDate() - 7);
        } else {
            previousDate.setMonth(currentDate.getMonth() - 1);
        }
        setCurrentDate(viewMode === 'Weekly' ? getMonday(previousDate) : getFirstDayOfMonth(previousDate));
    };

    // Function to navigate to the next week or month
    const goToNext = () => {
        const nextDate = new Date(currentDate);
        if (viewMode === 'Weekly') {
            nextDate.setDate(currentDate.getDate() + 7);
        } else {
            nextDate.setMonth(currentDate.getMonth() + 1);
        }
        setCurrentDate(viewMode === 'Weekly' ? getMonday(nextDate) : getFirstDayOfMonth(nextDate));
    };

    // Handle the change of view mode
    const handleViewModeChange = (value) => {
        setViewMode(value);
        const newDate = value === 'Weekly' ? getMonday(new Date()) : getFirstDayOfMonth(new Date());
        setCurrentDate(newDate);
    };
    const [dataSource, setDataSource] = useState(
        //     [
        //     {
        //         key: '1',
        //         project: 'Project A',
        //         hours: [5, 4, 6, 7, 4, 0, 3],
        //         descriptions: ['', '', '', '', '', '', ''],
        //         allocatedHours: 100,
        //         balanceHours: 90,
        //     },
        //     {
        //         key: '2',
        //         project: 'Project B',
        //         hours: [3, 2, 4, 8, 5, 2, 1],
        //         descriptions: ['', '', '', '', '', '', ''],
        //         allocatedHours: 100,
        //         balanceHours: 75,
        //     },
        // ]
    );
    const { session } = useSelector((state) => state.auth);

    const getProjects = async () => {
        const { data, error } = await supabase
            .from('x_projects')
            // .select('*')
            .select(`
            *,
              clients (*)
      `)
            //   users:users(*)
            .contains('project_users', [session?.user?.userId]);
        // .contains('details->project_users', [{ user_id: session?.user?.id }]);
        // .filter('details->project_users', 'contains', JSON.stringify([{ user_id: session?.user?.userId }]));
        if (error) {
            return console.log("Error fetching projects:", error.message);
        }
        console.log("Projects", data)
        if (data) {
            // Map the fetched data to match the dataSource structure
            const projectsData = data.map((project, index) => {
                const userDetail = project.details.project_users.find(
                    (user) => user.user_id === session?.user?.id
                );

                return {
                    key: `${index + 1}`,
                    project: project.details.project_name || '',
                    hours: [0, 0, 0, 0, 0, 0, 0], // Replace with actual data if available
                    descriptions: ['', '', '', '', '', '', ''],
                    allocatedHours: userDetail ? Number(userDetail.allocated_hours) : 0,
                    balanceHours: userDetail
                        ? Number(userDetail.allocated_hours) - Number(userDetail.expensed_hours)
                        : 0,
                };
            });

            setDataSource(projectsData);
        }
    };

    useEffect(() => {
        // const fetch = async () => {
        //     const { data, error } = await supabase
        //         .rpc('fetch_project_details');  // Call the function by name

        //     if (error) {
        //         console.error('Error calling function:', error);
        //     } else {
        //         console.log('Project data:', data);
        //     }
        // }
        // fetch()
        getProjects();
    }, []);

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
            key: `${dataSource.length + 1}`,
            project: '',
            hours: [0, 0, 0, 0, 0, 0, 0],
            descriptions: ['', '', '', '', '', '', ''],
            allocatedHours: 100,
            balanceHours: 100,
        };
        setDataSource([...dataSource, newRow]);
    };

    const dailyTotals = Array(7).fill(0);
    dataSource?.forEach(row => {
        row.hours.forEach((hour, index) => {
            dailyTotals[index] += Number(hour);
        });
    });

    const columns = [
        {
            title: 'Project',
            dataIndex: 'project',
            width: 200,
            render: (_, record, index) => (
                <Input
                    value={record.project}
                    onChange={(e) => {
                        const newData = [...dataSource];
                        newData[index].project = e.target.value;
                        setDataSource(newData);
                    }}
                    placeholder="Select Project..."
                />
            ),
        },
        {
            title: 'Mon, 14 Oct 24',
            dataIndex: 'mon',
            render: (_, record, index) => (
                <Input
                    type="number"
                    value={record.hours[0]}
                    onChange={(e) => handleHoursChange(index, 0, e.target.value)}
                />
            ),
        },
        {
            title: 'Tue, 15 Oct 24',
            dataIndex: 'tue',
            render: (_, record, index) => (
                <Input
                    type="number"
                    value={record.hours[1]}
                    onChange={(e) => handleHoursChange(index, 1, e.target.value)}
                />
            ),
        },
        {
            title: 'Wed, 16 Oct 24',
            dataIndex: 'wed',
            render: (_, record, index) => (
                <Input
                    type="number"
                    value={record.hours[2]}
                    onChange={(e) => handleHoursChange(index, 2, e.target.value)}
                />
            ),
        },
        {
            title: 'Thu, 17 Oct 24',
            dataIndex: 'thu',
            render: (_, record, index) => (
                <Input
                    type="number"
                    value={record.hours[3]}
                    onChange={(e) => handleHoursChange(index, 3, e.target.value)}
                />
            ),
        },
        {
            title: 'Fri, 18 Oct 24',
            dataIndex: 'fri',
            render: (_, record, index) => (
                <Input
                    type="number"
                    value={record.hours[4]}
                    onChange={(e) => handleHoursChange(index, 4, e.target.value)}
                />
            ),
        },
        {
            title: 'Sat, 19 Oct 24',
            dataIndex: 'sat',
            render: (_, record, index) => (
                <Input
                    type="number"
                    value={record.hours[5]}
                    onChange={(e) => handleHoursChange(index, 5, e.target.value)}
                />
            ),
        },
        {
            title: 'Sun, 20 Oct 24',
            dataIndex: 'sun',
            render: (_, record, index) => (
                <Input
                    type="number"
                    value={record.hours[6]}
                    onChange={(e) => handleHoursChange(index, 6, e.target.value)}
                />
            ),
        },
        {
            title: 'Total Hours',
            dataIndex: 'total',
            render: (_, record) => (
                <Text>{record.hours.reduce((acc, hour) => acc + Number(hour), 0)}</Text>
            ),
        },
        {
            title: 'Man Days',
            dataIndex: 'manDays',
            render: (_, record) => (
                <Text>{(record.hours.reduce((acc, hour) => acc + Number(hour), 0) / 8).toFixed(2)}</Text>
            ),
        },
        {
            title: 'Allocated Hours',
            dataIndex: 'allocatedHours',
            // render: (text) => <Text>{text}</Text>,
            render: (text) => <Text>{text}</Text>,
            // render: (_, record) => (
            //     <Text>{(record.hours.reduce((acc, hour) => acc + Number(hour), 0) / 8).toFixed(2)}</Text>
            // ),
        },
        {
            title: 'Balance Hours',
            dataIndex: 'balanceHours',
            render: (text) => <Text>{text}</Text>,
        },
    ];

    const dailyTotalRow = {
        key: 'totals',
        project: 'Daily Total',
        hours: dailyTotals,
        descriptions: ['', '', '', '', '', '', ''],
        allocatedHours: '',
        balanceHours: '',
    };

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
            submitted_time: currentDate
        };

        let result;
        console.log(currentDate, timesheetData)
        if (existingTimesheetId) {
            // Update the existing timesheet
            console.log("update", existingTimesheetId)
            result = await supabase
                .from('x_timesheet')
                .update(timesheetData)
                .eq('id', existingTimesheetId);
        } else {
            console.log("create")
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
            console.log('Submitted data:', data);
            if (data?.length > 0) {
                setExistingTimesheetId(data[0].id); // Update the ID in case of new insertion
            }
        }
    };


    return (
        <div>
            <h2>Weekly Timesheet Layout</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Select
                    defaultValue="Weekly"
                    style={{ width: 120 }}
                    onChange={handleViewModeChange}
                    options={[
                        { value: 'Weekly', label: 'Weekly' },
                        { value: 'Monthly', label: 'Monthly' }
                    ]}
                />
                <Button onClick={goToPrevious}>Prev</Button>
                <label>{formatDate(currentDate)}</label>
                <Button onClick={goToNext}>Next</Button>
            </div>
            <Space>
                <Button onClick={handleAddRow}>Add New Row</Button>
                <Button type="primary" onClick={handleSubmit}>Submit</Button>
            </Space>
            {dataSource && <Table
                dataSource={[...dataSource, dailyTotalRow]}
                columns={columns}
                pagination={false}
                expandable={{
                    expandedRowRender: (record) => (
                        <div>
                            {record.hours.map((_, index) => (
                                <Input
                                    key={index}
                                    type="text"
                                    value={record.descriptions[index]}
                                    onChange={(e) => handleDescriptionChange(record.key - 1, index, e.target.value)}
                                    placeholder="Enter Task Description..."
                                    style={{ marginBottom: '8px', width: '200px' }}
                                />
                            ))}
                        </div>
                    ),
                    rowExpandable: (record) => true,
                }}
                scroll={{ x: 'max-content' }} // Enable horizontal scroll
                summary={() => (
                    <Table.Summary fixed>
                        <Table.Summary.Row>
                            <Table.Summary.Cell index={0}>Total Hours</Table.Summary.Cell>
                            {dailyTotals?.map((total, index) => (
                                <Table.Summary.Cell index={index + 1} key={index}>
                                    {total}
                                </Table.Summary.Cell>
                            ))}
                        </Table.Summary.Row>
                    </Table.Summary>
                )}
            />}
        </div>
    );
};

export default Timesheet;
