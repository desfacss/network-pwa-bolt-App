import React from 'react';
import { Card } from 'antd';
import { useSelector } from 'react-redux';
// import { DailySummaryChart } from './Report';
// import SparklineTable from './Sparklines';
// import TimesheetTabs from './ReportTab';
import DashboardTabs from './DashboardTabs';
import { Link } from 'react-router-dom';
import { APP_PREFIX_PATH } from 'configs/AppConfig'
import ChangePassword from 'views/auth-views/components/ChangePassword';

const Dashboaard = () => {
    const { session } = useSelector((state) => state.auth);

    return (
        <Card>
            {!session?.user?.password_confirmed && (
                <Card style={{ marginBottom: 10, backgroundColor: 'rgb(255 247 230)', borderColor: 'rgb(250 140 23)' }} >
                    <p>
                        Welcome, <strong>{session?.user?.details?.userName}</strong>! 🎉
                        We're glad to have you on the <strong>UKPE Timesheet</strong> app.
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
            <DashboardTabs />
            {/* } */}
            {/* <TimesheetTabs /> */}
            {/* <SparklineTable /> */}
            {/* <DailySummaryChart /> */}
        </Card>
    );
};

export default Dashboaard;
