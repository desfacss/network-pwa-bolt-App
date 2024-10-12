import React, { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux';
import { AUTHENTICATED_ENTRY } from 'configs/AppConfig'
import { supabase } from 'configs/SupabaseConfig';

const PublicRoute = () => {

	console.log("PB")
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

	// return session ? <Navigate to={AUTHENTICATED_ENTRY} /> : <Outlet />
	return session ? <Navigate to={'/app'} /> : <Outlet />
}

export default PublicRoute