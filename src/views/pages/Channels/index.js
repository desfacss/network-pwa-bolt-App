import React, { useState, useEffect } from 'react';
import { Drawer, Menu, Input, Button, message, Card, Modal, Popconfirm } from 'antd';
import { CloseOutlined, PlusOutlined, MenuOutlined } from '@ant-design/icons';
import { supabase } from 'api/supabaseClient';
import { useSelector } from 'react-redux';
import ForumComment from './Comments';

const Channels = () => {
    const [channels, setChannels] = useState([]);
    const [activeChannel, setActiveChannel] = useState(null); // Replaced activeTab with activeChannel
    const [newChannelSlug, setNewChannelSlug] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isDrawerVisible, setIsDrawerVisible] = useState(false); // For Drawer visibility
    const [userNames, setUserNames] = useState({});

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
                setActiveChannel(data[0]); // Set the first channel as active
            }
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

    const showModal = () => setIsModalVisible(true);
    const handleOk = () => {
        handleAddChannel();
        setIsModalVisible(false);
    };
    const handleCancel = () => setIsModalVisible(false);

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
            setActiveChannel(channels.length > 0 ? channels[0] : null);
            message.success("Channel deleted successfully!");
        }
    };

    const handleJoinRequest = async (channelId) => {
        const channel = channels.find(c => c.id === channelId);
        const { error } = await supabase.from('channels').update({
            join_requests: [...(channel.join_requests || []), session.user.id]
        }).eq('id', channelId);

        if (error) {
            console.error("Error adding join request:", error);
            message.error("Failed to request to join channel.");
        } else {
            message.success("Join request sent!");
            fetchChannels();
        }
    };

    const approveJoinRequest = async (channelId, userId) => {
        const channel = channels.find(c => c.id === channelId);
        const newJoinRequests = channel.join_requests.filter(id => id !== userId);

        await supabase.from('channels').update({ join_requests: newJoinRequests }).eq('id', channelId);

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
        fetchChannels();
    };

    const renderChannelContent = (channel) => {
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
            {/* Button to toggle Drawer */}
            <Button
                icon={<MenuOutlined />}
                onClick={() => setIsDrawerVisible(true)}
                style={{ marginBottom: 16 }}
            >
                Channels
            </Button>

            {/* Drawer with Menu for channel selection */}
            <Drawer
                title="Channels"
                placement="right"
                onClose={() => setIsDrawerVisible(false)}
                visible={isDrawerVisible}
                width={300}
            >
                <Menu
                    selectedKeys={activeChannel ? [activeChannel.slug] : []}
                    mode="vertical"
                    onClick={({ key }) => {
                        const selectedChannel = channels.find(c => c.slug === key);
                        setActiveChannel(selectedChannel);
                        setIsDrawerVisible(false); // Close drawer on selection
                    }}
                >
                    {channels.map(channel => (
                        <Menu.Item key={channel.slug}>
                            <span>
                                {channel.slug}
                                {(session.user.id === channel.created_by || session?.user?.role_type === 'superadmin') && (
                                    <Popconfirm
                                        title={`Are you sure to delete ${channel.slug}?`}
                                        onConfirm={() => handleDeleteChannel(channel.id)}
                                        okText="Yes"
                                        cancelText="No"
                                    >
                                        <CloseOutlined style={{ marginLeft: '8px', color: 'red', cursor: 'pointer' }} />
                                    </Popconfirm>
                                )}
                                {channel.join_requests?.length > 0 && (session.user.id === channel.created_by || session?.user?.role_type === 'superadmin') && (
                                    <Button
                                        size="small"
                                        onClick={() => {
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
                                        }}
                                    >
                                        View Requests
                                    </Button>
                                )}
                            </span>
                        </Menu.Item>
                    ))}
                </Menu>
                {session?.user?.role_type === 'superadmin' && (
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={showModal}
                        style={{ marginTop: 16 }}
                    >
                        Add Channel
                    </Button>
                )}
            </Drawer>

            {/* Active Channel Content */}
            {activeChannel && (
                <div>
                    <h3>{activeChannel.slug}</h3>
                    {renderChannelContent(activeChannel)}
                </div>
            )}

            {/* Modal for adding new channel */}
            <Modal
                title="Add New Channel"
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Input
                    placeholder="New channel slug"
                    value={newChannelSlug}
                    onChange={(e) => setNewChannelSlug(e.target.value)}
                />
            </Modal>
        </Card>
    );
};

export default Channels;