import { Button, Col, Form, Input, notification, Row } from 'antd';
import React from 'react'
import { useDispatch } from 'react-redux';
import { changePassword } from 'store/slices/profileSlice';

const PasswordChange = () => {
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const submitHandler = (values) => {
        dispatch(changePassword(values))
            .then(() => {
                notification.success({
                    message: "Changed Password successfully",
                });
                form.resetFields()
            })
            .catch((errorData) => {
                notification.error({
                    message:
                        errorData?.error?.message || "Failed to Change Password",
                });
            });
    }
    return (
        <>
            <h2 className="mb-4">Change Password</h2>
            <Row >
                <Col xs={24} sm={24} md={24} lg={8}>
                    <Form
                        form={form}
                        onFinish={submitHandler}
                        name="changePasswordForm"
                        layout="vertical"
                    >
                        {/* <Form.Item
                            label="Current Password"
                            name="currentPassword"
                            rules={[{
                                required: true,
                                message: 'Please enter your currrent password!'
                            }]}
                        >
                            <Input.Password />
                        </Form.Item> */}
                        <Form.Item
                            label="New Password"
                            name="new_password"
                            rules={[{
                                required: true,
                                message: 'Please enter your new password!'
                            },
                            () => ({
                                validator(_, value) {
                                    if (value && value.length < 6) {
                                        return Promise.reject('Password should be at least 6 characters');
                                    }
                                    return Promise.resolve();
                                },
                            }),
                            ]}
                        >
                            <Input.Password />
                        </Form.Item>
                        <Form.Item
                            label="Confirm Password"
                            name="confirm_password"
                            rules={
                                [
                                    {
                                        required: true,
                                        message: 'Please confirm your password!'
                                    },
                                    ({ getFieldValue }) => ({
                                        validator(rule, value) {
                                            if (!value || getFieldValue('new_password') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject('Password not matched!');
                                        },
                                    }),
                                ]
                            }
                        >
                            <Input.Password />
                        </Form.Item>
                        <Button type="primary" htmlType="submit">
                            Change password
                        </Button>
                    </Form>
                </Col>
            </Row>
        </>
    )
}

export default PasswordChange