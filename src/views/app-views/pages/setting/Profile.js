import React, { useEffect, useState } from 'react'
import { Button, Col, Input, Row, Form, notification } from 'antd'
import { ROW_GUTTER } from 'constants/ThemeConstant'
import { useDispatch, useSelector } from 'react-redux';
import { getUserProfile, updateProfile } from 'store/slices/profileSlice';
// import { Link } from 'react-router-dom';
// import { APP_PREFIX_PATH } from 'configs/AppConfig';

const Profile = () => {
    const dispatch = useDispatch();
    const [edit, setEdit] = useState(false)
    const { userData, loading } = useSelector(
        (state) => state?.profile
    );

    const updateHandler = (values) => {
        if (edit) {
            console.log("Update User Payload", values);
            values = { ...values, mobile: parseInt(values.mobile, 10) }
            dispatch(updateProfile(values))
                .then(() => {
                    notification.success({
                        message: "Profile updated successfully",
                    });
                })
                .catch((errorData) => {
                    notification.error({
                        message:
                            errorData?.error?.message || "Failed to update Profile",
                    });
                });
            setEdit(false)
        }
        else {
            setEdit(prev => !prev)
        }
    }

    useEffect(() => {
        dispatch(getUserProfile());
    }, []);

    return !loading && (
        <>
            <div className="mt-4">
                <Form
                    name="basicInformation"
                    layout="vertical"
                    initialValues={userData}
                    onFinish={updateHandler}
                >
                    <Row>
                        <Col xs={24} sm={24} md={24} lg={16}>
                            <Row gutter={ROW_GUTTER}>
                                <Col xs={24} sm={24} md={12}>
                                    <Form.Item
                                        label="Name"
                                        name="name"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Please input your name!',
                                            },
                                        ]}
                                    >
                                        <Input disabled={!edit} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={24} md={12}>
                                    <Form.Item
                                        label="Email"
                                        name="email"
                                        rules={[{
                                            required: true,
                                            type: 'email',
                                            message: 'Please enter a valid email!'
                                        }]}
                                    >
                                        <Input disabled={!edit} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={24} md={12}>
                                    <Form.Item
                                        label="Phone"
                                        name="mobile"
                                    >
                                        <Input disabled={!edit} />
                                    </Form.Item>
                                </Col>
                            </Row>
                            {edit &&
                                <Button onClick={() => setEdit(false)}>
                                    Cancel
                                </Button>
                            }
                            <Button type="primary" htmlType="submit" disabled={true}>
                                {edit ? 'Save Changes' : 'Edit'}
                            </Button>
                        </Col>
                    </Row>
                    {/* <Divider>Subscriptions</Divider>
                    <Row>
                        <Col xs={24} sm={24} md={5}>
                            <Statistic title="Credits" value={userData?.credits || '- -'} />
                        </Col>
                        <Col xs={24} sm={24} md={7}>
                            <Statistic title="Start Date" value={userData?.subscription_start_date} />
                        </Col>
                        <Col xs={24} sm={24} md={7}>
                            <Statistic title="End Date" value={userData?.subscription_end_date} />
                        </Col>
                        <Col xs={24} sm={24} md={5}>
                            <Link to={`${APP_PREFIX_PATH}/pages/pricing`}>
                                <Button type="primary">
                                    Buy
                                </Button>
                            </Link>
                        </Col>
                    </Row> */}
                </Form>
            </div>
        </>
    )
}

export default Profile