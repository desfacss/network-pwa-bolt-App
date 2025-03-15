import React, { useEffect, useState } from 'react';
import { Card, Avatar, Form, Button, List, Input, Cascader, Tag, Mentions, Flex, Drawer, Popconfirm, message, Empty, ConfigProvider, theme } from 'antd';
import { UserOutlined, MessageOutlined, DeleteOutlined, RocketOutlined, CloseOutlined, SendOutlined, EditOutlined } from '@ant-design/icons';
import './styles.css';
import { supabase } from 'configs/SupabaseConfig';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const { Option } = Mentions;

// Function to fetch and build tag hierarchy
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
    const [mentionUsers] = useState([/* ... your mentionUsers data */]);
    const [tagHierarchy, setTagHierarchy] = useState([]);
    const [idToNameMap, setIdToNameMap] = useState(new Map());

    useEffect(() => {
        const loadHierarchy = async () => {
            const hierarchy = await buildTagHierarchy();
            setTagHierarchy(hierarchy);
            const map = new Map();
            function buildMap(categories) {
                categories.forEach(cat => {
                    map.set(cat.value, cat.label);
                    if (cat.children) buildMap(cat.children);
                });
            }
            buildMap(hierarchy);
            setIdToNameMap(map);
        };
        loadHierarchy();
    }, []);

    const handleCascaderChange = (value) => {
        if (value && value.length > 0) {
            setTags(value.map(id => ({ id, name: idToNameMap.get(id) })));
        } else {
            setTags([]);
        }
    };

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
                border: '1px solid #ccceee',
            }}>
                <Flex gap={8} align="center" style={{ padding: 8, width: '100%' }}>
                    <Form.Item
                        name="message"
                        rules={[{ required: true, message: 'Please write your message' }]}
                        style={{ flex: 1, margin: 0 }}
                    >
                        <Mentions
                            rows={2}
                            prefix={['@']}
                            placeholder="Write your message "
                            style={{
                                border: 'none',
                                padding: 0,
                                '::-webkit-scrollbar': { width: '4px' },
                                '::-webkit-scrollbar-track': { background: '#ccceee', borderRadius: '2px' },
                                // '::-webkit-scrollbar-thumb': { background: '#333333', borderRadius: '2px' },
                                scrollbarWidth: 'thin',
                                scrollbarColor: '#333333 #ccceee',
                            }}
                        >
                            {mentionUsers?.map((user) => (
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
                            background: '#333333',
                            border: 'none',
                            fontSize: 16,
                            padding: 8,
                            height: 40,
                            width: 40,
                        }}
                    />
                </Flex>
                <Flex gap={4} align="center" style={{ padding: '0 8px 8px', flexWrap: 'wrap' }}>
                    <Cascader
                        options={tagHierarchy}
                        onChange={handleCascaderChange}
                        value={tags.map(tag => tag.id)}
                        placeholder="Add tags"
                        style={{
                            width: '100%',
                            background: 'transparent',
                            border: 'none',
                            color: '#333333',
                            marginBottom: 4,
                        }}
                        showSearch
                        dropdownStyle={{ background: '#ccceee', color: '#333333' }}
                    />
                </Flex>
            </div>
        </Form>
    );
};

