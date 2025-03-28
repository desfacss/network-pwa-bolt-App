import React, { useState } from 'react';
import { Tabs } from 'antd-mobile'; // Import from antd-mobile
import Channels from './index'; // Assuming Channels is in the same directory
import { Card } from 'antd';

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
        setActiveTab(key); // Update the active tab when clicked
    };

    return (
        <Card >
            <Tabs
                activeKey={activeTab} // Controlled by state
                onChange={handleTabChange} // Update active tab on click
            >
                <Tabs.Tab title={activeChannelName} key="1">
                    <Channels
                        isPrivate={false}
                        onChannelChange={handleChannelChange} // Pass callback to Channels
                    />
                </Tabs.Tab>
                <Tabs.Tab title="Messages" key="2">
                    <Channels isPrivate={true} />
                </Tabs.Tab>
            </Tabs>
        </Card>
    );
};

export default ChannelsPage;