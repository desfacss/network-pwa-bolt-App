import React, { useState, useMemo } from 'react';
import { Tabs, Table, Select } from 'antd';
import Chart from 'react-apexcharts';

const { TabPane } = Tabs;
const { Option } = Select;

const TimesheetComponent = ({ data, printRef }) => {
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedProjectName, setSelectedProjectName] = useState(null);

    // Unique user IDs and project names for Select options
    const userIds = [...new Set(data.map((entry) => entry.user_name))];
    const projectNames = [...new Set(data.map((entry) => entry.project_name))];

    // Data transformation for "By Employee" tab
    const byEmployeeData = useMemo(() => {
        const filteredData = selectedUserId
            ? data.filter((entry) => entry.user_name === selectedUserId)
            : data;

        const grouped = filteredData.reduce((acc, curr) => {
            const key = curr.project_name;
            if (!acc[key]) {
                acc[key] = {
                    project_name: curr.project_name,
                    user_name: curr.user_name,
                    dates: {},
                    total: 0,
                };
            }
            acc[key].dates[curr.timesheet_date] = (acc[key].dates[curr.timesheet_date] || 0) + curr.hours;
            acc[key].total += curr.hours;
            return acc;
        }, {});

        return Object.values(grouped);
    }, [data, selectedUserId]);

    // Data transformation for "By Project" tab
    const byProjectData = useMemo(() => {
        const filteredData = selectedProjectName
            ? data.filter((entry) => entry.project_name === selectedProjectName)
            : data;

        const grouped = filteredData.reduce((acc, curr) => {
            const key = curr.user_name;
            if (!acc[key]) {
                acc[key] = {
                    user_name: curr.user_name,
                    project_name: curr.project_name,
                    dates: {},
                    total: 0,
                };
            }
            acc[key].dates[curr.timesheet_date] = (acc[key].dates[curr.timesheet_date] || 0) + curr.hours;
            acc[key].total += curr.hours;
            return acc;
        }, {});

        return Object.values(grouped);
    }, [data, selectedProjectName]);

    // Sparkline options generator
    const getSparklineOptions = (dates) => {
        const seriesData = Object.values(dates);
        return {
            chart: {
                type: 'line',
                sparkline: { enabled: true },
                toolbar: { show: false },
                zoom: { enabled: false },
            },
            tooltip: {
                enabled: true,
                x: { show: false },
                y: { formatter: (val) => `${val} hrs` },
            },
            stroke: { curve: 'smooth' },
            colors: ['#41c3f9'],
            series: [{ data: seriesData }],
        };
    };

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
                    options={getSparklineOptions(dates)}
                    series={getSparklineOptions(dates).series}
                    type="line"
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
                    options={getSparklineOptions(dates)}
                    series={getSparklineOptions(dates).series}
                    type="line"
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
            <Tabs defaultActiveKey="byEmployee">
                <TabPane tab="Project Summary" key="byEmployee">
                    <Select
                        style={{ width: 200, marginBottom: 16 }}
                        placeholder="Select User ID"
                        onChange={setSelectedUserId}
                        value={selectedUserId}
                        allowClear
                    >
                        {userIds.map((id) => (
                            <Option key={id} value={id}>
                                {id}
                            </Option>
                        ))}
                    </Select>
                    <Table columns={employeeColumns} dataSource={byEmployeeData} rowKey="project_name" />
                </TabPane>
                <TabPane tab="Employee Summary" key="byProject">
                    <Select
                        value={selectedProjectName}
                        style={{ width: 200, marginBottom: 16 }}
                        placeholder="Select Project Name"
                        onChange={setSelectedProjectName}
                        allowClear
                    >
                        {projectNames.map((name) => (
                            <Option key={name} value={name}>
                                {name}
                            </Option>
                        ))}
                    </Select>
                    <Table columns={projectColumns} dataSource={byProjectData} rowKey="user_name" />
                </TabPane>
            </Tabs>
        </div>
    );
};

export default TimesheetComponent;
