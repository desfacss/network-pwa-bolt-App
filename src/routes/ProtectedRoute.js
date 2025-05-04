import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { APP_PREFIX_PATH } from 'configs/AppConfig';
// import { supabase } from 'configs/SupabaseConfig';

const ProtectedRoute = () => {
  const location = useLocation();
  	// const location = useLocation();
	// const PREFIX_PATH = location.pathname.startsWith("/survey") ? SURVEY_PREFIX_PATH : APP_PREFIX_PATH;

  const { token, session } = useSelector(state => state.auth);
  console.log('ProtectedRoute: location.pathname=', location.pathname, 'session=', session, 'token=', token);
  	// if (session?.user?.password_confirmed === false && window.location.pathname !== `${APP_PREFIX_PATH}/change_password`) {
	// 	return <Navigate to={`${APP_PREFIX_PATH}/change_password`} replace />;
	// }
  if (!session) {
    console.log('ProtectedRoute: No session, redirecting to', APP_PREFIX_PATH);
	// return <Navigate to={`${AUTH_PREFIX_PATH}${UNAUTHENTICATED_ENTRY}?${REDIRECT_URL_KEY}=${location.pathname}`} replace />;
	// return <Navigate to={`${AUTH_PREFIX_PATH}/register`} replace />;
    localStorage.setItem('redirectFrom', location.pathname);
    return <Navigate to={`${APP_PREFIX_PATH}`} replace />;
  }
  console.log('ProtectedRoute: Rendering Outlet');
  return <Outlet />;
};


export default ProtectedRoute;