import React, { useState, useEffect } from "react";
import { connect, useSelector } from "react-redux";
import { Button, Form, Input, notification, Divider } from "antd";
import { MailOutlined, LockOutlined, GoogleOutlined } from "@ant-design/icons";
import { showLoading } from "store/slices/authSlice";
import { supabase } from "configs/SupabaseConfig";
import { useLocation } from "react-router-dom";
import { sendEmail } from "components/common/SendEmail";

export const RegisterForm = (props) => {
  const [linkSent, setLinkSent] = useState(false);
  const [mobile, setMobile] = useState("");
  const [referralExists, setReferralExists] = useState(null);
  const [roles, setRoles] = useState();
  const [referralDetails, setReferralDetails] = useState(null);
  const [matchedField, setMatchedField] = useState(null);

  const { defaultOrganization } = useSelector((state) => state.auth);

  const location = useLocation();
  const { showLoading } = props;

  const defaultRole = "delegate";

  // Function to send registration confirmation email
  const sendRegistrationEmail = async (userEmail, username) => {
    const emailData = {
      from: `IBCN2025 NO-REPLY <${process.env.REACT_APP_RESEND_FROM_EMAIL}>`,
      to: [userEmail],
      subject: "Welcome to IBCN NetworkX! Your Connection Hub for IBCN 2025 & Beyond! 👋",
      html: `
        <p>Hi ${username},</p>
        <p>Welcome to the IBCN NetworkX! We're thrilled to have you join for the upcoming IBCN 2025 event and to connect with the wider community members. 🎉</p>
        <p>IBCN NetworkX is your central platform to:</p>
        <ul>
          <li><strong>Plan Your Event:</strong> Explore the schedule and learn about our speakers.<br/>
            <a href="[Link to Schedule & Speakers - Dynamic Placeholder Link]">Schedule & Speakers</a></li>
          <li><strong>Network Seamlessly:</strong> Exchange virtual contacts by scanning QR codes on event passes during the July event.</li>
          <li><strong>Connect Virtually:</strong> Join networking channels to share what you're looking for and what you can offer, fostering connections within the community.</li>
        </ul>
        <p><strong>Access Anywhere:</strong> Install IBCN NetworkX as a web app on your iOS, Android, or Chrome browser for easy access on all your devices.</p>
        <ul>
          <li><strong>Login:</strong> <a href="${window.location.origin}/app/login">Login Page</a></li>
          <li><strong>Forgot Password?</strong> <a href="${window.location.origin}/app/confirm-signup">Forgot Password</a></li>
          <li><strong>Install as a Web App (PWA):</strong> Get easy access directly from your home screen. Find instructions here: <a href="[Link to PWA Install Instructions - Dynamic Placeholder Link]">PWA Install Instructions</a></li>
        </ul>
        <p>We're excited for you to experience the power of connection with IBCN NetworkX!</p>
        <p>Best regards,<br/>Ravi Shankar<br/>IBCN 2025 Team</p>
      `,
    };
  
    try {
      await sendEmail([emailData]);
      console.log("Registration confirmation email sent to:", userEmail);
    } catch (error) {
      console.error("Error sending registration email:", error);
      notification.error({ message: "Failed to send registration confirmation email" });
    }
  };

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

          // Update referrals table with email and user_id
          const updateQuery = supabase
            .from('referrals')
            .update({
              email: userEmail,
              user_id: session.user.id // Add the newly created user_id
            });

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

          // Send registration confirmation email
          await sendRegistrationEmail(userEmail, userEmail.split('@')[0]);
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

    // Update referrals table with email and user_id
    const updateQuery = supabase
      .from('referrals')
      .update({
        email: values.email,
        user_id: data.user.id // Add the newly created user_id
      });

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

    // Send registration confirmation email
    await sendRegistrationEmail(values.email, values.email.split('@')[0]);

    notification.success({ message: "Successfully Registered" });
    window.location.reload();
  };

  const checkReferral = async () => {
    if (!mobile) {
      notification.error({ message: "Please enter a mobile number or email" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email validation
    const mobileFormatRegex = /^\+\d{1,3}\s\d{6,15}$/; // +<country code> <number>

    let formattedMobile = mobile;

    // Check if the input starts with an alphabet
    const startsWithAlphabet = /^[a-zA-Z]/.test(mobile.trim());

    if (startsWithAlphabet) {
      // Treat as potential email, validate it
      if (!emailRegex.test(mobile)) {
        notification.error({
          message: "Invalid email format",
          description: "Please enter a valid email (e.g., user@example.com) or phone number (e.g., +91 9887771111)",
        });
        return;
      }
    } else {
      // Treat as phone number if it doesn't start with an alphabet
      let cleanedValue = mobile.replace(/\s+/g, "").replace("+", ""); // Remove spaces and +
      if (!mobile.startsWith("+")) {
        // Autocorrect to +91 if no + is provided
        cleanedValue = "91" + cleanedValue;
      }
      formattedMobile = `+${cleanedValue.slice(0, 2)} ${cleanedValue.slice(2)}`; // Format as +XX XXXXXX

      if (!mobileFormatRegex.test(formattedMobile)) {
        notification.error({
          message: "Invalid phone number format",
          description: "Please use +<country code> <number> (e.g., +91 9887771111)",
        });
        setMobile(formattedMobile); // Set the autocorrected value for user to correct further
        return;
      }
      setMobile(formattedMobile); // Update state with formatted value
    }

    showLoading();

    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .or(`details->>mobile.eq.${formattedMobile},details->>registered_email.eq.${formattedMobile}`)
      .single();

    if (error || !data) {
      setReferralExists(false);
      setReferralDetails(null);
      setMatchedField(null);
      notification.error({
        message: "Registration information not found",
        description: "Please register first or use existing credentials to login",
      });
    } else if (data.email) {
      setReferralExists(false);
      setReferralDetails(null);
      setMatchedField(null);
      notification.error({
        message: "Mobile number or email already registered",
        description: "Please login with your existing credentials",
      });
    } else {
      setReferralExists(true);
      setReferralDetails(data.details);
      if (data.details?.mobile === formattedMobile) {
        setMatchedField("mobile");
      } else {
        setMatchedField("registered_email");
      }
      notification.success({
        message: "Registration available!",
        description: "You can register with Google or email & password",
      });
    }
  };

  const message = "IBCN NetworkX App Registration - IBCN 2025";
  const number = "918073662457";
  const url = `https://wa.me/${number}?text=${encodeURIComponent(message || '')}`;

  return (
    <div>
      <Form layout="vertical" name="register-form" onFinish={onRegister}>
        {referralExists !== true && (
          <>
            <Form.Item label="Registered Email / Mobile">
              <Input
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+91 9887771111 or email"
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
            Having issues? Contact <a href="mailto:ibcnblr@gmail.com">ibcnblr@gmail.com</a> or{" "}
            <a href={url} target="_blank" rel="noopener noreferrer">
              Message us on WhatsApp{" "}
            </a>
            for any help.
          </p>
          {/* <p>
            If you have not registered for IBCN 2025,{" "}
            <a href="https://delegates.ibcn2025.com/register" target="_blank" rel="noopener noreferrer">
              click here to register
            </a>.
            <br />
            Or if you have registered, contact{" "}
            <a href="mailto:info@knba.com">info@knba.com</a>.
          </p> */}
        </div>
      )}
    </div>
  );
};

const mapDispatchToProps = { showLoading };
export default connect(null, mapDispatchToProps)(RegisterForm);