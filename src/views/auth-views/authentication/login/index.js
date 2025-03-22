// import React from "react";
// import LoginForm from "../../components/LoginForm";
// import { Col, Row } from "antd";
// // import IBCNLayout from "components/layout-components/IBCNLayout";
// import { useLocation, Link } from "react-router-dom";
// import { APP_PREFIX_PATH, SURVEY_PREFIX_PATH } from "configs/AppConfig";
// import CustomHeader from "../landing/Header";

// const LoginTwo = (props) => {
//   const location = useLocation();

//   const PREFIX_PATH = location.pathname.startsWith("/survey") ? SURVEY_PREFIX_PATH : APP_PREFIX_PATH;
//   return (
//     <>
//       <CustomHeader title={"Login"} headerHeight={100} />
//       <Row justify="center">
//         <Col offest={6} xs={24} sm={24} md={24} lg={24} xl={24}>
//           {/* <h2 className="mb-4">Sign In</h2> */}
//           <p>
//             New User ? {" "}
//             <Link to={`${APP_PREFIX_PATH}/register`}>Register here  </Link>
//             or
//             <Link to={`${APP_PREFIX_PATH}/landing`}>  Home</Link>
//           </p>
//           <div className="mt-4">
//             <LoginForm {...props} />
//           </div>
//         </Col>
//       </Row >
//     </>
//   );
// };

// export default LoginTwo;

import React from "react";
import LoginForm from "../../components/LoginForm";
import { Col, Row } from "antd";
import { useLocation, Link } from "react-router-dom";
import { APP_PREFIX_PATH, SURVEY_PREFIX_PATH } from "configs/AppConfig";

const LoginTwo = (props) => {
  const location = useLocation();

  const PREFIX_PATH = location.pathname.startsWith("/survey") ? SURVEY_PREFIX_PATH : APP_PREFIX_PATH;

  // Fixed header height
  const headerHeight = 90;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header matching IntroScreen */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px",
          color: "#003764",
          height: `${headerHeight}px`,
          background: "#fff",
        }}
      >
        <img src="/img/ibcn/ibcn.jpeg" alt="IBCN Logo" style={{ height: "70px" }} />
        <h1 style={{ margin: 0 }}>IBCN NetworkX</h1>
        <img src="/img/ibcn/knba.png" alt="KNBA Logo" style={{ height: "70px" }} />
      </div>

      {/* Main Content Area */}
      <div
        style={{
          flexGrow: 1, // Takes up remaining height
          background: "#f8f9fa", // Grey background matching IntroScreen
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start", // Top-aligned content
          alignItems: "center", // Centered horizontally
          overflowY: "auto", // Scroll if content overflows
        }}
      >
        <Row style={{ width: "100%", padding: "20px" }}>
          {/* <p style={{ textAlign: "center", marginBottom: "20px" }}> */}
          <Col span={24}>
            {/* <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#003764" }}>Sign In</h2> */}
            <div style={{ maxWidth: "500px", margin: "0 auto" }}> {/* Constrain form width */}
              {/* <p>
                New User?{" "}
                <Link to={`${APP_PREFIX_PATH}/register`}>Register here</Link> or{" "}
                <Link to={`${APP_PREFIX_PATH}/landing`}>Home</Link>
              </p> */}
              <h3>Register</h3>
              <p pb-2>IBCN 2025 Delegates can login with your mobile number and Google account or Email directly... For others, You can
                <Link to={`${APP_PREFIX_PATH}/register`}> Register here</Link> or Go to{" "}
                <Link to={`${APP_PREFIX_PATH}/landing`}>Home</Link></p>
              <LoginForm {...props} />
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default LoginTwo;
