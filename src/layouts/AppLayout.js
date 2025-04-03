import React, { Suspense, useEffect, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import SideNav from "components/layout-components/SideNav";
import TopNav from "components/layout-components/TopNav";
import Loading from "components/shared-components/Loading";
import HeaderNav from "components/layout-components/HeaderNav";
import PageHeader from "components/layout-components/PageHeader";
import Footer from "components/layout-components/Footer";
import { Layout, Grid, Badge } from "antd";
import { TabBar } from "antd-mobile";
import { TEMPLATE, MEDIA_QUERIES } from "constants/ThemeConstant";
import styled from "@emotion/styled";
import utils from "utils";
import './custom.css';
import { REACT_APP_WORKSPACE } from "configs/AppConfig";
import { getNavigationConfig } from "configs/NavigationConfig/navigationUtils";
import { supabase } from "configs/SupabaseConfig";

const { Content } = Layout;
const { useBreakpoint } = Grid;

const AppContent = styled("div")`
  padding: ${TEMPLATE.LAYOUT_CONTENT_GUTTER}px;
  margin-top: ${TEMPLATE.HEADER_HEIGHT}px;
  min-height: calc(100vh - ${TEMPLATE.CONTENT_HEIGHT_OFFSET}px);
  position: relative;

  ${(props) =>
    props.isNavTop
      ? `
        max-width: ${TEMPLATE.CONTENT_MAX_WIDTH}px;
        margin-left: auto;
        margin-right: auto;
        width: 100%;

        @media ${MEDIA_QUERIES.DESKTOP} { 
            margin-top: ${TEMPLATE.HEADER_HEIGHT + TEMPLATE.TOP_NAV_HEIGHT}px;
            min-height: calc(100vh - ${TEMPLATE.CONTENT_HEIGHT_OFFSET}px - ${TEMPLATE.TOP_NAV_HEIGHT
      }px);
        }
    `
      : ""}

  @media ${MEDIA_QUERIES.MOBILE} {
    padding: ${TEMPLATE.LAYOUT_CONTENT_GUTTER_SM}px;
    padding-bottom: 60px; /* Space for TabBar */
  }
`;

const StyledTabBar = styled(TabBar)`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000; /* Bring TabBar to the top layer */
  background: #f5f5f5; /* Ensure background is solid */
`;

export const AppLayout = ({
  navCollapsed,
  navType,
  direction,
  children,
  profile,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [unreadCount, setUnreadCount] = useState(0);
  const { session } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!session?.user?.id) return;

      const { data, error } = await supabase.rpc("get_unread_counts", { user_id: session.user.id });
      if (error) {
        console.error("Error fetching unread counts:", error);
        return;
      }

      const totalUnread = data.reduce((sum, row) => sum + row.unread_count, 0);
      setUnreadCount(totalUnread);
    };

    fetchUnreadCount();
  }, [session]);

  const workspace = session?.user?.organization?.app_settings?.workspace || REACT_APP_WORKSPACE || 'dev';
  const navigationConfig = getNavigationConfig(workspace);

  const currentRouteInfo = utils.getRouteInfo(navigationConfig, location.pathname);
  const screens = utils.getBreakPoint(useBreakpoint());
  const isMobile = screens.length === 0 ? false : !screens.includes("lg");
  const isNavSide = navType === TEMPLATE.NAV_TYPE_SIDE;
  const isNavTop = navType === TEMPLATE.NAV_TYPE_TOP;

  const getLayoutGutter = () => {
    if (isNavTop || isMobile) {
      return 0;
    }
    return navCollapsed ? TEMPLATE.SIDE_NAV_COLLAPSED_WIDTH : TEMPLATE.SIDE_NAV_WIDTH;
  };

  const getLayoutDirectionGutter = () => {
    if (direction === TEMPLATE.DIR_LTR) {
      return { paddingLeft: getLayoutGutter() };
    }
    if (direction === TEMPLATE.DIR_RTL) {
      return { paddingRight: getLayoutGutter() };
    }
    return { paddingLeft: getLayoutGutter() };
  };

  // Flatten navigationConfig for TabBar
  const tabBarItems = navigationConfig
    .flatMap((group) => group.submenu)
    .filter(Boolean)
    .map((item) => ({
      key: item.key,
      title: item.title,
      icon: item.key === 'channels' ?
        (
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <item.icon />
            <Badge
              dot={unreadCount}
              style={{ marginLeft: 8, backgroundColor: '#f5222d' }}
            />
          </span>
        )
        : <item.icon />,
      path: item.path,
    }));

  const handleTabClick = (path) => {
    // console.log("xz", path)
    navigate(path); // Navigate to the clicked item's path
  };


  return (
    <Layout style={{ minHeight: "100vh" }}>
      <HeaderNav profileData={profile} isMobile={isMobile} />
      {isNavTop && !isMobile ? <TopNav routeInfo={currentRouteInfo} /> : null}
      <Layout>
        {isNavSide && !isMobile ? (
          <SideNav routeInfo={currentRouteInfo} />
        ) : null}
        <Layout style={getLayoutDirectionGutter()}>
          <AppContent isNavTop={isNavTop}>
            <PageHeader
              display={currentRouteInfo?.breadcrumb}
              title={currentRouteInfo?.title}
            />
            <Content className="h-100">
              <Suspense fallback={<Loading cover="content" />}>
                {children}
              </Suspense>
            </Content>
            <Footer />
          </AppContent>
        </Layout>
      </Layout>
      {isMobile && (
        <StyledTabBar
          unselectedTintColor="#949494"
          tintColor="#1890ff"
          barTintColor="#f5f5f5"
          activeKey={location.pathname}
        >
          {/* {tabBarItems.map((item) => (
            <TabBar.Item
              key={item.key}
              title={item.title}
              icon={item.icon}
              selected={location.pathname === item.path}
              onPress={() => handleTabClick(item.path)} // Handle navigation
            />
          ))} */}
          {tabBarItems?.map((item) => (
            <TabBar.Item
              key={item?.path}
              title={item?.title}
              icon={item?.icon} // THIS IS THE CRITICAL CHANGE!
              selected={location.pathname === item?.path}
              onClick={() => handleTabClick(item?.path)}
            />
          ))}
        </StyledTabBar>
      )}
    </Layout>
  );
};

const mapStateToProps = ({ theme, profile }) => {
  const { navCollapsed, navType, locale } = theme;
  return { navCollapsed, navType, locale, profile };
};

export default connect(mapStateToProps)(React.memo(AppLayout));