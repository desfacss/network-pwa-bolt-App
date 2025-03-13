import React, { useEffect, useState } from 'react';
import { Form, Button, List, Mentions, Card, ConfigProvider, theme, message } from 'antd';
import { SendOutlined, UserOutlined } from '@ant-design/icons';
import { supabase } from 'configs/SupabaseConfig';
import { useSelector } from 'react-redux';
import './styles.css';

const { Option } = Mentions;

const NewPostForm = ({ form, onSubmit, isSubmitting }) => {
    const [mentionUsers] = useState([
        { id: '1', display: 'Alice' },
        { id: '2', display: 'Bob' },
    ]);

    return (
        <Form
            form={form}
            onFinish={onSubmit}
            layout="vertical"
            style={{
                background: 'transparent',
                borderRadius: 4,
            }}
        >
            <div style={{
                background: '#ccceee',
                borderRadius: 4,
                overflow: 'hidden',
                border: '1px solid #D8BFD8',
            }}>
                <div style={{ padding: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Form.Item
                        name="message"
                        rules={[{ required: true, message: 'Please write your message' }]}
                        style={{ flex: 1, margin: 0 }}
                    >
                        <Mentions
                            rows={2}
                            prefix={['@']}
                            placeholder="Write your message (use @ to mention users)"
                            style={{
                                border: 'none',
                                padding: 0,
                                '::-webkit-scrollbar': { width: '4px' },
                                '::-webkit-scrollbar-track': { background: '#ccceee', borderRadius: '2px' },
                                '::-webkit-scrollbar-thumb': { background: '#D8BFD8', borderRadius: '2px' },
                                scrollbarWidth: 'thin',
                                scrollbarColor: '#D8BFD8 #ccceee',
                            }}
                        >
                            {mentionUsers.map((user) => (
                                <Option key={user.id} value={user.id}>
                                    {user.display}
                                </Option>
                            ))}
                        </Mentions>
                    </Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        shape="circle"
                        icon={<SendOutlined />}
                        loading={isSubmitting}
                        disabled={isSubmitting}
                        style={{
                            background: '#9370DB',
                            border: 'none',
                            fontSize: 16,
                            padding: 8,
                            height: 40,
                            width: 40,
                        }}
                    />
                </div>
            </div>
        </Form>
    );
};

const PostMessage = ({ user_id, receiver_user_id, closeModal }) => {
    const [form] = Form.useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { session } = useSelector((state) => state.auth);

    useEffect(() => {
        return () => {
            form.resetFields();
        };
    }, [form]);

    // Fetch the inbox channel ID where is_inbox = true
    const fetchInboxChannelId = async () => {
        const { data, error } = await supabase
            .from('channels')
            .select('id')
            .eq('is_inbox', true)
            .single();

        if (error) {
            console.error('Error fetching inbox channel:', error);
            return null;
        }
        return data.id;
    };

    const handleSubmit = async (values) => {
        if (!session?.user?.id) {
            message.error('You must be logged in to send a message.');
            return;
        }

        setIsSubmitting(true);

        try {
            const channelId = await fetchInboxChannelId();
            if (!channelId) {
                message.error('Inbox channel not found.');
                return;
            }

            // Check for existing channel post with matching user_id and receiver_user_id
            const { data: existingPost, error: fetchError } = await supabase
                .from('channel_posts')
                .select('id')
                .or(
                    `and(user_id.eq.${user_id},receiver_user_id.eq.${receiver_user_id}),` +
                    `and(user_id.eq.${receiver_user_id},receiver_user_id.eq.${user_id})`
                )
                .single();

            let channelPostId;

            if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows found
                console.error('Error checking existing post:', fetchError);
                message.error('Error checking conversation.');
                return;
            }

            if (existingPost) {
                // Update the existing channel post with the new message
                const { error: updateError } = await supabase
                    .from('channel_posts')
                    .update({ message: values.message })
                    .eq('id', existingPost.id);

                if (updateError) {
                    console.error('Error updating channel post:', updateError);
                    message.error('Failed to update conversation.');
                    return;
                }
                channelPostId = existingPost.id;
            } else {
                // Create a new channel post
                const { data: newPost, error: insertError } = await supabase
                    .from('channel_posts')
                    .insert({
                        user_id: user_id,
                        receiver_user_id: receiver_user_id,
                        channel_id: channelId,
                        message: values.message,
                    })
                    .select('id')
                    .single();

                if (insertError) {
                    console.error('Error creating channel post:', insertError);
                    message.error('Failed to start conversation.');
                    return;
                }
                channelPostId = newPost.id;
            }

            // Insert the message into channel_post_messages
            const { data: newMessage, error: messageError } = await supabase
                .from('channel_post_messages')
                .insert({
                    message: values.message,
                    user_id: session.user.id,
                    channel_post_id: channelPostId,
                    name: session?.user?.user_name
                })
                .select('*');

            if (messageError) {
                console.error('Error inserting message:', messageError);
                message.error('Failed to send message.');
            } else {
                form.resetFields();
                message.success('Message sent successfully.');
            }
        } catch (err) {
            console.error('Unexpected error:', err);
            message.error('An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
            closeModal()
        }
    };

    return (
        <div className="forum-container">
            <ConfigProvider
                theme={{
                    algorithm: theme.defaultAlgorithm,
                    token: {
                        colorBorder: '#D8BFD8',
                        borderRadius: 4,
                        fontFamily: 'Inter, sans-serif',
                    },
                }}
            >
                <NewPostForm form={form} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
            </ConfigProvider>
        </div>
    );
};

export default PostMessage;