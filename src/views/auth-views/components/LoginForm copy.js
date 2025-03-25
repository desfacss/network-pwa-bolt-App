import React, { useState, useEffect } from "react";
import { connect, useSelector } from "react-redux";
import { Button, Form, Input, notification, Divider, message } from "antd";
import { MailOutlined, LockOutlined, GoogleOutlined } from "@ant-design/icons";
import {
  signIn,
  showLoading,
  showAuthMessage,
  hideAuthMessage,
} from "store/slices/authSlice";
import { supabase } from "configs/SupabaseConfig";
import { useNavigate, useLocation } from "react-router-dom";
import { APP_PREFIX_PATH, REACT_APP_WORKSPACE } from 'configs/AppConfig';

export const LoginForm = (props) => {
  const [linkSent, setLinkSent] = useState(false);
  const [magiclink, setMagicLink] = useState(false);
  const [mobile, setMobile] = useState("");
  const [referralExists, setReferralExists] = useState(null);
  const [roles, setRoles] = useState();

  const { defaultOrganization } = useSelector((state) => state.auth);

  const navigate = useNavigate();
  const location = useLocation();
  const { showLoading } = props;

  const defaultRole = "delegate";

  const getRoles = async () => {
    const { data, error } = await supabase.from('roles').select('*').eq('organization_id', defaultOrganization?.id);
    if (error) {
      return message.error("Roles does not exist");
    }
    if (data) {
      setRoles(data);
    }
    console.log("klo", defaultOrganization?.id, defaultRole, data?.find(i => i.role_name === defaultRole)?.id)
  };

  useEffect(() => {
    if (defaultOrganization) {
      getRoles();
    }
  }, [defaultOrganization]);

  useEffect(() => {
    const hash = location.hash;
    console.log("Hash on load:", hash);

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

  const handleOAuthCallback = async (idToken, accessToken, state, mobileFromState) => {
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
      } else if (state === 'referral-check') {
        const userMobile = mobileFromState;

        const { data: { session }, error: signInError } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: idToken,
        });

        if (signInError) {
          notification.error({ message: signInError.message });
          return;
        }

        const { data: existingUser, error: userError } = await supabase
          .from('users')
          .select('details, auth_id')
          .eq('details->>email', userEmail)
          .single();

        if (!existingUser) {
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: session.user.id,
              auth_id: session.user.id,
              details: { email: userEmail, mobile: userMobile },
              user_name: userEmail?.split('@')[0] || userEmail,
              organization_id: defaultOrganization?.id,
              role_type: defaultRole,
              role_id: roles?.find(i => i.role_name === defaultRole)?.id || "3dcb9d19-6197-4816-81c8-70435464a201"
            });

          if (insertError) {
            notification.error({ message: "Error creating user record: " + insertError.message });
            return;
          }

          await supabase
            .from('referrals')
            .update({ email: userEmail })
            .eq('mobile', userMobile);
        }

        notification.success({ message: "Successfully Registered" });
        // navigate(`${APP_PREFIX_PATH}/dashboard`);
        window.location.reload()
      }
    } catch (error) {
      notification.error({ message: "Failed to process Google login" });
    }
  };

  const oAuth = (stateType) => {
    showLoading();
    const clientId = '684934400219-qeftq7ldff5kchnkaqfi7kukefkl22st.apps.googleusercontent.com';
    const redirectUri = `${window.location.origin}/app/login`;
    const scope = 'profile email openid';

    const url = new URL('https://accounts.google.com/o/oauth2/auth');
    url.searchParams.append('client_id', clientId);
    url.searchParams.append('redirect_uri', redirectUri);
    url.searchParams.append('response_type', 'id_token token');
    url.searchParams.append('scope', scope);

    const stateObj = { type: stateType };
    if (stateType === 'referral-check' && mobile) {
      stateObj.mobile = mobile;
    }
    const encodedState = btoa(JSON.stringify(stateObj));
    url.searchParams.append('state', encodedState);

    window.location.href = url.toString();
  };

  const onLoginOrRegister = async (values) => {
    showLoading();
    if (referralExists === true) {
      // Register new user with email and password
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });

      if (error) {
        notification.error({ message: error.message });
        return;
      }

      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          auth_id: data.user.id,
          details: { email: values.email, mobile: mobile },
          user_name: values.email?.split('@')[0] || values.email,
          organization_id: defaultOrganization?.id,
          role_type: defaultRole,
          role_id: roles?.find(i => i.role_name === defaultRole)?.id || "3dcb9d19-6197-4816-81c8-70435464a201"
        });

      if (insertError) {
        notification.error({ message: "Error creating user record: " + insertError.message });
        return;
      }

      await supabase
        .from('referrals')
        .update({ email: values.email })
        .eq('mobile', mobile);

      notification.success({ message: "Successfully Registered" });
      // navigate(`${APP_PREFIX_PATH}/dashboard`);
      window.location.reload()
    } else {
      // Existing login functionality
      const { data, error } = await supabase.auth.signInWithPassword(values);
      if (!error) {
        notification.success({ message: 'Successfully Logged In' });
        navigate(`${APP_PREFIX_PATH}/dashboard`);
      } else {
        notification.error({ message: error.message || "Invalid credentials" });
      }
    }
  };

  const sendLink = async (values) => {
    if (!magiclink) {
      onLoginOrRegister(values);
      return;
    }
    showLoading();
    setLinkSent(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: values.email,
      options: { shouldCreateUser: false },
    });
    if (error) {
      notification.error({ message: error.message });
    } else {
      notification.success({ message: "If your email is registered, a login link has been sent" });
    }
  };

  const checkReferral = async () => {
    if (!mobile) {
      notification.error({ message: "Please enter a mobile number" });
      return;
    }
    showLoading();
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('mobile', mobile)
      .single();

    if (error || !data) {
      setReferralExists(false);
      notification.error({
        message: "Registration information not found",
        description: "Please register first or use existing credentials to login"
      });
    } else if (data.email) {
      setReferralExists(false);
      notification.error({
        message: "Mobile number already registered",
        description: "Please login with your existing credentials"
      });
    } else {
      setReferralExists(true);
      notification.success({
        message: "Registration available!",
        description: "You can register with Google or email & password"
      });
    }
  };

  return (
    <Form layout="vertical" name="login-form" onFinish={sendLink}>
      {referralExists !== true && (
        <>
          <Form.Item label="Mobile Number">
            <Input
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Enter mobile number"
            />
          </Form.Item>
          <Button type="primary" block onClick={checkReferral}>
            Check Registration
          </Button>
        </>)
      }
      {referralExists === true && (
        <Button
          icon={<GoogleOutlined />}
          block
          onClick={() => oAuth('referral-check')}
          style={{ marginTop: 10 }}
        >
          Register with Google
        </Button>
      )}
      <Divider>Or {referralExists === true ? 'Register' : 'Login'}</Divider>
      <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
        <Input prefix={<MailOutlined />} />
      </Form.Item>
      {!magiclink && (
        <Form.Item name="password" label={
          <span>
            Password {" "}
            <span style={{ paddingLeft: 5 }}>
              <a href={`${APP_PREFIX_PATH}/confirm-signup`}>Forgot Password?</a>
            </span>
          </span>
        } rules={[{ required: true }]}
        >
          <Input.Password prefix={<LockOutlined />} />
        </Form.Item>
      )}
      <Form.Item>
        <Button type="primary" htmlType="submit" block disabled={linkSent}>
          {magiclink ? "Send login link" : referralExists === true ? "Register" : "Login"}
        </Button>
        {linkSent && "Check your Email/Spam folder"}
      </Form.Item>

      <Button icon={<GoogleOutlined />} block onClick={() => oAuth('direct-login')}>
        Sign in with Google
      </Button>
    </Form>
  );
};

const mapDispatchToProps = { showLoading };
export default connect(null, mapDispatchToProps)(LoginForm);