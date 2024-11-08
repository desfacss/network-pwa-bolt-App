import React from 'react';
import Chart from 'react-apexcharts';

// Function to get total hours per day
const getDailySummary = (data) => {
    return data.reduce((acc, entry) => {
        const { timesheet_date, hours } = entry;
        acc[timesheet_date] = (acc[timesheet_date] || 0) + hours;
        return acc;
    }, {});
};

// Function to get total hours per project
const getProjectSummary = (data) => {
    return data.reduce((acc, entry) => {
        const { project_name, hours } = entry;
        acc[project_name] = (acc[project_name] || 0) + hours;
        return acc;
    }, {});
};

// Function to get detailed report grouped by date and then by project
const getDetailedReport = (data) => {
    return data.reduce((acc, entry) => {
        const { timesheet_date, project_name, hours, description } = entry;
        if (!acc[timesheet_date]) {
            acc[timesheet_date] = {};
        }
        if (!acc[timesheet_date][project_name]) {
            acc[timesheet_date][project_name] = [];
        }
        acc[timesheet_date][project_name].push({ hours, description });
        return acc;
    }, {});
};


export const DailySummaryChart = () => {
    const data = [
        {
            "timesheet_date": "2024-10-21",
            "user_id": "3c29dcca-c386-4ca3-b690-015ff156913b",
            "project_name": "Project 2",
            "hours": 4,
            "description": "tt"
        },
        {
            "timesheet_date": "2024-10-21",
            "user_id": "3c29dcca-c386-4ca3-b690-015ff156913b",
            "project_name": "Project T",
            "hours": 1,
            "description": "jjjjjj"
        },
        {
            "timesheet_date": "2024-10-21",
            "user_id": "3c29dcca-c386-4ca3-b690-015ff156913b",
            "project_name": "project 1",
            "hours": 2,
            "description": "sdfsstr"
        },
        {
            "timesheet_date": "2024-10-21",
            "user_id": "3c29dcca-c386-4ca3-b690-015ff156913b",
            "project_name": "test project",
            "hours": 3,
            "description": "ff"
        },
        {
            "timesheet_date": "2024-10-22",
            "user_id": "3c29dcca-c386-4ca3-b690-015ff156913b",
            "project_name": "Project 2",
            "hours": 1,
            "description": "dgg"
        },
        {
            "timesheet_date": "2024-10-22",
            "user_id": "3c29dcca-c386-4ca3-b690-015ff156913b",
            "project_name": "Project T",
            "hours": 3,
            "description": "xfg"
        },
        {
            "timesheet_date": "2024-10-22",
            "user_id": "3c29dcca-c386-4ca3-b690-015ff156913b",
            "project_name": "project 1",
            "hours": 2,
            "description": "dfgrr"
        },
        {
            "timesheet_date": "2024-10-22",
            "user_id": "3c29dcca-c386-4ca3-b690-015ff156913b",
            "project_name": "test project",
            "hours": 1,
            "description": "dfg"
        },
        {
            "timesheet_date": "2024-10-23",
            "user_id": "3c29dcca-c386-4ca3-b690-015ff156913b",
            "project_name": "Project 2",
            "hours": 0,
            "description": ""
        },
        {
            "timesheet_date": "2024-10-23",
            "user_id": "3c29dcca-c386-4ca3-b690-015ff156913b",
            "project_name": "Project T",
            "hours": 0,
            "description": ""
        },
        {
            "timesheet_date": "2024-10-23",
            "user_id": "3c29dcca-c386-4ca3-b690-015ff156913b",
            "project_name": "project 1",
            "hours": 0,
            "description": ""
        },
        {
            "timesheet_date": "2024-10-23",
            "user_id": "3c29dcca-c386-4ca3-b690-015ff156913b",
            "project_name": "test project",
            "hours": 3,
            "description": ""
        }
    ]
    const dailySummary = getDailySummary(data);
    const chartData = {
        series: [{
            name: 'Hours Worked',
            data: Object.values(dailySummary)
        }],
        options: {
            chart: {
                type: 'bar'
            },
            xaxis: {
                categories: Object.keys(dailySummary),
            }
        }
    };

    return <Chart options={chartData.options} series={chartData.series} type="bar" />;
};