const ForumComment = ({ channel_id, isPrivate = false }) => {
    const [form] = Form.useForm();
    const [tags, setTags] = useState([]);
    const [messages, setMessages] = useState([]);
    const [mentionUsers] = useState([
        { id: '1', display: 'Alice' },
        { id: '2', display: 'Bob' },
    ]);
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const { session } = useSelector((state) => state.auth);
    const [idToNameMap, setIdToNameMap] = useState(new Map());
    const [searchText, setSearchText] = useState("");
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [editingMessage, setEditingMessage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchMessages = async () => {
            if (channel_id) {
                let query = supabase
                    .from('channel_posts')
                    .select('*, user:users!channel_posts_user_id_fkey(user_name), receiver:users!channel_posts_receiver_user_id_fkey(user_name), channel:channels(slug), reply_count:channel_post_messages(count)')
                    .eq('channel_id', channel_id);

                if (isPrivate && session?.user?.id) {
                    query = query.or(`receiver_user_id.eq.${session.user.id},user_id.eq.${session.user.id}`);
                }

                const { data, error } = await query
                    .order('inserted_at', { ascending: false });

                if (error) {
                    console.error("Error fetching messages:", error);
                } else {
                    if (idToNameMap.size === 0) {
                        const hierarchy = await buildTagHierarchy();
                        const map = new Map();
                        function buildMap(categories) {
                            categories.forEach(cat => {
                                map.set(cat.value, cat.label);
                                if (cat.children) buildMap(cat.children);
                            });
                        }
                        buildMap(hierarchy);
                        setIdToNameMap(map);
                    }
                    const processedData = data.map(item => ({
                        ...item,
                        reply_count: item.reply_count[0]?.count || 0,
                    }));
                    setMessages(processedData || []);
                }
            }
        };

        fetchMessages();
    }, [channel_id]);

    const handleSubmit = async (values) => {
        if (!session?.user?.id) return;
        if (tags.length < 2) return message.error("Enter Tags");

        setIsSubmitting(true);
        const firstTag = tags.length > 0 ? tags[0] : null;
        const otherTags = tags.slice(1);

        const newMessage = {
            message: values.message,
            user_id: session.user.id,
            channel_id: channel_id,
            details: {
                tags: otherTags.map(tag => tag.id),
                category_id: firstTag.id,
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

                if (error) {
                    console.error("Error updating message:", error);
                    message.error("Failed to update message.");
                } else {
                    const updatedMessage = {
                        ...editingMessage,
                        message: newMessage.message,
                        details: newMessage.details,
                    };
                    setMessages(messages.map(msg => (msg.id === editingMessage.id ? updatedMessage : msg)));
                    message.success("Message updated successfully.");
                }
            } else {
                const { data, error } = await supabase
                    .from('channel_posts')
                    .insert([newMessage]).select('*');

                if (error) {
                    console.error("Error inserting message:", error);
                } else {
                    const { data: insertedMessage, error: insertError } = await supabase
                        .from('channel_posts')
                        .select('*, user:users!channel_posts_user_id_fkey(user_name), channel:channels(slug), reply_count:channel_post_messages(count)')
                        .eq('id', data[0].id)
                        .single();

                    if (insertedMessage) {
                        setMessages([{ ...insertedMessage, reply_count: insertedMessage.reply_count[0]?.count || 0 }, ...messages]);
                    }
                }
            }

            form.resetFields();
            setTags([]);
            setEditingMessage(null);
        } catch (err) {
            console.error(err);
            message.error("An error occurred.");
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

            if (error) {
                console.error("Error deleting message:", error);
                message.error("Failed to delete message.");
            } else {
                setMessages(messages.filter(msg => msg.id !== messageId));
                message.success("Message deleted successfully.");
            }
        } catch (err) {
            console.error(err);
            message.error("An error occurred.");
        }
    };

    const [filteredMessages, setFilteredMessages] = useState([]);

    useEffect(() => {
        const filterMessages = (text) => {
            const lowerCaseSearchText = text.toLowerCase();
            return messages.filter(message => {
                const userName = message.user?.user_name?.toLowerCase() || '';
                const messageContent = message.message?.toLowerCase() || '';
                const tags = message.details?.tags?.map(tag => idToNameMap.get(tag) || tag).join(' ').toLowerCase() || '';
                const category = idToNameMap.get(message.details.category_id)?.toLowerCase() || message.details.category_id?.toLowerCase() || '';
                return userName.includes(lowerCaseSearchText) ||
                    messageContent.includes(lowerCaseSearchText) ||
                    tags.includes(lowerCaseSearchText) ||
                    category.includes(lowerCaseSearchText);
            });
        };

        setFilteredMessages(filterMessages(searchText));
    }, [searchText, messages, idToNameMap]);

    const formatMessage = (text) => {
        const words = text.split(' ');
        const boldWords = words.slice(0, 5).join(' ');
        const restWords = words.slice(5).join(' ');
        return (
            <span>
                <strong>{boldWords}</strong> {restWords}
            </span>
        );
    };

    return (
        <div className="forum-container">
            <div className="message-list">
                {!isPrivate && (
                    <>
                        <ConfigProvider
                            theme={{
                                algorithm: theme.defaultAlgorithm,
                                token: {
                                    colorBorder: '#ccceee',
                                    borderRadius: 4,
                                    fontFamily: 'Inter, sans-serif',
                                },
                            }}
                        >
                            <NewPostForm form={form} onSubmit={handleSubmit} tags={tags} setTags={setTags} isSubmitting={isSubmitting} />
                        </ConfigProvider>
                        <div style={{ marginBottom: 16 }}>
                            <Input
                                placeholder="Search by user name, message or tag"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                style={{ borderColor: '#ccceee', color: '#333333' }}
                            />
                        </div>
                    </>
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
                                    // boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
                                    // #E6F7FF
                                    padding: '16px',
                                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                    // border: '1px solid #ccceee',
                                }}
                                bodyStyle={{ padding: 0 }}
                                hoverable
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '14px',
                                        marginBottom: 14,
                                    }}
                                >
                                    {!isPrivate && (
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: 40,
                                                    height: 40,
                                                    background: '#333333',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: 700,
                                                    fontSize: 20,
                                                    color: '#ffffff',
                                                    cursor: 'pointer',
                                                    transition: 'background 0.2s ease',
                                                }}
                                                onClick={() => navigate(`/app/networking/${item.id}`)}
                                                onMouseEnter={(e) => (e.currentTarget.style.background = '#333333')}
                                                onMouseLeave={(e) => (e.currentTarget.style.background = '#ccceee')}
                                            >
                                                {item.reply_count}
                                            </div>
                                        </div>
                                    )}
                                    <div
                                        style={{
                                            flex: 1,
                                            color: '#333333',
                                            fontSize: 16,
                                            lineHeight: 1.5,
                                            wordBreak: 'break-word',
                                        }}
                                    >
                                        {formatMessage(item.message)}
                                        <Button
                                            type="link"
                                            onClick={() => navigate(`/app/networking/${item.id}`)}
                                            style={{
                                                paddingLeft: 20, 
                                                fontSize: 13,
                                                color: '#333CCC',
                                                fontWeight: 500,
                                                height: 'auto',
                                                lineHeight: 1,
                                            }}
                                        >
                                            Reply
                                        </Button>
                                    </div>
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        paddingBottom: 10,
                                        borderBottom: '1px solid #ccceee',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                                        <div style={{ minWidth: 0 }}>
                                            <span
                                                style={{
                                                    fontWeight: 600,
                                                    color: '#333333',
                                                    fontSize: 15,
                                                }}
                                            >
                                                {isPrivate
                                                    ? item.user_id === session.user.id
                                                        ? item.receiver?.user_name
                                                        : item.user?.user_name
                                                    : item.user?.user_name}
                                            </span>
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            flex: 1,
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            flexWrap: 'wrap',
                                            gap: 6,
                                            padding: '0 10px',
                                        }}
                                    >
                                        {item.details.category_id && (
                                            <Tag
                                                style={{
                                                    borderRadius: 12,
                                                    background: '#efefef',
                                                    color: '#333333',
                                                    fontSize: 12,
                                                    padding: '2px 8px',
                                                    border: 'none',
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {idToNameMap.get(item.details.category_id) || item.details.category_id}
                                            </Tag>
                                        )}
                                        {item.details.tags?.map((tag) => (
                                            <Tag
                                                key={tag}
                                                style={{
                                                    borderRadius: 12,
                                                    background: '#efefec',
                                                    color: '#333333',
                                                    fontSize: 12,
                                                    padding: '2px 8px',
                                                    border: 'none',
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {idToNameMap.get(tag) || tag}
                                            </Tag>
                                        ))}
                                    </div>
                                    <span
                                        style={{
                                            fontSize: 12,
                                            color: '#333333',
                                            fontStyle: 'italic',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {new Date(item.inserted_at).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}{' '}
                                        ·{' '}
                                        {new Date(item.inserted_at).toLocaleDateString([], {
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </span>
                                </div>
                                {(session.user.role_type === 'superadmin' || session.user.id === item.user_id) && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: 16,
                                            right: 16,
                                            display: 'flex',
                                            gap: 8,
                                        }}
                                    >
                                        <EditOutlined
                                            style={{
                                                cursor: 'pointer',
                                                color: '#333333',
                                                fontSize: 18,
                                                transition: 'color 0.2s ease',
                                            }}
                                            onClick={() => handleEdit(item)}
                                            onMouseEnter={(e) => (e.currentTarget.style.color = '#ccceee')}
                                            onMouseLeave={(e) => (e.currentTarget.style.color = '#333333')}
                                        />
                                        <Popconfirm
                                            title="Are you sure to delete this message?"
                                            onConfirm={() => handleDelete(item.id)}
                                            okText="Yes"
                                            cancelText="No"
                                            placement="topRight"
                                        >
                                            <DeleteOutlined
                                                style={{
                                                    cursor: 'pointer',
                                                    color: '#333333',
                                                    fontSize: 18,
                                                    transition: 'color 0.2s ease',
                                                }}
                                                onMouseEnter={(e) => (e.currentTarget.style.color = '#ccceee')}
                                                onMouseLeave={(e) => (e.currentTarget.style.color = '#333333')}
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
                        imageStyle={{ height: 70 }}
                        description={
                            <>
                                {isPrivate ? (
                                    <span>
                                        <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#333333' }}>No Messages</span><br />
                                    </span>
                                ) : (
                                    <span>
                                        <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#333333' }}>Welcome to the {messages[0]?.channel?.slug} Group!</span><br />
                                        This space is ready for your team's conversations and updates. Start by sharing a message or even just a quick "hello!". Let's get this rolling!
                                    </span>
                                )}
                            </>
                        }
                    />
                )}
            </div>
            <Drawer
                title={editingMessage ? "Edit Post" : "New Post"}
                placement="bottom"
                closable={true}
                onClose={() => {
                    setIsDrawerVisible(false);
                    setEditingMessage(null);
                    form.resetFields();
                    setTags([]);
                }}
                visible={isDrawerVisible}
                style={{ padding: 0 }}
            >
                <Card style={{ border: 'none', padding: 0, background: '#ccceee' }}>
                    <Form form={form} onFinish={handleSubmit}>
                        <NewPostForm form={form} onSubmit={handleSubmit} tags={tags} setTags={setTags} isSubmitting={isSubmitting} />
                    </Form>
                </Card>
            </Drawer>
        </div>
    );
};

export default ForumComment;