import React, { useState } from 'react';
import { Tabs } from 'antd-mobile'; // Import from antd-mobile
import Channels from './index'; // Assuming Channels is in the same directory
import './styles.css'; // Add custom CSS file
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { Link } from 'react-router-dom';

const ChannelsPage = () => {
  const [activeChannelName, setActiveChannelName] = useState('Channels'); // Default label for Tab 1
  const [activeTab, setActiveTab] = useState('1'); // State to track active tab

  // Callback to update the tab label when a channel is selected in Tab 1
  const handleChannelChange = (channel) => {
    if (channel) {
      setActiveChannelName(channel.slug); // Update Tab 1 label with selected channel's slug
    } else {
      setActiveChannelName('Channels'); // Reset to default if no channel is selected
    }
  };

  // Handle tab change
  const handleTabChange = (key) => {
    setActiveTab(key); // Update active tab on click
  };

  return (
    <div className="channels-page">
      <Tabs
        activeKey={activeTab} // Controlled by state
        onChange={handleTabChange} // Update active tab on click
        stretch // Make tabs stretch to full width
        className="custom-tabs" // Add custom class for styling
      >
        <Tabs.Tab title={activeChannelName} key="1">
          <Channels
            isPrivate={false}
            onChannelChange={handleChannelChange} // Pass callback to Channels
          />
        </Tabs.Tab>
        <Tabs.Tab title="Messages" key="2">
          <Channels isPrivate={true} />
          {/* <h3>Find members and Send private message <span style={{ color: 'blue', cursor: 'pointer' }} onClick={handleNavigateToMembers}>from here...</span></h3> */}
                <div style={{ textAlign: "center;" }}>
                  <p>You can find members and Send private message <Link to={`${APP_PREFIX_PATH}/members`}> from here...</Link></p>
                </div>
        </Tabs.Tab>
      </Tabs>
    </div>
  );
};

export default ChannelsPage;