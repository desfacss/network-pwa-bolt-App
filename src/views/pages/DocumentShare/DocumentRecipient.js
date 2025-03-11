import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from 'configs/SupabaseConfig';
import { useSelector } from 'react-redux';
import { Form, Input, Button, message } from 'antd';
import GeneralDocumentComponent from '../Templates/GeneralDocumentComponent4';

const RecipientComponent = () => {
    const { id } = useParams();
    const { session } = useSelector((state) => state.auth);
    const [shareData, setShareData] = useState(null);
    const [document, setDocument] = useState(null);
    const [otpRequired, setOtpRequired] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchShareData();
    }, [id]);

    const fetchShareData = async () => {
        const { data, error } = await supabase
            .from('document_shares')
            .select('*, documents(content, type)')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching share data:', error);
            message.error('Invalid or expired share link');
        } else if (new Date(data.expires_at) < new Date()) {
            message.error('Share link has expired');
        } else {
            // Authorization check based on recipient_type
            if (data.recipient_type === 'user' && data.recipient_user_id === session?.user?.id) {
                setIsAuthorized(true);
            } else if (data.recipient_type === 'organization' && data.recipient_org_id === session?.user?.organization?.id) {
                setIsAuthorized(true);
            } else if (data.recipient_type === 'email') {
                setIsAuthorized(true); // Email recipients don't need session-based auth, handled via link/OTP
            } else {
                message.error('You are not authorized to view this document');
                return;
            }

            setShareData(data);
            if (data.otp) {
                setOtpRequired(true);
            } else if (isAuthorized) {
                setDocument(data.documents);
            }
        }
    };

    const handleOtpSubmit = async (values) => {
        if (values.otp === shareData.otp) {
            setOtpRequired(false);
            if (isAuthorized) {
                setDocument(shareData.documents);
            }
        } else {
            message.error('Invalid OTP');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            {otpRequired ? (
                <Form form={form} onFinish={handleOtpSubmit} layout="vertical">
                    <Form.Item label="Enter OTP" name="otp" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Verify OTP
                        </Button>
                    </Form.Item>
                </Form>
            ) : document && isAuthorized ? (
                <GeneralDocumentComponent formName={document.type} initialData={document.content} />
            ) : (
                <div>Loading or invalid share link...</div>
            )}
        </div>
    );
};

export default RecipientComponent;