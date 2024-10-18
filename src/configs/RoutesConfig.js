import React from 'react'
import { AUTH_PREFIX_PATH, APP_PREFIX_PATH, SURVEY_PREFIX_PATH } from 'configs/AppConfig'

export const publicRoutes = [
    {
        key: 'login',
        path: `${APP_PREFIX_PATH}/login`,
        component: React.lazy(() => import('views/auth-views/authentication/login')),
    },
    // {
    //     key: 'login',
    //     path: `${SURVEY_PREFIX_PATH}/login`,
    //     component: React.lazy(() => import('views/auth-views/authentication/login')),
    // },
    // {
    //     key: 'users',
    //     path: `${AUTH_PREFIX_PATH}/users`,
    //     component: React.lazy(() => import('views/pages/Users')),
    // },
    // {
    //     key: 'user_info',
    //     path: `${AUTH_PREFIX_PATH}/users/:user_id`,
    //     component: React.lazy(() => import('views/pages/UserInfo')),
    // },
    // {
    //     key: 'businesses',
    //     path: `${AUTH_PREFIX_PATH}/businesses`,
    //     component: React.lazy(() => import('views/pages/Businesses')),
    // },
    // {
    //     key: 'business_info',
    //     path: `${AUTH_PREFIX_PATH}/businesses/:business_id`,
    //     component: React.lazy(() => import('views/pages/BusinessInfo')),
    // },
    // {
    //     key: 'survey',
    //     // path: `${AUTH_PREFIX_PATH}/survey`,
    //     path: `${SURVEY_PREFIX_PATH}`,
    //     component: React.lazy(() => import('views/pages/Survey')),
    // },
    // {
    //     key: 'update_survey',
    //     path: `${SURVEY_PREFIX_PATH}/update_survey`,
    //     component: React.lazy(() => import('views/pages/Market/UpdateSurvey')),
    // },
    {
        key: 'register',
        path: `${APP_PREFIX_PATH}/register`,
        component: React.lazy(() => import('views/auth-views/authentication/register')),
    },
    // {
    //     key: 'register_survey',
    //     path: `${SURVEY_PREFIX_PATH}/register`,
    //     component: React.lazy(() => import('views/auth-views/authentication/register')),
    // },
    {
        key: 'error-page-1',
        path: `${APP_PREFIX_PATH}/error-page-1`,
        component: React.lazy(() => import('views/auth-views/errors/error-page-1')),
    },
    // {
    //     key: 'home',
    //     path: `${SURVEY_PREFIX_PATH}/home`,
    //     // component: React.lazy(() => import('views/app-views/dashboards/default')),
    //     component: React.lazy(() => import('views/pages/Home2')),
    // },
    // {
    //     key: 'dashboard.feeds',
    //     path: `${AUTH_PREFIX_PATH}/social_feeds`,
    //     // component: React.lazy(() => import('views/app-views/dashboards/default')),
    //     component: React.lazy(() => import('views/pages/SocialMediaFeeds')),
    // },
    // {
    //     key: 'profile',
    //     path: `${AUTH_PREFIX_PATH}/profile`,
    //     component: React.lazy(() => import('views/pages/Profile')),
    // },
    // {
    //     key: 'chat',
    //     path: `${APP_PREFIX_PATH}/chat`,
    //     component: React.lazy(() => import('views/pages/Chat')),
    // },
]

