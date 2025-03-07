import React, { useState, useEffect } from 'react';
import { Tabs, Input, Button, List, message, Card } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { supabase } from 'configs/SupabaseConfig';
import { useSelector } from 'react-redux';

const { TabPane } = Tabs;
const { TextArea } = Input;

const Channels = () => {
    const [channels, setChannels] = useState([]);
    const [activeTab, setActiveTab] = useState(null);
    const [messages, setMessages] = useState({});
    const [newMessage, setNewMessage] = useState('');
    const [newChannelSlug, setNewChannelSlug] = useState('');

    const { session } = useSelector((state) => state.auth);

    useEffect(() => {
        fetchChannels();
    }, []);

    useEffect(() => {
        if (activeTab) {
            fetchMessages(activeTab);
        }
    }, [activeTab]);

    const fetchChannels = async () => {
        const { data, error } = await supabase.from('channels').select('*');
        if (error) {
            console.error('Error fetching channels:', error);
            message.error("Failed to load channels.");
        } else {
            setChannels(data);
            if (data.length > 0) {
                setActiveTab(data[0].slug); // Set initial active tab
            }
        }
    };

    const fetchMessages = async (channelSlug) => {
        const channel = channels.find(c => c.slug === channelSlug);
        if (!channel) return;

        const { data, error } = await supabase
            .from('channel_posts')
            .select('*')
            .eq('channel_id', channel.id)
            .order('inserted_at');

        if (error) {
            console.error('Error fetching messages:', error);
            message.error("Failed to load messages.");
        } else {
            setMessages({ ...messages, [channelSlug]: data });
        }
    };

    const handleTabChange = (key) => {
        setActiveTab(key);
    };

    const handleAddMessage = async () => {
        if (!newMessage || !activeTab) return;

        const channel = channels.find(c => c.slug === activeTab);
        if (!channel) return;

        const { error } = await supabase.from('channel_posts').insert([
            { message: newMessage, user_id: session?.user?.id, channel_id: channel.id }, // Replace with actual user ID
        ]);

        if (error) {
            console.error('Error adding message:', error);
            message.error("Failed to add message.");
        } else {
            setNewMessage('');
            fetchMessages(activeTab);
        }
    };


    const handleDeleteMessage = async (messageId, channelSlug) => {
        const { error } = await supabase.from('channel_posts').delete().eq('id', messageId);

        if (error) {
            console.error("Error deleting message:", error)
            message.error("Failed to delete message.");
        } else {
            fetchMessages(channelSlug);
        }
    };

    const handleAddChannel = async () => {
        if (!newChannelSlug) return;
        const { error } = await supabase.from('channels').insert([{ slug: newChannelSlug, created_by: session?.user?.id, organization_id: session?.user?.organization?.id }]); // Replace with user and org id
        if (error) {
            console.error("Error creating channel:", error);
            message.error("Failed to create channel.");
        } else {
            setNewChannelSlug('');
            fetchChannels();
        }
    };

    const handleDeleteChannel = async (channelId) => {
        const { error } = await supabase.from('channels').delete().eq('id', channelId);
        if (error) {
            console.error("Error deleting channel:", error);
            message.error("Failed to delete channel.");
        } else {
            fetchChannels();
            setActiveTab(channels.length > 1 ? channels[0].slug : null); // Set active tab to another channel or null if no channels left.
            setMessages({}); // Clear messages when channel is deleted.
        }

    }

    return (
        <Card>
            <Tabs activeKey={activeTab} onChange={handleTabChange}>
                {channels.map((channel) => (
                    <TabPane tab={channel.slug} key={channel.slug}>
                        <List
                            dataSource={messages[channel.slug] || []}
                            renderItem={(messageItem) => (
                                <List.Item
                                    actions={[
                                        <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDeleteMessage(messageItem.id, channel.slug)} />,
                                    ]}
                                >
                                    {messageItem.message}
                                </List.Item>
                            )}
                        />
                        <TextArea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Enter your message"
                            onPressEnter={handleAddMessage} // Add message on Enter key press
                            autoSize={{ minRows: 1, maxRows: 3 }}
                        />
                        <Button type="primary" onClick={handleAddMessage} style={{ marginTop: "10px" }}>
                            Send
                        </Button>
                    </TabPane>
                ))}
            </Tabs>

            <h2>Add New Channel</h2>
            <Input
                placeholder="New channel slug"
                value={newChannelSlug}
                onChange={(e) => setNewChannelSlug(e.target.value)}
            />
            <Button type="primary" onClick={handleAddChannel} icon={<PlusOutlined />} style={{ marginTop: "10px" }}>
                Add Channel
            </Button>

            <h2>Delete Channel</h2>
            <select onChange={(e) => handleDeleteChannel(e.target.value)}>
                <option value="">Select a Channel</option>
                {channels.map((channel) => (
                    <option key={channel.id} value={channel.id}>{channel.slug}</option>
                ))}
            </select>

        </Card>
    );
};

export default Channels;