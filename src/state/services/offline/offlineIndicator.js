import React from 'react';
import { Alert } from 'antd';

export const OfflineIndicator = ({ isOnline, pendingSyncs }) => (
    <div className="offline-indicator">
        {!isOnline && (
            <Alert
                message="You are offline"
                description={`Changes will be synchronized when you reconnect.Pending changes: ${pendingSyncs}`}
                type="warning"
                showIcon
            />
        )}
    </div>
);