import {
  DashboardOutlined,BookOutlined
} from '@ant-design/icons';
import { APP_PREFIX_PATH } from 'configs/AppConfig';
import { store } from 'store';

const state = store.getState();


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
     {
        key: 'pass',
        path: `${APP_PREFIX_PATH}/pass`,
        title: 'Event Pass',
        icon: BookOutlined,
        breadcrumb: false,
        submenu: [],
      }
    ]?.filter(Boolean),
  },
]?.filter(Boolean);

export default navigationConfig;
