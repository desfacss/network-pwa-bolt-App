import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Button, Form, Input, Select, notification, Row, Col, Spin, InputNumber, message } from "antd";
import { signUp, showAuthMessage, showLoading, hideAuthMessage, setSession } from "store/slices/authSlice";
import { useLocation, Link } from "react-router-dom";
import { supabase } from "configs/SupabaseConfig";
// import App from "views/pages/Market/Steps";
// import { registrationType } from 'constants/registrationType';
import { APP_PREFIX_PATH, REACT_APP_WORKSPACE, SURVEY_PREFIX_PATH } from "configs/AppConfig";
import DynamicForm from "views/pages/DynamicForm";
import { store } from "store";

export const OpenRegisterForm = (props) => {
  const [organization, setOrganization] = useState();
  const [signIn, setSignIn] = useState(false);
  const [schema, setSchema] = useState();
  const [roles, setRoles] = useState();
  const [step, setStep] = useState(1);
  const [mobile, setMobile] = useState("");
  const [leadData, setLeadData] = useState(null);

  const getOrganization = async () => {
    const { data, error } = await supabase.from('organizations').select('*').eq('app_settings->>workspace', REACT_APP_WORKSPACE).single();
    if (error) {
      return message.error("Organization does not exist");
    }
    if (data) {
      setOrganization(data);
    }
  };

  const getForms = async () => {
    const { data, error } = await supabase.from('forms').select('*').eq('organization_id', organization?.id).eq('name', "open_user_registration_form").single();
    if (data) {
      setSchema(data);
    }
  };

  const getRoles = async () => {
    const { data, error } = await supabase.from('roles').select('*');
    if (data) {
      setRoles(data);
    }
  };
  const formData = {
    // "role": "Admin",
    // "lastName": "raikar",
    // "firstName": "ganesh",
    // "mobile": 7897897897,
    // "orgName": "new",
    // "email": "ganeshmr3003@gmail.com",
    // "password": "121212"
  }

  const location = useLocation();
  const surveyLayout = location.pathname.startsWith("/survey");
  const PREFIX_PATH = location.pathname.startsWith("/survey") ? SURVEY_PREFIX_PATH : APP_PREFIX_PATH;

  useEffect(() => {
    getOrganization();
    getRoles();
  }, []);

  useEffect(() => {
    if (organization) {
      getForms();
    }
  }, [organization]);

  const checkMobileInReferrals = async () => {
    const { data, error } = await supabase.from('referrals').select('*').eq('mobile', mobile);
    if (error) {
      return message.error("Error checking mobile number");
    }

    if (data && data.length > 0) {
      console.log("mobile", typeof mobile, data);
      setLeadData(data[0]);
      setStep(2);
    } else {
      setStep(3);
    }
  };

  const onFinish = async (values) => {
    if (values?.password !== values?.retypePassword) {
      return message.error("Password doesn't match");
    }

    let user_name = values?.firstName + " " + values?.lastName;
    let role = values?.role;

    if (leadData) {
      user_name = leadData.user_name;
      role = "member";
    }

    const { data, error } = await supabase.auth.signUp({
      email: values?.email,
      password: values?.password,
      options: {
        data: {
          display_name: user_name,
          email_confirmed_at: new Date().toISOString()
        }
      }
    });

    if (error) {
      console.log("Error reg", error);
      setSignIn(true);
      return notification.error({ message: error.message || "Registration Error" });
    }
    if (data) {
      const { password, retypePassword, ...detailsWithoutPassword } = values;
      const userDetails = {
        ...detailsWithoutPassword,
        user_name
      };

      const { data: data2, error: error2 } = await supabase.from('users').insert([
        {
          id: data?.user?.id,
          organization_id: organization?.id,
          details: userDetails,
          user_name,
          role_type: role,
          role_id: roles?.find(i => i.role_name === role)?.id
        },
      ]);

      if (error2) {
        console.log("Error2", error2);
        return notification.error({ message: error2.message || "Error" });
      }

      const { data: data3, error: error3 } = await supabase.from('ib_members').insert([
        {
          user_id: data?.user?.id,
          details: userDetails,
          short_name: user_name
        }
      ]);

      if (error3) {
        console.log("Error3", error3);
        return notification.error({ message: error3.message || "Error inserting into ib_members" });
      }
    }

    const fetchUserData = async (session) => {
      if (!session || !session.user) return;

      const { data, error } = await supabase.from('users').select('*').eq('id', session.user.id).single();

      if (error) {
        console.error('Error fetching user data:', error);
        return;
      }

      const updatedSession = {
        ...session,
        user: {
          ...session.user,
          ...data,
        },
      };
      console.log("Session", updatedSession);
      store.dispatch(setSession(updatedSession));
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchUserData(session);
      }
    });
  };

  return (
    <div>
      <p>
        Alredy Registered ? {" "}
        <Link to={`${APP_PREFIX_PATH}/login`}>Login here </Link>
        or
        <Link to={`${APP_PREFIX_PATH}/landing`}> Home</Link>
      </p>
      {step === 1 && (
        <Form layout="vertical" onFinish={checkMobileInReferrals}>
          <Form.Item label="Mobile">
            <Input
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              rules={[{ required: true, message: "Please enter your mobile number" }]}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Continue
            </Button>
          </Form.Item>
        </Form>
      )}
      {step === 2 && (
        <>
          <Form layout="vertical" onFinish={onFinish} initialValues={leadData}>
            <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Please input your email!' }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please input your password!' }]}>
              <Input.Password />
            </Form.Item>
            <Form.Item label="Retype Password" name="retypePassword" rules={[{ required: true, message: 'Please retype your password!' }]}>
              <Input.Password />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Register
              </Button>
            </Form.Item>
          </Form>
          {signIn && (
            <>
              User email already added!,Please
              <a href="/auth/login"> Login and Continue</a>
              <br />
              <br />
            </>
          )}

        </>
      )}
      {step === 3 && (
        <>
          <DynamicForm schemas={schema} onFinish={onFinish} formData={{}} />
          {signIn && (
            <>
              User email already added!,Please
              <a href="/auth/login"> Login and Continue</a>
              <br />
              <br />
            </>
          )}
        </>
      )}
    </div>
  );
};

const mapStateToProps = ({ auth }) => {
  const { loading, message, showMessage, token, redirect } = auth;
  return { loading, message, showMessage, token, redirect };
};

const mapDispatchToProps = {
  signUp,
  showAuthMessage,
  hideAuthMessage,
  showLoading,
};

export default connect(mapStateToProps, mapDispatchToProps)(OpenRegisterForm);