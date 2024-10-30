import React, { useState, useMemo } from 'react';
import { Tabs, Table, Select } from 'antd';
import { Sparklines, SparklinesBars } from 'react-sparklines';

const { TabPane } = Tabs;
const { Option } = Select;

const data = [
    { timesheet_date: '2024-10-21', user_id: '3c29dcca-c386-4ca3-b690-015ff156913b', project_name: 'Project 2', hours: 4, description: 'tt' },
    { timesheet_date: '2024-10-21', user_id: '3c29dcca-c386-4ca3-b690-015ff156913b', project_name: 'Project T', hours: 1, description: 'jjjjjj' },
    { timesheet_date: '2024-10-21', user_id: '3c29dcca-c386-4ca3-b690-015ff156913b', project_name: 'project 1', hours: 2, description: 'sdfsstr' },
    { timesheet_date: '2024-10-21', user_id: '3c29dcca-c386-4ca3-b690-015ff156913b', project_name: 'test project', hours: 3, description: 'ff' },
    { timesheet_date: '2024-10-22', user_id: '3c29dcca-c386-4ca3-b690-015ff156913b', project_name: 'Project 2', hours: 1, description: 'dgg' },
    { timesheet_date: '2024-10-22', user_id: '3c29dcca-c386-4ca3-b690-015ff156913b', project_name: 'Project T', hours: 3, description: 'xfg' },
    { timesheet_date: '2024-10-22', user_id: '3c29dcca-c386-4ca3-b690-015ff156913b', project_name: 'project 1', hours: 2, description: 'dfgrr' },
    { timesheet_date: '2024-10-22', user_id: '3c29dcca-c386-4ca3-b690-015ff156913b', project_name: 'test project', hours: 1, description: 'dfg' },
    { timesheet_date: '2024-10-23', user_id: '3c29dcca-c386-4ca3-b690-015ff156913b', project_name: 'Project 2', hours: 0, description: '' },
    { timesheet_date: '2024-10-23', user_id: '3c29dcca-c386-4ca3-b690-015ff156913b', project_name: 'Project T', hours: 0, description: '' },
    { timesheet_date: '2024-10-23', user_id: '3c29dcca-c386-4ca3-b690-015ff156913b', project_name: 'project 1', hours: 0, description: '' },
    { timesheet_date: '2024-10-23', user_id: '3c29dcca-c386-4ca3-b690-015ff156913b', project_name: 'test project', hours: 3, description: '' },
];

const TimesheetTabs = () => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);

    // Filtered data for "By Employee" view
    const employeeData = useMemo(() => {
        const filtered = selectedUser ? data.filter(d => d.user_id === selectedUser) : data;
        const grouped = filtered.reduce((acc, curr) => {
            const existing = acc.find(item => item.user_id === curr.user_id);
            if (existing) {
                existing.hoursData.push(curr.hours);
                existing.total += curr.hours;
            } else {
                acc.push({
                    user_id: curr.user_id,
                    hoursData: [curr.hours],
                    total: curr.hours,
                });
            }
            return acc;
        }, []);
        return grouped;
    }, [selectedUser]);

    // Filtered data for "By Project" view
    const projectData = useMemo(() => {
        const filtered = selectedProject ? data.filter(d => d.project_name === selectedProject) : data;
        const grouped = filtered.reduce((acc, curr) => {
            const existing = acc.find(item => item.project_name === curr.project_name);
            if (existing) {
                existing.hoursData.push(curr.hours);
                existing.total += curr.hours;
            } else {
                acc.push({
                    project_name: curr.project_name,
                    hoursData: [curr.hours],
                    total: curr.hours,
                });
            }
            return acc;
        }, []);
        return grouped;
    }, [selectedProject]);

    return (
        <Tabs defaultActiveKey="1">
            <TabPane tab="By Employee" key="1">
                <Select
                    style={{ width: 200, marginBottom: 16 }}
                    placeholder="Select User"
                    onChange={(value) => setSelectedUser(value)}
                    allowClear
                >
                    {[...new Set(data.map(d => d.user_id))].map(userId => (
                        <Option key={userId} value={userId}>{userId}</Option>
                    ))}
                </Select>
                <Table
                    dataSource={employeeData}
                    columns={[
                        { title: 'User ID', dataIndex: 'user_id', key: 'user_id' },
                        {
                            title: 'Hours',
                            dataIndex: 'hoursData',
                            key: 'hoursData',
                            render: (hoursData) => (
                                <Sparklines data={hoursData}>
                                    <SparklinesBars style={{ fill: "#41c3f9" }} />
                                </Sparklines>
                            ),
                        },
                        { title: 'Total', dataIndex: 'total', key: 'total' },
                    ]}
                    rowKey="user_id"
                />
            </TabPane>
            <TabPane tab="By Project" key="2">
                <Select
                    style={{ width: 200, marginBottom: 16 }}
                    placeholder="Select Project"
                    onChange={(value) => setSelectedProject(value)}
                    allowClear
                >
                    {[...new Set(data.map(d => d.project_name))].map(projectName => (
                        <Option key={projectName} value={projectName}>{projectName}</Option>
                    ))}
                </Select>
                <Table
                    dataSource={projectData}
                    columns={[
                        { title: 'Project Name', dataIndex: 'project_name', key: 'project_name' },
                        {
                            title: 'Hours',
                            dataIndex: 'hoursData',
                            key: 'hoursData',
                            render: (hoursData) => (
                                <Sparklines data={hoursData}>
                                    <SparklinesBars style={{ fill: "#41c3f9" }} />
                                </Sparklines>
                            ),
                        },
                        { title: 'Total', dataIndex: 'total', key: 'total' },
                    ]}
                    rowKey="project_name"
                />
            </TabPane>
        </Tabs>
    );
};

export default TimesheetTabs;
