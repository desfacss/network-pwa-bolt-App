import React, { useEffect, useState } from 'react';
import { Input, Button, Form, message, Typography, Row, Col } from 'antd';
import { supabase } from 'configs/SupabaseConfig';
// import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_ANON_KEY');

const Index = () => {
    // const [email, setEmail] = useState('optionsalgotrade@gmail.com');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState('recovery');
    // const [resend, setResend] = useState(false);

    // Extract email from URL if available
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const emailFromUrl = params.get('email');
        const typeFromUrl = params.get('type');
        if (emailFromUrl) {
            setEmail(emailFromUrl);
            setType(typeFromUrl); // If email is in URL, set type to 'signup'
            setIsOtpSent(true)
        }
    }, []);

    const handleSendOtp = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOtp({ email });
            if (error) {
                throw error;
            }
            setIsOtpSent(true);
            message.success('If your email is registered, OTP will be sent. Check your email!');
        } catch (error) {
            message.error(error.message || 'Failed to send OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.verifyOtp({
                email,
                token: otp,
                // type: 'signup',
                // type: 'magiclink',
                type
            });
            if (error) {
                throw error;
            }
            message.success('Signup confirmed successfully!');
        } catch (error) {
            setOtp('')
            message.error(error.message || 'Failed to verify OTP.');
        } finally {
            setLoading(false);
        }
    };

    const resendOtp = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email);
            if (error) {
                throw error;
            }
            // setIsOtpSent(true);
            message.success('If your email is registered, OTP will be sent. Check your email!');
        } catch (error) {
            message.error(error.message || 'Failed to send OTP.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto' }}>
            <Typography.Title level={3}>Signup with OTP</Typography.Title>
            <Form layout="vertical">
                <Form.Item label="Email" required>
                    <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </Form.Item>
                {isOtpSent && (
                    <Row gutter={[10, 10]}>
                        <Col xs={24} sm={16}>
                            <Form.Item label="OTP" required>
                                <Input
                                    type="text"
                                    placeholder="Enter the OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item label=" " colon={false}>
                                <Button
                                    onClick={resendOtp}
                                    loading={loading}
                                    block
                                >
                                    Resend OTP
                                </Button>
                            </Form.Item>
                        </Col>
                    </Row>
                )}
                <Form.Item>
                    {!isOtpSent ? (
                        <Button
                            type="primary"
                            onClick={handleSendOtp}
                            loading={loading}
                            disabled={!email}
                            block
                        >
                            Send OTP
                        </Button>
                    ) : (
                        <Button
                            type="primary"
                            onClick={handleVerifyOtp}
                            loading={loading}
                            disabled={!otp}
                            block
                        >
                            Verify OTP
                        </Button>
                    )}
                </Form.Item>
            </Form>
        </div>
    );


    // return (
    //     <div style={{ maxWidth: '400px', margin: '50px auto' }}>
    //         <Typography.Title level={3}>Signup with OTP</Typography.Title>
    //         <Form layout="vertical">
    //             <Form.Item label="Email" required>
    //                 <Input
    //                     type="email"
    //                     placeholder="Enter your email"
    //                     value={email}
    //                     onChange={(e) => setEmail(e.target.value)}
    //                 // disabled={isOtpSent}
    //                 />
    //             </Form.Item>
    //             {isOtpSent && (
    //                 <Row gutter={5}>
    //                     <Col span={18}>
    //                         <Form.Item label="OTP" required>
    //                             <Input
    //                                 type="text"
    //                                 placeholder="Enter the OTP"
    //                                 value={otp}
    //                                 onChange={(e) => setOtp(e.target.value)}
    //                             />
    //                         </Form.Item>
    //                     </Col>
    //                     <Col span={6}>
    //                         <Form.Item label=" ">
    //                             <Button
    //                                 // type="primary"
    //                                 // type='link'

    //                                 onClick={resendOtp}
    //                                 loading={loading}
    //                             // disabled={!otp}
    //                             // block
    //                             >
    //                                 Resend OTP
    //                             </Button>
    //                         </Form.Item>
    //                     </Col>
    //                 </Row>
    //             )}
    //             <Form.Item>
    //                 {!isOtpSent ? (
    //                     <Button
    //                         type="primary"
    //                         onClick={handleSendOtp}
    //                         loading={loading}
    //                         disabled={!email}
    //                         block
    //                     >
    //                         Send OTP
    //                     </Button>
    //                 ) : (
    //                     <>
    //                         <Button
    //                             type="primary"
    //                             onClick={handleVerifyOtp}
    //                             loading={loading}
    //                             disabled={!otp}
    //                             block
    //                         >
    //                             Verify OTP
    //                         </Button>
    //                     </>
    //                 )}
    //             </Form.Item>
    //         </Form>
    //     </div>
    // );




};

export default Index;
