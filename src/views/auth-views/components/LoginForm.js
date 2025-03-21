import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Button, Form, Input, notification, Divider } from "antd";
import { MailOutlined, LockOutlined, GoogleOutlined } from "@ant-design/icons";
import {
  signIn,
  showLoading,
  showAuthMessage,
  hideAuthMessage,
} from "store/slices/authSlice";
import { supabase } from "configs/SupabaseConfig";
import { useNavigate, useLocation } from "react-router-dom";
import { APP_PREFIX_PATH } from 'configs/AppConfig';

export const LoginForm = (props) => {
  const [linkSent, setLinkSent] = useState(false);
  const [magiclink, setMagicLink] = useState(false);
  const [mobile, setMobile] = useState("");
  const [referralExists, setReferralExists] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { showLoading } = props;

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

        console.log("Parsed stateType:", stateType);
        console.log("Parsed mobileFromState:", mobileFromState);

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
      if (!googleUserResponse.ok) {
        throw new Error('Failed to fetch Google user info');
      }
      const googleUser = await googleUserResponse.json();
      const userEmail = googleUser.email;

      if (state === 'direct-login') {
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('details, auth_id')
          .eq('details->>email', userEmail)
          .single();

        if (userError && userError.code !== 'PGRST116') {
          console.error("User fetch error:", userError);
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
          console.error("Sign-in error:", signInError);
          notification.error({ message: signInError.message });
          return;
        }

        if (!session) {
          console.error("No session created");
          notification.error({ message: "Failed to establish session" });
          return;
        }

        if (!user.auth_id) {
          const { error: updateError } = await supabase
            .from('users')
            .update({ auth_id: session.user.id })
            .eq('details->>email', userEmail);

          if (updateError) {
            console.error("Update error:", updateError);
          }
        }

        notification.success({ message: "Successfully Logged In" });
        navigate(`${APP_PREFIX_PATH}/dashboard`);
      } else if (state === 'referral-check') {
        const userMobile = mobileFromState;
        console.log("userMobile in referral-check:", userMobile);

        if (!userMobile) {
          notification.error({ message: "Mobile number is missing" });
          return;
        }

        const { data: referralUser, error: referralError } = await supabase
          .from('referrals')
          .select('*')
          .eq('mobile', userMobile)
          .single();

        if (referralError && referralError.code !== 'PGRST116') {
          console.error("Referral fetch error:", referralError);
          notification.error({ message: "Error checking referral" });
          return;
        }

        const { data: { session }, error: signInError } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: idToken,
        });

        if (signInError) {
          console.error("Sign-in error:", signInError);
          notification.error({ message: signInError.message });
          return;
        }

        if (!session) {
          console.error("No session created");
          notification.error({ message: "Failed to establish session" });
          return;
        }

        // Check and update public.users
        const { data: existingUser, error: userError } = await supabase
          .from('users')
          .select('details, auth_id')
          .eq('details->>email', userEmail)
          .single();

        if (userError && userError.code !== 'PGRST116') {
          console.error("User fetch error:", userError);
          notification.error({ message: "Error checking user record" });
          return;
        }

        if (!existingUser) {
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: session.user.id,
              auth_id: session.user.id,
              details: { email: userEmail, mobile: userMobile }, // Store mobile in details
              user_name: userEmail?.split('@')[0] || userEmail,
              // organization_id: "20e899a5-6261-40d9-8c9a-00666248d91a",
              // role_id: "4f074c42-cf61-4403-9460-da2382a2b003"
            });

          if (insertError) {
            console.error("Insert error:", insertError);
            notification.error({ message: "Error creating user record: " + insertError.message });
            return;
          }
        } else if (!existingUser.id || !existingUser.details.mobile) {
          const updatedDetails = { ...existingUser.details, email: userEmail, mobile: userMobile };
          const { error: updateError } = await supabase
            .from('users')
            .update({ id: session.user.id, details: updatedDetails })
            .eq('details->>email', userEmail);

          if (updateError) {
            console.error("Update error:", updateError);
            notification.error({ message: "Error updating user record" });
          }
        }

        // Update referrals table with email
        const { error: referralUpdateError } = await supabase
          .from('referrals')
          .update({ email: userEmail })
          .eq('mobile', userMobile);

        if (referralUpdateError) {
          console.error("Referral update error:", referralUpdateError);
          notification.error({ message: "Error updating referral record" });
        }

        notification.success({ message: "Successfully Logged In" });
        navigate(`${APP_PREFIX_PATH}/dashboard`);
      }
    } catch (error) {
      console.error("OAuth Callback Error:", error.message);
      notification.error({ message: "Failed to process Google login" });
    }
  };

  const oAuth = (stateType) => {
    showLoading();
    const clientId = '684934400219-qeftq7ldff5kchnkaqfi7kukefkl22st.apps.googleusercontent.com';
    const redirectUri = `${window.location.origin}/app/login`;
    const scope = 'profile email openid';

    console.log("Redirect URI sent:", redirectUri);

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

  const sendLink = async (values) => {
    if (!magiclink) {
      onLogin(values);
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

    if (error || !data || data?.email) {
      setReferralExists(false);
      notification.error({ message: "Registration information for this Mobile number is not available, Please register fresh or login if you have already registered... " });
      // No referral found for this mobile number
      navigate(`${APP_PREFIX_PATH}/register`);
    } else {
      setReferralExists(true);
      notification.success({ message: "Registration information for this Mobile number is available! You can sign in with Google or email & password" });
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
            Check Registeration
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
          Sign in with Google (Referral)
        </Button>
      )}
      <Divider>Or Login</Divider>
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
      )
      }
      <Form.Item>
        <Button type="primary" htmlType="submit" block disabled={linkSent}>
          {magiclink ? "Send login link" : "Login"}
        </Button>
        {linkSent && "Check your Email/Spam folder"}
      </Form.Item>

      {/* <Divider>Or</Divider> */}

      <Button icon={<GoogleOutlined />} block onClick={() => oAuth('direct-login')}>
        Sign in with Google
      </Button>

      {/* <Divider>Or with Referral</Divider> */}
      {/* <Form.Item label="Mobile Number">
        <Input
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          placeholder="Enter mobile number"
        />
      </Form.Item>
      <Button type="primary" block onClick={checkReferral}>
        Check Registration
      </Button> */}
      {/* {referralExists === true && (
        <Button
          icon={<GoogleOutlined />}
          block
          onClick={() => oAuth('referral-check')}
          style={{ marginTop: 10 }}
        >
          Sign in with Google (Referral)
        </Button>
      )} */}
    </Form >
  );
};

const mapDispatchToProps = { showLoading };
export default connect(null, mapDispatchToProps)(LoginForm);