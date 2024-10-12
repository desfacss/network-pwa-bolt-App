import React, { useEffect, useState } from 'react'
import { Button, Col, Input, Row, Form, notification, InputNumber } from 'antd'
import { ROW_GUTTER } from 'constants/ThemeConstant'
import { useDispatch, useSelector } from 'react-redux';
import { getUserProfile, updateTradeDefaults } from 'store/slices/profileSlice';
// import { SUPABASE_CLIENT_ANON_KEY } from 'configs/AppConfig';
// import axios from 'axios';

const TradeDefaults = () => {
    const dispatch = useDispatch();
    const [edit, setEdit] = useState(false)
    const { userData, loading } = useSelector(
        (state) => state?.profile
    );

    const updateHandler = (values) => {
        if (edit) {
            // const url = `https://anchkeslssbqimcekkpo.supabase.co/rest/v1/customer?user_id=eq.${userData?.id}`;
            // const apiKey = SUPABASE_CLIENT_ANON_KEY;
            // const headers = {
            //     'apikey': apiKey,
            //     'Authorization': `Bearer ${apiKey}`,
            //     'Content-Type': 'application/json',
            //     'Prefer': 'return=minimal'
            // };
            // const data = {
            //     bn_buying: values
            // };

            // axios.patch(url, data, { headers })
            //     .then(response => {
            //         console.log('Response:', response.data);
            //         dispatch(getUserProfile());
            //     })
            //     .catch(error => {
            //         console.error('Error:', error);
            //     });
            dispatch(updateTradeDefaults(values))
                .then(() => {
                    notification.success({
                        message: "Trade Defaults updated successfully",
                    });
                })
                .catch((errorData) => {
                    notification.error({
                        message:
                            errorData?.error?.message || "Failed to update Trade Defaults",
                    });
                });
            // console.log(values)
            setEdit(false)
            dispatch(getUserProfile());
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
                    initialValues={userData?.bn_buying}
                    onFinish={updateHandler}
                >
                    <Row>
                        <Col xs={24} sm={24} md={24} lg={16}>
                            <Row gutter={ROW_GUTTER}>
                                {Object?.entries(userData?.bn_buying)?.map(([key, value]) => (
                                    <Col xs={24} sm={24} md={12}>
                                        <Form.Item key={key} label={key} name={key}>
                                            {/* {typeof value === 'string' && <Input disabled={!edit} />}
                                            {typeof value === 'number' && <Input type="number" disabled={!edit} />} */}
                                            {typeof value === 'number' ?
                                                <InputNumber disabled={!edit} style={{ width: '100%' }} />
                                                :
                                                <Input
                                                    // type={typeof value === 'number' ? "number" : 'text'}
                                                    disabled={!edit} />
                                            }
                                        </Form.Item>
                                    </Col>
                                ))}
                            </Row>
                            {edit &&
                                <Button onClick={() => setEdit(false)}>
                                    Cancel
                                </Button>
                            }
                            <Button type="primary" htmlType="submit" >
                                {edit ? 'Save Changes' : 'Edit'}
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </div>
        </>
    )
}

export default TradeDefaults