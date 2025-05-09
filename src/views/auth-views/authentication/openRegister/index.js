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
        <img src="/img/ibcn/ibcn.png" alt="IBCN Logo" style={{ height: "70px" }} loading="lazy" />
        <h2 style={{ margin: 0 }}>IBCN NetworkX</h2>
        <img src="/img/ibcn/knba.png" alt="KNBA Logo" style={{ height: "70px" }} loading="lazy" />
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
              {/* <h3>Register</h3> */}
              <p>
              <div 
              // style={{ padding: '1rem' }}
              >
      {/* <h4>Not Registered for IBCN 2025 Yet?</h4>
      <ul>
        <li>
          Please register for the main IBCN 2025 event first:{' '}
          <a href="link-to-web-registration" target="_blank" rel="noopener noreferrer">
            Register here
          </a>
        </li>
        <li>Then return here to complete your app registration.</li>
      </ul> */}
      <h4>Registered IBCN 2025 Delegates:</h4>
      <ul>
        <li>Welcome!, Please register for the IBCN NetworkX app to access its features.</li>
        <li>Enter the email address or mobile number you used for your IBCN 2025 registration.</li>
        <li>Tap the <strong>"Check Registration"</strong> button to proceed.</li>
        <li>
          If you have already registered for the app,<br/>
          <a href="/app/login">click here to login...</a>
        </li>
      </ul>
      <RegisterForm {...props} />
      <Divider></Divider>
      <h4>Not Registered for IBCN 2025 Yet?</h4>
      <ul>
        <li>
          Please register for the main IBCN 2025 event first:{' '}
          <a href="https://delegates.ibcn2025.com/register" target="_blank" rel="noopener noreferrer">
            Register here
          </a>
        </li>
        <li>Then return here to complete your app registration.</li>
      </ul>

    </div>
                {/* NetworkX is open for IBCN 2025 Delegates only for now! Check you registration with your email or mobile and continue with the App! */}
              </p>
              {/* <RegisterForm {...props} />
              <Divider></Divider> */}
              <p>
                {/* If you have registered for the app,<Link to={`${APP_PREFIX_PATH}/login`}> Login here...</Link> */}
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
