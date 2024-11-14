import React, { useState, useMemo } from 'react';
import { Tabs, Table, Select, DatePicker, Checkbox } from 'antd';
import Chart from 'react-apexcharts';

const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

const TimesheetComponent = ({ data, printRef }) => {
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedProjectName, setSelectedProjectName] = useState(null);
    const [selectedDateRange, setSelectedDateRange] = useState([null, null]); // To store the start and end date
    const [nonProject, setNonProject] = useState(false);

    // Unique user IDs and project names for Select options
    const userIds = [...new Set(data?.map((entry) => entry?.user_name))];
    const projectNames = [...new Set(data?.filter((entry) => entry.is_non_project === nonProject)?.map((entry) => entry?.project_name))];

    const generateDateRange = (startDate, endDate) => {
        const dates = [];
        let currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            dates.push(new Date(currentDate));
            currentDate?.setDate(currentDate?.getDate() + 1);
        }

        return dates?.map((date) => date?.toLocaleDateString()); // Format dates as "MM/DD/YYYY"
    };

    const getSparklineOptions = (dates, allDates) => {
        const seriesData = allDates?.map(date => dates[date] || 0); // Map all dates to hours, defaulting to 0 if missing

        return {
            chart: {
                type: 'bar',
                sparkline: { enabled: true },
                toolbar: { show: false },
                zoom: { enabled: false },
            },
            tooltip: {
                enabled: true,
                x: { show: true },
                y: { formatter: (val) => `${val} hrs` },
                theme: 'light',
                marker: { show: false },
                shared: false,
            },
            stroke: { curve: 'smooth' },
            colors: ['#41c3f9'],
            series: [{ data: seriesData }],
            plotOptions: {
                bar: { columnWidth: '50%' },
            },
            xaxis: {
                categories: allDates,
                labels: {
                    show: true,
                    style: {
                        fontSize: '10px',
                        fontFamily: 'Arial',
                    },
                },
                crosshairs: { width: 1 },
                tooltip: { enabled: false },
            },
            yaxis: {
                show: false,
                min: 0,
                max: Math.max(...seriesData) + 1,
            },
        };
    };

    const byEmployeeData = useMemo(() => {
        // const filteredData = selectedUserId
        //     ? data.filter((entry) => entry.user_name === selectedUserId)
        //     : data;

        const filteredData = data
            .filter((entry) => selectedUserId ? entry?.user_name === selectedUserId : true)
            .filter((entry) => entry?.is_non_project === nonProject);

        const [startDate, endDate] = selectedDateRange;
        const allDates = startDate && endDate ? generateDateRange(startDate, endDate) : [];

        const grouped = filteredData.reduce((acc, curr) => {
            const key = curr.project_name;
            if (!acc[key]) {
                acc[key] = {
                    project_name: curr?.project_name,
                    user_name: curr?.user_name,
                    dates: {},
                    total: 0,
                };
            }
            acc[key].dates[curr?.timesheet_date] = (acc[key]?.dates[curr?.timesheet_date] || 0) + curr?.hours;
            acc[key].total += curr?.hours;
            return acc;
        }, {});

        // Add missing dates with 0 hours
        Object.values(grouped)?.forEach((project) => {
            const missingDates = allDates?.filter(date => !project?.dates[date]);
            missingDates?.forEach((date) => {
                project.dates[date] = 0; // Set missing date to 0 hours
            });
        });

        return Object.values(grouped)?.map((project) => ({
            ...project,
            dates: Object.keys(project.dates)
                .sort((a, b) => new Date(a) - new Date(b)) // Sort dates in ascending order
                .reduce((sortedDates, date) => {
                    sortedDates[date] = project?.dates[date];
                    return sortedDates;
                }, {}),
        }));
    }, [data, selectedUserId, selectedDateRange, nonProject]);

    const byProjectData = useMemo(() => {
        // const filteredData = selectedProjectName
        //     ? data.filter((entry) => entry.project_name === selectedProjectName)
        //     : data;

        const filteredData = data
            .filter((entry) => selectedProjectName ? entry?.project_name === selectedProjectName : true)
            .filter((entry) => entry?.is_non_project === nonProject);

        const [startDate, endDate] = selectedDateRange;
        const allDates = startDate && endDate ? generateDateRange(startDate, endDate) : [];

        const grouped = filteredData.reduce((acc, curr) => {
            const key = curr?.user_name;
            if (!acc[key]) {
                acc[key] = {
                    user_name: curr?.user_name,
                    project_name: curr?.project_name,
                    dates: {},
                    total: 0,
                };
            }
            acc[key].dates[curr?.timesheet_date] = (acc[key].dates[curr?.timesheet_date] || 0) + curr?.hours;
            acc[key].total += curr?.hours;
            return acc;
        }, {});

        // Add missing dates with 0 hours
        Object.values(grouped).forEach((user) => {
            const missingDates = allDates?.filter(date => !user.dates[date]);
            missingDates?.forEach((date) => {
                user.dates[date] = 0; // Set missing date to 0 hours
            });
        });

        return Object.values(grouped).map((user) => ({
            ...user,
            dates: Object.keys(user.dates)
                .sort((a, b) => new Date(a) - new Date(b)) // Sort dates in ascending order
                .reduce((sortedDates, date) => {
                    sortedDates[date] = user?.dates[date];
                    return sortedDates;
                }, {}),
        }));
    }, [data, selectedProjectName, selectedDateRange, nonProject]);

    // Columns for "By Employee" tab
    const employeeColumns = [
        {
            title: 'Project Name',
            dataIndex: 'project_name',
            key: 'project_name',
        },
        {
            title: 'Hours',
            dataIndex: 'dates',
            key: 'dates',
            render: (dates) => (
                <Chart
                    options={getSparklineOptions(dates, Object.keys(dates))}
                    series={getSparklineOptions(dates, Object.keys(dates)).series}
                    type="bar"
                    width="100"
                />
            ),
        },
        {
            title: 'Total',
            dataIndex: 'total',
            key: 'total',
        },
    ];

    // Columns for "By Project" tab
    const projectColumns = [
        {
            title: 'User Name',
            dataIndex: 'user_name',
            key: 'user_name',
        },
        {
            title: 'Hours',
            dataIndex: 'dates',
            key: 'dates',
            render: (dates) => (
                <Chart
                    options={getSparklineOptions(dates, Object.keys(dates))}
                    series={getSparklineOptions(dates, Object.keys(dates)).series}
                    type="bar"
                    width="100"
                />
            ),
        },
        {
            title: 'Total',
            dataIndex: 'total',
            key: 'total',
        },
    ];

    return (
        <div ref={printRef}>
            <Tabs defaultActiveKey="1"
                tabBarExtraContent={
                    <Checkbox
                        checked={nonProject}
                        onChange={(e) => { setSelectedProjectName(); setNonProject(e.target.checked) }}
                    >
                        Non-Project
                    </Checkbox>
                }
            >
                <TabPane tab="Project Summary" key="1">
                    <div>
                        {/* <RangePicker
                            value={selectedDateRange}
                            onChange={setSelectedDateRange}
                            style={{ marginBottom: 16 }}
                            format="YYYY-MM-DD"
                        /> */}

                        <Select allowClear
                            value={selectedUserId}
                            onChange={setSelectedUserId}
                            style={{ width: 200, marginBottom: 16 }}
                            placeholder="Select User"
                        >
                            {userIds.map((userId) => (
                                <Option key={userId} value={userId}>
                                    {userId}
                                </Option>
                            ))}
                        </Select>

                        <Table
                            columns={employeeColumns}
                            dataSource={byEmployeeData}
                            rowKey="project_name"
                            pagination={false}
                        />
                    </div>
                </TabPane>
                <TabPane tab="Employee Summary" key="2">
                    <div>
                        {/* <RangePicker
                            value={selectedDateRange}
                            onChange={setSelectedDateRange}
                            style={{ marginBottom: 16 }}
                            format="YYYY-MM-DD"
                        /> */}

                        <Select allowClear
                            value={selectedProjectName}
                            onChange={setSelectedProjectName}
                            style={{ width: 200, marginBottom: 16 }}
                            placeholder="Select Project"
                        >
                            {projectNames.map((projectName) => (
                                <Option key={projectName} value={projectName}>
                                    {projectName}
                                </Option>
                            ))}
                        </Select>

                        <Table
                            columns={projectColumns}
                            dataSource={byProjectData}
                            rowKey="user_name"
                            pagination={false}
                        />
                    </div>
                </TabPane>
            </Tabs>
        </div>
    );
};

export default TimesheetComponent;
