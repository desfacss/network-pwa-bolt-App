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
        key: 'web-register',
        path: `${APP_PREFIX_PATH}/web-register`,
        component: React.lazy(() => import('views/auth-views/authentication/webRegister')),
    },
    {
        key: 'register',
        path: `${APP_PREFIX_PATH}/register`,
        component: React.lazy(() => import('views/auth-views/authentication/openRegister')),
    },
    {
        key: 'confirm-signup',
        path: `${APP_PREFIX_PATH}/confirm-signup`,
        component: React.lazy(() => import('views/auth-views/authentication/ConfirmSignUp')),
    },
    {
        key: 'error',
        path: `${APP_PREFIX_PATH}/error`,
        component: React.lazy(() => import('views/auth-views/errors/error-page')),
    },
]

// export const protectedRoutes = [
export const protectedRoutes = (feature, module_features) => {
    // console.log("Features", feature)
    return [
        {
            key: 'dashboard',
            path: `${APP_PREFIX_PATH}/dashboard`,
            component: React.lazy(() => import('views/pages/Dashboard')),
        },
        module_features?.timesheets && feature?.timesheets && {
            key: 'timesheet',
            path: `${APP_PREFIX_PATH}/timesheet`,
            component: React.lazy(() => import('views/pages/Timesheet')),
        },
        module_features?.timesheetsH && feature?.timesheetsH && {
            key: 'timesheeth',
            path: `${APP_PREFIX_PATH}/timesheeth`,
            component: React.lazy(() => import('views/pages/TimesheetH')),
        },
        module_features?.leaves && feature?.leaves && {
            key: 'leave_app',
            path: `${APP_PREFIX_PATH}/leave_app`,
            component: React.lazy(() => import('views/pages/LeaveApp')),
        },
        module_features?.expenses && feature?.expenses && {
            key: 'expenses',
            path: `${APP_PREFIX_PATH}/expenses`,
            component: React.lazy(() => import('views/pages/Expenses')),
        },
        module_features?.reports && feature?.reports && {
            key: 'reports',
            path: `${APP_PREFIX_PATH}/reports`,
            component: React.lazy(() => import('views/pages/Reports')),
        },
        module_features?.clients && feature?.clients && {
            key: 'clients',
            path: `${APP_PREFIX_PATH}/clients`,
            component: React.lazy(() => import('views/pages/Clients')),// /Clients is view table/card, /client/:id is view detail page
        },
        module_features?.projects && feature?.projects && {
            key: 'projects',
            path: `${APP_PREFIX_PATH}/projects`,
            component: React.lazy(() => import('views/pages/Projects/index')),
        },
        module_features?.team && feature?.team && {
            key: 'team',
            path: `${APP_PREFIX_PATH}/team`,
            component: React.lazy(() => import('views/pages/Team/index')),
        },
        module_features?.notifications && feature?.notifications && {
            key: 'notifications',
            path: `${APP_PREFIX_PATH}/notifications`,
            component: React.lazy(() => import('views/pages/Notifications')),
        },
        module_features?.settings && feature?.settings && {
            key: 'settings',
            path: `${APP_PREFIX_PATH}/settings`,
            component: React.lazy(() => import('views/pages/Settings')),
        },
        {
            key: 'profile',
            path: `${APP_PREFIX_PATH}/profile`,
            component: React.lazy(() => import('views/pages/Profile/index')),
        },



        // RND

        // module_features?.a && feature?.rnd && {
        // {
        //     key: 'schedule',
        //     path: `${APP_PREFIX_PATH}/schedule`,
        //     component: React.lazy(() => import('views/pages/Schedule')),
        // },
        // module_features?.a && feature?.rnd && {
        //     key: 'services',
        //     path: `${APP_PREFIX_PATH}/services`,
        //     component: React.lazy(() => import('views/pages/Services')),
        // },
        // module_features?.a && feature?.rnd && {
        //     key: 'tasks',
        //     path: `${APP_PREFIX_PATH}/tasks`,
        //     component: React.lazy(() => import('views/pages/Tasks')),
        // },
        // module_features?.a && feature?.rnd && {
        //     key: 'jobs',
        //     path: `${APP_PREFIX_PATH}/jobs`,
        //     component: React.lazy(() => import('views/pages/Jobs')),
        // },

        module_features?.ytasks && feature?.ytasks && {
            key: 'ytasks',
            path: `${APP_PREFIX_PATH}/ytasks`,
            component: React.lazy(() => import('views/pages/DynamicTasks')),
        },
        module_features?.ysales && feature?.ysales && {
            key: 'ysales',
            path: `${APP_PREFIX_PATH}/ysales`,
            component: React.lazy(() => import('views/pages/DynamicSales')),
        },
        module_features?.yprojects && feature?.yprojects && {
            key: 'yprojects',
            path: `${APP_PREFIX_PATH}/yprojects`,
            component: React.lazy(() => import('views/pages/DynamicProj')),
        },
        module_features?.ystate && feature?.ystate && {
            key: 'ystate',
            path: `${APP_PREFIX_PATH}/ystate`,
            component: React.lazy(() => import('views/pages/DynamicState')),
        },
        module_features?.yst && feature?.yst && {
            key: 'yst',
            path: `${APP_PREFIX_PATH}/yst`,
            component: React.lazy(() => import('views/pages/DynState')),
        },
        module_features?.ysupport && feature?.ysupport && {
            key: 'ysupport',
            path: `${APP_PREFIX_PATH}/ysupport`,
            component: React.lazy(() => import('views/pages/DynamicSupport')),
        },
        module_features?.yclients && feature?.yclients && {
            key: 'yclients',
            path: `${APP_PREFIX_PATH}/yclients`,
            component: React.lazy(() => import('views/pages/DynamicClients')),
        },
        module_features?.yconfig && feature?.yconfig && {
            key: 'yconfig',
            path: `${APP_PREFIX_PATH}/yconfig`,
            component: React.lazy(() => import('views/pages/DynamicConfig')),
        },
        module_features?.yform && feature?.yform && {
            key: 'yform',
            path: `${APP_PREFIX_PATH}/yform`,
            component: React.lazy(() => import('views/pages/DynamicFormBuilder')),
        },
        module_features?.ibBusinesses && feature?.ibBusinesses && {
            key: 'ib_businesses',
            path: `${APP_PREFIX_PATH}/ib_businesses`,
            component: React.lazy(() => import('views/pages/Businesses')),
        },
        module_features?.ibMembers && feature?.ibMembers && {
            key: 'ib_members',
            path: `${APP_PREFIX_PATH}/ib_members`,
            component: React.lazy(() => import('views/pages/Members')),
        },
        module_features?.ibMembers && feature?.ibMembers && {
            key: 'ib_member',
            path: `${APP_PREFIX_PATH}/ib_members/:user_name`,
            component: React.lazy(() => import('views/pages/Profile/index')),
        },
        module_features?.ibChat && feature?.ibChat && {
            key: 'ib_chat',
            path: `${APP_PREFIX_PATH}/networking/:chatId`,
            component: React.lazy(() => import('views/pages/ib/Chat')),
        },
        module_features?.ibNetworking && feature?.ibNetworking && {
            key: 'ib_networking',
            path: `${APP_PREFIX_PATH}/ib_networking`,
            component: React.lazy(() => import('views/pages/ib/Networking')),
        },
        module_features?.ibNetworking && feature?.ibNetworking && {
            key: 'ib_heirarchy',
            path: `${APP_PREFIX_PATH}/ib_heirarchy`,
            component: React.lazy(() => import('views/pages/ib/Heirarchy')),
        },
        module_features?.ibPoll && feature?.ibPoll && {
            key: 'ib_poll',
            path: `${APP_PREFIX_PATH}/ib_poll`,
            component: React.lazy(() => import('views/pages/ib/Poll')),
        },


        // // module_features?.dynamicViews && feature?.dynamicViews && {
        // module_features?.a && feature?.rnd && {
        //     key: 'ytasks',
        //     path: `${APP_PREFIX_PATH}/ytasks`,
        //     component: React.lazy(() => import('views/pages/DynamicTasks')),
        // },
        // module_features?.rnd && feature?.rnd && {
        //     key: 'ysales',
        //     path: `${APP_PREFIX_PATH}/ysales`,
        //     component: React.lazy(() => import('views/pages/DynamicSales')),
        // },
        // module_features?.rnd && feature?.rnd && {
        //     key: 'yformbuilder',
        //     path: `${APP_PREFIX_PATH}/yform`,
        //     component: React.lazy(() => import('views/pages/DynamicFormBuilder')),
        // },
        // module_features?.rnd && feature?.rnd && {
        //     key: 'ysupport',
        //     path: `${APP_PREFIX_PATH}/ysupport`,
        //     component: React.lazy(() => import('views/pages/DynamicSupport')),
        // },
        // module_features?.rnd && feature?.rnd && {
        //     key: 'yclients',
        //     path: `${APP_PREFIX_PATH}/yclients`,
        //     component: React.lazy(() => import('views/pages/DynamicClients')),
        // },
        // module_features?.rnd && feature?.rnd && {
        //     key: 'yconfig',
        //     path: `${APP_PREFIX_PATH}/yconfig`,
        //     component: React.lazy(() => import('views/pages/DynamicConfig')),
        // },


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

        //RND END

    ].filter(Boolean)
}