export const protectedRoutes = [
    // {
    //     key: 'register_survey',
    //     path: `${SURVEY_PREFIX_PATH}/register`,
    //     component: React.lazy(() => import('views/auth-views/authentication/register')),
    // },
    {
        key: 'review',
        path: `${APP_PREFIX_PATH}/review`,
        component: React.lazy(() => import('views/pages/Review')),
    },
    {
        key: 'timesheet',
        path: `${APP_PREFIX_PATH}/timesheet`,
        component: React.lazy(() => import('views/pages/Timesheet')),
    },
    {
        key: 'team',
        path: `${APP_PREFIX_PATH}/team`,
        component: React.lazy(() => import('views/pages/Team')),
    },
    {
        key: 'schedule',
        path: `${APP_PREFIX_PATH}/schedule`,
        component: React.lazy(() => import('views/pages/Schedule')),
    },
    {
        key: 'services',
        path: `${APP_PREFIX_PATH}/services`,
        component: React.lazy(() => import('views/pages/Services')),
    },
    {
        key: 'tasks',
        path: `${APP_PREFIX_PATH}/tasks`,
        component: React.lazy(() => import('views/pages/Tasks')),
    },
    {
        key: 'jobs',
        path: `${APP_PREFIX_PATH}/jobs`,
        component: React.lazy(() => import('views/pages/Jobs')),
    },
    {
        key: 'projects',
        path: `${APP_PREFIX_PATH}/projects`,
        component: React.lazy(() => import('views/pages/Projects')),
    },
    {
        key: 'clients',
        path: `${APP_PREFIX_PATH}/clients`,
        component: React.lazy(() => import('views/pages/Clients')),// /Clients is view table/card, /client/:id is view detail page
    },
    // {
    //     key: 'update_survey',
    //     path: `${SURVEY_PREFIX_PATH}/update_survey`,
    //     component: React.lazy(() => import('views/pages/Market/UpdateSurvey')),
    // },
    {
        key: 'profile',
        path: `${APP_PREFIX_PATH}/profile`,
        component: React.lazy(() => import('views/pages/Profile/index')),
    },
    // {
    //     key: 'survey',
    //     // path: `${AUTH_PREFIX_PATH}/survey`,
    //     path: `${SURVEY_PREFIX_PATH}`,
    //     component: React.lazy(() => import('views/pages/Survey')),
    // },
    // {
    //     key: 'dashboard.default',
    //     path: `${APP_PREFIX_PATH}/dashboards/default`,
    //     // component: React.lazy(() => import('views/app-views/dashboards/default')),
    //     component: React.lazy(() => import('views/pages/LT')),
    // },
    {
        key: 'users',
        path: `${APP_PREFIX_PATH}/users`,
        component: React.lazy(() => import('views/pages/Users')),
    },
    {
        key: 'user_info',
        path: `${APP_PREFIX_PATH}/users/:user_id`,
        component: React.lazy(() => import('views/pages/UserInfo')),
    },
    // {
    //     key: 'businesses',
    //     path: `${APP_PREFIX_PATH}/businesses`,
    //     component: React.lazy(() => import('views/pages/Businesses')),
    // },
    // {
    //     key: 'business_info',
    //     path: `${APP_PREFIX_PATH}/businesses/:business_id`,
    //     component: React.lazy(() => import('views/pages/BusinessInfo')),
    // },
    // {
    //     key: 'register_survey2',
    //     path: `${SURVEY_PREFIX_PATH}/register2`,
    //     component: React.lazy(() => import('views/auth-views/authentication/register')),
    // },
    // {
    //     key: 'login',
    //     path: `${APP_PREFIX_PATH}/login-1`,
    //     component: React.lazy(() => import('views/auth-views/authentication/login')),
    //     meta: {
    //         blankLayout: true
    //     }
    // },
    // {
    //     key: 'register',
    //     path: `${APP_PREFIX_PATH}/register`,
    //     component: React.lazy(() => import('views/auth-views/authentication/register')),
    //     meta: {
    //         blankLayout: true
    //     }
    // },
    {
        key: 'error-page-1',
        path: `${APP_PREFIX_PATH}/error-page-1`,
        component: React.lazy(() => import('views/auth-views/errors/error-page-1')),
        meta: {
            blankLayout: true
        }
    },
    // {
    //     key: 'pages.setting',
    //     path: `${APP_PREFIX_PATH}/pages/setting/*`,
    //     component: React.lazy(() => import('views/app-views/pages/setting')),
    // },
    // {
    //     key: 'chat',
    //     path: `${APP_PREFIX_PATH}/chat`,
    //     component: React.lazy(() => import('views/pages/Chat')),
    // },
    // {
    //     key: 'dashboard',
    //     path: `${APP_PREFIX_PATH}/dashboard`,
    //     component: React.lazy(() => import('views/pages/ProjectList')),
    // },
    // {
    //     key: 'networking',
    //     path: `${APP_PREFIX_PATH}/networking`,
    //     component: React.lazy(() => import('views/pages/Networking')),
    // },
    // {
    //     key: 'dashboard',
    //     path: `${APP_PREFIX_PATH}/dashboard`,
    //     component: React.lazy(() => import('views/pages/ProjectList')),
    // },
    // {
    //     key: 'broker.login',
    //     path: `${APP_PREFIX_PATH}/broker/:broker/*`,
    //     component: React.lazy(() => import('views/pages/BrokerLogin')),
    // },
    // {
    //     key: 'profile',
    //     path: `${APP_PREFIX_PATH}/profile`,
    //     component: React.lazy(() => import('views/pages/Profile/indexe')),
    // },
    // {
    //     key: 'poll',
    //     path: `${APP_PREFIX_PATH}/poll`,
    //     component: React.lazy(() => import('views/pages/Market/PollForm')),
    // },
]