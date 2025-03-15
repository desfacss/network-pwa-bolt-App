import React, { useEffect, useState } from 'react';
import { Card, Form, Button, List, Input, Cascader, Tag, Mentions, Flex, Drawer, Popconfirm, message, Empty, ConfigProvider, theme } from 'antd';
import { SendOutlined, EditOutlined, DeleteOutlined, RocketOutlined } from '@ant-design/icons';
import './styles.css';
import { supabase } from 'configs/SupabaseConfig';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const { Option } = Mentions;

const buildTagHierarchy = async () => {
  const { data, error } = await supabase
    .from('ib_categories')
    .select('id, category_name, parent_category_id');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  const categoryMap = new Map(data.map(category => [category.id, { ...category, children: [] }]));
  const rootCategories = [];
  for (let category of data) {
    if (category.parent_category_id === null) {
      rootCategories.push(categoryMap.get(category.id));
    } else if (categoryMap.has(category.parent_category_id)) {
      categoryMap.get(category.parent_category_id).children.push(categoryMap.get(category.id));
    }
  }

  const convertToCascaderFormat = (category) => ({
    value: category.id,
    label: category.category_name,
    children: category.children.map(convertToCascaderFormat)
  });

  return rootCategories.map(convertToCascaderFormat);
};

const NewPostForm = ({ form, onSubmit, tags, setTags, isSubmitting }) => {
  const [tagHierarchy, setTagHierarchy] = useState([]);
  const [idToNameMap, setIdToNameMap] = useState(new Map());

  useEffect(() => {
    const loadHierarchy = async () => {
      const hierarchy = await buildTagHierarchy();
      setTagHierarchy(hierarchy);
      const map = new Map();
      const buildMap = (categories) => {
        categories.forEach(cat => {
          map.set(cat.value, cat.label);
          if (cat.children) buildMap(cat.children);
        });
      };
      buildMap(hierarchy);
      setIdToNameMap(map);
    };
    loadHierarchy();
  }, []);

  const handleCascaderChange = (value) => {
    setTags(value ? value.map(id => ({ id, name: idToNameMap.get(id) })) : []);
  };

  return (
    <Form form={form} onFinish={onSubmit} layout="vertical">
      <div style={{ background: '#ccceee', borderRadius: 4, border: '1px solid #ccceee', padding: 8 }}>
        <Flex gap={8} align="center">
          <Form.Item
            name="message"
            rules={[{ required: true, message: 'Please write your message' }]}
            style={{ flex: 1, margin: 0 }}
          >
            <Mentions
              rows={2}
              prefix={['@']}
              placeholder="Write your message"
              style={{
                border: 'none',
                padding: 0,
                scrollbarWidth: 'thin',
                scrollbarColor: '#333333 #ccceee',
              }}
            />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            shape="circle"
            icon={<SendOutlined />}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={{ background: '#333333', border: 'none', height: 40, width: 40 }}
          />
        </Flex>
        <Cascader
          options={tagHierarchy}
          onChange={handleCascaderChange}
          value={tags.map(tag => tag.id)}
          placeholder="Add tags"
          style={{ width: '100%', marginTop: 8 }}
          showSearch
        />
      </div>
    </Form>
  );
};

