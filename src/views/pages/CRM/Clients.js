import React from 'react';
import { Tabs } from 'antd';
import DynamicViews from '../DynamicViews';

const Index = () => {
    const myClientsFilter = {
        ownerId: 'currentUserId', // Replace with actual logic
    };

    const teamClientsFilter = {
        teamId: 'currentTeamId', // Replace with actual logic
    };

    const renderTabContent = ({ availableViews, globalFilters }) => {
        return (
            <div>
                {/* Render global filters */}
                <div style={{ marginBottom: 16 }}>{globalFilters}</div>

                {/* Render tabs with icons */}
                <Tabs
                    defaultActiveKey={availableViews[0]?.key} // Default to the first view
                    tabBarStyle={{ display: 'flex', justifyContent: 'start' }}
                    items={availableViews.map((view) => ({
                        key: view.key,
                        label: (
                            <span>
                                {view.icon} {view.label}
                            </span>
                        ),
                        children: view.children,
                    }))}
                />
            </div>
        );
    };

    const tabItems = [
        {
            key: 'myClients',
            label: 'My Clients',
            children: (
                <DynamicViews
                    entityType={'crm_clients'}
                    fetchFilters={[myClientsFilter]}
                    renderView={renderTabContent}
                />
            ),
        },
        {
            key: 'teamClients',
            label: 'Team Clients',
            children: (
                <DynamicViews
                    entityType={'crm_clients'}
                    fetchFilters={[teamClientsFilter]}
                    renderView={renderTabContent}
                />
            ),
        },
    ];

    return <Tabs items={tabItems} />;
};

export default Index;