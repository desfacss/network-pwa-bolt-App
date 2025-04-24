import React, { useState, useEffect } from 'react';
import { Drawer, Menu, Input, Button, message, Card, Modal, Popconfirm, notification } from 'antd';
import { CloseOutlined, PlusOutlined, MenuOutlined } from '@ant-design/icons';
import { supabase } from 'configs/SupabaseConfig';
import { useSelector } from 'react-redux';
import ForumComment from './Comments';
import PostMessage from './PostMessage';
import { Link, useNavigate } from 'react-router-dom';
import { APP_PREFIX_PATH } from 'configs/AppConfig';
import PropTypes from 'prop-types';

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

const Channels = ({ channelId, isPrivate = false, onChannelChange, onUnreadCountChange, setUnreadCounts }) => {
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [newChannelSlug, setNewChannelSlug] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isChannelsDrawerVisible, setIsChannelsDrawerVisible] = useState(false);
  const [isMessageDrawerVisible, setIsMessageDrawerVisible] = useState(false);
  const [userNames, setUserNames] = useState({});
  const [searchText, setSearchText] = useState('');
  const [editingMessage, setEditingMessage] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [unreadCounts, setLocalUnreadCounts] = useState({});
  const [totalPublicMinusActive, setTotalPublicMinusActive] = useState(0);
  const { session } = useSelector((state) => state.auth);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const navigate = useNavigate();

  useEffect(() => {
    console.log('Channels useEffect triggered:', { channelId, isPrivate });
    if (isPrivate) {
      fetchChannels();
    } else if (channelId) {
      fetchChannel();
    }
    fetchUnreadCounts();
  }, [channelId, isPrivate]);

  const fetchChannels = async () => {
    const query = supabase
      .from('channels')
      .select('*')
      .order('inserted_at', { ascending: true })
      .eq('is_inbox', true);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching private channels:', error);
      message.error('Failed to load private channels.');
    } else {
      console.log('Fetched private channels:', data);
      setChannels(data);
      if (data.length > 0 && !activeChannel) {
        setActiveChannel(data[0]);
        if (onChannelChange) {
          console.log('Setting initial private channel:', data[0]);
          onChannelChange(data[0]);
        }
      } else if (data.length === 0) {
        console.warn('No private channels found');
        setActiveChannel(null);
        if (onChannelChange) {
          onChannelChange(null);
        }
      }
      const uniqueUserIds = [...new Set(data.flatMap(channel => channel.join_requests || []))];
      fetchUserNames(uniqueUserIds);
    }
  };

  const fetchChannel = async () => {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .eq('id', channelId)
      .single();

    if (error) {
      console.error('Error fetching public channel:', error);
      message.error('Failed to load public channel.');
    } else {
      console.log('Fetched public channel:', data);
      setChannels([data]);
      setActiveChannel(data);
      if (onChannelChange) {
        console.log('Setting public channel:', data);
        onChannelChange(data);
      }
      const uniqueUserIds = [...new Set(data.join_requests || [])];
      fetchUserNames(uniqueUserIds);
    }
  };

  const fetchUserNames = async (userIds) => {
    if (userIds.length === 0) return;
    const { data, error } = await supabase
      .from('users')
      .select('id, user_name')
      .in('id', userIds);

    if (error) {
      console.error('Error fetching user names:', error);
    } else {
      const names = {};
      data.forEach(user => (names[user.id] = user.user_name));
      setUserNames(names);
      console.log('Fetched user names:', names);
    }
  };

  const fetchUnreadCounts = async () => {
    if (!session?.user?.id) return;

    let channelIds = [];
    if (isPrivate) {
      const { data: channelData, error: channelError } = await supabase
        .from('channels')
        .select('id')
        .eq('is_inbox', true);

      if (channelError) {
        console.error('Error fetching private channels for unread count:', channelError);
        return;
      }
      channelIds = channelData.map(channel => channel.id);
    } else {
      channelIds = [channelId].filter(Boolean);
    }

    console.log(`Channel IDs for ${isPrivate ? 'private' : 'public'}:`, channelIds);

    const { data, error } = await supabase.rpc('get_unread_counts', { user_id: session.user.id });

    if (error) {
      console.error('Error fetching unread counts:', error);
      return;
    }

    console.log('Raw unread counts from RPC:', data);

    const countsByChannel = data
      .filter(row => channelIds.includes(row.channel_id))
      .reduce((acc, row) => {
        acc[row.channel_id] = (acc[row.channel_id] || 0) + row.unread_count;
        return acc;
      }, {});

    console.log(`Filtered unread counts for ${isPrivate ? 'private' : 'public'}:`, countsByChannel);

    setLocalUnreadCounts(countsByChannel);
    if (typeof setUnreadCounts === 'function') {
      setUnreadCounts(prev => ({ ...prev, ...countsByChannel }));
    } else {
      console.warn('setUnreadCounts is not a function');
    }

    const totalUnread = Object.values(countsByChannel).reduce((sum, count) => sum + count, 0);
    console.log(`Total unread for ${isPrivate ? 'private' : 'public'}: ${totalUnread}`);
    if (onUnreadCountChange) {
      if (isPrivate && activeChannel) {
        onUnreadCountChange(countsByChannel[activeChannel.id] || 0, activeChannel.id);
      } else if (!isPrivate && channelId) {
        onUnreadCountChange(countsByChannel[channelId] || 0, channelId);
      }
    }

    if (isPrivate && activeChannel) {
      const totalMinusActive = Object.entries(countsByChannel)
        .filter(([channelId]) => channelId !== activeChannel.id)
        .reduce((sum, [, count]) => sum + count, 0);
      setTotalPublicMinusActive(totalMinusActive);
    }
  };

  useEffect(() => {
    if (isPrivate && activeChannel) {
      const totalMinusActive = Object.entries(unreadCounts)
        .filter(([channelId]) => channelId !== activeChannel.id)
        .reduce((sum, [, count]) => sum + count, 0);
      setTotalPublicMinusActive(totalMinusActive);
      if (onUnreadCountChange) {
        onUnreadCountChange(unreadCounts[activeChannel.id] || 0, activeChannel.id);
      }
    }
  }, [activeChannel, unreadCounts, isPrivate, onUnreadCountChange]);

  const showModal = () => setIsModalVisible(true);
  const handleOk = () => {
    handleAddChannel();
    setIsModalVisible(false);
  };
  const handleCancel = () => setIsModalVisible(false);

  const handleAddChannel = async () => {
    if (!newChannelSlug) return;
    const { error } = await supabase.from('channels').insert([
      {
        slug: isPrivate ? 'Private' : newChannelSlug,
        created_by: session?.user?.id,
        organization_id: session?.user?.organization?.id,
        is_inbox: isPrivate,
      },
    ]);
    if (error) {
      console.error('Error creating channel:', error);
      message.error('Failed to create channel.');
    } else {
      setNewChannelSlug('');
      if (isPrivate) {
        fetchChannels();
      } else {
        fetchChannel();
      }
      fetchUnreadCounts();
    }
  };

  const handleDeleteChannel = async (channelId) => {
    const { error } = await supabase.from('channels').delete().eq('id', channelId);
    if (error) {
      console.error('Error deleting channel:', error);
      message.error('Failed to delete channel.');
    } else {
      fetchChannels();
      fetchUnreadCounts();
      setActiveChannel(channels.length > 1 ? channels[0] : null);
      if (onChannelChange) {
        onChannelChange(channels.length > 1 ? channels[0] : null);
      }
      message.success('Channel deleted successfully!');
    }
  };

  const handleJoinRequest = async (channelId) => {
    const targetChannel = isPrivate ? channels.find(c => c.id === channelId) : channels[0];
    const { error } = await supabase
      .from('channels')
      .update({
        join_requests: [...(targetChannel.join_requests || []), session.user.id],
      })
      .eq('id', channelId);

    if (error) {
      console.error('Error adding join request:', error);
      message.error('Failed to request to join channel.');
    } else {
      message.success('Join request sent!');
      if (isPrivate) {
        fetchChannels();
      } else {
        fetchChannel();
      }
    }
  };

  const approveJoinRequest = async (channelId, userId) => {
    const targetChannel = isPrivate ? channels.find(c => c.id === channelId) : channels[0];
    const newJoinRequests = targetChannel.join_requests.filter(id => id !== userId);
console.log("NJR",newJoinRequests);
// Update activeChannel state immediately
setActiveChannel(prev => prev.id === channelId ? { ...prev, join_requests: newJoinRequests } : prev);

// Update channels state immediately to reflect in drawer
setChannels(prevChannels =>
  prevChannels.map(ch => (ch.id === channelId ? { ...ch, join_requests: newJoinRequests } : ch))
);

    await supabase.from('channels').update({ join_requests: newJoinRequests }).eq('id', channelId);

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('subscriptions')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
      return;
    }

    const currentChannels = user?.subscriptions?.channels || [];
  const newSubscriptions = {
    ...user?.subscriptions,
    channels: currentChannels.includes(channelId) ? currentChannels : [...currentChannels, channelId],
  };

    await supabase.from('users').update({ subscriptions: newSubscriptions }).eq('id', userId);
    notification.success({message: userNames[userId]+"'s join request approved!"})
    // if (isPrivate) {
    //   fetchChannels();
    // } else {
    //   fetchChannel();
    // }
    // fetchUnreadCounts();
  };

  const renderChannelContent = (targetChannel) => {
    if (!targetChannel) return null;

    console.log('Rendering content for channel:', targetChannel);

    const isSubscribed = session?.user?.subscriptions?.channels?.includes(targetChannel.id);

    if (targetChannel.is_public) {
      return (
        <ForumComment
          channel_id={targetChannel.id}
          isPrivate={isPrivate}
          searchText={searchText}
          setSearchText={setSearchText}
          setDrawerVisible={setDrawerVisible}
          setEditingMessage={setEditingMessage}
          drawerVisible={drawerVisible}
          editingMessage={editingMessage}
        />
      );
    } else if (
      isSubscribed ||
      session.user.id === targetChannel.created_by ||
      session.user.role_type === 'superadmin'
    ) {
      return (
        <ForumComment
          channel_id={targetChannel.id}
          isPrivate={isPrivate}
          searchText={searchText}
          setSearchText={setSearchText}
          setDrawerVisible={setDrawerVisible}
          setEditingMessage={setEditingMessage}
          drawerVisible={drawerVisible}
          editingMessage={editingMessage}
        />
      );
    } else if ((targetChannel?.join_requests || []).includes(session.user.id)) {
      return <>Requested to Join</>;
    } else {
      return <Button onClick={() => handleJoinRequest(targetChannel.id)}>Request to Join</Button>;
    }
  };

  const renderMenu = () => (
    <Menu
      selectedKeys={activeChannel ? [activeChannel.slug] : []}
      mode="vertical"
      onClick={({ key }) => {
        const selectedChannel = channels.find(c => c.slug === key);
        setActiveChannel(selectedChannel);
        if (onChannelChange) {
          console.log('Selected private channel:', selectedChannel);
          onChannelChange(selectedChannel);
        }
        setIsChannelsDrawerVisible(false);
      }}
      style={{ width: '100%', border: 'none' }}
    >
      {channels?.map(channel => (
        <Menu.Item key={channel.slug}>
          <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {channel.slug}
            {unreadCounts[channel.id] > 0 && (
              <span style={{ color: 'red', marginLeft: 8 }}>({unreadCounts[channel.id]})</span>
            )}
            {(session.user.id === channel.created_by || session?.user?.role_type === 'superadmin') && (
              <Popconfirm
                title={`Are you sure to delete ${channel.slug}?`}
                onConfirm={() => handleDeleteChannel(channel.id)}
                okText="Yes"
                cancelText="No"
              >
                <CloseOutlined style={{ color: 'red', cursor: 'pointer' }} />
              </Popconfirm>
            )}
            {channel.join_requests?.length > 0 &&
              (session.user.id === channel?.created_by || session?.user?.role_type === 'superadmin') && (
                <Button
                  size="small"
                  onClick={() => {
                    Modal.info({
                      title: 'Join Requests',
                      content: (
                        <div>
                          {channel.join_requests.map(userId => (
                            <div key={userId} style={{ marginBottom: 8 }}>
                              <Button onClick={() => approveJoinRequest(channel.id, userId)}>Approve</Button>{' '}
                              For {userNames[userId] || 'Unknown User'}
                            </div>
                          ))}
                        </div>
                      ),
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
    <div style={{ padding: 0 }}>
      <Card style={{ width: '100%' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 16,
            flexWrap: 'wrap',
          }}
        >
          {/* {!isPrivate && (
            <h3
              style={{
                margin: 0,
                flex: 1,
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {activeChannel?.slug}
            </h3>
          )} */}
          {!isPrivate && !isDesktop && session?.user?.features?.feature?.channels && (
            <Button
              type="primary"
              className="fab-button"
              shape="circle"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingMessage(null);
                setDrawerVisible(true);
              }}
            />
          )}
        </div>

        <div
          style={{
            display: 'flex',
            gap: 8,
            marginBottom: 16,
            flexWrap: 'wrap',
            width: '100%',
          }}
        >
          <Input
            placeholder="Search by user name, message or tag"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ flex: 1, minWidth: isDesktop ? '48%' : '58%' }}
          />
          {isPrivate && (
            // <Button
            //   type="primary"
            //   icon={<MenuOutlined />}
            //   onClick={() => setIsChannelsDrawerVisible(true)}
            //   style={{ flex: 1, minWidth: isDesktop ? '40%' : '38%' }}
            // >
            //   Channels {totalPublicMinusActive > 0 && `(${totalPublicMinusActive})`}
            // </Button>
            <Button
              type="primary"
              // icon={<MenuOutlined />}
              onClick={() => navigate(`${APP_PREFIX_PATH}/members`)}
              style={{ flex: 1, minWidth: isDesktop ? '40%' : '38%' }}
            >
              Members
            </Button>
          )}
          {!isPrivate && isDesktop && session?.user?.features?.feature?.channels && (
            <Button
              type="primary"
              onClick={() => {
                setEditingMessage(null);
                setDrawerVisible(true);
              }}
              style={{ flex: 1, minWidth: '8%' }}
            >
              Add Post
            </Button>
          )}
        </div>
        {activeChannel?.join_requests?.length > 0 &&
              (session?.user?.id === activeChannel?.created_by || session?.user?.role_type === 'superadmin') && (
                <Button type='primary'
                  size="small"
                  onClick={() => {
                    Modal.info({
                      key:activeChannel?.id,
                      title: 'Join Requests',
                      content: (
                        <div>
                          {activeChannel && activeChannel?.join_requests?.map(userId => (
                            <div key={userId} style={{ marginBottom: 8 }}>
                              <Button onClick={() => approveJoinRequest(activeChannel?.id, userId)}>Approve</Button>{' '}
                              For {userNames[userId] || 'Unknown User'}
                            </div>
                          ))}
                        </div>
                      ),
                    });
                  }}
                >
                  View Requests
                </Button>
              )}
        {isPrivate && (
          <Drawer
            title="Channels"
            placement="right"
            onClose={() => setIsChannelsDrawerVisible(false)}
            visible={isChannelsDrawerVisible}
            width={isDesktop ? 300 : '80%'}
          >
            {renderMenu()}
          </Drawer>
        )}

        <Drawer
          title="New Message"
          placement="bottom"
          height="100%"
          onClose={() => setIsMessageDrawerVisible(false)}
          visible={isMessageDrawerVisible}
          bodyStyle={{ padding: 0 }}
        >
          <PostMessage
            user_id={session?.user?.id}
            receiver_user_id={null}
            closeModal={() => setIsMessageDrawerVisible(false)}
          />
        </Drawer>

        {activeChannel && renderChannelContent(activeChannel)}
      </Card>
      {!isPrivate && session?.user?.role_type === 'superadmin' && (
        <Modal
          title="Add New Channel"
          visible={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <Input
            placeholder="New channel slug"
            value={newChannelSlug}
            onChange={e => setNewChannelSlug(e.target.value)}
          />
        </Modal>
      )}
    </div>
  );
};

Channels.propTypes = {
  channelId: PropTypes.string,
  isPrivate: PropTypes.bool,
  onChannelChange: PropTypes.func,
  onUnreadCountChange: PropTypes.func,
  setUnreadCounts: PropTypes.func,
};

Channels.defaultProps = {
  channelId: '',
  isPrivate: false,
  onChannelChange: () => {},
  onUnreadCountChange: () => {},
  setUnreadCounts: () => console.warn('setUnreadCounts not provided'),
};

export default Channels;