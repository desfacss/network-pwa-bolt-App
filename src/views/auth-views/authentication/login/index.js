import React from "react";
import LoginForm from "../../components/LoginForm";
import { Col, Row } from "antd";
// import IBCNLayout from "components/layout-components/IBCNLayout";
import { useLocation, Link } from "react-router-dom";
import { APP_PREFIX_PATH, SURVEY_PREFIX_PATH } from "configs/AppConfig";
import CustomHeader from "../landing/Header";

const LoginTwo = (props) => {
  const location = useLocation();

  const PREFIX_PATH = location.pathname.startsWith("/survey") ? SURVEY_PREFIX_PATH : APP_PREFIX_PATH;
  return (
    <>
      <CustomHeader title={"Login"} headerHeight={100} />
      <Row justify="center">
        <Col offest={6} xs={24} sm={24} md={24} lg={24} xl={24}>
          {/* <h2 className="mb-4">Sign In</h2> */}
          <p>
            New User ? {" "}
            <Link to={`${APP_PREFIX_PATH}/register`}>Register here  </Link>
            or
            <Link to={`${APP_PREFIX_PATH}/landing`}>  Home</Link>
          </p>
          <div className="mt-4">
            <LoginForm {...props} />
          </div>
        </Col>
      </Row >
    </>
  );
};

export default LoginTwo;
