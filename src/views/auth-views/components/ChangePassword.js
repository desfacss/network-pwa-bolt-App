import React, { useState } from 'react';
import { Form, Input, Button, message, Modal } from 'antd';
import { supabase } from 'configs/SupabaseConfig';
import { useSelector } from 'react-redux';

const ChangePassword = () => {
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [form] = Form.useForm();

    const { session } = useSelector((state) => state.auth);

    const onFinish = async (values) => {
        const { newPassword, confirmPassword } = values;

        if (newPassword !== confirmPassword) {
            message.error('New password and confirmation do not match.');
            return;
        }

        setLoading(true);

        try {
            // Update the user's password using Supabase Auth
            const { error: authError } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (authError) {
                throw authError;
            }

            // Update the password_confirmed column in the users table
            const { error: updateError } = await supabase
                .from('users')
                .update({ password_confirmed: true })
                .eq('id', session?.user?.id); // Assuming the user.id is the same as the id in the users table

            if (updateError) {
                throw updateError;
            }

            message.success('Password changed successfully!');
            handleClose(); // Close the modal after success
            form.resetFields();
        } catch (error) {
            message.error(error.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = () => setVisible(true);
    const handleClose = () => setVisible(false);

    return (
        <>
            {/* Trigger button to open modal */}
            <Button type="primary" onClick={handleOpen}>
                Change Password
            </Button>

            {/* Modal */}
            <Modal
                title="Change Password"
                visible={visible}
                onCancel={handleClose}
                footer={null}
            >
                <Form
                    form={form}
                    name="changePassword"
                    onFinish={onFinish}
                    layout="vertical"
                >
                    <Form.Item
                        label="New Password"
                        name="newPassword"
                        rules={[{ required: true, message: 'Please enter your new password.' }]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item
                        label="Confirm Password"
                        name="confirmPassword"
                        rules={[{ required: true, message: 'Please confirm your new password.' }]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block>
                            Change Password
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default ChangePassword;
