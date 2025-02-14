import React, { useEffect, useState } from 'react';
import { Card, Avatar, Form, Button, List, Input, Cascader, Tag, Mentions, Flex, Drawer } from 'antd';
import { UserOutlined, MessageOutlined } from '@ant-design/icons';
import './styles.css';
import { supabase } from 'api/supabaseClient';
import { useSelector } from 'react-redux';

const { Option } = Mentions;

// Sample data
// const tagHierarchy = [
//     {
//         value: 'frontend',
//         label: 'Frontend',
//         children: [
//             {
//                 value: 'react',
//                 label: 'React',
//                 children: [
//                     { value: 'hooks', label: 'Hooks' },
//                     { value: 'context', label: 'Context' },
//                 ],
//             },
//         ],
//     },
// ];
const tagHierarchy = [
    {
        value: 'frontend',
        label: 'Frontend',
        children: [
            {
                value: 'react',
                label: 'React',
                children: [
                    {
                        value: 'hooks', label: 'Hooks',
                        children: [
                            {
                                value: 'hooks', label: 'Hooks',
                                children: [
                                    {
                                        value: 'hooks', label: 'Hooks',
                                        children: [
                                            {
                                                value: 'hooks', label: 'Hooks',
                                                children: [
                                                    {
                                                        value: 'hooks', label: 'Hooks',
                                                        children: [
                                                            { value: 'hooks', label: 'Hooks' },
                                                            { value: 'context', label: 'Context' },
                                                        ]
                                                    },
                                                    { value: 'context', label: 'Context' },
                                                ]
                                            },
                                            { value: 'context', label: 'Context' },
                                        ]
                                    },
                                    { value: 'context', label: 'Context' },
                                ]
                            },
                            { value: 'context', label: 'Context' },
                        ]
                    },
                    {
                        value: 'context', label: 'Context',
                        children: [
                            { value: 'hooks', label: 'Hooks' },
                            { value: 'context', label: 'Context' },
                        ]
                    },
                ],
            },
        ],
    },
];

const NewPostForm = ({ form, onSubmit, tags, setTags }) => {
    const [mentionUsers] = useState([ /* ... your mentionUsers data */]);

    const handleCascaderChange = (value) => {
        if (value && value.length > 0) {
            setTags(value);
        } else {
            setTags([]);
        }
    };

    return (
        <Form form={form} onFinish={onSubmit}>
            <Form.Item
                name="message"
                rules={[{ required: true, message: 'Please write your message' }]}
            >
                <Mentions
                    rows={4}
                    prefix={['@']}
                    placeholder="Write your message (use @ to mention users)"
                >
                    {mentionUsers?.map((user) => (
                        <Option key={user.id} value={user.id}>
                            {user.display}
                        </Option>
                    ))}
                </Mentions>
            </Form.Item>

            <Form.Item label="Add Tags">
                <Flex gap={8}>
                    <Cascader
                        options={tagHierarchy}
                        onChange={handleCascaderChange}
                        placeholder="Hierarchical tags"
                        style={{ width: 200 }}
                        showSearch
                    />
                    <Input
                        placeholder="Free-form tags"
                        onPressEnter={(e) => {
                            const target = e.target;
                            const newTag = target.value.trim();
                            if (newTag) {
                                setTags([...tags, newTag]);
                                target.value = '';
                            }
                        }}
                    />
                </Flex>
            </Form.Item>

            <div style={{ marginTop: 16 }}>
                {tags.map((tag) => (
                    <Tag
                        key={tag}
                        closable
                        onClose={() => setTags(tags.filter((t) => t !== tag))}
                        style={{ marginBottom: 8 }}
                    >
                        {tag}
                    </Tag>
                ))}
            </div>

            <Form.Item style={{ marginTop: 24 }}>
                <Button type="primary" htmlType="submit">
                    Post Message
                </Button>
            </Form.Item>
        </Form>
    );
};

