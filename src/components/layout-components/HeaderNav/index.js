/** @jsxImportSource @emotion/react */
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { CaretLeftOutlined, CaretRightOutlined } from "@ant-design/icons";
import { toggleCollapsedNav } from "store/slices/themeSlice";
import { setSession } from "store/slices/authSlice";
import { supabase } from "configs/SupabaseConfig";
import { Button } from "antd";
import styled from "@emotion/styled";
import { TEMPLATE, SIDE_NAV_WIDTH, SIDE_NAV_COLLAPSED_WIDTH } from "constants/ThemeConstant";
import { useNavigate } from "react-router-dom";

const Header = styled.div`
  background: ${({ headerNavColor }) => headerNavColor};
  height: ${TEMPLATE.HEADER_HEIGHT}px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
`;

const HeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 16px;
`;

const Nav = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const NavEdge = styled.div`
  display: flex;
  align-items: center;
`;

export const HeaderNav = ({ isMobile }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const navCollapsed = useSelector((state) => state.theme.navCollapsed);
  const headerNavColor = "#ffffff"; // Fixed light background

  const onToggle = () => {
    dispatch(toggleCollapsedNav(!navCollapsed));
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) {
      console.error("Error signing out:", error.message);
      return;
    }
    dispatch(setSession(null));
    navigate("/app/login");
  };

  const getNavWidth = () => {
    if (isMobile) return "0px";
    return navCollapsed ? `${SIDE_NAV_COLLAPSED_WIDTH}px` : `${SIDE_NAV_WIDTH}px`;
  };

  return (
    <Header headerNavColor={headerNavColor}>
      <HeaderWrapper>
        <Nav style={{ marginLeft: getNavWidth() }}>
          <NavEdge>
            {!isMobile && (
              <div onClick={onToggle} style={{ cursor: "pointer", padding: "0 16px" }}>
                {navCollapsed ? <CaretRightOutlined style={{ fontSize: "90%", color: "#999" }} /> : <CaretLeftOutlined style={{ fontSize: "90%", color: "#999" }} />}
              </div>
            )}
            {isMobile && (
              <img src="/img/ibcn/ibcn.png" alt="IBCN Logo" style={{ height: "56px" }} loading="lazy" />
            )}
          </NavEdge>
          <NavEdge style={{ flex: 1, justifyContent: "center" }}>
            {isMobile && <h3 style={{ margin: 0, textAlign: "center" }}>IBCN NetworkX</h3>}
          </NavEdge>
          <NavEdge>
            <Button type="primary" onClick={handleLogout}>
              Logout
            </Button>
          </NavEdge>
        </Nav>
      </HeaderWrapper>
    </Header>
  );
};

export default HeaderNav;