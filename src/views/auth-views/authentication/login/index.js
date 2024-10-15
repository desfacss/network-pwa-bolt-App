import React from "react";
import LoginForm from "../../components/LoginForm";
import { Col, Row } from "antd";
// import IBCNLayout from "components/layout-components/IBCNLayout";
import { useLocation, Link } from "react-router-dom";
import { APP_PREFIX_PATH, SURVEY_PREFIX_PATH } from "configs/AppConfig";

const LoginTwo = (props) => {
  const location = useLocation();

  const PREFIX_PATH = location.pathname.startsWith("/survey") ? SURVEY_PREFIX_PATH : APP_PREFIX_PATH;
  return (
    <Row justify="center">
      <Col offest={6} xs={24} sm={24} md={12} lg={12} xl={12}>
        <h1>Sign In</h1>
        <p>
          New User ? {" "}
          <Link to={`${APP_PREFIX_PATH}/register`}>Register here...</Link>
        </p>
        <div className="mt-4">
          <LoginForm {...props} />
        </div>
      </Col>
    </Row >
  );
};

export default LoginTwo;
