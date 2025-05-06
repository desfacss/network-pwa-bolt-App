import NotificationPermission from 'components/common/NotificationPermission';
import SummaryEmailToggle from 'components/common/SummaryEmailToggle';
import React from 'react';

const Permissions = () => {
    return (
        <>
            <NotificationPermission/>
            <SummaryEmailToggle/>
        </>
    );
};

export default Permissions;
