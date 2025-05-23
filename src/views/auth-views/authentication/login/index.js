
import React from "react";
import LoginForm from "../../components/LoginForm";
import { Col, Divider, Row } from "antd";
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
        IBCN LOGO{/* <img src="/img/ibcn/ibcn.png" alt="IBCN Logo" style={{ height: "70px" }} loading="lazy" /> */}
        <h2 style={{ margin: 0 }}>IBCN NetworkX</h2>
        KNBA LOGO{/* <img src="/img/ibcn/knba.png" alt="KNBA Logo" style={{ height: "70px" }} loading="lazy" /> */}
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
              <h3>Login</h3>
              <LoginForm {...props} />
              <Divider></Divider>
              <p pb-2>If you have not registered for the app, <Link to={`${APP_PREFIX_PATH}/register`}> Register here...</Link>
                {/* or Go to{" "}
                <Link to={`${APP_PREFIX_PATH}/landing`}>Home</Link> */}
              </p>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default LoginTwo;
