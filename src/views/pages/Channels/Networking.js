import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Badge, Button, Popover } from 'antd-mobile';
import { LockOutline } from 'antd-mobile-icons';
import Channels from './index';
import { supabase } from 'configs/SupabaseConfig';
import { useSelector } from 'react-redux';
import { UnorderedListOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import LoadingComponent from 'components/layout-components/LoadingComponent';

const ChannelTabs = ({ onTotalUnreadChange }) => {
  const [publicUnreadCount, setPublicUnreadCount] = useState(0);
  const [privateUnreadCount, setPrivateUnreadCount] = useState(0);
  const [activePill, setActivePill] = useState(null);
  const { session } = useSelector((state) => state.auth);
  const subscribedChannelIds = session?.user?.subscriptions?.channels || [];

  // Fetch channels
  const { data: channels = [], isLoading: channelsLoading } = useQuery({
    queryKey: ['channels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('channels')
        .select('id, slug, is_public, ui_order, is_inbox')
        .order('ui_order', { ascending: true });
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Set initial active pill
  useEffect(() => {
    if (channels.length > 0 && !activePill) {
      setActivePill(channels[0].id);
    }
  }, [channels, activePill]);

  // Fetch unread counts
  const { data: unreadCounts = {} } = useQuery({
    queryKey: ['unreadCounts', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return {};

      const { data: countsData, error: countsError } = await supabase.rpc('get_unread_counts', {
        user_id: session.user.id,
      });
      if (countsError) throw countsError;

      const { data: channelData, error: channelError } = await supabase
        .from('channels')
        .select('id, is_inbox');
      if (channelError) throw channelError;

      const privateChannelIds = channelData.filter(ch => ch.is_inbox).map(ch => ch.id);
      const privateTotal = countsData
        .filter(row => privateChannelIds.includes(row.channel_id))
        .reduce((sum, row) => sum + row.unread_count, 0);

      setPrivateUnreadCount(privateTotal);

      return countsData.reduce((acc, row) => ({
        ...acc,
        [row.channel_id]: row.unread_count,
      }), {});
    },
    enabled: !!session?.user?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Handle unread count changes
  const handleUnreadCountChange = useCallback(
    (isPrivate) => (count, channelId) => {
      if (isPrivate) {
        setPrivateUnreadCount(count);
      } else {
        setPublicUnreadCount(count);
      }
    },
    []
  );

  // Calculate total unread count
  const totalUnread = useMemo(() => {
    return publicUnreadCount + privateUnreadCount;
  }, [publicUnreadCount, privateUnreadCount]);

  // Notify parent
  useEffect(() => {
    if (onTotalUnreadChange) {
      onTotalUnreadChange(totalUnread);
    }
  }, [totalUnread, onTotalUnreadChange]);

  // Generate pill options
  const pillOptions = useMemo(() => {
    return channels.map((channel) => {
      const isSubscribed = channel.is_public || subscribedChannelIds.includes(channel.id);
      const unreadCount = unreadCounts[channel.id] || 0;

      return {
        label: (
          <span>
            {channel.slug}
            {!isSubscribed && <LockOutline style={{ marginLeft: 4 }} />}
            {unreadCount > 0 && <Badge content=" " color="#f5222d" style={{ marginLeft: 4 }} />}
          </span>
        ),
        value: channel.id,
        isPublic: channel.is_public,
        isPrivate: !channel.is_public, // RAVI- check if needed?
      };
    });
  }, [channels, subscribedChannelIds, unreadCounts]);

  // Responsive split for pills
  const maxVisiblePills = 3;
  const visiblePills = pillOptions.slice(0, maxVisiblePills);
  const overflowPills = pillOptions.slice(maxVisiblePills);

  // Styles
  const scrollWrapperStyle = {
    display: 'flex',
    overflowX: 'auto',
    flexGrow: 1,
    gap: '8px',
    padding: '0 12px',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  };

  const scrollWrapperClass = `
    .pill-scroll-wrapper::-webkit-scrollbar {
      display: none;
    }
  `;

  if (channelsLoading) {
    return <LoadingComponent/>;
  }

  return (
    <>
      <style>{scrollWrapperClass}</style>
      <div style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden', padding: '8px 0', backgroundColor: '#f5f5f5', borderRadius: '8px', marginBottom: '12px' }}>
          <div style={scrollWrapperStyle} className="pill-scroll-wrapper">
            {pillOptions.map((option) => (
              <Button
                key={option.value}
                size="small"
                color={activePill === option.value ? 'primary' : 'default'}
                fill={activePill === option.value ? 'solid' : 'outline'}
                style={{
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                  borderRadius: '20px',
                  fontWeight: '500',
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
                  style={{
                    borderRadius: '6px',
                    margin: '4px 0',
                    textAlign: 'left',
                  }}
                  onClick={() => setActivePill(option.value)}
                >
                  {option.label}
                </Button>
              ))}
              trigger="click"
              placement="bottom-end"
            >
              <Button
                size="small"
                style={{
                  marginLeft: '8px',
                  color: 'var(--adm-color-primary)',
                  background: 'transparent',
                }}
              >
                <UnorderedListOutlined />
              </Button>
            </Popover>
          )}
        </div>

        {channels.map((channel) => {
          if (activePill !== channel.id) return null;

          return (
            <div key={channel.id} style={{ marginTop: '12px' }}>
              <Channels
                channelId={channel.id}
                // isPrivate={channel.is_inbox}
                // onUnreadCountChange={handleUnreadCountChange(channel.is_inbox)}

                isPrivate={!channel.is_public}
                onUnreadCountChange={handleUnreadCountChange(!channel.is_public)}
              />
            </div>
          );
        })}
      </div>
    </>
  );
};

export default ChannelTabs;