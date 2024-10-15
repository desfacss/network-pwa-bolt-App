import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
// import { LockOutlined, MailOutlined, UserOutlined, LoadingOutlined } from "@ant-design/icons";
import { Button, Form, Input, Select, notification, Row, Col, Spin, InputNumber } from "antd";
import { signUp, showAuthMessage, showLoading, hideAuthMessage, setSession } from "store/slices/authSlice";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "configs/SupabaseConfig";
// import App from "views/pages/Market/Steps";
// import { registrationType } from 'constants/registrationType';
import { APP_PREFIX_PATH, SURVEY_PREFIX_PATH } from "configs/AppConfig";
import DynamicForm from "views/pages/DynamicForm";
import { store } from "store";

export const RegisterForm = (props) => {
  // const [isSubmitted, setIsSubmitted] = useState(false);
  const [enums, setEnums] = useState();
  const [signIn, setSignIn] = useState(false)
  const [schema, setSchema] = useState();

  const getForms = async () => {
    const { data, error } = await supabase.from('forms').select('*').eq('name', "admin_registration_form").single()
    console.log("A", data)
    if (data) {
      console.log(data)
      setSchema(data)
    }
  }

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

  useEffect(() => {
    const getEnums = async () => {
      let { data, error } = await supabase.from('enums').select('*');
      if (data) {
        console.log(data)
        setEnums(data);
      }
    };
    getForms()
    // getUserType();
    getEnums();
  }, []);

  const navigate = useNavigate();
  const surveyLayout = location.pathname.startsWith("/survey")
  const PREFIX_PATH = location.pathname.startsWith("/survey") ? SURVEY_PREFIX_PATH : APP_PREFIX_PATH;

  const onFinish = async (values) => {
    console.log("payload", values)

    // let { data, error } = await supabase.auth.admin.inviteUserByEmail('ganeshmr3003@gmail.com')
    // console.log(data, error)

    const { data, error } = await supabase.auth.signUp({
      email: values?.email,
      password: values?.password,
      options: { data: { email_confirmed_at: new Date().toISOString() } }
    });

    if (error) {
      console.log("Error reg", error)
      setSignIn(true)
      return notification.error({ message: "Registration Error" })
    }
    if (data) {
      console.log("reg data", data)
      const user_id = data?.user?.id;
      const { data: data2, error: insertError2 } = await supabase.from('organizations').insert([
        {
          auth_id: user_id,
          name: values?.orgName || "",
          details: { name: values?.orgName || "" }
        },
      ]).select();
      console.log("orgn", data2, insertError2)
      if (insertError2) {
        console.log("Error org", insertError2);
        return notification.error({ message: "Error" })
      }
      if (data2?.length > 0) {
        const user_id = data?.user?.id;
        delete values?.password;
        console.log("org", {
          user_id: user_id,
          organization_id: data2[0]?.id,
          details: values,
          role_type: values?.role
        })

        const { data: data3, error: insertError3 } = await supabase.from('users').insert([
          {
            id: user_id,
            organization_id: data2[0]?.id,
            details: values,
            role_type: values?.role
          },
        ]);
        if (insertError3) {
          console.log("Error", insertError3);
          return notification.error({ message: "Error" })
        }

      }
    }
    const fetchUserData = async (session) => {
      if (!session || !session.user) return;

      // Fetch user data from the users table
      const { data, error } = await supabase.from('users').select('*').eq('id', session.user.id).single();

      if (error) {
        console.error('Error fetching user data:', error);
        return;
      }

      // Update session.user with the fetched user data
      const updatedSession = {
        ...session,
        user: {
          ...session.user,
          ...data, // Add the fetched user data here
        },
      };
      console.log("Session", updatedSession)
      // Dispatch the updated session to Redux
      store.dispatch(setSession(updatedSession));
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchUserData(session);
      }
    });
  };

  // const signOut = async () => {
  //   supabase.auth.signOut();
  //   navigate('/');
  // };

  return (
    <div style={{ width: '50%', margin: '0 auto' }}> {/* Container with 50% width at the topmost level */}
      {/* <Button onClick={signOut}>
        Sign Out
      </Button> */}
      {/* {formType ? (
        <App formType={formType} />
      ) : ( */}
      <>
        {!enums ?
          <Row>
            <Col offset={10}>
              <Spin size="large" className="center" />
            </Col>
          </Row> :
          <>
            <h2 className="mb-4">User Registration</h2>
            <p>
          Alredy Registered ? {" "}
          <a href={`http://localhost:3000${PREFIX_PATH}/login`}>Login here...</a>
        </p>
            {/* {schema &&  */}
            <DynamicForm schemas={schema} onFinish={onFinish} formData={formData} />
            {signIn && <>
              User email already added!,Please
              <a href="/auth/login"> Login and Continue</a><br /><br />
              For support, contact: <a href="mailto:info@timetrack.app">info@timetrack.app</a>
            </>
            }
          </>
        }
      </>
      {/* )} */}
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

export default connect(mapStateToProps, mapDispatchToProps)(RegisterForm);