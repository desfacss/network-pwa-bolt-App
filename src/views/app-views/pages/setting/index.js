import React, { Component } from 'react'
import { UserOutlined, LockOutlined, RadiusSettingOutlined, SettingOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import { Link, Route, Navigate, useLocation, Routes } from 'react-router-dom';
import InnerAppLayout from 'layouts/inner-app-layout';
import Theme from 'components/common/layout/Theme';
import Profile from './Profile';
import PasswordChange from './PasswordChange';
import TradeDefaults from './TradeDefaults';

const url = '/app/pages/setting'

const MenuItem = ({ icon, path, label }) => {

	return (
		<>
			{icon}
			<span>{label}</span>
			<Link to={`${url}/${path}`} />
		</>
	)
}

const SettingOption = () => {

	const location = useLocation();

	const locationPath = location.pathname.split('/')

	const currentpath = locationPath[locationPath.length - 1]

	return (
		<Menu
			mode="inline"
			selectedKeys={[currentpath]}
			items={[
				{
					key: 'trade-defaults',
					label: <MenuItem label="Trade Defaults" icon={<SettingOutlined />} path="trade-defaults" />
				},
				{
					key: 'edit-profile',
					label: <MenuItem label="Edit Profile" icon={<UserOutlined />} path="edit-profile" />
				},
				{
					key: 'change-password',
					label: <MenuItem label="Change Password" icon={<LockOutlined />} path="change-password" />
				},
				{
					key: 'theme',
					label: <MenuItem label="Theme" icon={<RadiusSettingOutlined />} path="theme" />
				},
			]}
		/>
	);
};

const SettingContent = () => {

	return (
		<Routes>
			<Route path="trade-defaults" element={<TradeDefaults />} />
			<Route path="edit-profile" element={<Profile />} />
			<Route path="change-password" element={<PasswordChange />} />
			<Route path="theme" element={<Theme />} />
			<Route path="*" element={<Navigate to="edit-profile" replace />} />
		</Routes>
	)
}

export class Setting extends Component {
	render() {
		return (
			<InnerAppLayout
				sideContentWidth={320}
				sideContent={<SettingOption />}
				mainContent={<SettingContent />}
			/>
		);
	}
}

export default Setting
