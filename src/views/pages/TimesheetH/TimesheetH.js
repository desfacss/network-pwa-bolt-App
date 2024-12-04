import React, { useEffect, useState } from 'react';
import { Table, Input, Button, Space, Typography, Select, message, Row, Col } from 'antd';
import { supabase } from 'configs/SupabaseConfig';
import { useSelector } from 'react-redux';
import './timesheet.css';

const { Text } = Typography;

const Timesheet = () => {
    const getMonday = (date) => {
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
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
    const [expandeAllRows, setExpandAllRows] = useState(true);
    const [dataSource, setDataSource] = useState([]);
    const [timesheetData, setTimeSheetData] = useState();
    const [hideNext, SetHideNext] = useState(true);

    const { session } = useSelector((state) => state.auth);

    const checkExistingTimesheet = async () => {
        if (!session?.user?.id) {
            message.error('User is not authenticated.');
            return;
        }

        const { data, error } = await supabase
            .from('x_timesheet_duplicate')
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
            setDisabled(['Approved'].includes(data[0]?.status));
            const timesheetDetails = data[0]?.details;
            if (timesheetDetails) {
                // Initialize an object to hold date entries
                const dateMap = {};

                // Populate the dateMap with project details grouped by date
                timesheetDetails.forEach((entry) => {
                    if (entry.dailyEntries) {
                        Object.entries(entry.dailyEntries).forEach(([date, { hours, description }]) => {
                            if (!dateMap[date]) {
                                dateMap[date] = {
                                    title: date,
                                    key: date,
                                    children: []
                                };
                            }
                            // Push project details into the respective date's children
                            dateMap[date].children.push({
                                title: `${entry.project} - ${hours} hours - ${description}`,
                                key: `${entry.key}-${date}-child`
                            });
                        });
                    } else {
                        console.warn(`dailyEntries is missing for entry with key: ${entry.key}`);
                    }
                });

                // Convert the dateMap object to an array for tree data
                const treeData = Object.values(dateMap);
                setTimeSheetData(treeData);
            }
            // const treeData = data[0]?.details.flatMap((entry) => {
            //     return Object.entries(entry.dailyEntries).map(([date, { hours, description }]) => ({
            //         title: date,
            //         key: `${entry.key}-${date}`,
            //         children: [
            //             {
            //                 title: `${entry.project} - ${hours} hours - ${description}`,
            //                 key: `${entry.key}-${date}-child`,
            //             },
            //         ],
            //     }));
            // });
            // setTimeSheetData(treeData)
        } else {
            console.log('No existing timesheet found');
            setExistingTimesheetId(null);
        }
    };

    const isCurrentDateDisabled = () => {
        const today = new Date();
        const currentMonday = getMonday(today);
        const firstDayOfCurrentMonth = getFirstDayOfMonth(today);
        // Create a new date object based only on year, month, and day
        const currentDateWithoutTime = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        const currentMondayWithoutTime = new Date(currentMonday.getFullYear(), currentMonday.getMonth(), currentMonday.getDate());
        const firstDayOfCurrentMonthWithoutTime = new Date(firstDayOfCurrentMonth.getFullYear(), firstDayOfCurrentMonth.getMonth(), firstDayOfCurrentMonth.getDate());

        // Use the modified date for comparison
        SetHideNext(currentDateWithoutTime.getTime() === currentMondayWithoutTime.getTime() || currentDateWithoutTime.getTime() === firstDayOfCurrentMonthWithoutTime.getTime());

        // const day = viewMode === 'Weekly' ? currentMonday.getTime() : firstDayOfCurrentMonth.getTime()
        // SetHideNext(currentDate.getTime() === day ? true : false)
        // console.log("DD", currentDate.getTime(), day)

        // Set hideNext based on the checks
        // SetHideNext(isCurrentMonday || isFirstDayOfMonth);
        if (viewMode === 'Weekly') {
            return currentDate.getTime() > currentMonday.getTime();
        } else if (viewMode === 'Monthly') {
            return currentDate.getTime() > firstDayOfCurrentMonth.getTime();
        }
        return false;
    };

    useEffect(() => {
        getProjects();
        checkExistingTimesheet();
        setDisabled(isCurrentDateDisabled());
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
        console.log("Projects", data);
        if (data) {
            const projectsData = data.map((project, index) => {
                const userDetail = project.details.project_users.find(
                    (user) => user.user_id === session?.user?.id
                );

                // Initialize an object for hours and descriptions keyed by date
                const dailyEntries = {};
                for (let i = 0; i < 7; i++) {
                    const dateKey = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + i));
                    dailyEntries[dateKey] = { hours: 0, description: '' };
                }

                return {
                    key: `${index + 1}`,
                    project: project.details.project_name || '',
                    dailyEntries, // Use the dailyEntries object
                    allocatedHours: userDetail ? Number(userDetail.allocated_hours) : 0,
                    balanceHours: userDetail ? Number(userDetail.allocated_hours) - Number(userDetail.expensed_hours) : 0,
                };
            });

            setDataSource(projectsData);
        }
    };

    useEffect(() => {
        const gete = async () => {
            const { data, error } = await supabase
                .from('x_timesheet_duplicate')
                .select('*')
            // console.log("TT", data)
        }
        getProjects();
        gete()
    }, []);

    const handleToggleDescription = (key) => {
        setExpandedRows((prev) => ({
            ...prev,
            [key]: !prev[key], // Toggle the expansion state for the row
        }));
    };

    const handleHoursChange = (rowIndex, dateKey, value) => {
        const newData = [...dataSource];
        newData[rowIndex].dailyEntries[dateKey].hours = value;
        setDataSource(newData);
    };

    const handleDescriptionChange = (rowIndex, dateKey, value) => {
        const newData = [...dataSource];
        newData[rowIndex].dailyEntries[dateKey].description = value;
        setDataSource(newData);
    };

    const handleAddRow = () => {
        const newRow = {
            key: `${dataSource.length + 1}`,
            project: '',
            dailyEntries: {}, // Initialize an empty object for daily entries
            allocatedHours: 100,
            balanceHours: 100,
        };

        // Initialize daily entries for the new row
        for (let i = 0; i < 7; i++) {
            const dateKey = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + i));
            newRow.dailyEntries[dateKey] = { hours: 0, description: '' };
        }

        setDataSource([...dataSource, newRow]);
    };

    // const dailyTotals = {};
    // dataSource.forEach(row => {
    //     Object.keys(row.dailyEntries).forEach(dateKey => {
    //         dailyTotals[dateKey] = (dailyTotals[dateKey] || 0) + Number(row.dailyEntries[dateKey].hours);
    //     });
    // });

    // Calculate daily totals as an object
    const dailyTotals = {};
    dataSource.forEach(row => {
        Object.keys(row.dailyEntries).forEach(dateKey => {
            dailyTotals[dateKey] = (dailyTotals[dateKey] || 0) + Number(row.dailyEntries[dateKey].hours);
        });
    });

    // Convert dailyTotals object to an array if needed
    const dailyTotalsArray = Object.entries(dailyTotals).map(([date, total]) => ({
        date,
        total,
    }));
    const startDate = new Date(currentDate);
    const daysInMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
    const columns = [
        {
            title: 'Project',
            dataIndex: 'project',
            fixed: 'left',
            render: (text, record) => (
                <Space align="start">
                    {/* <Button type="link" onClick={() => handleToggleDescription(record.key)}>
                        {expandedRows[record.key] ? '-' : '+'}
                    </Button> */}
                    <Input defaultValue={text} style={{ width: 200 }} />
                </Space>
            ),
        },
        ...Array.from({ length: viewMode === 'Monthly' ? daysInMonth : 7 }, (_, dayIndex) => {
            const dateKey = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + dayIndex));
            return {
                title: dateKey,
                dataIndex: `day${dayIndex}`,
                render: (_, record, rowIndex) => (
                    <div>
                        <Input disabled={disabled} style={{ width: 180 }} size="small"
                            type="number"
                            value={record.dailyEntries[dateKey]?.hours}
                            onChange={(e) => handleHoursChange(rowIndex, dateKey, e.target.value)}
                        /><br />
                        {/* {expandedRows[record.key] && ( */}
                        {expandeAllRows && (
                            <Input.TextArea disabled={disabled} style={{ width: 180 }} size="small"
                                value={record.dailyEntries[dateKey]?.description}
                                onChange={(e) => handleDescriptionChange(rowIndex, dateKey, e.target.value)}
                                placeholder="Description"
                            />
                        )}
                    </div>
                ),
            };
        }),
        {
            title: 'Total Hours',
            dataIndex: 'total',
            fixed: 'right',
            render: (_, record) => (
                <Text>
                    {Object.values(record.dailyEntries).reduce((acc, entry) => acc + Number(entry.hours), 0)}{" ("}
                    {(Object.values(record.dailyEntries).reduce((acc, entry) => acc + Number(entry.hours), 0) / 8).toFixed(2)}{"d)"}
                </Text>
            ),
        },
        {
            title: 'Balance Hours',
            fixed: 'right',
            render: ({ balanceHours }) => (
                <Text>{balanceHours}</Text>
            ),
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
            submitted_time: currentDate,
        };

        let result;
        console.log(currentDate, timesheetData);
        if (existingTimesheetId) {
            // Update the existing timesheet
            console.log("update", existingTimesheetId);
            result = await supabase
                .from('x_timesheet_duplicate')
                .update(timesheetData)
                .eq('id', existingTimesheetId);
        } else {
            console.log("create");
            // Insert a new timesheet
            result = await supabase
                .from('x_timesheet_duplicate')
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
                {/* Left-aligned section */}
                <Col>
                    <Button onClick={handleAddRow}>Add New Project</Button>
                    <Select
                        value={viewMode}
                        onChange={handleViewModeChange}
                        options={[
                            { label: 'Weekly', value: 'Weekly' },
                            { label: 'Monthly', value: 'Monthly' },
                        ]}
                    />
                </Col>
                <Col>
                    {/* <Button onClick={() => setCurrentDate(goToPrevious(viewMode, currentDate))}>Previous</Button>
                    <label className="ml-2 mr-2">{formatDate(currentDate)}</label>
                    {!hideNext && (
                        <Button onClick={() => setCurrentDate(goToNext(viewMode, currentDate))}>Next</Button>
                    )} */}
                    <Button onClick={goToPrevious}>Previous</Button>
                    <label className='ml-2 mr-2'>{formatDate(currentDate)}</label>
                    {!hideNext && <Button onClick={goToNext}>Next</Button>}
                </Col>

                {/* Right-aligned section */}
                <Col>
                    <Button type="primary" onClick={handleSubmit}>Save Draft</Button>
                    <Button type="primary" onClick={handleSubmit}>Submit</Button>
                    {/* <Button type="primary" onClick={() => handleSubmit("Draft")} className="mr-2">Save</Button>
                    <Button type="primary" onClick={() => handleSubmit("Submitted")}>Submit</Button> */}
                </Col>
            </Row>

            <Table
                dataSource={dataSource}
                columns={columns}
                pagination={false}
                // expandable={{
                //     expandedRowRender: (record) => <Text>{record.description}</Text>,
                //     onExpand: (expanded, record) => {
                //         setExpandedRows({
                //             ...expandedRows,
                //             [record.key]: expanded,
                //         });
                //     },
                // }}
                summary={() => (
                    <Table.Summary.Row>
                        <Table.Summary.Cell>Total</Table.Summary.Cell>
                        {Array.from({ length: 7 }, (_, dayIndex) => {
                            const dateKey = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + dayIndex));
                            return <Table.Summary.Cell key={dayIndex}>{dailyTotalsArray[dateKey] || 0}</Table.Summary.Cell>;
                        })}
                        {/* <Table.Summary.Cell>{Object.values(dailyTotalsArray).reduce((acc, curr) => acc + curr, 0)}</Table.Summary.Cell> */}
                        <Table.Summary.Cell></Table.Summary.Cell>
                        <Table.Summary.Cell></Table.Summary.Cell>
                    </Table.Summary.Row>
                )}
            // summary={() => (
            //     <Table.Summary fixed>
            //         <Table.Summary.Row className="table-summary-row">
            //             {/* <div>.</div> */}
            //             {/* <div style={{ width: '200px', position: 'sticky', left: 0, background: 'white', zIndex: 1 }}> */}

            //             <Table.Summary.Cell index={0} key={0} className="sticky-left">
            //             </Table.Summary.Cell>
            //             <Table.Summary.Cell index={1} className="sticky-left" width={300}
            //             >Daily Total</Table.Summary.Cell>
            //             {/* </div> */}
            //             {dailyTotalsArray?.map((total, index) => (
            //                 <Table.Summary.Cell index={index + 2} key={index} className="table-summary-cell">
            //                     {total}
            //                 </Table.Summary.Cell>
            //             ))}
            //             <Table.Summary.Cell index={dailyTotalsArray?.length + 2} key={dailyTotalsArray?.length + 2} align={'right'} className="sticky-right" width={200}>
            //             </Table.Summary.Cell>
            //             <Table.Summary.Cell index={dailyTotalsArray?.length + 3} key={dailyTotalsArray?.length + 3} align={'right'} className="sticky-right" width={200}>
            //             </Table.Summary.Cell>
            //         </Table.Summary.Row>
            //     </Table.Summary>
            // )}
            />
            {/* {timesheetData && < Tree
                treeData={timesheetData}
                defaultExpandAll
            />} */}
        </>
    );
};

export default Timesheet;
