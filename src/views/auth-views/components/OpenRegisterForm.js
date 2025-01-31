import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
// import { LockOutlined, MailOutlined, UserOutlined, LoadingOutlined } from "@ant-design/icons";
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
  // const [isSubmitted, setIsSubmitted] = useState(false);
  // const [enums, setEnums] = useState();
  const [organization, setOrganization] = useState();
  const [signIn, setSignIn] = useState(false)
  const [schema, setSchema] = useState();
  // const [roles, setRoles] = useState();

  const getOrganization = async () => {
    const { data, error } = await supabase.from('organizations').select('*').eq('app_settings->>workspace', REACT_APP_WORKSPACE).single()
    if (error) {
      return message.error("Organization does not exist") //TODO : Error Message in web page 
    }
    if (data) {
      setOrganization(data)
    }
  }
  const getForms = async () => {
    const { data, error } = await supabase.from('forms').select('*').eq('organization_id', organization?.id).eq('name', "open_user_registration_form").single()
    if (data) {
      setSchema(data)
    }
  }

  // const getRoles = async () => {
  //   const { data, error } = await supabase.from('roles').select('*')
  //   if (data) {
  //     setRoles(data)
  //   }
  // }

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
    // const getEnums = async () => {
    //   let { data, error } = await supabase.from('enums').select('*');
    //   if (data) {
    //     console.log(data)
    //     setEnums(data);
    //   }
    // };
    getOrganization()
    // getUserType();
    // getRoles()
    // getEnums();
  }, []);

  useEffect(() => {
    if (organization) {
      getForms()
    }
  }, [organization]);

  const surveyLayout = location.pathname.startsWith("/survey")
  const PREFIX_PATH = location.pathname.startsWith("/survey") ? SURVEY_PREFIX_PATH : APP_PREFIX_PATH;

  const onFinish = async (values) => {
    if (values?.password !== values?.retypePassword) {
      return message.error("Password doesn't match")
    }
    const user_name = values?.firstName + " " + values?.lastName
    console.log("payload", values, user_name)

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
      console.log("Error reg", error)
      setSignIn(true)
      return notification.error({ message: error.message || "Registration Error" })
    }
    if (data) {
      console.log("reg data", data)
      // Remove password fields before inserting into details
      const { password, retypePassword, ...detailsWithoutPassword } = values;
      const userDetails = {
        ...detailsWithoutPassword,
        user_name
      };

      // Insert into users table
      const { data: data2, error: error2 } = await supabase.from('users').insert([
        {
          id: data?.user?.id,
          organization_id: organization?.id,
          details: userDetails,
          user_name,
          // role_type: values?.role,
          // manager_id: user_id,
          // hr_id: user_id,
          // role_id: roles?.find(i => i.role_name === values?.role)?.id
          // TODO role_id, location_id
        },
      ]);

      if (error2) {
        console.log("Error2", error2);
        return notification.error({ message: error2.message || "Error" })
      }

      // Insert into ib_members table
      const { data: data3, error: error3 } = await supabase.from('ib_members').insert([
        {
          user_id: data?.user?.id,
          reg_info: userDetails, // Assuming reg_info is for registration data
          details: userDetails, // Assuming details here is for additional user info
          short_name: user_name // You might want to adjust this based on your table structure
        }
      ]);

      if (error3) {
        console.log("Error3", error3);
        return notification.error({ message: error3.message || "Error inserting into ib_members" })
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
    <div>
      {/* <div style={{ width: '50%', margin: '0 auto' }}> Container with 50% width at the topmost level */}
      {/* <Button onClick={signOut}>
        Sign Out
      </Button> */}
      {/* {formType ? (
        <App formType={formType} />
      ) : ( */}
      <>
        {/* {!enums ?
          <Row>
            <Col offset={10}>
              <Spin size="large" className="center" />
            </Col>
          </Row> : */}
        <>
          <h2 className="mb-4">User Registration</h2>
          <p>
            Alredy Registered ? {" "}
            <Link to={`${APP_PREFIX_PATH}/login`}>Login here  </Link>
            or
            <Link to={`${APP_PREFIX_PATH}/landing`}>  Home</Link>
          </p>
          {/* {schema &&  */}
          <DynamicForm schemas={schema} onFinish={onFinish} formData={formData} />
          {signIn && <>
            User email already added!,Please
            <a href="/auth/login"> Login and Continue</a><br /><br />
            {/* For support, contact: <a href="mailto:info@timetrack.app">info@timetrack.app</a> */}
          </>
          }
        </>
        {/* } */}
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

export default connect(mapStateToProps, mapDispatchToProps)(OpenRegisterForm);