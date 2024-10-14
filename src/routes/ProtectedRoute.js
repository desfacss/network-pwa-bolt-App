import React, { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux';
import {
	AUTH_PREFIX_PATH,
	UNAUTHENTICATED_ENTRY,
	REDIRECT_URL_KEY,
	SURVEY_PREFIX_PATH,
	APP_PREFIX_PATH
} from 'configs/AppConfig'
import { supabase } from 'configs/SupabaseConfig';

const ProtectedRoute = () => {
	console.log("PR")
	const location = useLocation();
	const PREFIX_PATH = location.pathname.startsWith("/survey") ? SURVEY_PREFIX_PATH : APP_PREFIX_PATH;
	// const [session, setSession] = useState(null)

	// useEffect(() => {
	// 	supabase.auth.getSession().then(({ data: { session } }) => {
	// 		setSession(session)
	// 	})
	// 	const {
	// 		data: { subscription },
	// 	} = supabase.auth.onAuthStateChange((_event, session) => {
	// 		setSession(session)
	// 	})
	// 	return () => subscription.unsubscribe()
	// }, [])

	const { token, session } = useSelector(state => state.auth)
	if (!session) {
		// return <Navigate to={`${AUTH_PREFIX_PATH}${UNAUTHENTICATED_ENTRY}?${REDIRECT_URL_KEY}=${location.pathname}`} replace />;
		// return <Navigate to={`${AUTH_PREFIX_PATH}/register`} replace />;
		return <Navigate to={`${PREFIX_PATH}/register`} replace />;
	}

	return <Outlet />
}

export default ProtectedRoute