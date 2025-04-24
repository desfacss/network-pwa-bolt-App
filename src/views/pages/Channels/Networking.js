import React, { useState, useEffect } from 'react';
import { Badge, Button, Popover } from 'antd-mobile';
import { LockOutline, MoreOutline } from 'antd-mobile-icons';
import Channels from './index';
import { APP_PREFIX_PATH } from 'configs/AppConfig';
import { Link } from 'react-router-dom';
import { supabase } from 'configs/SupabaseConfig';
import { useSelector } from 'react-redux';

const ChannelTabs = ({ onTotalUnreadChange }) => {
  const [publicUnreadCount, setPublicUnreadCount] = useState(0);
  const [privateUnreadCount, setPrivateUnreadCount] = useState(0);
  const [publicActiveChannel, setPublicActiveChannel] = useState(null);
  const [privateActiveChannel, setPrivateActiveChannel] = useState(null);
  const [channels, setChannels] = useState([]);
  const [activePill, setActivePill] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({}); // Define unreadCounts state
  const { session } = useSelector((state) => state.auth);
  const subscribedChannelIds = session?.user?.subscriptions?.channels || [];

  // Fetch channels
  useEffect(() => {
    const fetchChannels = async () => {
      const { data, error } = await supabase
        .from('channels')
        .select('id, slug, is_public, ui_order, is_inbox')
        .order('ui_order', { ascending: true });

      if (error) {
        console.error('Error fetching channels:', error);
      } else {
        setChannels(data);
        setActivePill(data?.[0]?.id ?? null);
      }
    };

    fetchChannels();
  }, []);

  // Fetch unread counts
  useEffect(() => {
    const fetchInitialUnreadCounts = async () => {
      if (!session?.user?.id) return;

      const { data: unreadData, error } = await supabase.rpc('get_unread_counts', { user_id: session.user.id });
      if (error) {
        console.error('Error fetching initial unread counts:', error);
        return;
      }

      const { data: allChannels, error: channelError } = await supabase
        .from('channels')
        .select('id, is_inbox');

      if (channelError) {
        console.error('Error fetching channels:', channelError);
        return;
      }

      const privateChannelIds = allChannels.filter(ch => ch.is_inbox).map(ch => ch.id);
      const privateTotal = unreadData
        .filter(row => privateChannelIds.includes(row.channel_id))
        .reduce((sum, row) => sum + row.unread_count, 0);

      setPrivateUnreadCount(privateTotal);

      // Update unreadCounts state
      const counts = {};
      unreadData.forEach(row => {
        counts[row.channel_id] = row.unread_count;
      });
      setUnreadCounts(counts);
    };

    fetchInitialUnreadCounts();
  }, [session]);

  // Handle unread count changes
  const handleUnreadCountChange = (isPrivate) => (count, channelId) => {
    console.log(`Unread count for ${isPrivate ? 'private' : 'public'} channel ${channelId}: ${count}`);
    if (isPrivate) {
      setPrivateUnreadCount(count);
    } else if (publicActiveChannel && channelId === publicActiveChannel.id) {
      setPublicUnreadCount(count);
    }
    // Update unreadCounts
    setUnreadCounts(prev => ({ ...prev, [channelId]: count }));
  };

  // Handle channel changes
  const handleChannelChange = (isPrivate) => (channel) => {
    console.log(`Active channel for ${isPrivate ? 'private' : 'public'}: ${channel?.slug}`);
    if (isPrivate) {
      setPrivateActiveChannel(channel);
    } else {
      setPublicActiveChannel(channel);
    }
  };

  // Update total unread count
  useEffect(() => {
    const totalUnread = publicUnreadCount + privateUnreadCount;
    console.log(`Total unread count: ${totalUnread}`);
    if (onTotalUnreadChange) {
      onTotalUnreadChange(totalUnread);
    }
  }, [publicUnreadCount, privateUnreadCount, onTotalUnreadChange]);

  // Unread badge for channels
  const getUnreadBadge = (channel) => {
    if (channel.is_public && publicUnreadCount > 0) {
      return <Badge content=" " color="#f5222d" style={{ marginLeft: 4 }} />;
    }
    if (!channel.is_public && privateUnreadCount > 0) {
      return <Badge content=" " color="#f5222d" style={{ marginLeft: 4 }} />;
    }
    return null;
  };

  // Pill options for channels
  const pillOptions = channels.map((channel) => {
    const isSubscribed = channel.is_public || subscribedChannelIds.includes(channel.id);
    return {
      label: (
        <span>
          {channel.slug}
          {!isSubscribed && <LockOutline style={{ marginLeft: 4 }} />}
          {getUnreadBadge(channel)}
        </span>
      ),
      value: channel.id,
    };
  });

  // Responsive split for pills
  const maxVisiblePills = 4;
  const visiblePills = pillOptions.slice(0, maxVisiblePills);
  const overflowPills = pillOptions.slice(maxVisiblePills);

  // Styles
  const pillContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    padding: '8px 0',
  };

  const scrollWrapperStyle = {
    display: 'flex',
    overflowX: 'auto',
    flexGrow: 1,
    gap: '8px',
    padding: '0 16px',
    WebkitOverflowScrolling: 'touch',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  };

  const scrollWrapperClass = `
    .pill-scroll-wrapper::-webkit-scrollbar {
      display: none;
    }
  `;

  const pillStyle = {
    flexShrink: 0,
    whiteSpace: 'nowrap',
    padding: '6px 12px',
    borderRadius: '16px',
    fontSize: '14px',
  };

  return (
    <>
      <style>{scrollWrapperClass}</style>
      <div style={pillContainerStyle}>
        <div style={scrollWrapperStyle} className="pill-scroll-wrapper">
          {pillOptions.map((option) => (
            <Button
              key={option.value}
              size="small"
              color={activePill === option.value ? 'primary' : 'default'}
              fill={activePill === option.value ? 'solid' : 'outline'}
              style={{
                ...pillStyle,
                backgroundColor: activePill === option.value ? '#1890ff' : 'transparent',
                color: activePill === option.value ? '#fff' : '#000',
                borderColor: activePill === option.value ? '#1890ff' : '#d9d9d9',
              }}
              onClick={() => setActivePill(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        {overflowPills.length > 0 && (
          <Popover
            content={overflowPills.map((option) => (
              <Button
                key={option.value}
                size="small"
                block
                color={activePill === option.value ? 'primary' : 'default'}
                fill={activePill === option.value ? 'solid' : 'none'}
                style={{
                  marginBottom: 4,
                  backgroundColor: activePill === option.value ? '#1890ff' : 'transparent',
                  color: activePill === option.value ? '#fff' : '#000',
                }}
                onClick={() => {
                  setActivePill(option.value);
                }}
              >
                {option.label}
              </Button>
            ))}
            trigger="click"
            placement="bottom-end"
          >
            <Button size="small" icon={<MoreOutline />} style={{ marginLeft: '8px' }} />
          </Popover>
        )}
      </div>

      {channels.map((channel) => {
        const isCurrent = activePill === channel.id;
        const isSubscribed = channel.is_public || subscribedChannelIds.includes(channel.id);
// console.log("vcx",channel.id,channel.is_inbox);
        if (!isCurrent) return null;

        return (
          <div key={channel.id}>
            {/* {isSubscribed ? ( */}
              <>
                <Channels
                  channelId={channel.id}
                  isPrivate={channel.is_inbox}
                  onChannelChange={handleChannelChange(!channel.is_public)}
                  onUnreadCountChange={handleUnreadCountChange(!channel.is_public)}
                  setUnreadCounts={setUnreadCounts} // Pass setUnreadCounts
                />
                {/* {!channel.is_public && (
                  <div style={{ textAlign: 'center' }}>
                    <p>
                      You can find members and send private messages{' '}
                      <Link to={`${APP_PREFIX_PATH}/members`}>from here...</Link>
                    </p>
                  </div>
                )} */}
              </>
            {/* ) : (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p>This channel is private. Please request access.</p>
              </div>
            )} */}
          </div>
        );
      })}
    </>
  );
};

export default ChannelTabs;