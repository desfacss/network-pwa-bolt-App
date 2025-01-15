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
const module_features = state?.auth?.session?.user?.organization?.module_features;


const navigationConfig = [
  {
    key: 'all',
    // path: `${APP_PREFIX_PATH}/dashboard`,
    title: '',
    isGroupTitle: true,
    // icon: DashboardOutlined,
    breadcrumb: false,
    submenu: [
      module_features?.dashboard && feature?.dashboard && {
        key: 'dashboard',
        path: `${APP_PREFIX_PATH}/dashboard`,
        title: 'Dashboard',
        icon: DashboardOutlined,
        breadcrumb: false,
        submenu: [],
      },
      module_features?.timesheets && feature?.timesheets && {
        key: 'timesheets',
        path: `${APP_PREFIX_PATH}/timesheet`,
        title: 'Timesheet',
        icon: ClockCircleOutlined,
        breadcrumb: false,
        submenu: [],
      },
      module_features?.leaves && feature?.leaves && { //Comment for Prod
        key: 'leave_app',
        path: `${APP_PREFIX_PATH}/leave_app`,
        //Comment for Prod
        title: 'Leaves',
        icon: CalendarOutlined,
        breadcrumb: false,
        submenu: [],
      },
      module_features?.expenses && feature?.expenses && {
        key: 'expenses',
        path: `${APP_PREFIX_PATH}/expenses`,
        title: 'Expense',
        icon: WalletOutlined,
        breadcrumb: false,
        submenu: [],
      },
      module_features?.reports && feature?.reports && {
        key: 'reports',
        path: `${APP_PREFIX_PATH}/reports`,
        title: 'Reports',
        icon: UserOutlined,
        breadcrumb: false,
        submenu: [],
      },
      module_features?.ibBusinesses && feature?.ibBusinesses && {
        key: 'ib_businesses',
        path: `${APP_PREFIX_PATH}/ib_businesses`,
        title: 'Businesses',
        icon: UserOutlined,
        breadcrumb: false,
        submenu: [],
      },
      module_features?.ibMembers && feature?.ibMembers && {
        key: 'ib_members',
        path: `${APP_PREFIX_PATH}/ib_members`,
        title: 'Members',
        icon: UserOutlined,
        breadcrumb: false,
        submenu: [],
      },
      module_features?.ibNetworking && feature?.ibNetworking && {
        key: 'ib_networking',
        path: `${APP_PREFIX_PATH}/ib_networking`,
        title: 'Networking',
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
      module_features?.clients && feature?.clients && {
        key: 'clients',
        path: `${APP_PREFIX_PATH}/clients`,
        title: 'Clients',
        icon: IdcardOutlined,
        breadcrumb: false,
        submenu: [],
      },
      module_features?.projects && feature?.projects && {
        key: 'projects',
        path: `${APP_PREFIX_PATH}/projects`,
        title: 'Projects',
        icon: FundOutlined,
        breadcrumb: false,
        submenu: [],
      },
      module_features?.team && feature?.team && {
        key: 'team',
        path: `${APP_PREFIX_PATH}/team`,
        title: 'Team',
        icon: UserOutlined,
        breadcrumb: false,
        submenu: [],
      },
      module_features?.notifications && feature?.notifications && {
        key: 'notifications',
        path: `${APP_PREFIX_PATH}/notifications`,
        title: 'Notifications',
        icon: ContainerOutlined,
        breadcrumb: false,
        submenu: [],
      },
      module_features?.settings && feature?.settings && {
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
