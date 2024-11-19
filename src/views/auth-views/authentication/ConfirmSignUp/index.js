import React, { useEffect, useState } from 'react';
import { Input, Button, Form, message, Typography } from 'antd';
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
    const [type, setType] = useState('magiclink');

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
            message.success('OTP sent successfully. Check your email!');
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
            message.error(error.message || 'Failed to verify OTP.');
        } finally {
            setLoading(false);
        }
    };

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
                    // disabled={isOtpSent}
                    />
                </Form.Item>
                {isOtpSent && (
                    <Form.Item label="OTP" required>
                        <Input
                            type="text"
                            placeholder="Enter the OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                        />
                    </Form.Item>
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
};

export default Index;
