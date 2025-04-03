import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux';
import { APP_PREFIX_PATH } from 'configs/AppConfig'

const PublicRoute = () => {

	const from = localStorage.getItem('redirectFrom') || `${APP_PREFIX_PATH}/dashboard`;
	const { token, session } = useSelector(state => state.auth)
	if (session) {
		// Clear localStorage only when redirecting to the protected route
		localStorage.removeItem('redirectFrom');
		return <Navigate to={from} replace />;
	}

	return <Outlet />;
	// return session ? <Navigate to={from} /> : <Outlet />
}

export default PublicRoute