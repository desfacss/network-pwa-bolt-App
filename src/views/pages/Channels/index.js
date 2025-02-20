import React, { useState, useEffect } from 'react';
import { Tabs, Input, Button, message, Card, Select, Modal, Popconfirm } from 'antd';
import { CloseOutlined, PlusOutlined } from '@ant-design/icons';
import { supabase } from 'api/supabaseClient';
import { useSelector } from 'react-redux';
import ForumComment from './Comments';

const { TabPane } = Tabs;

const Channels = () => {
    const [channels, setChannels] = useState([]);
    const [activeTab, setActiveTab] = useState(null);
    const [newChannelSlug, setNewChannelSlug] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedChannelToDelete, setSelectedChannelToDelete] = useState(null);
    const [userNames, setUserNames] = useState({}); // State to hold user names

    const { session } = useSelector((state) => state.auth);

    useEffect(() => {
        fetchChannels();
    }, []);

    const fetchChannels = async () => {
        const { data, error } = await supabase.from('channels').select('*').order('inserted_at', { ascending: true });
        if (error) {
            console.error('Error fetching channels:', error);
            message.error("Failed to load channels.");
        } else {
            setChannels(data);
            if (data.length > 0) {
                setActiveTab(data[0].slug);
            }
            // Fetch user names for all join requests across all channels
            const uniqueUserIds = [...new Set(data.flatMap(channel => channel.join_requests || []))];
            fetchUserNames(uniqueUserIds);
        }
    };

    const fetchUserNames = async (userIds) => {
        if (userIds.length === 0) return;
        const { data, error } = await supabase
            .from('users')
            .select('id, user_name')
            .in('id', userIds);

        if (error) console.error("Error fetching user names:", error);
        else {
            const names = {};
            data.forEach(user => names[user.id] = user.user_name);
            setUserNames(names);
        }
    };

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleOk = () => {
        handleAddChannel();
        setIsModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleTabChange = (key) => {
        setActiveTab(key);
    };

    const handleAddChannel = async () => {
        if (!newChannelSlug) return;
        const { error } = await supabase.from('channels').insert([{
            slug: newChannelSlug,
            created_by: session?.user?.id,
            organization_id: session?.user?.organization?.id
        }]);
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
            setActiveTab(channels.length > 0 ? channels[0]?.slug : null);
            message.success("Channel deleted successfully!");
        }
    };

    const handleJoinRequest = async (channelId) => {
        console.log("uuu", channelId, [...(channels.find(c => c.id === channelId).join_requests || []), session.user.id]);
        const { error } = await supabase.from('channels').update({
            join_requests: [...(channels.find(c => c.id === channelId).join_requests || []), session.user.id]
        }).eq('id', channelId);

        if (error) {
            console.error("Error adding join request:", error);
            message.error("Failed to request to join channel.");
        } else {
            message.success("Join request sent!");
            fetchChannels(); // Refresh channels to update UI
        }
    };

    const approveJoinRequest = async (channelId, userId) => {
        // Remove from join_requests
        const channel = channels.find(c => c.id === channelId);
        const newJoinRequests = channel.join_requests.filter(id => id !== userId);

        await supabase.from('channels').update({ join_requests: newJoinRequests }).eq('id', channelId);

        // Update user's subscriptions
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('subscriptions')
            .eq('id', userId)
            .single();

        if (userError) {
            console.error("Error fetching user:", userError);
            return;
        }

        const newSubscriptions = {
            ...user?.subscriptions,
            channels: [...(user?.subscriptions?.channels || []), channelId]
        };

        await supabase.from('users').update({ subscriptions: newSubscriptions }).eq('id', userId);
        fetchChannels(); // Refresh channels to reflect changes
    };

    const renderChannelTab = (channel) => {
        console.log("ccc", channel?.join_requests);
        const isSubscribed = session?.user?.subscriptions?.channels?.includes(channel.id);

        if (channel.is_public) {
            return <ForumComment channel_id={channel.id} />;
        } else if (isSubscribed || session.user.id === channel.created_by || session.user.role_type === 'superadmin') {
            return <ForumComment channel_id={channel.id} />;
        } else if ((channel?.join_requests || [])?.includes(session.user.id)) {
            return <>Requested to Join</>;
        } else {
            return (
                <Button onClick={() => handleJoinRequest(channel.id)}>
                    Request to Join
                </Button>
            );
        }
    };

    return (
        <Card>
            <Tabs activeKey={activeTab} onChange={handleTabChange} animated={true}
                tabBarExtraContent={session?.user?.role_type === 'superadmin' && <Button type="primary" onClick={showModal} icon={<PlusOutlined />}>Add Channel</Button>}
            >
                {channels.map((channel) => (
                    <TabPane tab={
                        <span>
                            {channel.slug}
                            {(session.user.id === channel.created_by || session?.user?.role_type === 'superadmin') &&
                                <Popconfirm
                                    title={`Are you sure to delete ${channel.slug}?`}
                                    onConfirm={() => handleDeleteChannel(channel.id)}
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <CloseOutlined style={{ marginLeft: '8px', color: 'red', cursor: 'pointer' }} />
                                </Popconfirm>
                            }
                            {channel.join_requests && channel.join_requests.length > 0 && (session.user.id === channel.created_by || session?.user?.role_type === 'superadmin') &&
                                <Button onClick={() => {
                                    Modal.info({
                                        title: 'Join Requests',
                                        content: (
                                            <div>
                                                {channel.join_requests.map((userId) => (
                                                    <div key={userId}>
                                                        <Button onClick={() => approveJoinRequest(channel.id, userId)}>Approve</Button>
                                                        {" "}For {userNames[userId] || 'Unknown User'}
                                                    </div>
                                                ))}
                                            </div>
                                        )
                                    });
                                }}>View Requests</Button>
                            }
                        </span>
                    }
                        key={channel.slug}>
                        {renderChannelTab(channel)}
                    </TabPane>
                ))}
            </Tabs>
            <Modal title="Add New Channel" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
                <Input placeholder="New channel slug" value={newChannelSlug} onChange={(e) => setNewChannelSlug(e.target.value)} />
            </Modal>
        </Card>
    );
};

export default Channels;