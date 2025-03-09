// import React from "react";
// import { Row, Col, Layout, Typography } from "antd";
// import { useSelector } from "react-redux";

// const { Content } = Layout;
// const { Title, Text } = Typography;

// const backgroundURL = "/img/subscribe3.jpg";
// const backgroundStyle = {
//   backgroundImage: `url(${backgroundURL})`,
//   backgroundRepeat: "no-repeat",
//   backgroundSize: "cover",
//   backgroundPosition: "center",
//   height: "100vh",
//   display: "flex",
//   flexDirection: "column",
//   justifyContent: "center",
//   alignItems: "center",
//   color: "white",
//   textAlign: "center",
//   padding: "20px",
// };

// const SurveyLayout = ({ children }) => {
//   const theme = useSelector((state) => state.theme.currentTheme);
//   const { session, selectedOrganization, defaultOrganization } = useSelector((state) => state.auth);
//   const workspace = session?.user?.organization?.app_settings?.workspace || defaultOrganization?.app_settings?.workspace || 'dev';
//   const name = session?.user?.organization?.app_settings?.name || defaultOrganization?.app_settings?.name || 'dev';

//   return (
//     <Layout className={`h-100 ${theme === "light" ? "bg-white" : "bg-dark text-light"}`} style={{ minHeight: "100vh" }}>
//       <Row className="h-100" gutter={[16, 16]} justify="center" align="middle" style={{ width: "100%" }}>
//         {/* Main Content Area - Maximized for mobile and tablets up to 768px */}
//         <Col xs={24} sm={24} md={24} lg={16} xl={16} style={{ display: "flex", justifyContent: "center" }}>
//           <Content className="d-flex flex-column align-items-center" style={{ maxWidth: "900px", padding: "20px", width: "100%" }}>
//             {children}
//           </Content>
//         </Col>

//         {/* Sidebar - Hidden on screens below 768px */}
//         <Col xs={0} sm={0} md={0} lg={8} xl={8} style={backgroundStyle}>
//           <div>
//             <Title level={2} style={{ color: "white" }}>IBCN 2025 Bengaluru</Title>
//             <Title level={4} style={{ color: "white" }}>
//               International Business Conference for Nagarathars
//             </Title>
//             <Text style={{ color: "white", fontSize: "16px" }}>
//               Enhancing Nagarathar Businesses Through Technology
//             </Text>
//           </div>
//         </Col>
//       </Row>
//     </Layout>
//   );
// };

// export default SurveyLayout;

import React from "react";
import { Layout, Typography } from "antd";
import { useSelector } from "react-redux";
import { useMediaQuery } from "react-responsive"; // New dependency for media queries

const { Content } = Layout;
const { Title, Text } = Typography;

const backgroundURL = "/img/subscribe3.jpg";
const sidebarStyle = {
  backgroundImage: `url(${backgroundURL})`,
  backgroundRepeat: "no-repeat",
  backgroundSize: "cover",
  backgroundPosition: "center",
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  color: "white",
  textAlign: "center",
  padding: "20px",
  flexShrink: 0, // Prevent shrinking
};

const SurveyLayout = ({ children }) => {
  const theme = useSelector((state) => state.theme.currentTheme);
  const { session, selectedOrganization, defaultOrganization } = useSelector((state) => state.auth);
  const workspace = session?.user?.organization?.app_settings?.workspace || defaultOrganization?.app_settings?.workspace || 'dev';
  const name = session?.user?.organization?.app_settings?.name || defaultOrganization?.app_settings?.name || 'dev';

  // Use media query to detect screen size
  const isLargeScreen = useMediaQuery({ minWidth: 768 }); // 768px as the breakpoint

  return (
    <Layout className={`h-100 ${theme === "light" ? "bg-white" : "bg-dark text-light"}`} style={{ minHeight: "100vh" }}>
      <div style={{ display: "flex", flexDirection: "row", height: "100vh", width: "100%" }}>
        {/* Main Content Area - Full width on smaller screens */}
        <Content
          className="d-flex flex-column align-items-center"
          style={{
            flexGrow: 1, // Takes available space
            maxWidth: isLargeScreen ? "900px" : "100%", // Constrain on large screens
            padding: "20px",
            width: "100%",
          }}
        >
          {children}
        </Content>

        {/* Sidebar - Only rendered on screens >= 768px */}
        {isLargeScreen && (
          <div style={{ ...sidebarStyle, width: "33.33%" }}> {/* Approx 8/24 columns */}
            <div>
              <Title level={2} style={{ color: "white" }}>IBCN 2025 Bengaluru</Title>
              <Title level={4} style={{ color: "white" }}>
                International Business Conference for Nagarathars
              </Title>
              <Text style={{ color: "white", fontSize: "16px" }}>
                Enhancing Nagarathar Businesses Through Technology
              </Text>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SurveyLayout;