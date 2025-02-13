import React, { useState } from 'react';
import { Card, Avatar, Form, Button, List, Input, Cascader, Tag, Mentions, Flex, Drawer } from 'antd';
import { UserOutlined, MessageOutlined } from '@ant-design/icons';
import './styles.css';

const { TextArea } = Input;
const { Option } = Mentions;

// Sample data
const tagHierarchy = [
    {
        value: 'frontend',
        label: 'Frontend',
        children: [
            {
                value: 'react',
                label: 'React',
                children: [
                    { value: 'hooks', label: 'Hooks' },
                    { value: 'context', label: 'Context' },
                ],
            },
        ],
    },
];

const ForumComment = () => {
    const [form] = Form.useForm();
    const [tags, setTags] = useState([]);
    const [comments, setComments] = useState([]);
    const [mentionUsers] = useState([
        { id: '1', display: 'Alice' },
        { id: '2', display: 'Bob' },
    ]);
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);

    const handleSubmit = (values) => {
        const newComment = {
            author: 'Current User',
            content: values.message,
            tags,
            mentions: values.mentions,
            datetime: new Date().toLocaleString(),
        };

        setComments([...comments, newComment]);
        form.resetFields();
        setTags([]);
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
                    dataSource={comments}
                    renderItem={(item) => (
                        <Card
                            style={{ marginBottom: 16 }}
                            actions={[
                                <div key="tags">
                                    {item.tags?.map((tag) => (
                                        <Tag key={tag}>{tag}</Tag>
                                    ))}
                                </div>,
                            ]}
                        >
                            <Card.Meta
                                avatar={<Avatar icon={<UserOutlined />} />}
                                title={item.author}
                                description={
                                    <div>
                                        <div style={{ marginBottom: 8 }}>{item.content}</div>
                                        <div style={{ fontSize: 12, color: '#666' }}>
                                            {item.datetime}
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
                    <Form form={form} onFinish={handleSubmit}>
                        <Form.Item
                            name="message"
                            rules={[{ required: true, message: 'Please write your message' }]}
                        >
                            <Mentions
                                rows={4}
                                prefix={['@']}
                                placeholder="Write your message (use @ to mention users)"
                            >
                                {mentionUsers.map((user) => (
                                    <Option key={user.id} value={user.id}>
                                        {user.display}
                                    </Option>
                                ))}
                            </Mentions>
                        </Form.Item>

                        <Form.Item label="Add Tags">
                            <Flex gap={8}>
                                {/* <Cascader
                                options={tagHierarchy}
                                onChange={(value) => {
                                    if (value) setTags([...tags, value.join(' > ')]);
                                }}
                                placeholder="Hierarchical tags"
                                style={{ width: 200 }}
                                showSearch
                            /> */}
                                {/* <Cascader
                                options={tagHierarchy}
                                onChange={handleCascaderChange}
                                placeholder="Hierarchical tags"
                                style={{ width: 200 }}
                                showSearch
                                changeOnSelect // Key change: Allow selecting intermediate levels
                            /> */}
                                <Cascader
                                    options={tagHierarchy}
                                    onChange={handleCascaderChange}
                                    placeholder="Hierarchical tags"
                                    style={{ width: 200 }}
                                    showSearch
                                // Remove changeOnSelect. We only want the final value.
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