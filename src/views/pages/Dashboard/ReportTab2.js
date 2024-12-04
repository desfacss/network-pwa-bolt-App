import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Tabs, Table, Select, DatePicker, Checkbox, Empty, Button, Tooltip } from 'antd';
import Chart from 'react-apexcharts';
import DownloadMenu from 'components/common/DownloadMenu';
import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { supabase } from 'configs/SupabaseConfig';
import { useReactToPrint } from 'react-to-print';
import { FilePdfFilled } from '@ant-design/icons';

const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

const TimesheetComponent = ({ data, printRef }) => {

    const defaultStartDate = dayjs().subtract(7, 'days');
    const defaultEndDate = dayjs();
    const [reportData, setReportData] = useState();
    const [dateRange, setDateRange] = useState([defaultStartDate, defaultEndDate]);
    const { session } = useSelector((state) => state.auth);
    const dateFormat = 'YYYY/MM/DD';
    const reportDataRef = useRef(null);
    const [loading, setLoading] = useState(false);

    const handlePrint = useReactToPrint({
        // content: () => reportDataRef?.current,
        contentRef: reportDataRef
    })

    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedProjectName, setSelectedProjectName] = useState(null);
    const [selectedDateRange, setSelectedDateRange] = useState([null, null]); // To store the start and end date
    const [nonProject, setNonProject] = useState(false);

    // Unique user IDs and project names for Select options
    const userIds = [...new Set(reportData?.map((entry) => entry?.user_name))];
    const projectNames = [...new Set(reportData?.filter((entry) => entry.is_non_project === nonProject)?.map((entry) => entry?.project_name))];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            // const { data: viewData, error } = await supabase
            //     .from('generate_timesheet_view_v1') // Replace with the name of your view
            //     .select('*'); // Specify the columns you want to fetch, or '*' for all
            const startDate = dateRange[0];
            const endDate = dateRange[1];
            const projectName = null; // Use null if you want to query all projects
            const userId = !['hr', 'manager', 'admin'].includes(session?.user?.role_type) ? session?.user?.id : null;


            // Make the RPC call to the generate_timesheet_view function
            const { data: viewData, error } = await supabase
                .rpc('generate_timesheet_view_v3', {
                    start_date: startDate,
                    end_date: endDate,
                    // project_name: projectName, // Pass null if querying all projects
                    // user_id: userId,
                    selected_project: projectName, // Pass null if querying all projects
                    selected_user: userId,
                });

            if (error) {
                console.error('Error fetching data:', error);
                console.log("VW", error);
            } else {
                setReportData(viewData)
                console.log("VD", viewData);
                // console.log("VD", JSON.stringify(viewData, null, 2));
            }
            setLoading(false);
        };

        fetchData();
        console.log(dateRange)
    }, [dateRange]);


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

        const filteredData = reportData && reportData
            ?.filter((entry) => selectedUserId ? entry?.user_name === selectedUserId : true)
            ?.filter((entry) => entry?.is_non_project === nonProject);

        const [startDate, endDate] = selectedDateRange;
        const allDates = startDate && endDate ? generateDateRange(startDate, endDate) : [];

        const grouped = filteredData && filteredData?.reduce((acc, curr) => {
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
        grouped && Object.values(grouped)?.forEach((project) => {
            const missingDates = allDates?.filter(date => !project?.dates[date]);
            missingDates?.forEach((date) => {
                project.dates[date] = 0; // Set missing date to 0 hours
            });
        });

        return grouped && Object.values(grouped)?.map((project) => ({
            ...project,
            dates: Object.keys(project.dates)
                .sort((a, b) => new Date(a) - new Date(b)) // Sort dates in ascending order
                .reduce((sortedDates, date) => {
                    sortedDates[date] = project?.dates[date];
                    return sortedDates;
                }, {}),
        }));
    }, [reportData, selectedUserId, selectedDateRange, nonProject]);

    const byProjectData = useMemo(() => {
        // const filteredData = selectedProjectName
        //     ? data.filter((entry) => entry.project_name === selectedProjectName)
        //     : data;

        const filteredData = reportData && reportData
            ?.filter((entry) => selectedProjectName ? entry?.project_name === selectedProjectName : true)
            ?.filter((entry) => entry?.is_non_project === nonProject);

        const [startDate, endDate] = selectedDateRange;
        const allDates = startDate && endDate ? generateDateRange(startDate, endDate) : [];

        const grouped = filteredData && filteredData?.reduce((acc, curr) => {
            const key = curr?.user_name;
            if (!acc[key]) {
                acc[key] = {
                    user_name: curr?.user_name,
                    project_name: curr?.project_name,
                    dates: {},
                    total: 0,
                };
            }
            acc[key].dates[curr?.timesheet_date] = (acc[key]?.dates[curr?.timesheet_date] || 0) + curr?.hours;
            acc[key].total += curr?.hours;
            return acc;
        }, {});

        // Add missing dates with 0 hours
        grouped && Object.values(grouped).forEach((user) => {
            const missingDates = allDates?.filter(date => !user?.dates[date]);
            missingDates?.forEach((date) => {
                user.dates[date] = 0; // Set missing date to 0 hours
            });
        });

        return grouped && Object.values(grouped).map((user) => ({
            ...user,
            dates: Object.keys(user?.dates)
                .sort((a, b) => new Date(a) - new Date(b)) // Sort dates in ascending order
                .reduce((sortedDates, date) => {
                    sortedDates[date] = user?.dates[date];
                    return sortedDates;
                }, {}),
        }));
    }, [reportData, selectedProjectName, selectedDateRange, nonProject]);

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
        <div ref={reportDataRef}>
            <Tabs defaultActiveKey="1"
                tabBarExtraContent={
                    <>
                        <RangePicker defaultValue={[defaultStartDate, defaultEndDate]} allowClear={false}
                            // format={dateFormat} 
                            onChange={(date) => {
                                setDateRange([
                                    date[0]?.format(dateFormat), // Format date here
                                    date[1]?.format(dateFormat), // Format date here
                                ]);
                            }}
                            // onChange={(date) => { console.log(date[0]); setDateRange([date?.startDate, date?.endDate]) }} 
                            // style={{ marginBottom: '20px' }} 
                            />
                        <Checkbox className='ml-2'
                            checked={nonProject}
                            onChange={(e) => { setSelectedProjectName(); setNonProject(e.target.checked) }}
                        >
                            Non-Project
                        </Checkbox>
                        {reportData && <Tooltip title='Download Report'><Button type='primary' icon={<FilePdfFilled />} onClick={handlePrint}></Button></Tooltip>
                        }
                    </>
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

                        <Select allowClear showSearch
                            filterOption={(input, option) =>
                                (option?.children ?? "").toLowerCase().includes(input.toLowerCase())
                            }
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

                        <Table size={'small'}
                            columns={employeeColumns}
                            dataSource={byEmployeeData}
                            rowKey="project_name"
                            pagination={false}
                            locale={{
                                emptyText: <Empty description="No results. Try widening your search!" />,
                            }}
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

                        <Select allowClear showSearch
                            filterOption={(input, option) =>
                                (option?.children ?? "").toLowerCase().includes(input.toLowerCase())
                            }
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

                        <Table size={'small'}
                            columns={projectColumns}
                            dataSource={byProjectData}
                            rowKey="user_name"
                            pagination={false}
                            locale={{
                                emptyText: <Empty description="No results. Try widening your search!" />,
                            }}
                        />
                    </div>
                </TabPane>
            </Tabs>
        </div>
    );
};

export default TimesheetComponent;
