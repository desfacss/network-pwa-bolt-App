// App.js
import React, { useState } from 'react';
import { Tabs } from 'antd';
import StatusTab from './Details/Status';
import NotesTab from './Details/Notes';
import FilesTab from './Details/Files';
import AllocationsTab from './Details/Allocations';

const DetailsView = ({ entityType, viewConfig, editItem, DetailsCard }) => {
    const [activeKey, setActiveKey] = useState('1'); // Initialize active tab

    const onChange = (key) => {
        setActiveKey(key);
    };

    return (
        <div style={{ padding: '20px' }}> {/* Added padding for better visuals */}
            {/* <DetailsCard /> */}
            <Tabs
                activeKey={activeKey}
                onChange={onChange}
                items={[
                    {
                        key: '1',
                        label: 'Status',
                        children: <StatusTab />,
                    },
                    {
                        key: '2',
                        label: 'Notes',
                        children: <NotesTab />,
                    },
                    {
                        key: '3',
                        label: 'Files',
                        children: <FilesTab />,
                    },
                    {
                        key: '4',
                        label: 'Allocations',
                        children: <AllocationsTab entityType={entityType} viewConfig={viewConfig} editItem={editItem} />,
                    },
                ]}
            />
        </div>
    );
};

export default DetailsView;








