import React, { useEffect, useRef, useState } from 'react';
import { Select, DatePicker, Button, Typography, Divider, Card, Table, Spin, Empty, message } from 'antd';
import { supabase } from 'configs/SupabaseConfig';
import { useReactToPrint } from 'react-to-print';
import { useSelector } from 'react-redux';
import { FilePdfFilled } from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
const { Option } = Select;

const ReportComponent = () => {
    const [users, setUsers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [userId, setUserId] = useState(null);
    const [projectName, setProjectName] = useState(null);
    const [dateRange, setDateRange] = useState([]);
    const [reportData, setReportData] = useState(null);
    const [emptyData, setEmptytData] = useState(false);
    const [loading, setLoading] = useState(false);

    const { session } = useSelector((state) => state.auth);

    const reportDataRef = useRef();

    const handlePrint = useReactToPrint({
        // content: () => reportDataRef?.current,
        contentRef: reportDataRef
    })

    const fetchUsers = async () => {
        const { data, error } = await supabase.from('users').select('id, user_name').eq('organization_id', session?.user?.organization_id);
        if (error) console.error(error);
        else setUsers(data);
    };

    const fetchProjects = async () => {
        const { data, error } = await supabase.from('projects').select('id, project_name').eq('organization_id', session?.user?.organization_id);
        // const { data, error } = await supabase.rpc('get_projects_with_allocation_v3', {
        //     userid: null,
        //     include_leaves: false,
        //     include_non_project: true
        // });
        if (error) console.error(error);
        else setProjects(data);
    };

    useEffect(() => {
        // Fetch users and projects on component mount
        fetchUsers();
        fetchProjects();
    }, []);

    const fetchReportData = async () => {
        if (dateRange.length !== 2) {
            return message.error("Please select a date range.");
        }

        const [startDate, endDate] = dateRange;
        setLoading(true);
        const { data, error } = await supabase.rpc('generate_timesheet_view_v3', {
            start_date: startDate.format('YYYY-MM-DD'),
            end_date: endDate.format('YYYY-MM-DD'),
            selected_project: projectName || null,
            selected_user: userId || null,
        });
        setLoading(false);
        if (error) {
            console.error("Error fetching report data:", error);
        } else {
            // console.log("Report Data", data.map(e => e.hours))
            setReportData(data);
            if (!data || data.length === 0) {
                setEmptytData(true)
            };
        }
    };

    const calculateReportSummary = (data) => {
        if (!data || data.length === 0) {
            return null
        };

        const totalHours = data.reduce((sum, entry) => sum + entry?.hours, 0);
        const allocatedHours = data[0].allocated_hours || 0;
        const expensedHours = (data[0].expensed_hours + totalHours) || 0;
        const balanceHours = allocatedHours - expensedHours;
        const costPerHour = data[0].rate || 0;
        const totalCost = totalHours * costPerHour;

        return { totalHours, allocatedHours, expensedHours, balanceHours, costPerHour, totalCost };
    };

    const summary = calculateReportSummary(reportData);

    useEffect(() => {
        setReportData()
        setEmptytData(false)
    }, [userId, projectName, dateRange])

    const columns = [
        {
            title: "Date",
            dataIndex: "timesheet_date",
            key: "timesheet_date",
            render: (text) => <span>{text}</span>,
        },
        {
            title: "Hours",
            dataIndex: "hours",
            key: "hours",
            render: (text) => <span>{text}</span>,
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
            render: (text) => <span>{text || "-"}</span>, // display "N/A" if description is empty
        },
    ];

    return (
        <Card bodyStyle={{ padding: "0px" }}>
            <div className="d-flex p-2 justify-content-between align-items-center" style={{ marginBottom: "16px" }}>
                <h2 style={{ margin: 0 }}>Reports</h2>
            </div>
            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Select showSearch
                    filterOption={(input, option) =>
                        (option?.children ?? "").toLowerCase().includes(input?.toLowerCase())
                    }
                    placeholder="Select User"
                    onChange={setUserId}
                    style={{ width: 200 }}
                >
                    {users?.map((user) => (
                        <Option key={user?.id} value={user?.id}>{user?.user_name}</Option>
                    ))}
                </Select>
                <Select showSearch
                    filterOption={(input, option) =>
                        (option?.children ?? "").toLowerCase().includes(input?.toLowerCase())
                    }
                    placeholder="Select Project"
                    onChange={setProjectName}
                    style={{ width: 200 }}
                >
                    {projects?.map((project) => (
                        <Option key={project?.id} value={project?.id}>{project?.project_name}</Option>
                    ))}
                </Select>
                <RangePicker onChange={(dates) => setDateRange(dates)} />
                <Button type="primary" onClick={fetchReportData}>Get Report</Button>
                <div style={{ flexGrow: 1, textAlign: 'right' }}>
                    {summary && <Button type="primary" icon={<FilePdfFilled />} onClick={handlePrint}>Download Report</Button>}
                </div>
            </div>

            {loading ? (
                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    <Spin size="large" />
                </div>
            ) : (
                <>
                    {summary && (
                        <div style={{ marginTop: '24px' }} ref={reportDataRef} className="report-container">
                            {/* Print-specific Header */}
                            <div className="report-header">
                                <img src="/img/ukpe_logo_dark.png" alt="Logo" className="app-logo" />
                                <Title level={4} style={{ color: '#fa8c16' }}>
                                    Report Summary - {users.find((user) => user.id === userId)?.user_name || "N/A"}
                                </Title>
                            </div>
                            <Divider />
                            <Text strong>USER: </Text>
                            <Text>{users.find((user) => user.id === userId)?.user_name || "N/A"}</Text>
                            <br />
                            <Text strong>PROJECT: </Text>
                            <Text>{projects.find((project) => project.id === projectName)?.project_name || "N/A"}</Text>
                            <br />
                            <Text strong>DATE RANGE: </Text>
                            <Text>{dateRange.length === 2 ? `${dateRange[0].format('YYYY-MM-DD')} to ${dateRange[1].format('YYYY-MM-DD')}` : "N/A"}</Text>
                            <Divider />
                            <Table size={'small'} pagination={false} columns={columns} dataSource={reportData} rowKey={(record) => record.timesheet_date + record.user_id} />
                            <Divider />
                            <Title level={5} style={{ marginTop: '24px' }}>Summary Details</Title>
                            <Text strong>TOTAL HOURS: </Text>
                            <Text>{summary.totalHours} HOURS</Text>
                            <br />
                            <Text strong>TOTAL HOURS ALLOCATED: </Text>
                            <Text>{summary.allocatedHours} HOURS</Text>
                            <br />
                            <Text strong>TOTAL EXPENSED HOURS: </Text>
                            <Text>{summary.expensedHours} HOURS</Text>
                            <br />
                            <Text strong>BALANCE HOURS: </Text>
                            <Text>{summary.balanceHours} HOURS</Text>
                            <Divider />
                            <Text strong>COST/HR: </Text>
                            <Text>{summary.costPerHour}</Text>
                            <br />
                            <Text strong>TOTAL COST: </Text>
                            <Text>{summary.totalCost}</Text>
                        </div>
                    )}
                    {emptyData &&
                        <Empty description='No Data' />
                    }
                </>
            )}
        </Card>
    );
};

export default ReportComponent;
