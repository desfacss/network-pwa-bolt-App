import {
  DashboardOutlined, SlidersOutlined, AreaChartOutlined, FundOutlined, HeatMapOutlined, UserOutlined, FundProjectionScreenOutlined, FilePptOutlined, ReadOutlined, IdcardOutlined, ContainerOutlined, RadarChartOutlined
} from '@ant-design/icons';
import { APP_PREFIX_PATH } from 'configs/AppConfig'
// import { signOut } from "store/slices/authSlice";

const dashBoardNavTree = [{
  key: 'dashboards',
  path: `${APP_PREFIX_PATH}/dashboards`,
  title: '',
  icon: DashboardOutlined,
  breadcrumb: false,
  isGroupTitle: true,
  submenu: [
    // {
    //   key: 'dashboards-Livetrade',
    //   path: `${APP_PREFIX_PATH}/dashboards/live-trade`,
    //   title: 'Live Trade',
    //   icon: FundOutlined,
    //   breadcrumb: false,
    //   submenu: []
    // },
    {
      key: 'profile',
      path: `${APP_PREFIX_PATH}/profile`,
      title: 'My Profile',
      icon: DashboardOutlined,
      breadcrumb: false,
      submenu: []
    },
    {
      key: 'users',
      path: `${APP_PREFIX_PATH}/users`,
      title: 'Services',
      icon: UserOutlined,
      breadcrumb: false,
      submenu: []
    },
    {
      key: 'clients',
      path: `${APP_PREFIX_PATH}/clients`,
      title: 'Clients',
      icon: UserOutlined,
      breadcrumb: false,
      submenu: []
    },
    {
      key: 'businesses',
      path: `${APP_PREFIX_PATH}/businesses`,
      title: 'Business Directory',
      icon: UserOutlined,
      breadcrumb: false,
      submenu: []
    },
    {
      key: 'networking',
      path: `${APP_PREFIX_PATH}/networking`,
      title: 'Networking',
      icon: ContainerOutlined,
      breadcrumb: false,
      submenu: []
    },
    {
      key: 'chat',
      path: `${APP_PREFIX_PATH}/chat`,
      title: 'Chat',
      icon: FundProjectionScreenOutlined,
      breadcrumb: false,
      submenu: []
    },
    {
      key: 'poll',
      path: `${APP_PREFIX_PATH}/poll`,
      title: 'Poll',
      icon: SlidersOutlined,
      breadcrumb: false,
      submenu: []
    },



    // {
    //   key: 'dashboards-Order-Book',
    //   path: `${APP_PREFIX_PATH}/order_book`,
    //   title: 'Orders',
    //   icon: ReadOutlined,
    //   breadcrumb: false,
    //   submenu: []
    // },
    // {
    //   key: 'dashboards-Position-Book',
    //   path: `${APP_PREFIX_PATH}/position_book`,
    //   title: 'Position Book',
    //   icon: FilePptOutlined,
    //   breadcrumb: false,
    //   submenu: []
    // },
    // {
    //   key: 'dashboards-trade_analysis',
    //   path: `${APP_PREFIX_PATH}/trading_view_chart`,
    //   title: 'Trade Analysis',
    //   icon: SlidersOutlined,
    //   breadcrumb: false,
    //   submenu: []
    // },
    // {
    //   key: 'dashboards-Strategy-builder',
    //   path: `${APP_PREFIX_PATH}/strategy-builder`,
    //   title: 'Strategy Builder',
    //   icon: HeatMapOutlined,
    //   breadcrumb: false,
    //   submenu: []
    // },
    // {
    //   key: 'dashboards-market-view',
    //   path: `${APP_PREFIX_PATH}/market_view`,
    //   title: 'Market View',
    //   icon: SlidersOutlined,
    //   breadcrumb: false,
    //   submenu: []
    // },
    // {
    //   key: 'dashboards-heat-map',
    //   path: `${APP_PREFIX_PATH}/heat_map`,
    //   title: 'Sector View',
    //   icon: RadarChartOutlined,
    //   breadcrumb: false,
    //   submenu: []
    // },
    // {
    //   key: 'dashboards-screener-ticker',
    //   path: `${APP_PREFIX_PATH}/screener_ticker`,
    //   title: 'Screener',
    //   icon: FundOutlined,
    //   breadcrumb: false,
    //   submenu: []
    // },
    // {
    //   key: 'dashboards-tv-chart',
    //   path: `${APP_PREFIX_PATH}/tv_chart`,
    //   title: 'Advanced Chart',
    //   icon: AreaChartOutlined,
    //   breadcrumb: false,
    //   submenu: []
    // },
    // {
    //   key: 'dashboards-Broker',
    //   path: `${APP_PREFIX_PATH}/broker`,
    //   title: 'Broker',
    //   icon: IdcardOutlined,
    //   breadcrumb: false,
    //   submenu: []
    // },
    // {
    //   key: 'dashboards-Portfolio',
    //   path: `${APP_PREFIX_PATH}/portfolio`,
    //   title: 'Portfolio',
    //   icon: HeatMapOutlined,
    //   breadcrumb: false,
    //   submenu: []
    // },
  ]
}]

const navigationConfig = [
  ...dashBoardNavTree,
]

export default navigationConfig;
