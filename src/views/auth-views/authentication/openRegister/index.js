// import React from "react";
// import OpenRegisterForm from "../../components/OpenRegisterForm";
// import CustomHeader from "../landing/Header";
// // import IBCNLayout from "components/layout-components/IBCNLayout";

// const RegisterTwo = (props) => {
//   return (
//     <div>
//       <CustomHeader title={"Register"} headerHeight={100} />
//       <OpenRegisterForm {...props} />
//     </div>
//   );
// };

// export default RegisterTwo;

import React from "react";
import OpenRegisterForm from "../../components/OpenRegisterForm";
import RegisterForm from "../../components/RegisterForm";
import { Row, Col, Divider } from "antd";
import { Link } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";

const RegisterTwo = (props) => {
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
        <h2 style={{ margin: 0 }}>IBCN NetworkX</h2>
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
          <Col span={24}> {/* Full width */}

            <div style={{ maxWidth: "500px", margin: "0 auto" }}> {/* Constrain form width */}
              <h3>Register</h3>
              <p pb-2>NetworkX is open for IBCN 2025 Delegates only for now! Check you registration with your email or mobile and continue with the App!</p>
              <RegisterForm {...props} />
              <Divider></Divider>
              <p>
                If you have registered for the app,<Link to={`${APP_PREFIX_PATH}/login`}> Login here...</Link>
              </p>
              {/* <br />
              If you want to register for attending IBCN 2025, Please Register here! */}
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default RegisterTwo;
