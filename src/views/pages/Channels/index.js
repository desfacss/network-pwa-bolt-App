import React, { useState, useEffect } from 'react';
import { Drawer, Menu, Input, Button, message, Card, Modal, Popconfirm } from 'antd';
import { CloseOutlined, PlusOutlined, MenuOutlined } from '@ant-design/icons';
import { supabase } from 'configs/SupabaseConfig';
import { useSelector } from 'react-redux';
import ForumComment from './Comments';

// Simple hook to detect screen size
const useMediaQuery = (query) => {
    const [matches, setMatches] = useState(window.matchMedia(query).matches);

    useEffect(() => {
        const media = window.matchMedia(query);
        const listener = () => setMatches(media.matches);
        media.addListener(listener);
        return () => media.removeListener(listener);
    }, [query]);

    return matches;
};

const Channels = ({ isPrivate = false }) => {
    const [channels, setChannels] = useState([]);
    const [activeChannel, setActiveChannel] = useState(null);
    const [newChannelSlug, setNewChannelSlug] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const [userNames, setUserNames] = useState({});

    const { session } = useSelector((state) => state.auth);
    const isDesktop = useMediaQuery('(min-width: 768px)');

    useEffect(() => {
        fetchChannels();
    }, [isPrivate]);

    const fetchChannels = async () => {
        let query = supabase
            .from('channels')
            .select('*')
            .order('inserted_at', { ascending: true });

        if (isPrivate) {
            query = query.eq('slug', 'Private');
        } else {
            query = query.neq('slug', 'Private');
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching channels:', error);
            message.error("Failed to load channels.");
        } else {
            setChannels(data);
            if (data.length > 0) {
                setActiveChannel(data[0]);
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
            slug: isPrivate ? 'Private' : newChannelSlug,
            created_by: session?.user?.id,
            organization_id: session?.user?.organization?.id,
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
            return <ForumComment channel_id={channel.id} isPrivate={isPrivate} />;
        } else if (isSubscribed || session.user.id === channel.created_by || session.user.role_type === 'superadmin') {
            return <ForumComment channel_id={channel.id} isPrivate={isPrivate} />;
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

    const renderMenu = () => (
        <Menu
            selectedKeys={activeChannel ? [activeChannel.slug] : []}
            mode="vertical"
            onClick={({ key }) => {
                const selectedChannel = channels.find(c => c.slug === key);
                setActiveChannel(selectedChannel);
            }}
            style={{ width: '100%' }}
        >
            {channels?.map(channel => (
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
            {session?.user?.role_type === 'superadmin' && (
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={showModal}
                    style={{ marginTop: 16, width: '100%' }}
                >
                    Add Channel
                </Button>
            )}
        </Menu>
    );

    return (
        <>
            <Card style={{ paddingRight: isDesktop && !isPrivate ? 320 : 0 }}>
                {/* Mobile Layout with Drawer - Only show when not private */}
                {!isPrivate && !isDesktop && (
                    <>
                        <Button
                            icon={<MenuOutlined />}
                            onClick={() => setIsDrawerVisible(true)}
                            style={{ marginBottom: 16 }}
                        >
                            Channels
                        </Button>
                        <Drawer
                            title="Channels"
                            placement="right"
                            onClose={() => setIsDrawerVisible(false)}
                            visible={isDrawerVisible}
                            width={300}
                        >
                            {renderMenu()}
                        </Drawer>
                    </>
                )}

                {/* Content Area */}
                {activeChannel && (
                    <div>
                        {!isPrivate && <h3>{activeChannel.slug}</h3>}
                        {renderChannelContent(activeChannel)}
                    </div>
                )}
            </Card>

            {/* Desktop Fixed Menu - Only show when not private */}
            {!isPrivate && isDesktop && (
                <div
                    style={{
                        position: 'fixed',
                        top: 80,
                        right: 16,
                        width: 300,
                        background: '#fff',
                        borderRadius: 4,
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                        zIndex: 1000,
                    }}
                >
                    {renderMenu()}
                </div>
            )}

            {/* Modal for adding new channel */}
            {!isPrivate && (
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
            )}
        </>
    );
};

export default Channels;