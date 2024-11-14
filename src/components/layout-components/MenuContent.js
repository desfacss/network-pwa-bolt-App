import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Grid } from 'antd';
import IntlMessage from '../util-components/IntlMessage';
import Icon from '../util-components/Icon';
import navigationConfig from 'configs/NavigationConfig';
import { useSelector, useDispatch } from 'react-redux';
import { SIDE_NAV_LIGHT, NAV_TYPE_SIDE } from "constants/ThemeConstant";
import utils from 'utils'
import { onMobileNavToggle } from 'store/slices/themeSlice';

const { useBreakpoint } = Grid;

const setLocale = (localeKey, isLocaleOn = true) =>
	isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();

const setDefaultOpen = (key) => {
	let keyList = [];
	let keyString = "";
	if (key) {
		const arr = key.split("-");
		for (let index = 0; index < arr.length; index++) {
			const elm = arr[index];
			index === 0 ? (keyString = elm) : (keyString = `${keyString}-${elm}`);
			keyList.push(keyString);
		}
	}
	return keyList;
};

const MenuItem = ({ title, icon, path }) => {

	const dispatch = useDispatch();

	const isMobile = !utils.getBreakPoint(useBreakpoint()).includes('lg');

	const closeMobileNav = () => {
		if (isMobile) {
			dispatch(onMobileNavToggle(false))
		}
	}

	return (
		<>
			{icon && <Icon type={icon} />}
			<span>{setLocale(title)}</span>
			{path && <Link onClick={closeMobileNav} to={path} />}
		</>
	)
}

const getSideNavMenuItem = (navItem) => navItem.map(nav => {
	return {
		key: nav.key,
		label: <MenuItem title={nav.title} {...(nav.isGroupTitle ? {} : { path: nav.path, icon: nav.icon })} />,
		...(nav.isGroupTitle ? { type: 'group' } : {}),
		...(nav.submenu.length > 0 ? { children: getSideNavMenuItem(nav.submenu) } : {})
	}
})

const getTopNavMenuItem = (navItem) => navItem.map(nav => {
	return {
		key: nav.key,
		label: <MenuItem title={nav.title} icon={nav.icon} {...(nav.isGroupTitle ? {} : { path: nav.path })} />,
		...(nav.submenu.length > 0 ? { children: getTopNavMenuItem(nav.submenu) } : {})
	}
})

const SideNavContent = (props) => {

	const { routeInfo, hideGroupTitle } = props;

	const sideNavTheme = useSelector(state => state.theme.sideNavTheme);

	const { userData } = useSelector((state) => state?.profile);
	const { session } = useSelector((state) => state.auth);
	const clientSubmenu = ['Dashboard']
	// useEffect(() => {
	// if (userData?.role_type === 'client') {
	// navigationConfig[0].submenu = navigationConfig[0]?.submenu?.filter(item => clientSubmenu.includes(item.title))
	// }

	// METHOD 1
	// if (userData) {
	// 	navigationConfig[0].submenu = navigationConfig[0]?.submenu?.filter(item => item.key !== 'dashboards-Strategy-builder' && !userData?.feature?.viewStrategyBuilder)
	// 	navigationConfig[0].submenu = navigationConfig[0]?.submenu?.filter(item => item.key !== 'dashboards-Portfolio' && !userData?.feature?.viewPorfolio)
	// 	navigationConfig[0].submenu = navigationConfig[0]?.submenu?.filter(item => item.key !== 'dashboards-Broker' && !userData?.feature?.viewBroker)
	// 	navigationConfig[0].submenu = navigationConfig[0]?.submenu?.filter(item => item.key !== 'dashboards-Order-Book' && !userData?.feature?.viewOrderBook)
	// 	navigationConfig[0].submenu = navigationConfig[0]?.submenu?.filter(item => item.key !== 'dashboards-Position-Book' && !userData?.feature?.viewPositionBook)
	// 	navigationConfig[0].submenu = navigationConfig[0]?.submenu?.filter(item => item.key !== 'dashboards-Position' && !userData?.feature?.viewPosition)
	// }
	// METHOD 2
	if (session) {
		console.log("rt", session.user.feature);
		navigationConfig[0].submenu = session?.user?.features?.feature?.Projects === true ? navigationConfig[0]?.submenu : navigationConfig[0]?.submenu?.filter(item => item.key !== 'projects')
		navigationConfig[0].submenu = session?.user?.features?.feature?.settings === true ? navigationConfig[0]?.submenu : navigationConfig[0]?.submenu?.filter(item => item.key !== 'settings')
		navigationConfig[0].submenu = session?.user?.features?.feature?.notifications === true ? navigationConfig[0]?.submenu : navigationConfig[0]?.submenu?.filter(item => item.key !== 'notifications')
		navigationConfig[0].submenu = session?.user?.features?.feature?.Clients === true ? navigationConfig[0]?.submenu : navigationConfig[0]?.submenu?.filter(item => item.key !== 'clients')
		navigationConfig[0].submenu = session?.user?.features?.feature?.dashboard === true ? navigationConfig[0]?.submenu : navigationConfig[0]?.submenu?.filter(item => item.key !== 'dashboard')
		navigationConfig[0].submenu = session?.user?.features?.feature?.Team === true ? navigationConfig[0]?.submenu : navigationConfig[0]?.submenu?.filter(item => item.key !== 'team')
		navigationConfig[0].submenu = session?.user?.features?.feature?.viewReports === true ? navigationConfig[0]?.submenu : navigationConfig[0]?.submenu?.filter(item => item.key !== 'reports')
	}

	// }, [session])

	const menuItems = useMemo(() => getSideNavMenuItem(navigationConfig), [session]);

	const [selectedKeys, setSelectedKeys] = useState([]);
	const location = useLocation();

	useEffect(() => {
		const currentPathKey = location.pathname.replace("/app/", "")
		// .replace(/^\//, '').replace(/\//g, '-');
		// console.log("loction", currentPathKey)
		setSelectedKeys([currentPathKey]);
	}, [location]);


	return (
		<Menu
			mode="inline"
			theme={sideNavTheme === SIDE_NAV_LIGHT ? "light" : "dark"}
			style={{ height: "100%", borderInlineEnd: 0 }}
			defaultSelectedKeys={[routeInfo?.key]}
			defaultOpenKeys={setDefaultOpen(routeInfo?.key)}
			selectedKeys={selectedKeys}
			className={hideGroupTitle ? "hide-group-title" : ""}
			items={menuItems}
		/>
	);
};

const TopNavContent = () => {

	const topNavColor = useSelector(state => state.theme.topNavColor);

	const menuItems = useMemo(() => getTopNavMenuItem(navigationConfig), [])

	return (
		<Menu
			mode="horizontal"
			style={{ backgroundColor: topNavColor }}
			items={menuItems}
		/>
	);
};

const MenuContent = (props) => {

	return props.type === NAV_TYPE_SIDE ? (
		<SideNavContent {...props} />
	) : (
		<TopNavContent {...props} />
	);
};

export default MenuContent;
