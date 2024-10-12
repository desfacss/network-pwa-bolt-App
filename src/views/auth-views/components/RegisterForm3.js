import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { LockOutlined, MailOutlined, UserOutlined, LoadingOutlined } from "@ant-design/icons";
import { Button, Form, Input, Select, notification, Row, Col, Spin, InputNumber } from "antd";
import { signUp, showAuthMessage, showLoading, hideAuthMessage } from "store/slices/authSlice";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "configs/SupabaseConfig";
import App from "views/pages/Market/Steps";
import { registrationType } from 'constants/registrationType';
import { APP_PREFIX_PATH, SURVEY_PREFIX_PATH } from "configs/AppConfig";

const { Option } = Select;

const rules = {
  registrationType: [
    {
      required: true,
      message: "Please select your registration type",
    },
  ],
  firstName: [
    {
      required: true,
      message: "Please input your first name",
    },
  ],
  lastName: [
    {
      required: true,
      message: "Please input your last name",
    },
  ],
  nativeVillage: [
    {
      required: true,
      message: "Please select your native Chettinad village/town",
    },
  ],
  associatedTemple: [
    {
      required: true,
      message: "Please select the temple you are associated with",
    },
  ],
  email: [
    {
      required: true,
      message: "Please input your email address",
    },
    {
      type: "email",
      message: "Please enter a valid email!",
    },
  ],
  password: [
    {
      required: true,
      message: "Please input your Number",
    },
    {
      min: 10,
      message: "Mobile must be at least 10 characters",
    },
  ],
};

export const RegisterForm = (props) => {
  const { loading } = props;
  const [form] = Form.useForm();
  // const [isSubmitted, setIsSubmitted] = useState(false);
  const [enums, setEnums] = useState();
  const [formType, setFormType] = useState();
  const [signIn, setSignIn] = useState(false)
  const [existingEmail, setExistingEmail] = useState('')
  const [userId, setUserId] = useState()
  const location = useLocation();

  const getUserType = async () => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      let { data, error } = await supabase.from('members').select('*').eq('user_id', session?.user?.id)
      console.log("Session", session?.user?.id, session?.user?.email, data)
      if (data?.length === 0) {
        setExistingEmail(session?.user?.email)
        setUserId(session?.user?.id)
      }
      if (data) {
        const type = data[0]?.reg_info?.registrationType;
        setFormType(registrationType[type]);
      }
      if (error) {
        console.log(error)
      }
    });
  };

  useEffect(() => {
    const getEnums = async () => {
      let { data, error } = await supabase.from('enum').select('*');
      if (data) {
        setEnums(data);
      }
    };
    getUserType();
    getEnums();
  }, []);

  const navigate = useNavigate();
  const surveyLayout = location.pathname.startsWith("/survey")
  const PREFIX_PATH = location.pathname.startsWith("/survey") ? SURVEY_PREFIX_PATH : APP_PREFIX_PATH;

  const onSignUp = async () => {
    form.validateFields().then(async (values) => {
      if (!!existingEmail) {
        console.log("ExistingUser:", existingEmail)
        const user_id = userId;
        values = { ...values, mobile: values?.password };
        delete values?.password;
        delete values?.confirm;
        const { data: data2, error: insertError } = await supabase.from('members').insert([
          {
            user_id,
            reg_info: { ...values, }
          },
        ]);
        if (insertError) {
          console.log("Error: ", insertError);
          return notification.error({ message: "Error" })
        }
        console.log("data:", data2)
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: values?.email,
          password: values?.password,
          options: { data: { email_confirmed_at: new Date().toISOString() } }
        });
        if (error) {
          setSignIn(true)
          return notification.error({ message: "User email already added!,Please Login to Continue" })
        }
        if (data) {
          const user_id = data?.user?.id;
          values = { ...values, mobile: values?.password };
          delete values?.password;
          delete values?.confirm;
          console.log("id", user_id, data)
          const { data: data2, error: insertError } = await supabase.from('members').insert([
            {
              user_id,
              reg_info: { ...values, }
            },
          ]);
          if (insertError) {
            console.log("Error", insertError);
            return notification.error({ message: "Error" })
          }
          console.log("data2:", data2)
          // if (!surveyLayout) {
          navigate(`${PREFIX_PATH}/login`)
          // }
        }
      }
      getUserType();
      notification.success({
        message: "SignUp Successful",
      });
    }).catch((info) => {
      console.log("Validate Failed:", info);
    });
  };

  useEffect(() => {
    console.log(",", existingEmail)
    if (existingEmail !== '') {
      form.setFieldsValue({
        email: existingEmail,
      });
    }
  }, [existingEmail]);

  // const signOut = async () => {
  //   supabase.auth.signOut();
  //   navigate('/');
  // };

  return (
    <>
      {/* <Button onClick={signOut}>
        Sign Out
      </Button> */}
      {formType ? (
        <App formType={formType} />
      ) : (
        <>
          {!enums ?
            <Row>
              <Col offset={10}>
                <Spin size="large" className="center" />
              </Col>
            </Row> :
            <>
              <h2 className="mb-4">IBCN 2025 Nagarathar Business Insights Survey</h2>
              <Form form={form} layout="vertical" name="register-form" onFinish={onSignUp}>
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item name="firstName" label="First Name" rules={rules.firstName} hasFeedback>
                      <Input prefix={<UserOutlined className="text-primary" />} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="lastName" label="Last Name" rules={rules.lastName} hasFeedback>
                      <Input prefix={<UserOutlined className="text-primary" />} />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item name="email" label="Email" rules={rules.email} hasFeedback >
                      <Input prefix={<MailOutlined className="text-primary" />} disabled={!!existingEmail} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="password" label="Mobile" rules={rules.password} hasFeedback
                    // tooltip="Use this as a temporary password, if you want to save draft and continue later. You can change the password later"
                    >
                      <Input controls={false} style={{ width: '100%' }}
                        prefix={<LockOutlined className="text-primary" />}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item name="associatedTemple" label="Associated Kovil" rules={rules.associatedTemple} hasFeedback>
                      <Select placeholder="Select your associated Kovil" showSearch>
                        {enums?.find(item => item.name === 'temple')?.options.map((temple) => (
                          <Option key={temple} value={temple}>
                            {temple}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="nativeVillage" label="Native Chettinad Village/Town" rules={rules.nativeVillage} hasFeedback>
                      <Select placeholder="Select your native village/town" showSearch>
                        {enums?.find(item => item.name === 'village')?.options.map((village) => (
                          <Option key={village} value={village}>
                            {village}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item name="registrationType" label="Select Registration Type" rules={rules.registrationType} hasFeedback>
                      <Select placeholder="Select your Registration type">
                        {enums?.find(item => item.name === 'registration_type')?.options.map((type) => (
                          <Option key={type} value={type}>
                            {type}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    {surveyLayout ? "Save & Continue" : "Register"}
                  </Button>
                </Form.Item>
              </Form>
              {signIn && <>
                User email already added!,Please
                <a href="/auth/login"> Login and Continue</a><br /><br />
                if you are facing any issue, <a href="mailto:ibcnblr@gmail.com">ibcnblr@gmail.com</a>
              </>
              }
            </>
          }
        </>
      )}
    </>
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
