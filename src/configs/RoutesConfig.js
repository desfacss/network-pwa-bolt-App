import React from 'react'
import { AUTH_PREFIX_PATH, APP_PREFIX_PATH, SURVEY_PREFIX_PATH } from 'configs/AppConfig'

export const publicRoutes = [
    {
        key: 'login',
        path: `${APP_PREFIX_PATH}/login`,
        component: React.lazy(() => import('views/auth-views/authentication/login')),
    },
    //ONLY APPLICABLE ON A SAAS WEBSITE(FOR NEW COMPANY REGISTRATION)
    {
        key: 'register',
        path: `${APP_PREFIX_PATH}/web-register`,
        component: React.lazy(() => import('views/auth-views/authentication/register')),
    },
    {
        key: 'confirm-signup',
        path: `${APP_PREFIX_PATH}/confirm-signup`,
        component: React.lazy(() => import('views/auth-views/authentication/ConfirmSignUp')),
    },
    {
        key: 'error-page-1',
        path: `${APP_PREFIX_PATH}/error-page-1`,
        component: React.lazy(() => import('views/auth-views/errors/error-page-1')),
    },
]

// export const protectedRoutes = [
export const protectedRoutes = (feature) => {
    // console.log("Features", feature)
    return [
        feature?.dashboard && {
            key: 'dashboard',
            path: `${APP_PREFIX_PATH}/dashboard`,
            component: React.lazy(() => import('views/pages/Dashboard')),
        },
        feature?.timesheets && {
            key: 'timesheet',
            path: `${APP_PREFIX_PATH}/timesheet`,
            component: React.lazy(() => import('views/pages/Timesheet')),
        },
        feature?.timesheetsH && {
            key: 'timesheeth',
            path: `${APP_PREFIX_PATH}/timesheeth`,
            component: React.lazy(() => import('views/pages/TimesheetH')),
        },
        feature?.leaves && {
            key: 'leave_app',
            path: `${APP_PREFIX_PATH}/leave_app`,
            component: React.lazy(() => import('views/pages/LeaveApp')),
        },
        feature?.expenses && {
            key: 'expenses',
            path: `${APP_PREFIX_PATH}/expenses`,
            component: React.lazy(() => import('views/pages/Expenses')),
        },
        feature?.viewReports && {
            key: 'reports',
            path: `${APP_PREFIX_PATH}/reports`,
            component: React.lazy(() => import('views/pages/Reports')),
        },
        feature?.Clients && {
            key: 'clients',
            path: `${APP_PREFIX_PATH}/clients`,
            component: React.lazy(() => import('views/pages/Clients')),// /Clients is view table/card, /client/:id is view detail page
        },
        feature?.Projects && {
            key: 'projects',
            path: `${APP_PREFIX_PATH}/projects`,
            component: React.lazy(() => import('views/pages/Projects/index')),
        },
        feature?.Team && {
            key: 'team',
            path: `${APP_PREFIX_PATH}/team`,
            component: React.lazy(() => import('views/pages/Team/index')),
        },
        feature?.notifications && {
            key: 'notifications',
            path: `${APP_PREFIX_PATH}/notifications`,
            component: React.lazy(() => import('views/pages/Notifications')),
        },
        feature?.settings && {
            key: 'settings',
            path: `${APP_PREFIX_PATH}/settings`,
            component: React.lazy(() => import('views/pages/Settings')),
        },
        feature?.schedule && {
            key: 'schedule',
            path: `${APP_PREFIX_PATH}/schedule`,
            component: React.lazy(() => import('views/pages/Schedule')),
        },
        feature?.services && {
            key: 'services',
            path: `${APP_PREFIX_PATH}/services`,
            component: React.lazy(() => import('views/pages/Services')),
        },
        feature?.tasks && {
            key: 'tasks',
            path: `${APP_PREFIX_PATH}/tasks`,
            component: React.lazy(() => import('views/pages/Tasks')),
        },
        feature?.jobs && {
            key: 'jobs',
            path: `${APP_PREFIX_PATH}/jobs`,
            component: React.lazy(() => import('views/pages/Jobs')),
        },
        {
            key: 'profile',
            path: `${APP_PREFIX_PATH}/profile`,
            component: React.lazy(() => import('views/pages/Profile/index')),
        },
        // {
        //     key: 'users',
        //     path: `${APP_PREFIX_PATH}/users`,
        //     component: React.lazy(() => import('views/pages/Users')),
        // },
        // {
        //     key: 'user_info',
        //     path: `${APP_PREFIX_PATH}/users/:user_id`,
        //     component: React.lazy(() => import('views/pages/UserInfo')),
        // },
        // {
        //     key: 'error-page-1',
        //     path: `${APP_PREFIX_PATH}/error-page-1`,
        //     component: React.lazy(() => import('views/auth-views/errors/error-page-1')),
        //     meta: {
        //         blankLayout: true
        //     }
        // },
    ].filter(Boolean)
}