const ForumComment = ({ channel_id }) => {
    const [form] = Form.useForm();
    const [tags, setTags] = useState([]);
    const [messages, setMessages] = useState([]);
    const [mentionUsers] = useState([
        { id: '1', display: 'Alice' },
        { id: '2', display: 'Bob' },
    ]);
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const { session } = useSelector((state) => state.auth);

    useEffect(() => {
        // Fetch messages on component mount or when channel_id changes
        const fetchMessages = async () => {
            if (channel_id) {
                const { data, error } = await supabase
                    .from('messages')
                    .select('*, user:users(user_name)')
                    .eq('channel_id', channel_id)
                    .order('inserted_at', { ascending: false }); // Order by time

                if (error) {
                    console.error("Error fetching messages:", error);
                } else {
                    console.log("ui", data);
                    setMessages(data || []);
                }
            }
        };

        fetchMessages();
    }, [channel_id]);

    const handleSubmit = async (values) => {
        if (!session?.user?.id) return;

        const firstTag = tags.length > 0 ? tags[0] : null;
        const otherTags = tags.slice(1);

        const newMessage = {
            message: values.message,
            user_id: session?.user?.id,
            channel_id: channel_id,
            details: {
                tags: otherTags,
                category_id: firstTag,
            },
        };

        try {
            const { data, error } = await supabase
                .from('messages')
                .insert([newMessage]).select('*');
            console.log("tt", data);
            if (error) {
                console.error("Error inserting message:", error);
            } else {
                // Fetch the newly inserted message (it will have the correct timestamp and ID)
                const { data: insertedMessage } = await supabase
                    .from('messages')
                    .select('*, user:users(user_name)')
                    .eq('id', data[0].id) // Use the ID from the insert response
                    .single(); // Expecting only one result

                if (insertedMessage) {

                    setMessages([insertedMessage, ...messages]); // Add the fetched message to state
                    form.resetFields();
                    setTags([]);
                } else {
                    console.error("Failed to fetch inserted message")
                }



            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleCascaderChange = (value) => {
        if (value && value.length > 0) {
            setTags(value); // Directly set the value array as tags
        } else {
            setTags([]); // Clear tags if selection is cleared
        }
    };

    return (
        <div className="forum-container"> {/* Main container */}
            <div className="message-list">
                <List
                    dataSource={messages}
                    renderItem={(item) => (
                        <Card
                            style={{ marginBottom: 16 }}
                            actions={[
                                <div key="tags">
                                    {item?.details?.tags?.map((tag) => (
                                        <Tag key={tag}>{tag}</Tag>
                                    ))}
                                    {item?.details?.category_id && <Tag color="blue">{item?.details?.category_id}</Tag>}
                                </div>,
                            ]}
                        >
                            <Card.Meta
                                avatar={<Avatar icon={<UserOutlined />} />}
                                title={item?.user?.user_name} // Or get the user's name if you have it
                                description={
                                    <div>
                                        <div style={{ marginBottom: 8 }}>{item?.message}</div>
                                        <div style={{ fontSize: 12, color: '#666' }}>
                                            {new Date(item?.inserted_at).toLocaleString() || ""} {/* Format the timestamp */}
                                        </div>
                                    </div>
                                }
                            />
                        </Card>
                    )}
                />
            </div>
            <div className="new-post-container">
                <Card title={<><MessageOutlined /> New Post</>} style={{ marginTop: 24 }}>
                    <NewPostForm form={form} onSubmit={handleSubmit} tags={tags} setTags={setTags} />
                    {/* <Form form={form} onFinish={handleSubmit}>
                        <Form.Item
                            name="message"
                            rules={[{ required: true, message: 'Please write your message' }]}
                        >
                            <Mentions
                                rows={4}
                                prefix={['@']}
                                placeholder="Write your message (use @ to mention users)"
                            >
                                {mentionUsers?.map((user) => (
                                    <Option key={user.id} value={user.id}>
                                        {user.display}
                                    </Option>
                                ))}
                            </Mentions>
                        </Form.Item>

                        <Form.Item label="Add Tags">
                            <Flex gap={8}>
                                <Cascader
                                    options={tagHierarchy}
                                    onChange={handleCascaderChange}
                                    placeholder="Hierarchical tags"
                                    style={{ width: 200 }}
                                    showSearch
                                />
                                <Input
                                    placeholder="Free-form tags"
                                    onPressEnter={(e) => {
                                        const target = e.target;
                                        const newTag = target.value.trim();
                                        if (newTag) {
                                            setTags([...tags, newTag]);
                                            target.value = '';
                                        }
                                    }}
                                />
                            </Flex>
                        </Form.Item>

                        <div style={{ marginTop: 16 }}>
                            {tags.map((tag) => (
                                <Tag
                                    key={tag}
                                    closable
                                    onClose={() => setTags(tags.filter((t) => t !== tag))}
                                    style={{ marginBottom: 8 }}
                                >
                                    {tag}
                                </Tag>
                            ))}
                        </div>

                        <Form.Item style={{ marginTop: 24 }}>
                            <Button type="primary" htmlType="submit">
                                Post Message
                            </Button>
                        </Form.Item>
                    </Form> */}
                </Card>
            </div>
            <Drawer
                title="New Post"
                placement="bottom"
                closable={true}
                onClose={() => setIsDrawerVisible(false)}
                visible={isDrawerVisible}
                style={{ padding: 0 }}
            >
                <Card style={{ border: 'none', padding: 0 }}>{/* Card inside Drawer */}
                    <Form form={form} onFinish={handleSubmit}>
                        <NewPostForm form={form} onSubmit={handleSubmit} tags={tags} setTags={setTags} />
                        {/* ... (Form content - Mentions, Tags, etc.) */}
                    </Form>
                </Card>
            </Drawer>

            {/* Floating Button (for smaller screens) */}
            <div className="new-post-button-container">
                <Button
                    type="primary"
                    icon={<MessageOutlined />}
                    onClick={() => setIsDrawerVisible(true)}
                >
                    New Post
                </Button>
            </div>
        </div>
    );
};

export default ForumComment;