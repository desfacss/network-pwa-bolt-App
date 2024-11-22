import React, { useEffect, useState } from 'react';
import { Table, Input, Button, Space, Typography, Select, message } from 'antd';
import { supabase } from 'configs/SupabaseConfig';
import { useSelector } from 'react-redux';
// import 'antd/dist/antd.css'; // Import Ant Design styles
import './timesheet.css'; // For custom styles
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
    );
    const { session } = useSelector((state) => state.auth);

    const getProjects = async () => {
        const { data, error } = await supabase
            .from('projects')
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
        getProjects();
    }, []);

    // const handleHoursChange = (rowIndex, dayIndex, value) => {
    //     const newData = [...dataSource];
    //     newData[rowIndex].hours[dayIndex] = value;
    //     setDataSource(newData);
    // };
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
    const startDate = new Date(currentDate);
    const daysInMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
    const columns = [
        {
            title: 'Project',
            dataIndex: 'project',
            // width: 200,
            fixed: 'left',
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
        // ...Array.from({ length: viewMode === 'Monthly' ? daysInMonth : 7 }, (_, index) => ({
        //     title: formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + index)),
        //     dataIndex: `day${index}`,
        //     render: (_, record, index) => (
        //         <Input
        //             type="number"
        //             value={record.hours[index]}
        //             onChange={(e) => handleHoursChange(index, index, e.target.value)}
        //         />
        //     ),
        // })),
        ...Array.from({ length: viewMode === 'Monthly' ? daysInMonth : 7 }, (_, dayIndex) => ({
            title: formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + dayIndex)),
            dataIndex: `day${dayIndex}`,
            render: (_, record, rowIndex) => (
                <div>
                    <Input
                        type="number"
                        value={record.hours[dayIndex]}
                        onChange={(e) => handleHoursChange(rowIndex, dayIndex, e.target.value)}
                    />
                    <Input
                        type="text"
                        value={record.descriptions[dayIndex]}
                        onChange={(e) => handleDescriptionChange(rowIndex, dayIndex, e.target.value)}
                        placeholder="Description"
                    />
                </div>
            ),
        })),
        {
            title: 'Total Hours',
            dataIndex: 'total',
            fixed: 'right',
            render: (_, record) => (
                <Text>{record.hours.reduce((acc, hour) => acc + Number(hour), 0)}{" ("}{(record.hours.reduce((acc, hour) => acc + Number(hour), 0) / 8).toFixed(2)}{"d)"}</Text>
            ),
        },
        {
            title: 'Balance Hours',
            // dataIndex: 'balanceHours',
            // render: (text) => <Text>{text}</Text>,
            render: ({ balanceHours, allocatedHours }) => <Text>{balanceHours + " of " + allocatedHours}</Text>,
            fixed: 'right',
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
                dataSource={[...dataSource]}
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
                        <Table.Summary.Row className="table-summary-row">
                            {/* <div>.</div> */}
                            {/* <div style={{ width: '200px', position: 'sticky', left: 0, background: 'white', zIndex: 1 }}> */}

                            <Table.Summary.Cell index={0} key={0} className="sticky-left">
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={1} className="sticky-left" width={300}
                            >Daily Total</Table.Summary.Cell>
                            {/* </div> */}
                            {dailyTotals?.map((total, index) => (
                                <Table.Summary.Cell index={index + 2} key={index} className="table-summary-cell">
                                    {total}
                                </Table.Summary.Cell>
                            ))}
                            <Table.Summary.Cell index={dailyTotals?.length + 2} key={dailyTotals?.length + 2} align={'right'} className="sticky-right" width={200}>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={dailyTotals?.length + 3} key={dailyTotals?.length + 3} align={'right'} className="sticky-right" width={200}>
                            </Table.Summary.Cell>
                        </Table.Summary.Row>
                    </Table.Summary>
                )}
            />}
        </div>
    );
};

export default Timesheet;
