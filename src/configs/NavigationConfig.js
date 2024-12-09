import {
  DashboardOutlined,
  ReadOutlined,
  UserOutlined,
  FundOutlined,
  IdcardOutlined,
  ContainerOutlined,
  RadarChartOutlined,
  HeatMapOutlined,
  WalletOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { APP_PREFIX_PATH } from 'configs/AppConfig';
import { store } from 'store';

const state = store.getState();
const feature = state?.auth?.session?.user?.features?.feature;


const navigationConfig = [
  {
    key: 'all',
    // path: `${APP_PREFIX_PATH}/dashboard`,
    title: '',
    isGroupTitle: true,
    // icon: DashboardOutlined,
    breadcrumb: false,
    submenu: [
      {
        key: 'dashboard',
        path: `${APP_PREFIX_PATH}/dashboard`,
        title: 'Dashboard',
        icon: DashboardOutlined,
        breadcrumb: false,
        submenu: [],
      },
      feature?.timesheets && {
        key: 'timesheets',
        path: `${APP_PREFIX_PATH}/timesheet`,
        title: 'Timesheet',
        icon: ClockCircleOutlined,
        breadcrumb: false,
        submenu: [],
      },
      feature?.leaves && { //Comment for Prod
        key: 'leave_app',
        path: `${APP_PREFIX_PATH}/leave_app`,
        //Comment for Prod
        title: 'Leaves',
        icon: CalendarOutlined,
        breadcrumb: false,
        submenu: [],
      },
      feature?.expenses && {
        key: 'expenses',
        path: `${APP_PREFIX_PATH}/expenses`,
        title: 'Expense',
        icon: WalletOutlined,
        breadcrumb: false,
        submenu: [],
      },
      feature?.reports && {
        key: 'reports',
        path: `${APP_PREFIX_PATH}/reports`,
        title: 'Reports',
        icon: UserOutlined,
        breadcrumb: false,
        submenu: [],
      },
      {
        key: 'blank',
        path: `#`,
        title: '',
        // icon: UserOutlined,
        breadcrumb: false,
        submenu: [],
      },
      // {
      //   key: 'settings_group',
      //   title: 'Settings',
      //   icon: HeatMapOutlined,
      //   breadcrumb: false,
      //   isGroupTitle: true,
      //   submenu: [
      feature?.clients && {
        key: 'clients',
        path: `${APP_PREFIX_PATH}/clients`,
        title: 'Clients',
        icon: IdcardOutlined,
        breadcrumb: false,
        submenu: [],
      },
      feature?.projects && {
        key: 'projects',
        path: `${APP_PREFIX_PATH}/projects`,
        title: 'Projects',
        icon: FundOutlined,
        breadcrumb: false,
        submenu: [],
      },
      feature?.team && {
        key: 'team',
        path: `${APP_PREFIX_PATH}/team`,
        title: 'Team',
        icon: UserOutlined,
        breadcrumb: false,
        submenu: [],
      },
      feature?.notifications && {
        key: 'notifications',
        path: `${APP_PREFIX_PATH}/notifications`,
        title: 'Notifications',
        icon: ContainerOutlined,
        breadcrumb: false,
        submenu: [],
      },
      feature?.settings && {
        key: 'settings',
        path: `${APP_PREFIX_PATH}/settings`,
        title: 'Settings',
        icon: RadarChartOutlined,
        breadcrumb: false,
        submenu: [],
      },
    ]?.filter(Boolean)
  }
  // ],
  // },
];

export default navigationConfig;
