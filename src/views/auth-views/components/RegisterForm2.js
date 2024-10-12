import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { LockOutlined, MailOutlined, UserOutlined, EnvironmentOutlined, HomeOutlined } from "@ant-design/icons";
import { Button, Form, Input, Select, notification } from "antd";
import { signUp, showAuthMessage, showLoading, hideAuthMessage } from "store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { supabase } from "configs/SupabaseConfig";
import App from "views/pages/Market/Steps";
// import { motion } from "framer-motion"

const { Option } = Select;

const registrationTypeOptions = [
  "Entrepreneur / Small Business Owner",
  "Traditional Enterprise / Family Business",
  "Individual / Employee / Aspiring Entrepreneur"
];

const villageOptions = [
  "Village 1",
  "Village 2",
  "Village 3"
  // Add more village options as needed
];

const templeOptions = [
  "Temple 1",
  "Temple 2",
  "Temple 3"
  // Add more temple options as needed
];

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
  currentLocation: [
    {
      required: true,
      message: "Please input your current location (City Name, Country)",
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
      message: "Please input your password",
    },
    {
      min: 6,
      message: "Password must be at least 6 characters",
    },
  ],
  // confirm: [
  //   {
  //     required: true,
  //     message: "Please confirm your password!",
  //   },
  //   ({ getFieldValue }) => ({
  //     validator(_, value) {
  //       if (!value || getFieldValue("password") === value) {
  //         return Promise.resolve();
  //       }
  //       return Promise.reject("Passwords do not match!");
  //     },
  //   }),
  // ],
};

export const RegisterForm = (props) => {
  const {
    // signUp,
    // showLoading,
    // token,
    loading,
    // redirect,
    // showMessage,
    // hideAuthMessage,
    // allowRedirect = true,
  } = props;
  const [form] = Form.useForm();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [enums, setEnums] = useState();
  const [formType, setFormType] = useState();

  const getUserType = async () => {
    // const fg = await supabase.auth.signInWithPassword({ email: 'ratedrnagesh28@gmail.com', password: 'Test@1234' });
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      let { data, error } = await supabase.from('members').select('*').eq('user_id', session?.user?.id)
      console.log("T", data)
      if (data) {
        const type = data[0]?.reg_info?.registrationType
        setFormType(
          type === "Entrepreneur / Small Business Owner" ? 'start_reg' :
            type === "Traditional Enterprise / Family Business" ? 'bus_reg' :
              type === "Individual / Employee / Aspiring Entrepreneur" ? 'ind_reg' : ''
        )
      }
    })
    // let { data, error } = await supabase.auth.getSession()
    // console.log("V", data)
  }

  useEffect(() => {
    const getEnums = async () => {
      let { data, error } = await supabase
        .from('enum')
        .select('*')
      if (data) {
        setEnums(data)
      }
    }
    getUserType()
    getEnums()
  }, [])

  const navigate = useNavigate();

  const onSignUp = async () => {
    form
      .validateFields()
      .then(async (values) => {
        console.log("V", values)
        const { data, error } = await supabase.auth.signUp({
          email: values?.email,
          password: values?.password,
          options: { data: { email_confirmed_at: new Date().toISOString() } }
        })
        if (error) {
          return console.log("Error", error)
        }
        if (data) {
          const user_id = data?.user?.id
          values = { ...values, mobile: values?.password }
          delete values?.password;
          // delete values?.email;
          delete values?.confirm;
          const { data: data2, error } = await supabase
            .from('members')
            .insert([
              {
                user_id,
                reg_info: { ...values, }
              },
            ])
          if (error) {
            return console.log("Error", error)
          }
          getUserType()
          // setIsSubmitted(true);
          notification.success({
            message: "Signup successful",
          });
        }
        // showLoading();
        // signUp(values).then((data) => {
        //   notification.success({
        //     message: "Signup successfully",
        //   });
        //   console.log(data);
        //   if (data?.type === "auth/signUp/fulfilled") {
        //     navigate("/auth/login");
        //   }
        // });
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  // useEffect(() => {
  //   if (token !== null && allowRedirect) {
  //     navigate(redirect);
  //   }
  //   if (showMessage) {
  //     const timer = setTimeout(() => hideAuthMessage(), 3000);
  //     return () => {
  //       clearTimeout(timer);
  //     };
  //   }
  // }, []);

  const signOut = async () => {
    supabase.auth.signOut()
    navigate('/')
  }

  return (
    <>
      {/* <motion.div 
        initial={{ opacity: 0, marginBottom: 0 }} 
        animate={{ 
          opacity: showMessage ? 1 : 0,
          marginBottom: showMessage ? 20 : 0 
        }}> 
        <Alert type="error" showIcon message={message}></Alert>
      </motion.div> */}
      {<Button onClick={signOut}>
        Sign Out
      </Button>}
      {formType ? (
        <App formType={formType} />
      ) : (
        <>
          {enums &&
            <Form
              form={form}
              layout="vertical"
              name="register-form"
              onFinish={onSignUp}
            >
              <Form.Item name="registrationType" label="Select User Type" rules={rules.registrationType} hasFeedback>
                <Select placeholder="Select your Registration type">
                  {registrationTypeOptions?.map((type) => (
                    <Option key={type} value={type}>
                      {type}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="firstName" label="First Name" rules={rules.firstName} hasFeedback>
                <Input prefix={<UserOutlined className="text-primary" />} />
              </Form.Item>
              <Form.Item name="lastName" label="Last Name" rules={rules.lastName} hasFeedback>
                <Input prefix={<UserOutlined className="text-primary" />} />
              </Form.Item>
              <Form.Item name="nativeVillage" label="Native Chettinad Village/Town" rules={rules.nativeVillage} hasFeedback>
                <Select placeholder="Select your native village/town">
                  {enums && enums.length > 0 && enums?.find(item => item?.name === 'village')?.options?.map((village) => (
                    <Option key={village} value={village}>
                      {village}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="associatedTemple" label="Associated Temple" rules={rules.associatedTemple} hasFeedback>
                <Select placeholder="Select your associated temple">
                  {enums && enums.length > 0 && enums?.find(item => item?.name === 'temple')?.options?.map((temple) => (
                    <Option key={temple} value={temple}>
                      {temple}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              {/* <Form.Item name="currentLocation" label="Current Location (City Name, Country)" rules={rules.currentLocation} hasFeedback>
          <Input prefix={<EnvironmentOutlined className="text-primary" />} />
        </Form.Item> */}
              <Form.Item name="email" label="Email" rules={rules.email} hasFeedback>
                <Input prefix={<MailOutlined className="text-primary" />} />
              </Form.Item>
              <Form.Item name="password" label="Mobile"
                rules={rules.password}
                hasFeedback>
                <Input prefix={<LockOutlined className="text-primary" />} />
              </Form.Item>
              {/* <Form.Item name="confirm" label="Confirm Password" rules={rules.confirm} hasFeedback>
          <Input.Password prefix={<LockOutlined className="text-primary" />} />
        </Form.Item> */}
              <Form.Item>
                <Button type="primary" htmlType="submit" block loading={loading}>
                  Continue
                </Button>
              </Form.Item>
            </Form>
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
