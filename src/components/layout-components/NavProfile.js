import React, { useState } from "react";
import { Dropdown, Avatar, notification, Space } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { QuestionCircleOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import NavItem from "./NavItem";
import Flex from "components/shared-components/Flex";
import { setSelectedOrganization, setSelectedUser, signOut } from "store/slices/authSlice";
import styled from "@emotion/styled";
import { FONT_WEIGHT, MEDIA_QUERIES, SPACER, FONT_SIZES } from "constants/ThemeConstant";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { Link, useNavigate } from "react-router-dom";
import { ActionSheet } from "antd-mobile";
import { setSession } from "store/slices/authSlice";
import { store } from "store";

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
  <Link to={props.path}>
    <Space>
      <Icon>{props.icon}</Icon>
      <span>{props.label}</span>
    </Space>
  </Link>
);

// RAVI - WHY SIGNOUT NOT WORKING HERE>>
const MenuItemSignOut = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onLogOut = async () => {
    try {
      await dispatch(signOut()).unwrap();
      dispatch(setSelectedOrganization(null));
      dispatch(setSelectedUser(null));
      navigate(`${APP_PREFIX_PATH}/login`);
    } catch (error) {
      notification.error({ message: "Error signing out" });
    }
  };


  // TRIAL FROM OLD - WHY SIGNOUT NOT WORKING HERE>>
// const MenuItemSignOut = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const onLogOut = async () => {
//     try {
//       await dispatch(signOut()).unwrap();
//       // dispatch(setSelectedOrganization(null));
//       // dispatch(setSelectedUser(null));
//       // navigate(`${APP_PREFIX_PATH}/login`);
//     store.dispatch(setSelectedOrganization());
//     store.dispatch(setSelectedUser());
//     store.dispatch(setSession());
//     navigate(`${APP_PREFIX_PATH}`);
//     } catch (error) {
//       notification.error({ message: "Error signing out" });
//     }
//   };

  return (
    <div onClick={onLogOut}>
      <Flex alignItems="center" gap={SPACER[2]}>
        <Icon><LogoutOutlined /></Icon>
        {/* <span>{props.label}</span> */}
        <span>Sign Out</span>
      </Flex>
    </div>
  );
};

