import {
  DashboardOutlined,
  UserOutlined,
  FundOutlined,
  IdcardOutlined,
  ContainerOutlined,
  RadarChartOutlined,
  WalletOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  TeamOutlined,
  ShopOutlined,
  UsergroupAddOutlined,
  ApartmentOutlined,
  FormOutlined,
  HeatMapOutlined
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
      // module_features?.dashboard && feature?.dashboard && 
      {
        key: 'dashboard',
        path: `${APP_PREFIX_PATH}/dashboard`,
        title: 'Dashboard',
        icon: DashboardOutlined,
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
      // module_features?.ibIdeas && feature?.ibIdeas && {
      //   key: 'process',
      //   path: `${APP_PREFIX_PATH}/process`,
      //   title: 'Process',
      //   icon: ApartmentOutlined,
      //   breadcrumb: false,
      //   submenu: [],
      // },
      // module_features?.ibNetworking && feature?.ibNetworking && {
      //   key: 'ib_networking',
      //   path: `${APP_PREFIX_PATH}/networking`,
      //   title: 'Networking',
      //   icon: TeamOutlined,
      //   breadcrumb: false,
      //   submenu: [],
      // },
      // module_features?.ibBusinesses && feature?.ibBusinesses && {
      //   key: 'ib_businesses',
      //   path: `${APP_PREFIX_PATH}/businesses`,
      //   title: 'Businesses',
      //   icon: ShopOutlined,
      //   breadcrumb: false,
      //   submenu: [],
      // },
      // module_features?.ibMembers && feature?.ibMembers && {
      //   key: 'ib_members',
      //   path: `${APP_PREFIX_PATH}/members`,
      //   title: 'Members',
      //   icon: UsergroupAddOutlined,
      //   breadcrumb: false,
      //   submenu: [],
      // },
      // module_features?.ibCategories && feature?.ibCategories && {
      //   key: 'ib_heirarchy',
      //   path: `${APP_PREFIX_PATH}/heirarchy`,
      //   title: 'Categories',
      //   icon: ApartmentOutlined,
      //   breadcrumb: false,
      //   submenu: [],
      // },
      // module_features?.survey && feature?.survey &&
      // {
      //   key: 'survey',
      //   path: `${APP_PREFIX_PATH}/survey`,
      //   title: 'Survey',
      //   icon: FormOutlined,
      //   breadcrumb: false,
      //   submenu: [],
      // },
      // module_features?.trial && feature?.trial && {
      //   key: 'trial',
      //   path: `${APP_PREFIX_PATH}/trial`,
      //   title: 'Trial',
      //   icon: FormOutlined,
      //   breadcrumb: false,
      //   submenu: [],
      // },
      // module_features?.ibIdeas && feature?.ibIdeas && {
      //   key: 'ib_ideas',
      //   path: `${APP_PREFIX_PATH}/ideas`,
      //   title: 'Ideas',
      //   icon: ApartmentOutlined,
      //   breadcrumb: false,
      //   submenu: [],
      // },
      // module_features?.ibIdeas && feature?.ibIdeas && {
      //   key: 'poll',
      //   path: `${APP_PREFIX_PATH}/poll`,
      //   title: 'Poll',
      //   icon: ApartmentOutlined,
      //   breadcrumb: false,
      //   submenu: [],
      // },
      // {
      //   key: 'blank',
      //   path: `#`,
      //   title: '',
      //   // icon: UserOutlined,
      //   breadcrumb: false,
      //   submenu: [],
      // },
      // module_features?.tmembers && feature?.tmembers && {
      //   key: 'tmembers',
      //   path: `${APP_PREFIX_PATH}/tmembers`,
      //   title: 'Offline',
      //   icon: TeamOutlined,
      //   breadcrumb: false,
      //   submenu: [],
      // },
      // module_features?.tmembers && feature?.tmembers && {
      //   key: 'sales',
      //   path: `${APP_PREFIX_PATH}/ysales`,
      //   title: 'Sales',
      //   icon: TeamOutlined,
      //   breadcrumb: false,
      //   submenu: [],
      // },
      // module_features?.tmembers && feature?.tmembers && {
      //   key: 'projects',
      //   path: `${APP_PREFIX_PATH}/yprojects`,
      //   title: 'Projects',
      //   icon: TeamOutlined,
      //   breadcrumb: false,
      //   submenu: [],
      // },
      // module_features?.ibIdeas && feature?.ibIdeas && {
      //   key: 'template',
      //   path: `${APP_PREFIX_PATH}/template`,
      //   title: 'Template',
      //   icon: ApartmentOutlined,
      //   breadcrumb: false,
      //   submenu: [],
      // },
      // module_features?.ibIdeas && feature?.ibIdeas && {
      //   key: 'config',
      //   path: `${APP_PREFIX_PATH}/yconfig`,
      //   title: 'Config',
      //   icon: ApartmentOutlined,
      //   breadcrumb: false,
      //   submenu: [],
      // },
      // {
      //   key: 'blank',
      //   path: `#`,
      //   title: '',
      //   // icon: UserOutlined,
      //   breadcrumb: false,
      //   submenu: [],
      // },
      {
        key: 'crm',
        title: 'CRM',
        icon: HeatMapOutlined,
        breadcrumb: false,
        isGroupTitle: true,
        submenu: [
          module_features?.clients && feature?.clients && {
            key: 'clients',
            path: `${APP_PREFIX_PATH}/clients`,
            title: 'Clients',
            icon: IdcardOutlined,
            breadcrumb: false,
            submenu: [],
          },
          module_features?.clients && feature?.clients && {
            key: 'clients_contacts',
            path: `${APP_PREFIX_PATH}/clients_contacts`,
            title: 'Client Contacts',
            icon: IdcardOutlined,
            breadcrumb: false,
            submenu: [],
          },
          // module_features?.services && feature?.services && 
          {
            key: 'services',
            path: `${APP_PREFIX_PATH}/services`,
            title: 'Services',
            icon: FundOutlined,
            breadcrumb: false,
            submenu: [],
          },
          {
            key: 'ysales',
            path: `${APP_PREFIX_PATH}/ysales`,
            title: 'Sales pipeline',
            icon: FundOutlined,
            breadcrumb: false,
            submenu: [],
          }
        ]?.filter(Boolean)
      },
      {
        key: 'inventory',
        title: 'Budget & Plan',
        icon: HeatMapOutlined,
        breadcrumb: false,
        isGroupTitle: true,
        submenu: [
          {
            key: 'boq',
            path: `${APP_PREFIX_PATH}/boq`,
            title: 'BOQ',
            icon: FundOutlined,
            breadcrumb: false,
            submenu: [],
          },
          {
            key: 'materials',
            path: `${APP_PREFIX_PATH}/materials`,
            title: 'Materials',
            icon: IdcardOutlined,
            breadcrumb: false,
            submenu: [],
          },
          // module_features?.services && feature?.services && 
          {
            key: 'suppliers',
            path: `${APP_PREFIX_PATH}/suppliers`,
            title: 'Suppliers',
            icon: FundOutlined,
            breadcrumb: false,
            submenu: [],
          },
        ]?.filter(Boolean)
      },
      {
        key: 'instance',
        title: 'Projects',
        icon: HeatMapOutlined,
        breadcrumb: false,
        isGroupTitle: true,
        submenu: [
          {
            key: 'projects',
            path: `${APP_PREFIX_PATH}/yprojects`,
            title: 'Projects',
            icon: FundOutlined,
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
        ]?.filter(Boolean)
      },
      {
        key: 'workforce',
        title: 'Workforce',
        icon: HeatMapOutlined,
        breadcrumb: false,
        isGroupTitle: true,
        submenu: [
          module_features?.team && feature?.team &&
          {
            key: 'team',
            path: `${APP_PREFIX_PATH}/team`,
            title: 'Team',
            icon: UserOutlined,
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
        ]?.filter(Boolean)
      },
      {
        key: 'settings_group',
        title: 'Settings',
        icon: HeatMapOutlined,
        breadcrumb: false,
        isGroupTitle: true,
        submenu: [
          // module_features?.clients && feature?.clients && {
          //   key: 'clients',
          //   path: `${APP_PREFIX_PATH}/clients`,
          //   title: 'Clients',
          //   icon: IdcardOutlined,
          //   breadcrumb: false,
          //   submenu: [],
          // },
          // module_features?.projects && feature?.projects && {
          //   key: 'projects',
          //   path: `${APP_PREFIX_PATH}/projects`,
          //   title: 'Projects',
          //   icon: FundOutlined,
          //   breadcrumb: false,
          //   submenu: [],
          // },
          module_features?.notifications && feature?.notifications &&
          {
            key: 'notifications',
            path: `${APP_PREFIX_PATH}/notifications`,
            title: 'Notifications',
            icon: ContainerOutlined,
            breadcrumb: false,
            submenu: [],
          },
          module_features?.settings && feature?.settings &&
          {
            key: 'settings',
            path: `${APP_PREFIX_PATH}/settings`,
            title: 'Settings',
            icon: RadarChartOutlined,
            breadcrumb: false,
            submenu: [],
          },
          // module_features?.ibIdeas && feature?.ibIdeas && 
          {
            key: 'process',
            path: `${APP_PREFIX_PATH}/process`,
            title: 'Process',
            icon: ApartmentOutlined,
            breadcrumb: false,
            submenu: [],
          },
          {
            key: 'template',
            path: `${APP_PREFIX_PATH}/template`,
            title: 'Documents',
            icon: ApartmentOutlined,
            breadcrumb: false,
            submenu: [],
          },
        ]?.filter(Boolean)
      },
    ],
  },
];

export default navigationConfig;
