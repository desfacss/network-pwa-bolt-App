import React, { useState, useEffect } from 'react';
import { Badge } from 'antd';
import { Tabs } from 'antd-mobile';
import Channels from './index';
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { Link } from 'react-router-dom';
import { supabase } from 'configs/SupabaseConfig';
import { useSelector } from 'react-redux';

const ChannelTabs = ({ onTotalUnreadChange }) => {
  const [publicUnreadCount, setPublicUnreadCount] = useState(0); // Now specific to active public channel
  const [privateUnreadCount, setPrivateUnreadCount] = useState(0); // Total private unread count
  const [publicActiveChannel, setPublicActiveChannel] = useState(null);
  const [privateActiveChannel, setPrivateActiveChannel] = useState(null);
  const [activeTab, setActiveTab] = useState('1');
  const { session } = useSelector((state) => state.auth);

  // Fetch unread counts for both public and private channels on mount
  useEffect(() => {
    const fetchInitialUnreadCounts = async () => {
      if (!session?.user?.id) return;

      const { data: unreadData, error } = await supabase.rpc("get_unread_counts", { user_id: session.user.id });
      if (error) {
        console.error("Error fetching initial unread counts:", error);
        return;
      }

      // Fetch all channels to map IDs to public/private
      const { data: allChannels, error: channelError } = await supabase
        .from('channels')
        .select('id, is_inbox');

      if (channelError) {
        console.error("Error fetching channels:", channelError);
        return;
      }

      const privateChannelIds = allChannels.filter(ch => ch.is_inbox).map(ch => ch.id);
      const publicChannelIds = allChannels.filter(ch => !ch.is_inbox).map(ch => ch.id);

      const privateTotal = unreadData
        .filter(row => privateChannelIds.includes(row.channel_id))
        .reduce((sum, row) => sum + row.unread_count, 0);

      setPrivateUnreadCount(privateTotal);
    };

    fetchInitialUnreadCounts();
  }, [session]);

  const handleUnreadCountChange = (isPrivate) => (count, channelId) => {
    console.log(`Unread count for ${isPrivate ? 'private' : 'public'} channel ${channelId}: ${count}`);
    if (isPrivate) {
      setPrivateUnreadCount(count); // This will still reflect total private count from Channels
    } else if (publicActiveChannel && channelId === publicActiveChannel.id) {
      setPublicUnreadCount(count); // Only update if it matches the active public channel
    }
  };

  const handleChannelChange = (isPrivate) => (channel) => {
    console.log(`Active channel for ${isPrivate ? 'private' : 'public'}: ${channel?.slug}`);
    if (isPrivate) {
      setPrivateActiveChannel(channel);
    } else {
      setPublicActiveChannel(channel);
      // Update public unread count based on the newly selected channel
      if (channel && unreadCounts[channel.id] !== undefined) {
        setPublicUnreadCount(unreadCounts[channel.id] || 0);
      }
    }
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  // Track unread counts for all channels to pass down
  const [unreadCounts, setUnreadCounts] = useState({});

  useEffect(() => {
    const totalUnread = publicUnreadCount + privateUnreadCount;
    console.log(`Total unread count: ${totalUnread}`);
    if (onTotalUnreadChange) {
      onTotalUnreadChange(totalUnread);
    }
  }, [publicUnreadCount, privateUnreadCount, onTotalUnreadChange]);

  return (
    <Tabs
      activeKey={activeTab}
      onChange={handleTabChange}
      stretch
      className="custom-tabs"
    >
      <Tabs.Tab
        title={
          <span>
            {publicActiveChannel ? publicActiveChannel.slug : 'Public Channels'}{" "}
            {publicUnreadCount > 0 && (
              <Badge dot={publicUnreadCount}
                style={{ backgroundColor: '#f5222d' }}
              />
            )}
          </span>
        }
        key="1"
      >
        <Channels
          isPrivate={false}
          onChannelChange={handleChannelChange(false)}
          onUnreadCountChange={handleUnreadCountChange(false)}
          setUnreadCounts={setUnreadCounts} // Pass setter to update unread counts
        />
      </Tabs.Tab>
      <Tabs.Tab
        title={
          <span>
            {privateActiveChannel ? privateActiveChannel.slug : 'Private Messages'}{" "}
            {privateUnreadCount > 0 && (
              <Badge dot={privateUnreadCount}
                style={{ backgroundColor: '#f5222d' }}
              />
            )}
          </span>
        }
        key="2"
      >
        <Channels
          isPrivate={true}
          onChannelChange={handleChannelChange(true)}
          onUnreadCountChange={handleUnreadCountChange(true)}
          setUnreadCounts={setUnreadCounts}
        />
        <div style={{ textAlign: "center" }}>
          <p>You can find members and Send private message <Link to={`${APP_PREFIX_PATH}/members`}> from here...</Link></p>
        </div>
      </Tabs.Tab>
    </Tabs>
  );
};

export default ChannelTabs;