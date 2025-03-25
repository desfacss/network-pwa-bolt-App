import React, { useEffect, useState } from 'react';
import { Form, Button, Mentions, message } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { supabase } from 'configs/SupabaseConfig';
import { useSelector } from 'react-redux';
import './styles.css';

const { Option } = Mentions;

const NewPostForm = ({ form, onSubmit, isSubmitting, onClose }) => {
  const [mentionUsers] = useState([
    { id: '1', display: 'Alice' },
    { id: '2', display: 'Bob' },
  ]);

  return (
    <div style={{ padding: 16, height: '100%' }}>
      <Form
        form={form}
        onFinish={onSubmit}
        layout="vertical"
        style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        <div style={{
          flex: 1,
          // background: '#D3E0EA',
          // borderRadius: 4,
          // padding: 8,
          border: '1px solid #ECF4FB',
        }}>
          <Form.Item
            name="message"
            rules={[{ required: true, message: 'Please write your message' }]}
            style={{ margin: 0, height: '100%' }}
          >
            <Mentions
              rows={10}
              prefix={['@']}
              placeholder="Write your message"
              style={{
                border: 'none',
                padding: 0,
                resize: 'none',
                height: '100%',
                scrollbarWidth: 'thin',
                scrollbarColor: '#ECF4FB #D3E0EA',
              }}
            >
              {mentionUsers.map((user) => (
                <Option key={user.id} value={user.id}>
                  {user.display}
                </Option>
              ))}
            </Mentions>
          </Form.Item>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            onClick={onClose}
            style={{ marginTop: 16, width: '48%', height: 40 }} // Adjust width as needed
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            // icon={<SendOutlined />}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={{
              marginTop: 16,
              background: '#4A90E2',
              border: 'none',
              width: '48%', // Adjust width as needed
              height: 40,
            }}
          >
            Send Message
          </Button>
        </div>
      </Form>
    </div>
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

      const { data: existingPost, error: fetchError } = await supabase
        .from('channel_posts')
        .select('id')
        .or(
          `and(user_id.eq.${user_id},receiver_user_id.eq.${receiver_user_id}),` +
          `and(user_id.eq.${receiver_user_id},receiver_user_id.eq.${user_id})`
        )
        .single();

      let channelPostId;

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error checking existing post:', fetchError);
        message.error('Error checking conversation.');
        return;
      }

      if (existingPost) {
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
        closeModal();
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      message.error('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <NewPostForm
        form={form}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        onClose={closeModal}
      />
    </>
  );
};

export default PostMessage;