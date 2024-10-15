import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Button, Form, Input, notification, Space } from "antd";
import { MailOutlined, LockOutlined, GoogleOutlined, FacebookOutlined, XOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import {
  signIn,
  showLoading,
  showAuthMessage,
  hideAuthMessage,
} from "store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { supabase } from "configs/SupabaseConfig";
import { AUTH_PREFIX_PATH, APP_PREFIX_PATH } from 'configs/AppConfig'

export const LoginForm = (props) => {
  const [linkSent, setLinkSent] = useState(false)
  const [magiclink, setMagicLink] = useState(false)

  const navigate = useNavigate();

  const {
    otherSignIn,
    showForgetPassword,
    hideAuthMessage,
    onForgetPasswordClick,
    showLoading,
    signInWithGoogle,
    signInWithFacebook,
    extra,
    signIn,
    token,
    loading,
    redirect,
    showMessage,
    message,
    allowRedirect = true,
  } = props;

  const initialCredential = {
    email: "",
    password: "",
  };

  const onLogin = async (values) => {
    showLoading();
    // signIn(values);
    const { data, error } = await supabase.auth.signInWithPassword(values);
    if (!error) {
      console.log('Logged In', data, values);
      // navigate(`${AUTH_PREFIX_PATH}/update_survey`)
    } else {
      console.log('Error', values);
      return notification.error({ message: "Invalid credentials" })
    }
  };

  const sendLink = async (values) => {
    // const { data, error } = await supabase
    //   .from('members')
    //   .select('*')
    //   if (error) {
    //     console.error(error)
    //     return
    //   }
    if (!magiclink) {
      onLogin(values)
      return
    }
    showLoading();
    setLinkSent(true)
    const redirectTo = window.location.href.slice(0, -5) + 'update_survey'
    console.log(redirectTo)
    let { data, error } = await supabase.auth.signInWithOtp({ email: values?.email, shouldCreateUser: false }
      , { redirectTo: redirectTo }
    )
    if (error) {
      console.log(error)
      return notification.error({
        // message: "If your email ID is registered, You will recieve an email with link to login and update the survey!"
        message: error.message
      });
    }
    if (data) {
      console.log(data)
      notification.success({
        message: "If your email ID is registered, You will recieve an email with link to login and update the survey!"
      });
    }
  }
  const onGoogleLogin = () => {
    showLoading();
    signInWithGoogle();
  };

  const onFacebookLogin = () => {
    showLoading();
    signInWithFacebook();
  };

  // useEffect(() => {
  //   if (token !== null && allowRedirect) {
  //     navigate(redirect);
  //   }
  //   if (showMessage) {
  //     const timer = setTimeout(() => hideAuthMessage(), 3000);
  //     return () => {
  //       clearTimeout(timer);
  //     };
  //   }
  // }, []);

  // const renderOtherSignIn = (
  // 	<div>
  // 		<Divider>
  // 			<span className="text-muted font-size-base font-weight-normal">or connect with</span>
  // 		</Divider>
  // 		<div className="d-flex justify-content-center">
  // 			<Button
  // 				onClick={() => onGoogleLogin()}
  // 				className="mr-2"
  // 				disabled={loading}
  // 				icon={<CustomIcon svg={GoogleSVG}/>}
  // 			>
  // 				Google
  // 			</Button>
  // 			<Button
  // 				onClick={() => onFacebookLogin()}
  // 				icon={<CustomIcon svg={FacebookSVG}/>}
  // 				disabled={loading}
  // 			>
  // 				Facebook
  // 			</Button>
  // 		</div>
  // 	</div>
  // )
  const oAuth = async (provider) => {
    // supabase.auth.signOut()
    // store.dispatch(removeSession());
    let { data, error } = await supabase.auth.signInWithOAuth({ provider })
  }
  return (
    <>
      {/* <Space>
        <Button onClick={() => oAuth('google')}>
          <GoogleOutlined />
        </Button>
        <Button onClick={() => oAuth('facebook')}>
          <FacebookOutlined />
        </Button>
        <Button onClick={() => oAuth('twitter')}>
          <XOutlined />
        </Button>
      </Space> */}
      {/* <motion.div 
				initial={{ opacity: 0, marginBottom: 0 }} 
				animate={{ 
					opacity: showMessage ? 1 : 0,
					marginBottom: showMessage ? 20 : 0 
				}}> 
			<Alert type="error" showIcon message={message}></Alert>
			</motion.div> */}
      <Form
        layout="vertical"
        name="login-form"
        initialValues={initialCredential}
        onFinish={sendLink}
      >
        <Form.Item
          name="email"
          label="Email"
          rules={[
            {
              required: true,
              message: "Please input your email",
            },
            {
              type: "email",
              message: "Please enter a validate email!",
            },
          ]}
        >
          <Input prefix={<MailOutlined className="text-primary" />} />
        </Form.Item>
        {!magiclink && <Form.Item
          // tooltip={"Refer your email"}
          name="password"
          label={
            <div
              className={`${true
                ? "d-flex justify-content-between w-100 align-items-center"
                : ""
                }`}
            >
              <span>Password</span>
              {true && (
                <span
                  onClick={() => setMagicLink(true)}
                  className="ml-2 cursor-pointer font-size-sm font-weight-normal text-muted"
                >
                  Forget Password?
                </span>
              )}
            </div>
          }
          rules={[
            {
              required: true,
              message: "Please input your password",
            },
          ]}
        >
          <Input.Password prefix={<LockOutlined className="text-primary" />} />
        </Form.Item>}
        <Form.Item>

          {/* {magiclink ? <><Button type="primary" htmlType="submit" block disabled={linkSent}>
            Send login link to email
          </Button>{linkSent && "Check your Email/Spam folder"}</> :
            <Button onClick={onLogin} type='primary' htmlType="submit" block>
              Login
            </Button>} */}
          <Button type="primary" htmlType="submit" block disabled={linkSent}>
            {magiclink ? "Send login link to email" : "Login"}
          </Button>{linkSent && "Check your Email/Spam folder"}
        </Form.Item>
        {/* {
					otherSignIn ? renderOtherSignIn : null
				} */}
        {extra}
      </Form>
      For support, contact: <a href="mailto:info@timetrack.app">info@timetrack.app</a>
    </>
  );
};

LoginForm.propTypes = {
  otherSignIn: PropTypes.bool,
  showForgetPassword: PropTypes.bool,
  extra: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
};

LoginForm.defaultProps = {
  otherSignIn: true,
  showForgetPassword: false,
};

const mapStateToProps = ({ auth }) => {
  const { loading, message, showMessage, token, redirect } = auth;
  return { loading, message, showMessage, token, redirect };
};

const mapDispatchToProps = {
  signIn,
  showAuthMessage,
  showLoading,
  hideAuthMessage
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginForm);
