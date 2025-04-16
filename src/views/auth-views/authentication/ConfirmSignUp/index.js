import React, { useEffect, useState } from 'react';
import { Input, Button, Form, message, Typography, Row, Col } from 'antd';
import { supabase } from 'configs/SupabaseConfig';

const Index = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('recovery');

  // Extract email from URL if available
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailFromUrl = params.get('email');
    const typeFromUrl = params.get('type');
    if (emailFromUrl) {
      setEmail(emailFromUrl);
      setType(typeFromUrl);
      setIsOtpSent(true);
    }
  }, []);

  const handleSendOtp = async () => {
    setLoading(true);
    try {
      // Call the RPC function to check if email exists
      const { data: emailExists, error: rpcError } = await supabase.rpc('check_email_exists', {
        email_to_check: email,
      });

      if (rpcError) {
        throw new Error(rpcError.message || 'Error checking email.');
      }

      if (!emailExists) {
        throw new Error('This email is not registered.');
      }

      // If email exists, proceed to send OTP
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) {
        throw error;
      }

      setIsOtpSent(true);
      message.success('OTP sent to your email. Please check your inbox!');
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
        type,
      });
      if (error) {
        throw error;
      }
      message.success('Signup confirmed successfully!');
    } catch (error) {
      setOtp('');
      message.error(error.message || 'Failed to verify OTP.');
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setLoading(true);
    try {
      // Optionally check email existence again for resend
      const { data: emailExists, error: rpcError } = await supabase.rpc('check_email_exists', {
        email_to_check: email,
      });

      if (rpcError) {
        throw new Error(rpcError.message || 'Error checking email.');
      }

      if (!emailExists) {
        throw new Error('This email is not registered.');
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        throw error;
      }
      message.success('OTP resent to your email. Please check your inbox!');
    } catch (error) {
      message.error(error.message || 'Failed to resend OTP.');
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
                <Button onClick={resendOtp} loading={loading} block>
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
};

export default Index;