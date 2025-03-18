import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from 'configs/SupabaseConfig';
import { useSelector } from 'react-redux';
import { Form, Input, Button, message, Card } from 'antd';
import GeneralDocumentComponent from '../Templates/GeneralDocumentComponent4';

const RecipientComponent = () => {
    const { id } = useParams();
    const { session } = useSelector((state) => state.auth);
    const [shareData, setShareData] = useState(null);
    const [document, setDocument] = useState(null);
    const [otpRequired, setOtpRequired] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // Add error state
    const [form] = Form.useForm();

    useEffect(() => {
        fetchShareData();
    }, [id]);

    const fetchShareData = async () => {
        setLoading(true);
        setError(null); // Reset error state
        const { data, error: fetchError } = await supabase
            .from('document_shares')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError) {
            console.error('Error fetching share data:', fetchError);
            message.error('Invalid or expired share link');
            setError('Invalid or expired share link'); // Set error message
            setLoading(false);
            return;
        }

        if (new Date(data.expires_at) < new Date()) {
            message.error('Share link has expired');
            setError('Share link has expired'); // Set error message
            setLoading(false);
            return;
        }

        if (data.recipient_type === 'user' && data.recipient_user_id === session?.user?.id) {
            setIsAuthorized(true);
        } else if (data.recipient_type === 'organization' && data.recipient_org_id === session?.user?.organization?.id) {
            setIsAuthorized(true);
        } else if (data.recipient_type === 'email') {
            setIsAuthorized(true);
        } else {
            message.error('You are not authorized to view this document');
            setError('You are not authorized to view this document'); // Set error message
            setLoading(false);
            return;
        }

        setShareData(data);
        if (!!data.otp) {
            setOtpRequired(true);
            setLoading(false);
        } else {
            fetchDocumentContent(data); // Fetch document content based on document_type
        }
    };

    const fetchDocumentContent = async (shareData) => {
        const tableName = shareData.document_table;
        const documentId = shareData.document_id;

        const { data: documentData, error: documentError } = await supabase
            .from(tableName)
            .select('*')
            .eq('id', documentId)
            .single();

        if (documentError) {
            console.error('Error fetching document content:', documentError);
            message.error('Failed to fetch document content.');
            setError('Failed to fetch document content.');
            setLoading(false);
            return;
        }

        setDocument(documentData);
        setLoading(false);
    };

    const handleOtpSubmit = async (values) => {
        if (values.otp === shareData.otp) {
            setOtpRequired(false);
            fetchDocumentContent(shareData); // Fetch document after OTP verification
        } else {
            message.error('Invalid OTP');
        }
    };

    return (
        <Card style={{ padding: '20px' }}>
            {loading ? (
                <div>Loading...</div>
            ) : otpRequired ? (
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
            ) : document ? (
                <GeneralDocumentComponent formName={shareData?.document_type} initialData={document} /> // Use document_type from shareData
            ) : error ? (
                <div>{error}</div>
            ) : (
                <div>Invalid or expired share link...</div>
            )}
        </Card>
    );
};

export default RecipientComponent;