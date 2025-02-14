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
    const [selectedChannelToDelete, setSelectedChannelToDelete] = useState(null); // State for tracking the channel to delete


    const { session } = useSelector((state) => state.auth);

    useEffect(() => {
        fetchChannels()
    }, []);

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
        const { error } = await supabase.from('channels').insert([{ slug: newChannelSlug, created_by: session?.user?.id, organization_id: session?.user?.organization?.id }]); // Replace with user and org id
        if (error) {
            console.error("Error creating channel:", error);
            message.error("Failed to create channel.");
        } else {
            setNewChannelSlug('');
            fetchChannels();
        }
    };

    const handleDeleteChannel = async (channelId) => { // Accept channelId as argument
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


    return (
        <Card>
            <Tabs activeKey={activeTab} onChange={handleTabChange}
                tabBarExtraContent={<Button type="primary" onClick={showModal} icon={<PlusOutlined />}>Add Channel</Button>}
            >
                {channels.map((channel) => (
                    <TabPane tab={
                        <span>
                            {channel?.slug}
                            <Popconfirm // Wrap CloseOutlined with Popconfirm
                                title={`Are you sure to delete ${channel?.slug}?`}
                                onConfirm={() => handleDeleteChannel(channel?.id)} // Pass channel?.id to delete function
                                onCancel={() => { }} // Handle cancel if needed
                                okText="Yes"
                                cancelText="No"
                            >
                                <CloseOutlined
                                    style={{ marginLeft: '8px', color: 'red', cursor: 'pointer' }}
                                    onClick={(e) => e.stopPropagation()} // Prevent tab change
                                />
                            </Popconfirm>
                        </span>
                    }
                        key={channel?.slug}>
                        <ForumComment channel_id={channel?.id} />
                    </TabPane>
                ))}
            </Tabs>
            <Modal
                title="Add New Channel"
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Input placeholder="New channel slug" value={newChannelSlug} onChange={(e) => setNewChannelSlug(e.target.value)} />
            </Modal>
        </Card>
    );
};

export default Channels;