// App.js
import React, { useState, lazy, Suspense } from 'react';
import { Tabs } from 'antd';
import StatusTab from '../Details/Status';
import NotesTab from '../Details/Notes';
import FilesTab from '../Details/Files';
import DetailOverview from './DetailOverview';
const DynamicComponent = lazy(() => import('../Details/DynamicTab'));
// import AllocationsTab from './Details/Allocations';

// Lazy load dynamic components.  This is crucial for performance.
// const AllocationsTab = lazy(() => import('src/views/pages/DynamicViews/Details/Allocations.js'));

const DetailsView = ({ entityType, viewConfig, editItem, DetailsCard, rawData, openMessageModal }) => {
    const [activeKey, setActiveKey] = useState('Overview'); // Initialize active tab

    const onChange = (key) => {
        setActiveKey(key);
    };
    console.log("vcx", viewConfig?.allocations);

    const generateTabs = () => {
        const tabs = [];

        const staticTabs = [
            { key: 'Overview', label: 'Overview', component: <DetailOverview openMessageModal={openMessageModal} data={editItem} config={viewConfig?.details_overview} /> },
            { key: 'Status', label: 'Status', component: <StatusTab /> },
            { key: 'Notes', label: 'Notes', component: <NotesTab /> },
            { key: 'Files', label: 'Files', component: <FilesTab editItem={editItem} rawData={rawData} /> },
        ];

        // staticTabs?.forEach(tabConfig => {
        //     if (viewConfig && viewConfig?.detailview && viewConfig?.detailview?.staticTabs?.map(tab => tab?.tab)[tabConfig?.label?.toLowerCase()] === true) {
        //         tabs?.push({
        //             key: tabConfig?.key,
        //             label: tabConfig?.label,
        //             children: tabConfig?.component,
        //         });
        //     }
        // });

        // Handle static tabs from new format
        staticTabs?.forEach(tabConfig => {
            if (viewConfig?.detailview?.staticTabs?.some(tab =>
                tab?.tab?.toLowerCase() === tabConfig?.label?.toLowerCase()
            )) {
                tabs?.push({
                    key: tabConfig?.key,
                    label: tabConfig?.label,
                    children: tabConfig?.component,
                });
            }
        });

        // // Dynamic Tabs
        // if (viewConfig && viewConfig?.detailview?.dynamicTabs) { // Check for dynamicTabs in config
        //     for (const tabConfig of viewConfig?.detailview?.dynamicTabs) {
        //         const tabProps = tabConfig?.props
        //         // console.log("tp", tabConfig);
        //         // const DynamicComponent = lazy(() => import('../Details/DynamicTab')); // Dynamic import
        //         tabs?.push({
        //             key: tabConfig?.label?.toLowerCase(), // Use key from config or label
        //             label: tabConfig?.label,
        //             children: (
        //                 <Suspense fallback={<div>Loading {tabConfig?.label}...</div>}> {/* Important! */}
        //                     <DynamicComponent entityType={tabProps?.entityType} viewConfig={viewConfig} editItem={editItem}
        //                         fetchFilters={tabProps?.filters} tabs={tabProps?.tabs}
        //                     // {...tabConfig?.props}
        //                     /> {/* Pass props */}
        //                 </Suspense>
        //             ),
        //         });
        //     }
        // }

        // Dynamic Tabs
        if (viewConfig && viewConfig?.detailview?.dynamicTabs) {
            for (const tabConfig of viewConfig?.detailview?.dynamicTabs) {
                const tabProps = tabConfig?.props;

                const safeEditItem = editItem || {};
                // Transform filters using editItem values
                const transformedFilters = tabProps?.filters?.map(filter => ({
                    column: filter.column,
                    value: filter.value in safeEditItem ? safeEditItem[filter.value] : filter.value
                })) || [];

                tabs?.push({
                    key: tabConfig?.label?.toLowerCase(),
                    label: tabConfig?.label,
                    children: (
                        <Suspense fallback={<div>Loading {tabConfig?.label}...</div>}>
                            <DynamicComponent
                                entityType={tabProps?.entityType}
                                viewConfig={viewConfig}
                                editItem={editItem}
                                fetchFilters={transformedFilters}
                                tabs={tabProps?.tabs}
                            />
                        </Suspense>
                    ),
                });
            }
        }

        return tabs;
    };

    const tabs = generateTabs();

    if (tabs.length === 1) {
        return (
            <div style={{ padding: '20px' }}>
                {tabs[0].children}
            </div>
        );
    }
    return (
        <div style={{ padding: '20px' }}> {/* Added padding for better visuals */}
            {/* <DetailsCard /> */}
            <Tabs
                activeKey={activeKey}
                onChange={onChange}
                items={tabs}
            />
        </div>
    );
};

export default DetailsView;