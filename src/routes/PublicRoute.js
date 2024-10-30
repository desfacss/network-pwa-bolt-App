import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux';
const PublicRoute = () => {

	console.log("PB")

	const { token, session } = useSelector(state => state.auth)
	return session ? <Navigate to={'/app/services'} /> : <Outlet />
}

export default PublicRoute