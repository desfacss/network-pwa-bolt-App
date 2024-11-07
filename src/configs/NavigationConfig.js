import {
  DashboardOutlined, SlidersOutlined, AreaChartOutlined, FundOutlined, HeatMapOutlined, UserOutlined, FundProjectionScreenOutlined, FilePptOutlined, ReadOutlined, IdcardOutlined, ContainerOutlined, RadarChartOutlined
} from '@ant-design/icons';
import { APP_PREFIX_PATH } from 'configs/AppConfig'

const dashBoardNavTree = [{
  key: 'dashboards',
  path: `${APP_PREFIX_PATH}/dashboards`,
  title: '',
  icon: DashboardOutlined,
  breadcrumb: false,
  isGroupTitle: true,
  submenu: [
    {
      key: 'manage_employees',
      path: `${APP_PREFIX_PATH}/manage_employees`,
      title: 'DashBoard',
      icon: UserOutlined, // Kept as UserOutlined
      breadcrumb: false,
      submenu: []
    },
    // {
    //   key: 'services',
    //   path: `${APP_PREFIX_PATH}/services`,
    //   title: 'Services',
    //   icon: SlidersOutlined, // Changed to SlidersOutlined
    //   breadcrumb: false,
    //   submenu: []
    // },

    // {
    //   key: 'jobs',
    //   path: `${APP_PREFIX_PATH}/jobs`,
    //   title: 'Jobs',
    //   icon: FilePptOutlined, // Changed to FilePptOutlined
    //   breadcrumb: false,
    //   submenu: []
    // },
    // {
    //   key: 'tasks',
    //   path: `${APP_PREFIX_PATH}/tasks`,
    //   title: 'Tasks',
    //   icon: ContainerOutlined, // Changed to ContainerOutlined
    //   breadcrumb: false,
    //   submenu: []
    // },
    // {
    //   key: 'schedule',
    //   path: `${APP_PREFIX_PATH}/schedule`,
    //   title: 'Schedule',
    //   icon: ReadOutlined, // Changed to ReadOutlined
    //   breadcrumb: false,
    //   submenu: []
    // },
    {
      key: 'timesheet',
      path: `${APP_PREFIX_PATH}/timesheet`,
      title: 'Timesheets',
      icon: ReadOutlined, // Changed to ReadOutlined
      breadcrumb: false,
      submenu: []
    },
    // {
    //   key: 'timesheeth',
    //   path: `${APP_PREFIX_PATH}/timesheeth`,
    //   title: 'Timesheet-H',
    //   icon: ReadOutlined, // Changed to ReadOutlined
    //   breadcrumb: false,
    //   submenu: []
    // },
    // {
    //   key: 'review',
    //   path: `${APP_PREFIX_PATH}/review`,
    //   title: 'Review',
    //   icon: ReadOutlined, // Changed to ReadOutlined
    //   breadcrumb: false,
    //   submenu: []
    // },
    {
      key: 'leave_application',
      path: `${APP_PREFIX_PATH}/leave_application`,
      title: 'Leaves',
      icon: ReadOutlined, // Changed to ReadOutlined
      breadcrumb: false,
      submenu: []
    },
    {
      key: 'expenses',
      path: `${APP_PREFIX_PATH}/expenses`,
      title: 'Expense',
      icon: ReadOutlined, // Changed to ReadOutlined
      breadcrumb: false,
      submenu: []
    },
    // {
    //   key: 'Settings',
    //   title: 'Settings',
    //   icon: HeatMapOutlined, // Changed to HeatMapOutlined
    //   breadcrumb: false,
    //   submenu: [
    {
      key: 'blank',
      // path: `${APP_PREFIX_PATH}/team`,
      title: '',
      // icon: UserOutlined, // Kept as UserOutlined
      breadcrumb: false,
      submenu: []
    },
    {
      key: 'clients',
      path: `${APP_PREFIX_PATH}/clients`,
      title: 'Clients',
      icon: IdcardOutlined, // Changed to IdcardOutlined
      breadcrumb: false,
      submenu: []
    },
    {
      key: 'projects',
      path: `${APP_PREFIX_PATH}/projects`,
      title: 'Projects',
      icon: FundOutlined, // Changed to FundOutlined
      breadcrumb: false,
      submenu: []
    },
    {
      key: 'team',
      path: `${APP_PREFIX_PATH}/team`,
      title: 'Team',
      icon: UserOutlined, // Kept as UserOutlined
      breadcrumb: false,
      submenu: []
    },
    {
      key: 'blank2',
      // path: `${APP_PREFIX_PATH}/team`,
      title: '',
      // icon: UserOutlined, // Kept as UserOutlined
      breadcrumb: false,
      submenu: []
    },

    {
      key: 'notifications',
      path: `${APP_PREFIX_PATH}/notifications`,
      title: 'Notifications',
      icon: UserOutlined, // Kept as UserOutlined
      breadcrumb: false,
      submenu: []
    },
    {
      key: 'settings',
      path: `${APP_PREFIX_PATH}/settings`,
      title: 'Settings',
      icon: UserOutlined, // Kept as UserOutlined
      breadcrumb: false,
      submenu: []
    },
    {
      key: 'profile',
      path: `${APP_PREFIX_PATH}/profile`,
      title: 'My Profile',
      icon: FundProjectionScreenOutlined, // Changed to FundProjectionScreenOutlined
      breadcrumb: false,
      submenu: []
    }
  ]
  // }
  // ]
}]

const navigationConfig = [
  ...dashBoardNavTree,
]

export default navigationConfig;