export const NavProfile = ({ mode, profileData, isMobile }) => {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();
  const { session } = useSelector((state) => state.auth);

  const items = [
    !profileData && {
      key: "Login",
      label: <MenuItem path="/app/login" label="Login" icon={<QuestionCircleOutlined />} />,
      onClick: () => navigate("/app/login"),
    },
    profileData?.user?.features?.feature?.profile && {
      key: "My Profile",
      label: <MenuItem path="/app/profile" label="My Profile" icon={<UserOutlined />} />,
      onClick: () => navigate("/app/profile"),
    },
    profileData && {
      key: "Sign Out",
      label: <MenuItemSignOut />,
    },
  ].filter(Boolean);

  // Define menu items
  // let items = [
  //   !profileData && {
  //     key: "Login",
  //     label: (
  //       <MenuItem
  //         path="/app/login"
  //         label="Login"
  //         icon={<QuestionCircleOutlined />}
  //       />
  //     ),
  //     onClick: () => navigate("/app/login"),
  //   },
  //   profileData?.user?.features?.feature?.profile && {
  //     key: "My Profile",
  //     label: (
  //       <MenuItem
  //         path="/app/profile"
  //         label="My Profile"
  //         icon={<UserOutlined />}
  //       />
  //     ),
  //     onClick: () => navigate("/app/profile"),
  //   },
  //   profileData && {
  //     key: "Sign Out",
  //     label: <MenuItemSignOut label="Sign Out" />,
  //     onClick: async () => {
  //       const { error } = await supabase.auth.signOut({ scope: "local" });
  //       if (error) {
  //         console.error("Error signing out:", error.message);
  //         notification.error({ message: "Error signing out" });
  //         return;
  //       }
  //       store.dispatch(setSelectedOrganization());
  //       store.dispatch(setSelectedUser());
  //       store.dispatch(setSession());
  //       navigate(`${APP_PREFIX_PATH}`);
  //     },
  //   },
  // ].filter(Boolean); // Remove falsy values

  // const clientMenu = ["Setting", "Login", "Forgot Password", "Sign Out"];
  // if (userData?.role_type === "client") {
  //   items = items.filter((item) => clientMenu.includes(item.key));
  // }

  // // ActionSheet actions for mobile
  const actions = items.map((item) => ({
    text: item.key,
    onClick: item.onClick,
  }));

  // Handle click to show ActionSheet on mobile
  const handleMobileClick = () => {
    if (isMobile) setVisible(true);
  };

  return (
    <>
      {isMobile ? (
        <>
          <NavItem mode={mode} onClick={handleMobileClick}>
            {session?.user?.user_name && (
              <Profile>
                <Avatar src="/img/avatars/thumb-7.jpg" alt={session?.user?.user_name[0]}>
                  {session?.user?.user_name[0] || ""}
                </Avatar>
                <UserInfo className="profile-text">
                  <Name>{session?.user?.user_name || ""}</Name>
                </UserInfo>
              </Profile>
            )}
          </NavItem>
          <ActionSheet
            visible={visible}
            actions={actions}
            onClose={() => setVisible(false)}
            cancelText="Cancel"
          />
        </>
      ) : (
        <Dropdown placement="bottomRight" menu={{ items }} trigger={["click"]}>
          <NavItem mode={mode}>
            {session?.user?.user_name && (
              <Profile>
                <Avatar src="/img/avatars/thumb-7.jpg" alt={session?.user?.user_name[0]}>
                  {session?.user?.user_name[0] || ""}
                </Avatar>
                <UserInfo className="profile-text">
                  <Name>{session?.user?.user_name || ""}</Name>
                </UserInfo>
              </Profile>
            )}
          </NavItem>
        </Dropdown>
      )}
    </>
  );
};

export default NavProfile;

// import React, { useState } from "react";
// import { Dropdown, Avatar, notification, Space } from "antd";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   QuestionCircleOutlined,
//   LogoutOutlined,
//   UserOutlined,
// } from "@ant-design/icons";
// import NavItem from "./NavItem";
// import Flex from "components/shared-components/Flex";
// import { setSelectedOrganization, setSelectedUser, setSession } from "store/slices/authSlice";
// import styled from "@emotion/styled";
// import {
//   FONT_WEIGHT,
//   MEDIA_QUERIES,
//   SPACER,
//   FONT_SIZES,
// } from "constants/ThemeConstant";
// import { supabase } from "configs/SupabaseConfig";
// import { store } from "store";
// import { APP_PREFIX_PATH } from "configs/AppConfig";
// import { Link, useNavigate } from "react-router-dom";
// import { ActionSheet } from "antd-mobile"; // Import ActionSheet from antd-mobile

// const Icon = styled.div(() => ({
//   fontSize: FONT_SIZES.LG,
// }));

// const Profile = styled.div(() => ({
//   display: "flex",
//   alignItems: "center",
// }));

// const UserInfo = styled("div")`
//   padding-left: ${SPACER[2]};

//   @media ${MEDIA_QUERIES.MOBILE} {
//     display: none;
//   }
// `;

// const Name = styled.div(() => ({
//   fontWeight: FONT_WEIGHT.SEMIBOLD,
// }));

// const Title = styled.span(() => ({
//   opacity: 0.8,
// }));

// const MenuItem = (props) => (
//   <Link to={props.path}>
//     <Space>
//       <Icon>{props.icon}</Icon>
//       <span>{props.label}</span>
//     </Space>
//   </Link>
// );

// const MenuItemSignOut = (props) => {
//   const navigate = useNavigate();

//   const onLogOut = async () => {
//     const { error } = await supabase.auth.signOut({ scope: "local" });
//     if (error) {
//       console.error("Error signing out:", error.message);
//       notification.error({ message: "Error signing out" });
//       return;
//     }
//     store.dispatch(setSelectedOrganization());
//     store.dispatch(setSelectedUser());
//     store.dispatch(setSession());
//     navigate(`${APP_PREFIX_PATH}`);
//   };

