import React, { useEffect, useRef, useState } from 'react';
import { Form, Input, Button, Select, message, Card, DatePicker } from 'antd';
import { supabase } from 'configs/SupabaseConfig';
import { useSelector } from 'react-redux';
// import { sendEmail } from 'components/common/SendEmail';
import { sendBatchEmail } from './sendBatchEmail';
// import { DailySummaryChart } from './Report';
// import SparklineTable from './Sparklines';
// import TimesheetTabs from './ReportTab';
import TimesheetComponent from './ReportTab2';
import DownloadMenu from 'components/common/DownloadMenu';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { APP_PREFIX_PATH } from 'configs/AppConfig'
import ChangePassword from 'views/auth-views/components/ChangePassword';

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

    return (
        <Card>
            {!session?.user?.password_confirmed && (
                <Card
                    style={{
                        marginBottom: 10,
                        backgroundColor: 'rgb(255 247 230)',
                        borderColor: 'rgb(250 140 23)',
                    }}
                >
                    <p>
                        Welcome, <strong>{session?.user?.details?.userName}</strong>! 🎉
                        We're glad to have you on the <strong>Timesheet, Leave & Expense Management</strong> platform.
                        <br></br>
                        To get started, please set up a new password to make future logins easier.
                        You can change it from your <Link to={`${APP_PREFIX_PATH}/profile`}>Profile</Link> page or here:{' '}
                        <span>
                            <ChangePassword />
                        </span>
                        <br></br>
                        Once your password is updated, explore features based on your role.
                        You can manage timesheets, apply for leave, or track expenses.
                        <br></br><br></br>Let's simplify your work experience!</p>
                </Card>
            )}

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
            {/* <Button onClick={sendBatchEmail}>Send email</Button> */}
        </Card>
    );
};

export default Dashboaard;
