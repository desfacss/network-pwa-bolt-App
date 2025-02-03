import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
// import { LockOutlined, MailOutlined, UserOutlined, LoadingOutlined } from "@ant-design/icons";
import { notification, Row, Col, Spin, message } from "antd";
import { signUp, showAuthMessage, showLoading, hideAuthMessage, setSession } from "store/slices/authSlice";
import { useLocation, Link } from "react-router-dom";
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
  const [roles, setRoles] = useState();
  const [loading, setLoading] = useState(false);

  const getForms = async () => {
    const { data, error } = await supabase.from('forms').select('*').eq('name', "web_admin_registration_form").single()
    console.log("hy", data)
    if (data) {
      setSchema(data)
    }
  }

  const getRoles = async () => {
    const { data, error } = await supabase.from('roles').select('*')
    if (data) {
      setRoles(data)
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
    getRoles()
    getEnums();
  }, []);

  const surveyLayout = location.pathname.startsWith("/survey")
  const PREFIX_PATH = location.pathname.startsWith("/survey") ? SURVEY_PREFIX_PATH : APP_PREFIX_PATH;

  const onFinish = async (values) => {
    if (values?.password !== values?.retypePassword) {
      return message.error("Password doesn't match")
    }
    setLoading(true);
    console.log("payload", values);

    let user_id = null;
    let org_id = null;
    const orgName = values?.orgName;
    const userName = orgName + " " + values?.role
    try {
      // Step 1: Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email: values?.email,
        password: values?.password,
        options: {
          data: {
            display_name: userName,
            phone: String(values?.mobile),
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
        console.log("reg data", data);
        user_id = data?.user?.id;

        // Step 2: Insert organization
        const { data: data2, error: insertError2 } = await supabase.from('organizations').insert([
          {
            auth_id: user_id,
            name: orgName || "Dev",
            details: { name: orgName || "" },
            app_settings: {
              name: orgName?.toLowerCase().replace(/\s+/g, "_") || "dev",
              workspace: values?.workspace?.toLowerCase() || "dev"
            }
          },
        ]).select();

        if (insertError2) {
          console.log("Error org", insertError2);
          throw new Error(insertError2.message || "Error inserting organization");
        }

        if (data2?.length > 0) {
          org_id = data2[0]?.id;

          // Step 3: Insert user
          delete values?.password;
          const { data: data3, error: insertError3 } = await supabase.from('users').insert([
            {
              id: user_id,
              organization_id: org_id,
              details: { ...values, user_name: orgName },
              user_name: userName,
              role_type: values?.role,
              role_id: roles?.find(i => i.role_name === values?.role)?.id,
              password_confirmed: true
            },
          ]);

          if (insertError3) {
            console.log("Error", insertError3);
            throw new Error(insertError3.message || "Error inserting user");
          }
        }
      }

      // Fetch user data and update session
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
        console.log("Session load", updatedSession);
        store.dispatch(setSession(updatedSession));
      };

      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          fetchUserData(session);
        }
      });

    } catch (error) {
      console.error("Error during registration:", error);

      // Rollback logic
      if (user_id) {
        // Delete the authenticated user
        await supabase.rpc('auth_user_rollback', { user_id });
        console.log("rollback auth");

        // Delete the organization if it was created
        if (org_id) {
          console.log("rollback org");
          await supabase.from('organizations').delete().eq('id', org_id);
        }

        console.log("rollback user");
        // Delete the user if it was created
        const { error } = await supabase.auth.signOut({ scope: 'local' });
        if (error) {
          console.error('Error signing out:', error.message);
          notification.error({ message: 'Error signing out' })
          return
        }
        // store.dispatch(setSelectedOrganization())
        // store.dispatch(setSelectedUser())
        store.dispatch(setSession())
        await supabase.from('users').delete().eq('id', user_id);
      }

      notification.error({ message: error.message || "Registration Error" });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div>
      {/* style={{ width: '50%', margin: '0 auto' }}> Container with 50% width at the topmost level */}
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
              <Link to={`${APP_PREFIX_PATH}/login`}>Login here...</Link>
            </p>
            {/* {schema &&  */}
            {schema && <DynamicForm schemas={schema} onFinish={onFinish} formData={formData} />}
            {signIn && <>
              User email already added!,Please
              <a href="/auth/login"> Login and Continue</a><br /><br />
              {/* For support, contact: <a href="mailto:info@timetrack.app">info@timetrack.app</a> */}
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