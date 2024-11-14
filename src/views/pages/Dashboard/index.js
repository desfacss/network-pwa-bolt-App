import React, { useEffect, useRef, useState } from 'react';
import { Form, Input, Button, Select, message, Card, DatePicker } from 'antd';
import { supabase } from 'configs/SupabaseConfig';
import { useSelector } from 'react-redux';
import axios from 'axios';
// import { sendEmail } from 'components/common/SendEmail';
import { sendBatchEmail } from './sendBatchEmail';
// import { DailySummaryChart } from './Report';
// import SparklineTable from './Sparklines';
// import TimesheetTabs from './ReportTab';
import TimesheetComponent from './ReportTab2';
import DownloadMenu from 'components/common/DownloadMenu';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const Dashboaard = () => {
    const defaultStartDate = dayjs().subtract(30, 'days');
    const defaultEndDate = dayjs();
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState();
    const [dateRange, setDateRange] = useState([defaultStartDate, defaultEndDate]);
    const { session } = useSelector((state) => state.auth);
    const dateFormat = 'YYYY/MM/DD';
    const reportDataRef = useRef(null);
    // const onFinish = async (values) => {
    //     const {
    //         email,
    //         mobile,
    //         firstName,
    //         lastName,
    //         role_type,
    //     } = values;

    //     const userName = `${firstName} ${lastName}`;

    //     setLoading(true);

    //     try {
    //         // Step 1: Send user invite link
    //         // const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email);
    //         const { data, error: inviteError } = await axios.post('https://azzqopnihybgniqzrszl.functions.supabase.co/invite_users', { email }, { headers: { 'Content-Type': 'application/json' } });

    //         if (inviteError) {
    //             throw inviteError;
    //         }

    //         // Step 2: Insert new row in the users table
    //         const payload = {
    //             organization_id: session?.user?.organization_id,
    //             role_type: role_type,
    //             details: {
    //                 role_type,
    //                 email,
    //                 mobile,
    //                 orgName: session?.user?.details?.orgName,
    //                 lastName,
    //                 userName,
    //                 firstName,
    //             },
    //             id: data?.id,
    //             user_name: userName,
    //             is_manager: role_type === 'manager',
    //             is_active: true,
    //             manager_id: session?.user?.id,
    //             hr_id: session?.user?.id,
    //             password_confirmed: false,
    //         };

    //         const { error: insertError } = await supabase.from('users').insert([payload]);

    //         if (insertError) {
    //             throw insertError;
    //         }

    //         message.success('User invited and added successfully!');
    //     } catch (error) {
    //         message.error(error.message || 'An error occurred.');
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const onFinish = async (values) => {
        const {
            email,
            mobile,
            firstName,
            lastName,
            role_type,
        } = values;

        const userName = `${firstName} ${lastName}`;

        setLoading(true);

        try {
            // Step 1: Check if the user already exists
            const { data: existingUser, error: checkError } = await supabase
                .from('users')
                .select('id')
                .eq('details->>email', email)
            // .single();

            if (checkError && checkError.code !== 'PGRST116') {
                // If the error is not related to "No rows found" (PGRST116), throw the error
                throw checkError;
            }

            if (existingUser?.length > 0) {
                // User already exists
                message.warning('User with this email already exists.');
                setLoading(false);
                return;
            }

            // Step 2: Send user invite link
            const { data, error: inviteError } = await axios.post(
                'https://azzqopnihybgniqzrszl.functions.supabase.co/invite_users',
                { email },
                { headers: { 'Content-Type': 'application/json' } }
            );

            if (inviteError) {
                throw inviteError;
            }

            // Step 3: Insert new row in the users table
            const payload = {
                organization_id: session?.user?.organization_id,
                role_type: role_type,
                details: {
                    role_type,
                    email,
                    mobile,
                    orgName: session?.user?.details?.orgName,
                    lastName,
                    userName,
                    firstName,
                },
                id: data?.id,
                user_name: userName,
                // is_manager: role_type === 'manager'||role_type === 'hr'||role_type === 'admin',
                is_active: true,
                manager_id: session?.user?.id,
                hr_id: session?.user?.id,
                password_confirmed: false,
            };

            const { error: insertError } = await supabase.from('users').insert([payload]);

            if (insertError) {
                throw insertError;
            }

            message.success('User invited and added successfully!');
        } catch (error) {
            message.error(error.message || 'An error occurred.');
        } finally {
            setLoading(false);
        }
    };

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
                .rpc('generate_timesheet_view_v2', {
                    start_date: startDate,
                    end_date: endDate,
                    // project_name: projectName, // Pass null if querying all projects
                    // user_id: userId,
                    selected_project: projectName, // Pass null if querying all projects
                    selected_user: userId,

                });

            if (error) {
                console.error('Error fetching data:', error);
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

    return (
        <Card>
            <RangePicker defaultValue={[defaultStartDate, defaultEndDate]}
                // format={dateFormat} 
                onChange={(date) => {
                    setDateRange([
                        date[0]?.format(dateFormat), // Format date here
                        date[1]?.format(dateFormat), // Format date here
                    ]);
                }}
                // onChange={(date) => { console.log(date[0]); setDateRange([date?.startDate, date?.endDate]) }} 
                style={{ marginBottom: '20px' }} />
            {reportData && <DownloadMenu dataSorce={reportData} printRef={reportDataRef} />}
            {reportData &&
                <TimesheetComponent data={reportData} printRef={reportDataRef} />
            }
            {/* <TimesheetTabs /> */}
            {/* <SparklineTable /> */}
            {/* <DailySummaryChart /> */}
            {/* <Button onClick={sendBatchEmail}>Send email</Button>
            <Form
                name="manageEmployees"
                onFinish={onFinish}
                layout="vertical"
                initialValues={{ role_type: 'employee' }}
            // style={{ maxWidth: 600, margin: '0 auto' }}
            >
                <Form.Item
                    label="First Name"
                    name="firstName"
                    rules={[{ required: true, message: 'Please enter the first name.' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Last Name"
                    name="lastName"
                    rules={[{ required: true, message: 'Please enter the last name.' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Email"
                    name="email"
                    rules={[{ required: true, type: 'email', message: 'Please enter a valid email.' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Mobile"
                    name="mobile"
                    rules={[{ required: true, message: 'Please enter the mobile number.' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Role"
                    name="role_type"
                    rules={[{ required: true, message: 'Please select the role.' }]}
                >
                    <Select placeholder="Select a role">
                        <Option value="admin">Admin</Option>
                        <Option value="employee">Employee</Option>
                        <Option value="hr">HR</Option>
                        <Option value="manager">Manager</Option>
                    </Select>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block>
                        Invite User
                    </Button>
                </Form.Item>
            </Form> */}
        </Card>
    );
};

export default Dashboaard;
