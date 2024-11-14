import React, { useEffect, useRef, useState } from 'react';
import { Select, DatePicker, Button, Typography, Divider, Card, Row, Col } from 'antd';
import { supabase } from 'configs/SupabaseConfig';
import DownloadMenu from 'components/common/DownloadMenu';
// import dayjs from 'dayjs';
// import { supabase } from './supabaseClient'; // Adjust the import based on your Supabase setup
// import dayjs from 'dayjs';
import { useReactToPrint } from 'react-to-print';

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

    const reportDataRef = useRef();

    const handlePrint = useReactToPrint({
        // content: () => reportDataRef?.current,
        contentRef: reportDataRef
    })

    const fetchUsers = async () => {
        const { data, error } = await supabase.from('users').select('id, user_name');
        if (error) console.error(error);
        else setUsers(data);
    };

    const fetchProjects = async () => {
        const { data, error } = await supabase.from('x_projects').select('id, project_name');
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
            return alert("Please select a date range.");
        }

        const [startDate, endDate] = dateRange;
        const { data, error } = await supabase.rpc('generate_timesheet_view_v1', {
            start_date: startDate.format('YYYY-MM-DD'),
            end_date: endDate.format('YYYY-MM-DD'),
            selected_project: projectName || null,
            selected_user: userId || null,
        });

        if (error) {
            console.error("Error fetching report data:", error);
        } else {
            console.log("Report Data", data.map(e => e.hours))
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

    return (
        <Card style={{ padding: '24px' }}>
            <Title level={3}>Generate Report</Title>
            <div style={{ marginBottom: '16px' }}>
                <Select
                    placeholder="Select User"
                    onChange={setUserId}
                    style={{ width: 200, marginRight: 16 }}
                // Add options here for user selection
                >
                    {users.map((user) => (
                        <Option key={user.id} value={user.id}>{user.user_name}</Option>
                    ))}
                </Select>
                <Select
                    placeholder="Select Project"
                    onChange={setProjectName}
                    style={{ width: 200, marginRight: 16 }}
                // Add options here for project selection
                // options={[
                //     { label: 'Project A', value: 'project_a' },
                //     { label: 'Project B', value: 'project_b' },
                //     // Replace these with actual project options from Supabase
                // ]}
                >
                    {projects?.map((project) => (
                        <Option key={project.id} value={project.id}>{project.project_name}</Option>
                    ))}
                </Select>
                <RangePicker onChange={(dates) => setDateRange(dates)} />
            </div>
            <Row justify="space-between" align="middle" style={{ width: '100%' }}>
                <Col>
                    <Button type="primary" onClick={fetchReportData}>Get Report</Button>
                </Col>
                <Col>
                    {summary && <Button onClick={handlePrint} style={{ textAlign: 'right' }}>Download</Button>}
                </Col>
            </Row>
            {/* {summary && <DownloadMenu dataSource={summary} printRef={reportDataRef} />} */}
            {summary && (
                <div style={{ marginTop: '24px' }} ref={reportDataRef}>
                    <Divider />
                    <Title level={4}>Report Summary</Title>
                    <Divider />
                    <Text>USER: {users.find((user) => user.id === userId)?.user_name || "N/A"}</Text>
                    <br />
                    <Text>PROJECT: {projects.find((project) => project.id === projectName)?.project_name || "N/A"}</Text>
                    <br />
                    <Text>DATE RANGE: {dateRange.length === 2 ? `${dateRange[0].format('YYYY-MM-DD')} to ${dateRange[1].format('YYYY-MM-DD')}` : "N/A"}</Text>
                    <Divider />
                    <Text>TOTAL HOURS (FOR THE SELECTED DATE RANGE): {summary.totalHours} HOURS</Text>
                    <br />
                    <Text>TOTAL HOURS ALLOCATED: {summary.allocatedHours} HOURS</Text>
                    <br />
                    <Text>TOTAL EXPENSED HOURS: {summary.expensedHours} HOURS</Text>
                    <br />
                    <Text>BALANCE HOURS: {summary.balanceHours} HOURS</Text>
                    <Divider />
                    <Text>COST/HR: {summary.costPerHour}</Text>
                    <br />
                    <Text>TOTAL COST: {summary.totalCost}</Text>
                </div>
            )}
            {emptyData && <div style={{ marginTop: '24px' }}>No Data Available</div>}
        </Card>
    );
};

export default ReportComponent;
