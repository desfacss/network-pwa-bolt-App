import React, { useEffect } from "react";
import { connect } from "react-redux";
import { Button, Divider, Form, Input, notification } from "antd";
import { MailOutlined, LockOutlined, GoogleOutlined } from "@ant-design/icons";
import {
  showLoading,
} from "store/slices/authSlice";
import { supabase } from "configs/SupabaseConfig";
import { useNavigate, useLocation } from "react-router-dom";
import { APP_PREFIX_PATH } from 'configs/AppConfig';

export const LoginForm = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showLoading } = props;

  useEffect(() => {
    const hash = location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.replace('#', ''));
      const idToken = params.get('id_token');
      const accessToken = params.get('access_token');
      const state = params.get('state');

      if (idToken && accessToken) {
        let stateType, mobileFromState;
        try {
          const decodedState = JSON.parse(atob(state));
          stateType = decodedState.type;
          mobileFromState = decodedState.mobile;
        } catch (e) {
          stateType = state;
        }
        handleOAuthCallback(idToken, accessToken, stateType, mobileFromState);
      } else {
        notification.error({ message: "Missing tokens from Google response" });
      }
    }
  }, [location]);

  const handleOAuthCallback = async (idToken, accessToken, state) => {
    showLoading();
    try {
      const googleUserResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const googleUser = await googleUserResponse.json();
      const userEmail = googleUser.email;

      if (state === 'direct-login') {
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('details, auth_id')
          .eq('details->>email', userEmail)
          .single();

        if (userError && userError.code !== 'PGRST116') {
          notification.error({ message: "Error checking user record" });
          return;
        }

        if (!user) {
          notification.error({
            message: "Google Sign-In not allowed",
            description: "Your email is not registered. Please use a different method or register first.",
          });
          return;
        }

        const { data: { session }, error: signInError } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: idToken,
        });

        if (signInError) {
          notification.error({ message: signInError.message });
          return;
        }

        if (!user.auth_id) {
          await supabase
            .from('users')
            .update({ auth_id: session.user.id })
            .eq('details->>email', userEmail);
        }

        notification.success({ message: "Successfully Logged In" });
        navigate(`${APP_PREFIX_PATH}/dashboard`);
      }
    } catch (error) {
      notification.error({ message: "Failed to process Google login" });
    }
  };

  const oAuth = () => {
    showLoading();
    const clientId = '684934400219-qeftq7ldff5kchnkaqfi7kukefkl22st.apps.googleusercontent.com';
    const redirectUri = `${window.location.origin}/app/login`;
    const scope = 'profile email openid';

    const url = new URL('https://accounts.google.com/o/oauth2/auth');
    url.searchParams.append('client_id', clientId);
    url.searchParams.append('redirect_uri', redirectUri);
    url.searchParams.append('response_type', 'id_token token');
    url.searchParams.append('scope', scope);
    url.searchParams.append('state', 'direct-login');

    window.location.href = url.toString();
  };

  const onLogin = async (values) => {
    showLoading();
    const { data, error } = await supabase.auth.signInWithPassword(values);
    if (!error) {
      notification.success({ message: 'Successfully Logged In' });
      navigate(`${APP_PREFIX_PATH}/dashboard`);
    } else {
      notification.error({ message: error.message || "Invalid credentials" });
    }
  };

  return (
    <Form layout="vertical" name="login-form" onFinish={onLogin}>
      <Button
        icon={<GoogleOutlined />} // Google red color
        block
        onClick={oAuth}
        style={{ backgroundColor: '#DB4437', color: 'white', borderColor: '#DB4437' }}
      >
        Sign in with Google
      </Button>
      <Divider>Or</Divider>
      <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
        <Input prefix={<MailOutlined />} />
      </Form.Item>
      <Form.Item
        name="password"
        label="Password"
        labelCol={{ style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }}
        extra={<a href={`${APP_PREFIX_PATH}/confirm-signup`}>Forgot Password?</a>}
        rules={[{ required: true }]}
      >
        <Input.Password prefix={<LockOutlined />} />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          Login
        </Button>
      </Form.Item>
    </Form>
  );
};

const mapDispatchToProps = { showLoading };
export default connect(null, mapDispatchToProps)(LoginForm);