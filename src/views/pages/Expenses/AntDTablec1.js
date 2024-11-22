import React, { useEffect, useState } from 'react';
import { Table, Input, Button, Space, Typography, Select, message } from 'antd';
import { supabase } from 'configs/SupabaseConfig';
import { useSelector } from 'react-redux';

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
    const [currentDate, setCurrentDate] = useState(getMonday(new Date()));
    const [existingTimesheetId, setExistingTimesheetId] = useState(null);
    const [dataSource, setDataSource] = useState([]);
    const { session } = useSelector((state) => state.auth);

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
            setDataSource(data[0].details);
            setExistingTimesheetId(data[0].id);
        } else {
            setExistingTimesheetId(null);
        }
    };

    useEffect(() => {
        getProjects();
        checkExistingTimesheet();
    }, [currentDate, viewMode]);

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
            .select(`*, clients (*)`)
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
                    hours: [0, 0, 0, 0, 0, 0, 0],
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
        ...Array.from({ length: viewMode === 'Monthly' ? 31 : 7 }, (_, index) => ({
            title: formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + index)),
            dataIndex: `day${index}`,
            render: (_, record, index) => (
                <Input
                    type="number"
                    value={record.hours[index]}
                    onChange={(e) => handleHoursChange(index, index, e.target.value)}
                />
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
        if (existingTimesheetId) {
            result = await supabase
                .from('x_timesheet')
                .update(timesheetData)
                .eq('id', existingTimesheetId);
        } else {
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
                setExistingTimesheetId(data[0].id);
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
                >
                    <Select.Option value="Weekly">Weekly</Select.Option>
                    <Select.Option value="Monthly">Monthly</Select.Option>
                </Select>
                <Button onClick={goToPrevious}>Previous</Button>
                <Button onClick={goToNext}>Next</Button>
            </div>
            <Table
                dataSource={[dailyTotalRow, ...dataSource]}
                columns={columns}
                scroll={{ x: 'max-content' }}
                pagination={false}
                footer={() => (
                    <Button type="primary" onClick={handleSubmit}>Submit</Button>
                )}
                style={{ marginTop: '20px' }}
                rowClassName={(record) => record.key === 'totals' ? 'daily-total-row' : ''}
            />
        </div>
    );
};

export default Timesheet;
