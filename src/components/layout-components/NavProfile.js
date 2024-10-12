import React from "react";
import { Dropdown, Avatar, Select } from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  QuestionCircleOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import NavItem from "./NavItem";
import Flex from "components/shared-components/Flex";
import { signOut } from "store/slices/authSlice";
import styled from "@emotion/styled";
import {
  FONT_WEIGHT,
  MEDIA_QUERIES,
  SPACER,
  FONT_SIZES,
} from "constants/ThemeConstant";

const Icon = styled.div(() => ({
  fontSize: FONT_SIZES.LG,
}));

const Profile = styled.div(() => ({
  display: "flex",
  alignItems: "center",
}));

const UserInfo = styled("div")`
  padding-left: ${SPACER[2]};

  @media ${MEDIA_QUERIES.MOBILE} {
    display: none;
  }
`;

const Name = styled.div(() => ({
  fontWeight: FONT_WEIGHT.SEMIBOLD,
}));

const Title = styled.span(() => ({
  opacity: 0.8,
}));

const MenuItem = (props) => (
  <Flex as="a" href={props.path} alignItems="center" gap={SPACER[2]}>
    <Icon>{props.icon}</Icon>
    <span>{props.label}</span>
  </Flex>
);

const MenuItemSignOut = (props) => {
  const dispatch = useDispatch();

  const handleSignOut = () => {
    dispatch(signOut());
  };

  return (
    <div onClick={handleSignOut}>
      <Flex alignItems="center" gap={SPACER[2]}>
        <Icon>
          <LogoutOutlined />
        </Icon>
        <span>{props.label}</span>
      </Flex>
    </div>
  );
};

export const NavProfile = ({ mode, profileData }) => {
  let items = [
    !profileData && ({
      key: "Login",
      label: (
        <MenuItem
          path="/app/login"
          label="Login"
          icon={<QuestionCircleOutlined />}
        />
      ),
    }),
    profileData && ({
      key: "Sign Out",
      label: <MenuItemSignOut label="Sign Out" />,
    })
  ];

  const { userData } = useSelector((state) => state?.profile);
  const clientMenu = ['Setting', 'Login', 'Forgot Password', 'Sign Out']
  if (userData?.role_type === 'client') {
    items = items.filter(item => clientMenu.includes(item.key))
  }

  return (
    <Dropdown placement="bottomRight" menu={{ items }} trigger={["click"]}>
      <NavItem mode={mode}>
        <Profile>
          <Avatar src="/img/avatars/thumb-7.jpg" />
          <UserInfo className="profile-text">
            <Name>{profileData?.userData?.name}</Name>
          </UserInfo>
        </Profile>
      </NavItem>
    </Dropdown>
  );
};

export default NavProfile;