const ForumComment = ({ channel_id, isPrivate = false }) => {
  const [form] = Form.useForm();
  const [tags, setTags] = useState([]);
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [editingMessage, setEditingMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [idToNameMap, setIdToNameMap] = useState(new Map());
  const { session } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMessages = async () => {
      if (!channel_id) return;

      let query = supabase
        .from('channel_posts')
        .select('*, user:users!channel_posts_user_id_fkey(user_name), receiver:users!channel_posts_receiver_user_id_fkey(user_name), channel:channels(slug), reply_count:channel_post_messages(count)')
        .eq('channel_id', channel_id);

      if (isPrivate && session?.user?.id) {
        query = query.or(`receiver_user_id.eq.${session.user.id},user_id.eq.${session.user.id}`);
      }

      const { data, error } = await query.order('inserted_at', { ascending: false });

      if (error) {
        console.error("Error fetching messages:", error);
        return;
      }

      if (idToNameMap.size === 0) {
        const hierarchy = await buildTagHierarchy();
        const map = new Map();
        const buildMap = (categories) => {
          categories.forEach(cat => {
            map.set(cat.value, cat.label);
            if (cat.children) buildMap(cat.children);
          });
        };
        buildMap(hierarchy);
        setIdToNameMap(map);
      }

      const processedData = data.map(item => ({
        ...item,
        reply_count: item.reply_count[0]?.count || 0,
      }));
      setMessages(processedData);
      setFilteredMessages(processedData);
    };

    fetchMessages();
  }, [channel_id, session]);

  useEffect(() => {
    const filterMessages = () => {
      const lowerCaseSearchText = searchText.toLowerCase();
      return messages.filter(message => {
        const userName = message.user?.user_name?.toLowerCase() || '';
        const messageContent = message.message?.toLowerCase() || '';
        const tags = message.details?.tags?.map(tag => idToNameMap.get(tag)?.toLowerCase() || '').join(' ') || '';
        const category = idToNameMap.get(message.details?.category_id)?.toLowerCase() || '';
        return userName.includes(lowerCaseSearchText) ||
          messageContent.includes(lowerCaseSearchText) ||
          tags.includes(lowerCaseSearchText) ||
          category.includes(lowerCaseSearchText);
      });
    };
    setFilteredMessages(filterMessages());
  }, [searchText, messages, idToNameMap]);

  const handleSubmit = async (values) => {
    if (!session?.user?.id) return;
    if (!isPrivate && tags.length < 2) {
      message.error("Please add at least 2 tags");
      return;
    }

    setIsSubmitting(true);
    const firstTag = tags.length > 0 ? tags[0] : null;
    const otherTags = tags.slice(1);
    const newMessage = {
      message: values.message,
      user_id: session.user.id,
      channel_id: channel_id,
      details: isPrivate ? {} : {
        tags: otherTags.map(tag => tag.id),
        category_id: firstTag?.id,
      },
    };

    try {
      if (editingMessage) {
        const { data, error } = await supabase
          .from('channel_posts')
          .update({
            message: newMessage.message,
            details: newMessage.details,
          })
          .eq('id', editingMessage.id)
          .select('*');

        if (error) throw error;
        setMessages(messages.map(msg => msg.id === editingMessage.id ? { ...msg, ...data[0] } : msg));
        message.success("Message updated successfully.");
      } else {
        const { data, error } = await supabase
          .from('channel_posts')
          .insert([newMessage])
          .select('*, user:users!channel_posts_user_id_fkey(user_name), channel:channels(slug), reply_count:channel_post_messages(count)')
          .single();

        if (error) throw error;
        setMessages([{ ...data, reply_count: data.reply_count[0]?.count || 0 }, ...messages]);
      }

      form.resetFields();
      setTags([]);
      setEditingMessage(null);
    } catch (err) {
      console.error("Error:", err);
      message.error("Failed to save message.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (message) => {
    form.setFieldsValue({ message: message.message });
    const tagsToEdit = [
      ...(message.details?.category_id ? [{ id: message.details.category_id, name: idToNameMap.get(message.details.category_id) }] : []),
      ...(message.details?.tags?.map(tag => ({ id: tag, name: idToNameMap.get(tag) })) || []),
    ];
    setTags(tagsToEdit);
    setEditingMessage(message);
  };

  const handleDelete = async (messageId) => {
    try {
      const { error } = await supabase
        .from('channel_posts')
        .delete()
        .eq('id', messageId);

      if (error) throw error;
      setMessages(messages.filter(msg => msg.id !== messageId));
      message.success("Message deleted successfully.");
    } catch (err) {
      console.error("Error deleting message:", err);
      message.error("Failed to delete message.");
    }
  };

  const formatMessage = (text) => {
    const words = text.split(' ');
    const boldWords = words.slice(0, 5).join(' ');
    const restWords = words.slice(5).join(' ');
    return <span><strong>{boldWords}</strong> {restWords}</span>;
  };

  return (
    <div className="forum-container">
      {!isPrivate && (
        <ConfigProvider theme={{ 
          algorithm: theme.defaultAlgorithm,
          token: { colorBorder: '#ccceee', borderRadius: 4, fontFamily: 'Inter, sans-serif' }
        }}>
          <NewPostForm form={form} onSubmit={handleSubmit} tags={tags} setTags={setTags} isSubmitting={isSubmitting} />
          <Input
            placeholder="Search by user name, message or tag"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ borderColor: '#ccceee', color: '#333333', margin: '16px 0' }}
          />
        </ConfigProvider>
      )}

      {filteredMessages.length > 0 ? (
        <List
          dataSource={filteredMessages}
          renderItem={(item) => (
            <Card
              style={{
                marginBottom: 16,
                borderRadius: 10,
                background: 'rgb(238, 241, 246)',
                padding: 16,
                position: 'relative',
                cursor: 'pointer',
              }}
              bodyStyle={{ padding: 0 }}
              onClick={() => navigate(`/app/networking/${item.id}`)}
              hoverable
            >
              <Flex vertical gap={12}>
                <div style={{ color: '#333333', fontSize: 16, lineHeight: 1.5, wordBreak: 'break-word' }}>
                  {formatMessage(item.message)}
                </div>
                <div style={{ borderTop: '1px solid #ccceee', paddingTop: 12 }}>
                  <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
                    <span style={{ fontWeight: 600, color: '#333333', fontSize: 15 }}>
                      {isPrivate
                        ? item.user_id === session.user.id
                          ? item.receiver?.user_name
                          : item.user?.user_name
                        : item.user?.user_name}
                    </span>
                    <Flex gap={6} wrap="wrap" justify="center" style={{ flex: 1, minWidth: 0 }}>
                      {item.details?.category_id && (
                        <Tag style={{ borderRadius: 12, background: '#efefef', color: '#333333', border: 'none', fontWeight: 500 }}>
                          {idToNameMap.get(item.details.category_id) || item.details.category_id}
                        </Tag>
                      )}
                      {item.details?.tags?.map((tag) => (
                        <Tag key={tag} style={{ borderRadius: 12, background: '#efefef', color: '#333333', border: 'none', fontWeight: 500 }}>
                          {idToNameMap.get(tag) || tag}
                        </Tag>
                      ))}
                    </Flex>
                    <span style={{ fontSize: 12, color: '#333333', fontStyle: 'italic', whiteSpace: 'nowrap' }}>
                      {new Date(item.inserted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ·{' '}
                      {new Date(item.inserted_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </Flex>
                </div>
              </Flex>
              {(session.user.role_type === 'superadmin' || session.user.id === item.user_id) && (
                <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 8 }}>
                  <EditOutlined
                    style={{ color: '#333333', fontSize: 18 }}
                    onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                  />
                  <Popconfirm
                    title="Are you sure to delete this message?"
                    onConfirm={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                    okText="Yes"
                    cancelText="No"
                    placement="topRight"
                  >
                    <DeleteOutlined
                      style={{ color: '#333333', fontSize: 18 }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Popconfirm>
                </div>
              )}
            </Card>
          )}
        />
      ) : (
        <Empty
          image={<RocketOutlined style={{ fontSize: '48px', color: '#333333' }} />}
          description={
            isPrivate ? (
              <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#333333' }}>No Messages</span>
            ) : (
              <span>
                <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#333333' }}>
                  Welcome to the {messages[0]?.channel?.slug} Group!
                </span><br />
                This space is ready for your team's conversations and updates. Start by sharing a message!
              </span>
            )
          }
        />
      )}
    </div>
  );
};

export default ForumComment;