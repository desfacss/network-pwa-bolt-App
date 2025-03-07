import React, { Suspense, useEffect } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import SideNav from "components/layout-components/SideNav";
import TopNav from "components/layout-components/TopNav";
import Loading from "components/shared-components/Loading";
import MobileNav from "components/layout-components/MobileNav";
import HeaderNav from "components/layout-components/HeaderNav";
import PageHeader from "components/layout-components/PageHeader";
import Footer from "components/layout-components/Footer";
import { Layout, Grid } from "antd";
// import navigationConfig from "configs/NavigationConfig/Default";
import { TEMPLATE, MEDIA_QUERIES } from "constants/ThemeConstant";
import styled from "@emotion/styled";
import utils from "utils";
// import { getUserProfile } from "store/slices/profileSlice";
import './custom.css'
import { REACT_APP_WORKSPACE } from "configs/AppConfig";
import { getNavigationConfig } from "configs/NavigationConfig/navigationUtils";

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
  }
`;

export const AppLayout = ({
  navCollapsed,
  navType,
  direction,
  children,
  profile,
}) => {
  const location = useLocation();
  const dispatch = useDispatch();

  const { session } = useSelector((state) => state.auth);
  const workspace = session?.user?.organization?.app_settings?.workspace || REACT_APP_WORKSPACE || 'dev'
  const navigationConfig = getNavigationConfig(workspace);

  const currentRouteInfo = utils.getRouteInfo(
    navigationConfig,
    location.pathname
  );
  const screens = utils.getBreakPoint(useBreakpoint());
  const isMobile = screens.length === 0 ? false : !screens.includes("lg");
  const isNavSide = navType === TEMPLATE.NAV_TYPE_SIDE;
  const isNavTop = navType === TEMPLATE.NAV_TYPE_TOP;
  const getLayoutGutter = () => {
    if (isNavTop || isMobile) {
      return 0;
    }
    return navCollapsed
      ? TEMPLATE.SIDE_NAV_COLLAPSED_WIDTH
      : TEMPLATE.SIDE_NAV_WIDTH;
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

  useEffect(() => {
    // dispatch(getUserProfile());
  }, []);

  return (
    <Layout>
      <HeaderNav profileData={profile} isMobile={isMobile} />
      {isNavTop && !isMobile ? <TopNav routeInfo={currentRouteInfo} /> : null}
      <Layout>
        {isNavSide && !isMobile ? (
          <SideNav routeInfo={currentRouteInfo} />
        ) : null}
        <Layout style={getLayoutDirectionGutter()}>
          <AppContent>
            <PageHeader
              display={currentRouteInfo?.breadcrumb}
              title={currentRouteInfo?.title}
            />
            <Content className="h-100">
              <Suspense fallback={<Loading cover="content" />}>
                {children}
              </Suspense>
            </Content>
          </AppContent>
          <Footer />
        </Layout>
      </Layout>
      {isMobile && <MobileNav />}
    </Layout>
  );
};

const mapStateToProps = ({ theme, profile }) => {
  const { navCollapsed, navType, locale } = theme;
  return { navCollapsed, navType, locale, profile };
};

export default connect(mapStateToProps)(React.memo(AppLayout));
