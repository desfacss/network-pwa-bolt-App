import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux';
import { APP_PREFIX_PATH } from 'configs/AppConfig'
// import { supabase } from 'configs/SupabaseConfig';

const ProtectedRoute = () => {
	const location = useLocation();
	// const location = useLocation();
	// const PREFIX_PATH = location.pathname.startsWith("/survey") ? SURVEY_PREFIX_PATH : APP_PREFIX_PATH;

	const { token, session } = useSelector(state => state?.auth)
	// if (session?.user?.password_confirmed === false && window.location.pathname !== `${APP_PREFIX_PATH}/change_password`) {
	// 	return <Navigate to={`${APP_PREFIX_PATH}/change_password`} replace />;
	// }
	if (!session) {
		// return <Navigate to={`${AUTH_PREFIX_PATH}${UNAUTHENTICATED_ENTRY}?${REDIRECT_URL_KEY}=${location.pathname}`} replace />;
		// return <Navigate to={`${AUTH_PREFIX_PATH}/register`} replace />;
		localStorage.setItem('redirectFrom', location.pathname);
		return <Navigate to={`${APP_PREFIX_PATH}`} replace />;
	}

	return <Outlet />
}

export default ProtectedRoute