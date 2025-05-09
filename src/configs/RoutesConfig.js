import React from 'react'
import { APP_PREFIX_PATH } from 'configs/AppConfig'

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
        feature?.eventPass && {
            key: 'pass',
            path: `${APP_PREFIX_PATH}/pass`,
            component: React.lazy(() => import('views/pages/ib/Ticket')),
        },

    ].filter(Boolean)
}