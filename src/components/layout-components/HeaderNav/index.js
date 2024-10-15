/** @jsxImportSource @emotion/react */
import { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { TEMPLATE } from "constants/ThemeConstant";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import Logo from "../Logo";
// import NavProfile from "../NavProfile";
import Header from "./Header";
import HeaderWrapper from "./HeaderWrapper";
import Nav from "./Nav";
import NavEdge from "./NavEdge";
import NavItem from "../NavItem";
import { toggleCollapsedNav, onMobileNavToggle } from "store/slices/themeSlice";
import {
  NAV_TYPE_TOP,
  SIDE_NAV_COLLAPSED_WIDTH,
  SIDE_NAV_WIDTH,
} from "constants/ThemeConstant";
import utils from "utils";
import { Button, Col, Form, Input, Modal, notification, Row, Select, Typography } from "antd";
import { AUTH_PREFIX_PATH, APP_PREFIX_PATH } from 'configs/AppConfig'

import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from "configs/SupabaseConfig";

export const HeaderNav = (props) => {
  const { Option } = Select;

  const { isMobile, profileData } = props;

  const location = useLocation();
  const navigate = useNavigate();

  const onLogOut = async () => {
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    if (error) {
      console.error('Error signing out:', error.message);
      notification.error({ message: 'Error signing out' })
      return
    }
    navigate(`${APP_PREFIX_PATH}/login`)
  }

  const dispatch = useDispatch();

  const navCollapsed = useSelector((state) => state.theme.navCollapsed);
  const mobileNav = useSelector((state) => state.theme.mobileNav);
  const navType = useSelector((state) => state.theme.navType);
  const headerNavColor = useSelector((state) => state.theme.headerNavColor);
  const currentTheme = useSelector((state) => state.theme.currentTheme);
  const {
    brokerAccounts: brokerAccountsList,
    getBrokerAccountsLoading,
    selectedAccount,
    brokerPortfolios,
    getBrokerPortfoliosLoading,
    selectedPortfolio,
    userData,
    selectedDate
  } = useSelector((state) => state?.profile);

  const brokerAccounts = brokerAccountsList?.filter((account) => account?.broker_login_status === true)

  const onToggle = () => {
    if (!isMobile) {
      dispatch(toggleCollapsedNav(!navCollapsed));
    } else {
      dispatch(onMobileNavToggle(!mobileNav));
    }
  };

  const isNavTop = navType === NAV_TYPE_TOP;
  const isDarkTheme = currentTheme === "dark";

  const navMode = useMemo(() => {
    if (!headerNavColor) {
      return utils.getColorContrast(isDarkTheme ? "#000000" : "#ffffff");
    }
    return utils.getColorContrast(headerNavColor);
  }, [isDarkTheme, headerNavColor]);

  const navBgColor = isDarkTheme
    ? TEMPLATE.HEADER_BG_DEFAULT_COLOR_DARK
    : TEMPLATE.HEADER_BG_DEFAULT_COLOR_LIGHT;

  const getNavWidth = () => {
    if (isNavTop || isMobile) {
      return "0px";
    }
    if (navCollapsed) {
      return `${SIDE_NAV_COLLAPSED_WIDTH}px`;
    } else {
      return `${SIDE_NAV_WIDTH}px`;
    }
  };

  // Generate date options
  const today = new Date();
  const dateOptions = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const formattedDate = date.toISOString().split('T')[0];
    dateOptions.push(formattedDate);
  }

  return (
    <Header
      isDarkTheme={isDarkTheme}
      headerNavColor={headerNavColor || navBgColor}
    >
      <HeaderWrapper isNavTop={isNavTop}>
        <Logo logoType={navMode} />
        <Nav navWidth={getNavWidth()}>
          <NavEdge left>
            <NavItem onClick={onToggle} mode={navMode}>
              <div className="d-flex align-items-center">
                {navCollapsed || isMobile ? (
                  <MenuUnfoldOutlined className="nav-icon" />
                ) : (
                  <MenuFoldOutlined className="nav-icon" />
                )}
              </div>
            </NavItem>

            {isMobile ? (
              <div
                className="ant-menu-item ant-menu-item-only-child"
                style={{ cursor: "auto" }}
              >
                <Row gutter={16}>
                  <Col span={30}>
                  </Col>
                </Row>
              </div>
            ) : (
              <div
                className="ant-menu-item ant-menu-item-only-child"
                style={{ cursor: "auto" }}
              >
                <Row gutter={16}>
                  <Col span={30}>
                  </Col>
                </Row>
              </div>
            )}
          </NavEdge>
          <NavEdge right>
            <div className="border-bottom d-flex justify-content-between align-items-center px-3 py-2">
              <Button onClick={onLogOut}>LogOut</Button>
            </div>
            {/* <NavProfile profileData={profileData} mode={navMode} /> */}
          </NavEdge>
        </Nav>
      </HeaderWrapper>
    </Header>
  );
};

export default HeaderNav;
