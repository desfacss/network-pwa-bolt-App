import {
  DashboardOutlined,
  BookOutlined,
} from '@ant-design/icons';
import { APP_PREFIX_PATH } from 'configs/AppConfig';
import { store } from 'store';

const state = store.getState();
const feature = state?.auth?.session?.user?.features?.feature;


const navigationConfig = [
  {
    key: 'all',
    title: '',
    isGroupTitle: true,
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
      feature?.eventPass && {
        key: 'pass',
        path: `${APP_PREFIX_PATH}/pass`,
        title: 'Event Pass',
        icon: BookOutlined,
        breadcrumb: false,
        submenu: [],
      }
    ]?.filter(Boolean),
  },
];

export default navigationConfig;