//   return (
//     <div onClick={onLogOut}>
//       <Flex alignItems="center" gap={SPACER[2]}>
//         <Icon>
//           <LogoutOutlined />
//         </Icon>
//         <span>{props.label}</span>
//       </Flex>
//     </div>
//   );
// };

// export const NavProfile = ({ mode, profileData, isMobile }) => {
//   const [visible, setVisible] = useState(false); // State to control ActionSheet visibility

//   const navigate = useNavigate();
//   const { userData } = useSelector((state) => state?.profile);
//   const { session } = useSelector((state) => state.auth);

//   // Define menu items
//   let items = [
//     !profileData && {
//       key: "Login",
//       label: (
//         <MenuItem
//           path="/app/login"
//           label="Login"
//           icon={<QuestionCircleOutlined />}
//         />
//       ),
//       onClick: () => navigate("/app/login"),
//     },
//     profileData?.user?.features?.feature?.profile && {
//       key: "My Profile",
//       label: (
//         <MenuItem
//           path="/app/profile"
//           label="My Profile"
//           icon={<UserOutlined />}
//         />
//       ),
//       onClick: () => navigate("/app/profile"),
//     },
//     profileData && {
//       key: "Sign Out",
//       label: <MenuItemSignOut label="Sign Out" />,
//       onClick: async () => {
//         const { error } = await supabase.auth.signOut({ scope: "local" });
//         if (error) {
//           console.error("Error signing out:", error.message);
//           notification.error({ message: "Error signing out" });
//           return;
//         }
//         store.dispatch(setSelectedOrganization());
//         store.dispatch(setSelectedUser());
//         store.dispatch(setSession());
//         navigate(`${APP_PREFIX_PATH}`);
//       },
//     },
//   ].filter(Boolean); // Remove falsy values

//   const clientMenu = ["Setting", "Login", "Forgot Password", "Sign Out"];
//   if (userData?.role_type === "client") {
//     items = items.filter((item) => clientMenu.includes(item.key));
//   }

//   // ActionSheet actions for mobile
//   const actions = items.map((item) => ({
//     text: item.key,
//     onClick: item.onClick,
//   }));

//   // Handle click to show ActionSheet on mobile
//   const handleMobileClick = () => {
//     if (isMobile) {
//       setVisible(true);
//     }
//   };

//   // Render logic
//   return (
//     <>
//       {isMobile ? (
//         <>
//           <NavItem mode={mode} onClick={handleMobileClick}>
//             {session?.user?.user_name && (
//               <Profile>
//                 <Avatar
//                   src="/img/avatars/thumb-7.jpg"
//                   alt={session?.user?.user_name[0]}
//                 >
//                   {session?.user?.user_name[0] || ""}
//                 </Avatar>
//                 <UserInfo className="profile-text">
//                   <Name>{session?.user?.user_name || ""}</Name>
//                 </UserInfo>
//               </Profile>
//             )}
//           </NavItem>
//           <ActionSheet
//             visible={visible}
//             actions={actions}
//             onClose={() => setVisible(false)}
//             cancelText="Cancel"
//           />
//         </>
//       ) : (
//         <Dropdown placement="bottomRight" menu={{ items }} trigger={["click"]}>
//           <NavItem mode={mode}>
//             {session?.user?.user_name && (
//               <Profile>
//                 <Avatar
//                   src="/img/avatars/thumb-7.jpg"
//                   alt={session?.user?.user_name[0]}
//                 >
//                   {session?.user?.user_name[0] || ""}
//                 </Avatar>
//                 <UserInfo className="profile-text">
//                   <Name>{session?.user?.user_name || ""}</Name>
//                 </UserInfo>
//               </Profile>
//             )}
//           </NavItem>
//         </Dropdown>
//       )}
//     </>
//   );
// };

// export default NavProfile;