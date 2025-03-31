import {
  DashboardOutlined,
  WechatWorkOutlined,
  ShopOutlined,
  UsergroupAddOutlined,
  FormOutlined,
  BookOutlined,
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
      // module_features?.dashboard && feature?.dashboard && 
      {
        key: 'dashboard',
        path: `${APP_PREFIX_PATH}/dashboard`,
        title: 'Dashboard',
        icon: DashboardOutlined,
        breadcrumb: false,
        submenu: [],
      },
      feature?.eventPass && {
        key: 'pass',
        path: `${APP_PREFIX_PATH}/pass`,
        title: 'Event Pass',
        icon: BookOutlined,
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
      feature?.ibNetworking && {
        key: 'channels',
        path: `${APP_PREFIX_PATH}/channels`,
        title: 'Networking',
        icon: WechatWorkOutlined,
        breadcrumb: false,
        submenu: [],
      },
      feature?.businessDirectory && {
        key: 'businesses',
        path: `${APP_PREFIX_PATH}/businesses`,
        title: 'Businesses',
        icon: ShopOutlined,
        breadcrumb: false,
        submenu: [],
      },
      feature?.memberDirectory && {
        key: 'members',
        path: `${APP_PREFIX_PATH}/members`,
        title: 'Members',
        icon: UsergroupAddOutlined,
        breadcrumb: false,
        submenu: [],
      },
      // module_features?.ibCategories && feature?.ibCategories && {
      //   key: 'ib_heirarchy',
      //   path: `${APP_PREFIX_PATH}/heirarchy`,
      //   title: 'Categories',
      //   icon: ApartmentOutlined,
      //   breadcrumb: false,
      //   submenu: [],
      // },
      // module_features?.survey && feature?.survey &&
      feature?.survey && {
        key: 'survey',
        path: `${APP_PREFIX_PATH}/survey`,
        title: 'Survey',
        icon: FormOutlined,
        breadcrumb: false,
        submenu: [],
      },
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
      // module_features?.ibIdeas && feature?.ibIdeas && 
      // {
      //   key: 'poll_org',
      //   path: `${APP_PREFIX_PATH}/poll`,
      //   title: 'Poll-org',
      //   icon: ApartmentOutlined,
      //   breadcrumb: false,
      //   submenu: [],
      // },
      // {
      //   key: 'poll',
      //   path: `${APP_PREFIX_PATH}/trial`,
      //   title: 'Live Survey',
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
    ]?.filter(Boolean),
  },
];

export default navigationConfig;
