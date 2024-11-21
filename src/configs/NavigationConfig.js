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
      {
        key: 'timesheets',
        path: `${APP_PREFIX_PATH}/timesheet`,
        title: 'Timesheet',
        icon: ClockCircleOutlined,
        breadcrumb: false,
        submenu: [],
      },
      {
        key: 'leaves',
        path: `#`,
        title: 'Leaves',
        icon: CalendarOutlined,
        breadcrumb: false,
        submenu: [],
      },
      {
        key: 'expenses',
        path: `#`,
        title: 'Expense',
        icon: WalletOutlined,
        breadcrumb: false,
        submenu: [],
      },
      {
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
      {
        key: 'clients',
        path: `${APP_PREFIX_PATH}/clients`,
        title: 'Clients',
        icon: IdcardOutlined,
        breadcrumb: false,
        submenu: [],
      },
      {
        key: 'projects',
        path: `${APP_PREFIX_PATH}/projects`,
        title: 'Projects',
        icon: FundOutlined,
        breadcrumb: false,
        submenu: [],
      },
      {
        key: 'team',
        path: `${APP_PREFIX_PATH}/team`,
        title: 'Team',
        icon: UserOutlined,
        breadcrumb: false,
        submenu: [],
      },
      {
        key: 'notifications',
        path: `${APP_PREFIX_PATH}/notifications`,
        title: 'Notifications',
        icon: ContainerOutlined,
        breadcrumb: false,
        submenu: [],
      },
      {
        key: 'settings',
        path: `${APP_PREFIX_PATH}/settings`,
        title: 'Settings',
        icon: RadarChartOutlined,
        breadcrumb: false,
        submenu: [],
      },
    ]
  }
  // ],
  // },
];

export default navigationConfig;
