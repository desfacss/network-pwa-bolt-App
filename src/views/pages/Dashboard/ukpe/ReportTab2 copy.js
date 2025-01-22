import React, { useState, useMemo } from 'react';
import { Tabs, Table, Select } from 'antd';
import { Sparklines, SparklinesBars } from 'react-sparklines';
import Chart from 'react-apexcharts';
const { TabPane } = Tabs;
const { Option } = Select;

const TimesheetComponent = ({ data, printRef }) => {
    // console.log("Chart Component:", Chart);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedProjectName, setSelectedProjectName] = useState(null);

    // Unique user IDs and project names for Select options
    console.log("UT", data);
    const userIds = [...new Set(data.map((entry) => entry.user_id))];
    const projectNames = [...new Set(data.map((entry) => entry.project_name))];

    // Data transformation for "By Employee" tab
    const byEmployeeData = useMemo(() => {
        const filteredData = selectedUserId
            ? data.filter((entry) => entry.user_id === selectedUserId)
            : data;

        const grouped = filteredData.reduce((acc, curr) => {
            const key = curr.project_name;
            if (!acc[key]) {
                acc[key] = {
                    project_name: curr.project_name,
                    user_id: curr.user_id,
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
    console.log("BE", byEmployeeData)

    // Data transformation for "By Project" tab
    const byProjectData = useMemo(() => {
        const filteredData = selectedProjectName
            ? data.filter((entry) => entry.project_name === selectedProjectName)
            : data;

        const grouped = filteredData.reduce((acc, curr) => {
            const key = curr.user_id;
            if (!acc[key]) {
                acc[key] = {
                    user_id: curr.user_id,
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

    const getSparklineOptions = (data) => {
        const categories = Object.keys(data); // Dates
        const seriesData = Object.values(data); // Values
        console.log("dates", categories, seriesData)
        return {
            chart: {
                type: 'line',
                sparkline: { enabled: true },
                toolbar: {
                    show: false, // This hides the entire toolbar including download and zoom options
                },
                zoom: {
                    enabled: false, // Disables zoom controls
                },
            },
            tooltip: {
                enabled: true,
                x: {
                    formatter: (value, { dataPointIndex }) => categories[dataPointIndex], // Show date in tooltip
                },
                y: {
                    formatter: (val) => `${val} hrs`,
                },
            },
            stroke: {
                curve: 'smooth',
            },
            colors: ['#41c3f9'],
            series: [{
                name: 'Daily Data',
                data: seriesData,
            }
                // { data }
            ],
        }
    };

    const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, value: null });

    const handleMouseMove = (event, value) => {
        const { clientX, clientY } = event;
        setTooltip({
            visible: true,
            x: clientX,
            y: clientY,
            value,
        });
    };

    const handleMouseLeave = () => {
        setTooltip({ ...tooltip, visible: false });
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
                <>
                    {/* <Sparklines data={Object.values(dates)}>
                        <SparklinesBars style={{ fill: "#41c3f9" }} />
                    </Sparklines> */}
                    <Chart
                        options={getSparklineOptions((dates)).chart}
                        series={getSparklineOptions((dates)).series}
                        type="line"
                        width="100"
                    />
                </>
                // <div style={{ position: "relative" }}>
                //     <Sparklines
                //         data={Object.values(dates)}
                //         onMouseMove={(event) => handleMouseMove(event, Object.values(dates))}
                //         onMouseLeave={handleMouseLeave}
                //     >
                //         <SparklinesBars style={{ fill: "#41c3f9" }} />
                //     </Sparklines>
                //     {tooltip.visible && (
                //         <div
                //             style={{
                //                 position: "absolute",
                //                 left: tooltip.x,
                //                 top: tooltip.y,
                //                 backgroundColor: "#fff",
                //                 padding: "5px",
                //                 border: "1px solid #ccc",
                //                 borderRadius: "4px",
                //                 pointerEvents: "none",
                //                 transform: "translate(-50%, -100%)",
                //             }}
                //         >
                //             {tooltip.value} hrs
                //         </div>
                //     )}
                // </div>
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
            title: 'User ID',
            dataIndex: 'user_id',
            key: 'user_id',
        },
        {
            title: 'Hours',
            dataIndex: 'dates',
            key: 'dates',
            render: (dates) => (
                <>
                    <Sparklines data={Object.values(dates)}>
                        <SparklinesBars style={{ fill: "#41c3f9" }} />
                    </Sparklines>
                    {/* <Chart
                        options={getSparklineOptions(Object.values(dates)).chart}
                        series={getSparklineOptions(Object.values(dates)).series}
                        type="line"
                        width="100"
                    /> */}
                </>
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
                    <Table columns={projectColumns} dataSource={byProjectData} rowKey="user_id" />
                </TabPane>
            </Tabs>
        </div>
    );
};

export default TimesheetComponent;
