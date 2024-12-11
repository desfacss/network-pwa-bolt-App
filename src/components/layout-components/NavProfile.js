import React from "react";
import { Dropdown, Avatar, Select, notification, Space } from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  QuestionCircleOutlined,
  LogoutOutlined, UserOutlined
} from "@ant-design/icons";
import NavItem from "./NavItem";
import Flex from "components/shared-components/Flex";
import { setSelectedOrganization, setSelectedUser, setSession } from "store/slices/authSlice";
import styled from "@emotion/styled";
import {
  FONT_WEIGHT,
  MEDIA_QUERIES,
  SPACER,
  FONT_SIZES,
} from "constants/ThemeConstant";
import { supabase } from "configs/SupabaseConfig";
import { store } from "store";
import { APP_PREFIX_PATH } from 'configs/AppConfig'
import { Link, useNavigate } from "react-router-dom";

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
  // <Flex as="a" href={props.path} alignItems="center" gap={SPACER[2]}>
  <Link to={props.path}>
    <Space>
      <Icon>{props.icon}</Icon>
      <span>{props.label}</span>
    </Space>
  </Link>
  //  </Flex> 
);

const MenuItemSignOut = (props) => {
  // const dispatch = useDispatch();
  const navigate = useNavigate();
  const onLogOut = async () => {
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    if (error) {
      console.error('Error signing out:', error.message);
      notification.error({ message: 'Error signing out' })
      return
    }
    store.dispatch(setSelectedOrganization())
    store.dispatch(setSelectedUser())
    store.dispatch(setSession())
    navigate(`${APP_PREFIX_PATH}/login`)
  }



  const handleSignOut = () => {
    onLogOut()
    // dispatch(signOut());
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
      key: "My Profile",
      label: (
        <MenuItem
          path="/app/profile"
          label="My Profile"
          icon={<UserOutlined />}
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

  const { session } = useSelector((state) => state.auth);

  return (
    <Dropdown placement="bottomRight" menu={{ items }} trigger={["click"]}>
      <NavItem mode={mode}>
        {session?.user?.user_name && <Profile>
          <Avatar src="/img/avatars/thumb-7.jpg" alt={session?.user?.user_name[0]} >{session?.user?.user_name[0] || ""}</Avatar>
          <UserInfo className="profile-text">
            <Name>{session?.user?.user_name || ""}</Name>
          </UserInfo>
        </Profile>}
      </NavItem>
    </Dropdown>
  );
};

export default NavProfile;
