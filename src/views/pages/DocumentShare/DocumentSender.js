import React, { useEffect, useState } from 'react';
import { Form, Select, Input, Button, Checkbox, InputNumber, message } from 'antd';
import { supabase } from 'configs/SupabaseConfig';
import { useSelector } from 'react-redux';
import GeneralDocumentComponent from '../Templates/GeneralDocumentComponent4';
import { sendEmail } from 'components/common/SendEmail';

const SenderComponent = () => {
    const [form] = Form.useForm();
    const { session } = useSelector((state) => state.auth);
    const [documents, setDocuments] = useState([]);
    const [users, setUsers] = useState([]);
    const [organizations, setOrganizations] = useState([]);
    const [recipientType, setRecipientType] = useState(null);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [otpEnabled, setOtpEnabled] = useState(false);

    useEffect(() => {
        fetchDocuments();
        fetchUsers();
        fetchOrganizations();
    }, []);

    const fetchDocuments = async () => {
        const { data, error } = await supabase.from('documents').select('id, title, content, type');
        if (error) console.error('Error fetching documents:', error);
        else setDocuments(data);
    };

    const fetchUsers = async () => {
        const { data, error } = await supabase.from('users').select('*');
        if (error) console.error('Error fetching users:', error);
        else setUsers(data);
    };

    const fetchOrganizations = async () => {
        const { data, error } = await supabase.from('organizations').select('id, name');
        if (error) console.error('Error fetching organizations:', error);
        else setOrganizations(data);
    };

    const handleDocumentSelect = (value) => {
        const doc = documents.find((d) => d.id === value);
        setSelectedDocument(doc);
    };

    const onFinish = async (values) => {
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + values.expiry);

        const shareData = {
            document_id: values.document,
            sender_id: session?.user?.id,
            recipient_type: values.recipientType,
            ...(values.recipientType === 'email' && { recipient_email: values.recipientEmail }),
            ...(values.recipientType === 'user' && { recipient_user_id: values.recipientUser }),
            ...(values.recipientType === 'organization' && { recipient_org_id: values.recipientOrg }),
            otp: otpEnabled ? values.otp : null,
            expires_at: expiresAt.toISOString(),
            created_by: session?.user?.id,
        };

        const { data, error } = await supabase.from('document_shares').insert(shareData).select().single();
        if (error) {
            console.error('Error creating document share:', error);
            message.error('Failed to share document');
        } else {
            message.success('Document shared successfully');
            if (values.recipientType === 'email') {
                const recipientLink = `${window.location.origin}/recipient/${data.id}`;
                const emailData = [{
                    from: `${session?.user?.user_name} on zoworks ${process.env.REACT_APP_RESEND_FROM_EMAIL}`, // Adjust as needed
                    to: [values.recipientEmail],
                    subject: `${session?.user?.user_name} on zoworks Shared invoice with You`,
                    html: `<p>You have been shared a document. View it here: <a href="${recipientLink}">${recipientLink}</a></p>`,
                }];
                await sendEmail(emailData); // Using your sendEmail function with edge function
            }
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item label="Select Document" name="document" rules={[{ required: true }]}>
                    <Select onChange={handleDocumentSelect}>
                        {documents.map((doc) => (
                            <Select.Option key={doc.id} value={doc.id}>
                                {doc.title}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>



                <Form.Item label="Recipient Type" name="recipientType" rules={[{ required: true }]}>
                    <Select onChange={(value) => setRecipientType(value)}>
                        <Select.Option value="email">Email</Select.Option>
                        <Select.Option value="user">User</Select.Option>
                        <Select.Option value="organization">Organization</Select.Option>
                    </Select>
                </Form.Item>

                {recipientType === 'email' && (
                    <Form.Item label="Recipient Email" name="recipientEmail" rules={[{ required: true, type: 'email' }]}>
                        <Input />
                    </Form.Item>
                )}
                {recipientType === 'user' && (
                    <Form.Item label="Select User" name="recipientUser" rules={[{ required: true }]}>
                        <Select>
                            {users.map((user) => (
                                <Select.Option key={user.id} value={user.id}>
                                    {user.user_name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                )}
                {recipientType === 'organization' && (
                    <Form.Item label="Select Organization" name="recipientOrg" rules={[{ required: true }]}>
                        <Select>
                            {organizations.map((org) => (
                                <Select.Option key={org.id} value={org.id}>
                                    {org.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                )}

                <Form.Item name="otpEnabled" valuePropName="checked">
                    <Checkbox onChange={(e) => setOtpEnabled(e.target.checked)}>Require OTP</Checkbox>
                </Form.Item>

                {otpEnabled && (
                    <Form.Item label="OTP" name="otp" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                )}

                <Form.Item label="Expiry (minutes)" name="expiry" rules={[{ required: true }]}>
                    <InputNumber min={1} />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Share Document
                    </Button>
                </Form.Item>
                {selectedDocument && (
                    <GeneralDocumentComponent formName={selectedDocument.type} initialData={selectedDocument.content} />
                )}
            </Form>
        </div>
    );
};

export default SenderComponent;