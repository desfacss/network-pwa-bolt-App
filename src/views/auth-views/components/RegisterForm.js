import React, { useState, useEffect } from "react";
import { connect, useSelector } from "react-redux";
import { Button, Form, Input, notification, Divider, message } from "antd";
import { MailOutlined, LockOutlined, GoogleOutlined } from "@ant-design/icons";
import { showLoading } from "store/slices/authSlice";
import { supabase } from "configs/SupabaseConfig";
import { useNavigate, useLocation } from "react-router-dom";
import { APP_PREFIX_PATH } from 'configs/AppConfig';

export const RegisterForm = (props) => {
  const [linkSent, setLinkSent] = useState(false);
  const [mobile, setMobile] = useState("");
  const [referralExists, setReferralExists] = useState(null);
  const [roles, setRoles] = useState();
  const [referralDetails, setReferralDetails] = useState(null);
  const [matchedField, setMatchedField] = useState(null);

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
  };

  useEffect(() => {
    if (defaultOrganization) {
      getRoles();
    }
  }, [defaultOrganization]);

  useEffect(() => {
    const hash = location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.replace('#', ''));
      const idToken = params.get('id_token');
      const accessToken = params.get('access_token');
      const state = params.get('state');

      if (idToken && accessToken) {
        let stateType, mobileFromState, referralDetailsFromState, matchedFieldFromState;
        try {
          const decodedState = JSON.parse(atob(state));
          stateType = decodedState.type;
          mobileFromState = decodedState.mobile;
          referralDetailsFromState = decodedState.referralDetails;
          matchedFieldFromState = decodedState.matchedField;
        } catch (e) {
          stateType = state;
        }
        handleOAuthCallback(idToken, accessToken, stateType, mobileFromState, referralDetailsFromState, matchedFieldFromState);
      } else {
        notification.error({ message: "Missing tokens from Google response" });
      }
    }
  }, [location]);

  const handleOAuthCallback = async (idToken, accessToken, state, mobileFromState, referralDetailsFromState, matchedFieldFromState) => {
    showLoading();
    try {
      const googleUserResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const googleUser = await googleUserResponse.json();
      const userEmail = googleUser.email;

      if (state === 'referral-check') {
        const userMobile = mobileFromState;

        const { data: { session }, error: signInError } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: idToken,
        });

        if (signInError) {
          notification.error({ message: signInError.message });
          return;
        }

        const { data: existingUsers, error: userError } = await supabase
          .from('users')
          .select('details, auth_id')
          .eq('details->>email', userEmail);

        if (userError) {
          notification.error({ message: "Error checking existing user: " + userError.message });
          return;
        }

        const existingUser = existingUsers?.[0];

        if (!existingUser && referralDetailsFromState) {
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: session.user.id,
              auth_id: session.user.id,
              details: {
                ...referralDetailsFromState,
                email: userEmail,
              },
              user_name: userEmail?.split('@')[0] || userEmail,
              organization_id: defaultOrganization?.id,
              role_type: defaultRole,
              role_id: roles?.find(i => i.role_name === defaultRole)?.id || "3dcb9d19-6197-4816-81c8-70435464a201"
            });

          if (insertError) {
            notification.error({ message: "Error creating user record: " + insertError.message });
            return;
          }

          const updateQuery = supabase
            .from('referrals')
            .update({ email: userEmail });

          // Use matchedFieldFromState instead of component state matchedField
          if (matchedFieldFromState === 'mobile') {
            updateQuery.match({ 'details->>mobile': userMobile });
          } else if (matchedFieldFromState === 'registered_email') {
            updateQuery.match({ 'details->>registered_email': userMobile });
          }

          const { error: updateError } = await updateQuery;
          if (updateError) {
            notification.error({ message: "Error updating referral: " + updateError.message });
            return;
          }
        }

        notification.success({ message: "Successfully Registered" });
        window.location.reload();
      }
    } catch (error) {
      notification.error({ message: "Failed to process Google registration: " + error.message });
    }
  };

  const oAuth = (stateType) => {
    showLoading();
    const clientId = '684934400219-qeftq7ldff5kchnkaqfi7kukefkl22st.apps.googleusercontent.com';
    const redirectUri = `${window.location.origin}/app/register`;
    const scope = 'profile email openid';

    const url = new URL('https://accounts.google.com/o/oauth2/auth');
    url.searchParams.append('client_id', clientId);
    url.searchParams.append('redirect_uri', redirectUri);
    url.searchParams.append('response_type', 'id_token token');
    url.searchParams.append('scope', scope);

    const stateObj = {
      type: stateType,
      mobile: mobile,
      referralDetails: referralDetails,
      matchedField: matchedField
    };

    const encodedState = btoa(JSON.stringify(stateObj));
    url.searchParams.append('state', encodedState);

    window.location.href = url.toString();
  };

  const onRegister = async (values) => {
    showLoading();
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
        details: {
          ...referralDetails,
          email: values.email,
        },
        user_name: values.email?.split('@')[0] || values.email,
        organization_id: defaultOrganization?.id,
        role_type: defaultRole,
        role_id: roles?.find(i => i.role_name === defaultRole)?.id || "3dcb9d19-6197-4816-81c8-70435464a201"
      });

    if (insertError) {
      notification.error({ message: "Error creating user record: " + insertError.message });
      return;
    }

    const updateQuery = supabase
      .from('referrals')
      .update({ email: values.email });

    if (matchedField === 'mobile') {
      updateQuery.match({ 'details->>mobile': mobile });
    } else {
      updateQuery.match({ 'details->>registered_email': mobile });
    }

    const { error: updateError } = await updateQuery;
    if (updateError) {
      notification.error({ message: "Error updating referral: " + updateError.message });
      return;
    }

    notification.success({ message: "Successfully Registered" });
    window.location.reload();
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
      .or(`details->>mobile.eq.${mobile},details->>registered_email.eq.${mobile}`)
      .single();

    if (error || !data) {
      setReferralExists(false);
      setReferralDetails(null);
      setMatchedField(null);
      notification.error({
        message: "Registration information not found",
        description: "Please register first or use existing credentials to login"
      });
    } else if (data.email) {
      setReferralExists(false);
      setReferralDetails(null);
      setMatchedField(null);
      notification.error({
        message: "Mobile number already registered",
        description: "Please login with your existing credentials"
      });
    } else {
      setReferralExists(true);
      setReferralDetails(data.details);
      if (data.details?.mobile === mobile) {
        setMatchedField('mobile');
      } else {
        setMatchedField('registered_email');
      }
      notification.success({
        message: "Registration available!",
        description: "You can register with Google or email & password"
      });
    }
  };

  return (
    <div>
      <Form layout="vertical" name="register-form" onFinish={onRegister}>
        {referralExists !== true && (
          <>
            <Form.Item label="Registered Email / Mobile">
              <Input
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Enter Email / Mobile"
              />
            </Form.Item>
            <Button type="primary" block onClick={checkReferral}>
              Check Registration
            </Button>
          </>
        )}
        {referralExists === true && (
          <>
            <Button
              icon={<GoogleOutlined />}
              block
              onClick={() => oAuth('referral-check')}
              style={{ backgroundColor: '#DB4437', color: 'white', borderColor: '#DB4437' }}
            >
              Register with Google
            </Button>
            <Divider>Or</Divider>
            <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
              <Input prefix={<MailOutlined />} />
            </Form.Item>
            <Form.Item name="password" label="Password" rules={[{ required: true }]}>
              <Input.Password prefix={<LockOutlined />} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block disabled={linkSent}>
                Register
              </Button>
            </Form.Item>
          </>
        )}
      </Form>
      {referralExists === false && (
        <div style={{ marginTop: 20 }}>
          <p>
            If you have not registered for IBCN 2025,{" "}
            <a href="https://delegates.ibcn2025.com/register" target="_blank" rel="noopener noreferrer">
              click here to register
            </a>.
            <br />
            Or if you have registered, contact{" "}
            <a href="mailto:info@knba.com">info@knba.com</a>.
          </p>
        </div>
      )}
    </div>
  );
};

const mapDispatchToProps = { showLoading };
export default connect(null, mapDispatchToProps)(RegisterForm);