import React from 'react'
import { AUTH_PREFIX_PATH, APP_PREFIX_PATH, SURVEY_PREFIX_PATH } from 'configs/AppConfig'

export const publicRoutes = [
    {
        key: 'login',
        path: `${APP_PREFIX_PATH}/login`,
        component: React.lazy(() => import('views/auth-views/authentication/login')),
    },
    {
        key: 'landing',
        path: `${APP_PREFIX_PATH}`,
        component: React.lazy(() => import('views/auth-views/authentication/landing')),
    },
    //ONLY APPLICABLE ON A SAAS WEBSITE(FOR NEW COMPANY REGISTRATION)
    // {
    //     key: 'web-register',
    //     path: `${APP_PREFIX_PATH}/web-register`,
    //     component: React.lazy(() => import('views/auth-views/authentication/webRegister')),
    // },
    // {
    //     key: 'register',
    //     path: `${APP_PREFIX_PATH}/register`,
    //     component: React.lazy(() => import('views/auth-views/authentication/openRegister')),
    // },
    // {
    //     key: 'confirm-signup',
    //     path: `${APP_PREFIX_PATH}/confirm-signup`,
    //     component: React.lazy(() => import('views/auth-views/authentication/ConfirmSignUp')),
    // },
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
        
        // module_features?.notifications && feature?.notifications && 
        // {
        //     key: 'notifications',
        //     path: `${APP_PREFIX_PATH}/notifications`,
        //     component: React.lazy(() => import('views/pages/Notifications')),
        // },
       
        // // module_features?.survey && feature?.survey && 
        // {
        //     key: 'survey',
        //     path: `${APP_PREFIX_PATH}/survey`,
        //     component: React.lazy(() => import('views/pages/Survey')),
        // },
        // {
        //     key: 'profile',
        //     path: `${APP_PREFIX_PATH}/profile`,
        //     component: React.lazy(() => import('views/pages/Profile/index')),
        // },
        // {
        //     key: 'settings',
        //     path: `${APP_PREFIX_PATH}/settings`,
        //     component: React.lazy(() => import('views/pages/Permissions/index')),
        // },



        // feature?.businessDirectory && {
        //     key: 'ib_businesses',
        //     path: `${APP_PREFIX_PATH}/businesses`,
        //     component: React.lazy(() => import('views/pages/Businesses')),
        // },
        // feature?.memberDirectory && {
        //     key: 'ib_members',
        //     path: `${APP_PREFIX_PATH}/members`,
        //     component: React.lazy(() => import('views/pages/Members')),
        // },
        // {
        //     key: 'channels',
        //     path: `${APP_PREFIX_PATH}/channels`,
        //     component: React.lazy(() => import('views/pages/Channels/Networking')),
        // },
        
        // module_features?.ibChat && feature?.ibChat && 
        // {
        //     key: 'ib_chat',
        //     path: `${APP_PREFIX_PATH}/net/:chatId`,
        //     component: React.lazy(() => import('views/pages/ib/Chat')),
        // },
        // {
        //     key: 'channel_post_messages',
        //     path: `${APP_PREFIX_PATH}/networking/:channel_post_id`,
        //     component: React.lazy(() => import('views/pages/Channels/ChannelPostMessages')),
        // },
        // {
        //     key: 'ib_networking',
        //     path: `${APP_PREFIX_PATH}/networking`,
        //     component: React.lazy(() => import('views/pages/ib/Networking')),
        // },
        // // module_features?.ibNetworking && feature?.ibNetworking && 
        // {
        //     key: 'tags',
        //     path: `${APP_PREFIX_PATH}/tags`,
        //     component: React.lazy(() => import('views/pages/ib/Heirarchy')),
        // },
        // // module_features?.ibPoll && feature?.ibPoll && 
        // {
        //     key: 'poll',
        //     path: `${APP_PREFIX_PATH}/poll`,
        //     component: React.lazy(() => import('views/pages/ib/Poll')),
        // },
        
        // module_features?.trial && feature?.trial && 
        // feature?.liveSurvey && {
        //     key: 'live',
        //     path: `${APP_PREFIX_PATH}/live`,
        //     component: React.lazy(() => import('views/pages/Live')),
        // },
        feature?.eventPass && {
            key: 'pass',
            path: `${APP_PREFIX_PATH}/pass`,
            component: React.lazy(() => import('views/pages/ib/Ticket')),
        },
        // {
        //     key: 'conf',
        //     path: `${APP_PREFIX_PATH}/conf`,
        //     component: React.lazy(() => import('views/pages/Conference')),
        // },
        // {
        //     key: 'member_info',
        //     path: `${APP_PREFIX_PATH}/members/:user_name`,
        //     component: React.lazy(() => import('views/pages/Profile/index')),
        // },






        // module_features?.timesheets && feature?.timesheets && {
        //     key: 'timesheet',
        //     path: `${APP_PREFIX_PATH}/timesheet`,
        //     component: React.lazy(() => import('views/pages/Timesheet')),
        // },
        // module_features?.timesheetsH && feature?.timesheetsH && {
        //     key: 'timesheeth',
        //     path: `${APP_PREFIX_PATH}/timesheeth`,
        //     component: React.lazy(() => import('views/pages/TimesheetH')),
        // },
        // module_features?.leaves && feature?.leaves && {
        //     key: 'leave_app',
        //     path: `${APP_PREFIX_PATH}/leave_app`,
        //     component: React.lazy(() => import('views/pages/LeaveApp')),
        // },
        // module_features?.expenses && feature?.expenses && {
        //     key: 'expenses',
        //     path: `${APP_PREFIX_PATH}/expenses`,
        //     component: React.lazy(() => import('views/pages/Expenses')),
        // },
        // module_features?.reports && feature?.reports && {
        //     key: 'reports',
        //     path: `${APP_PREFIX_PATH}/reports`,
        //     component: React.lazy(() => import('views/pages/Reports')),
        // },
        // module_features?.clients && feature?.clients && {
        //     key: 'clients',
        //     path: `${APP_PREFIX_PATH}/clients`,
        //     component: React.lazy(() => import('views/pages/Clients')),// /Clients is view table/card, /client/:id is view detail page
        // },
        // module_features?.clients && feature?.clients && {
        //     key: 'clients',
        //     path: `${APP_PREFIX_PATH}/clients`,
        //     component: React.lazy(() => import('views/pages/CRM/Clients')),// /Clients is view table/card, /client/:id is view detail page
        // },
        // module_features?.clients && feature?.services && 
        // {
        //     key: 'services',
        //     path: `${APP_PREFIX_PATH}/services`,
        //     component: React.lazy(() => import('views/pages/CRM/Services')),
        // },
        // {
        //     key: 'materials',
        //     path: `${APP_PREFIX_PATH}/materials`,
        //     component: React.lazy(() => import('views/pages/Inventory/Materials')),
        // },
        // {
        //     key: 'suppliers',
        //     path: `${APP_PREFIX_PATH}/suppliers`,
        //     component: React.lazy(() => import('views/pages/Inventory/Suppliers')),
        // },
        // module_features?.projects && feature?.projects && {
        //     key: 'projects',
        //     path: `${APP_PREFIX_PATH}/projects`,
        //     component: React.lazy(() => import('views/pages/Projects/index')),
        // },
        // module_features?.team && feature?.team && 
        // {
        //     key: 'team',
        //     path: `${APP_PREFIX_PATH}/team`,
        //     component: React.lazy(() => import('views/pages/Team/index')),
        // },

         // module_features?.settings && feature?.settings && 
        // {
        //     key: 'settings',
        //     path: `${APP_PREFIX_PATH}/settings`,
        //     component: React.lazy(() => import('views/pages/Settings')),
        // },

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

        // module_features?.ytasks && feature?.ytasks && {
        //     key: 'ytasks',
        //     path: `${APP_PREFIX_PATH}/ytasks`,
        //     component: React.lazy(() => import('views/pages/DynamicTasks')),
        // },
        // module_features?.ysales && feature?.ysales && {
        //     key: 'ysales',
        //     path: `${APP_PREFIX_PATH}/ysales`,
        //     component: React.lazy(() => import('views/pages/DynamicSales')),
        // },
        // module_features?.yprojects && feature?.yprojects && 
        // {
        //     key: 'yprojects',
        //     path: `${APP_PREFIX_PATH}/yprojects`,
        //     component: React.lazy(() => import('views/pages/DynamicProjects')),
        // },
        // {
        //     key: 'net',
        //     path: `${APP_PREFIX_PATH}/net`,
        //     component: React.lazy(() => import('views/pages/ib/Networking')),
        // },
        // // module_features?.yprojects && feature?.yprojects && 
        // {
        //     key: 'yprojects',
        //     path: `${APP_PREFIX_PATH}/yprojects`,
        //     component: React.lazy(() => import('views/pages/DynamicProjects')),
        // },
        // module_features?.ibIdeas && feature?.ibIdeas && {
        //     key: 'ib_ideas',
        //     path: `${APP_PREFIX_PATH}/ideas`,
        //     component: React.lazy(() => import('views/pages/Ideas')),
        // },
        // module_features?.ystate && feature?.ystate && {
        //     key: 'ystate',
        //     path: `${APP_PREFIX_PATH}/ystate`,
        //     component: React.lazy(() => import('views/pages/DynamicState')),
        // },
        // module_features?.tmembers && feature?.tmembers && {
        //     key: 'tmembers',
        //     path: `${APP_PREFIX_PATH}/tmembers`,
        //     component: React.lazy(() => import('views/pages/Tmembers')),
        // },
        // module_features?.ysupport && feature?.ysupport && {
        //     key: 'ysupport',
        //     path: `${APP_PREFIX_PATH}/ysupport`,
        //     component: React.lazy(() => import('views/pages/DynamicSupport')),
        // },
        // module_features?.yclients && feature?.yclients && {
        //     key: 'yclients',
        //     path: `${APP_PREFIX_PATH}/yclients`,
        //     component: React.lazy(() => import('views/pages/DynamicClients')),
        // },
        // module_features?.yconfig && feature?.yconfig && 
        // {
        //     key: 'yconfig',
        //     path: `${APP_PREFIX_PATH}/yconfig`,
        //     component: React.lazy(() => import('views/pages/DynamicConfig')),
        // },
        // module_features?.yform && feature?.yform && {
        //     key: 'yform',
        //     path: `${APP_PREFIX_PATH}/yform`,
        //     component: React.lazy(() => import('views/pages/DynamicFormBuilder')),
        // },

        // {
        //     key: 'process',
        //     path: `${APP_PREFIX_PATH}/process`,
        //     component: React.lazy(() => import('views/pages/ProcessEditor')),
        // },
        // {
        //     key: 'boq',
        //     path: `${APP_PREFIX_PATH}/boq`,
        //     component: React.lazy(() => import('views/pages/BOQ')),
        // },
        // {
        //     key: 'template',
        //     path: `${APP_PREFIX_PATH}/template`,
        //     component: React.lazy(() => import('views/pages/Templates')),
        // },
        // module_features?.ibMembers && feature?.ibMembers && {
        //     key: 'ib_member',
        //     path: `${APP_PREFIX_PATH}/members/:user_name`,
        //     component: React.lazy(() => import('views/pages/Profile/index')),
        // },


        // {
        //     key: 'sender',
        //     path: `${APP_PREFIX_PATH}/sender`,
        //     component: React.lazy(() => import('views/pages/DocumentShare/DocumentSender')),
        // },
        // {
        //     key: 'recipient',
        //     path: `${APP_PREFIX_PATH}/recipient/:id`,
        //     component: React.lazy(() => import('views/pages/DocumentShare/DocumentRecipient')),
        // },

        // // module_features?.dynamicViews && feature?.dynamicViews && {
        // module_features?.a && feature?.rnd && {
        //     key: 'ytasks',
        //     path: `${APP_PREFIX_PATH}/ytasks`,
        //     component: React.lazy(() => import('views/pages/DynamicTasks')),
        // },
        // module_features?.rnd && feature?.rnd && 
        // {
        //     key: 'ysales',
        //     path: `${APP_PREFIX_PATH}/ysales`,
        //     component: React.lazy(() => import('views/pages/CRM/Sales')),
        // },
        // {
        //     key: 'clients_contacts',
        //     path: `${APP_PREFIX_PATH}/clients_contacts`,
        //     component: React.lazy(() => import('views/pages/CRM/Sales_contacts')),
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