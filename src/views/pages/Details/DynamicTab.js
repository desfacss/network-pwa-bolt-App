// AllocationsTab.js
import React from 'react';
import DynamicForm from 'views/pages/DynamicForm';
import { handleAllocations } from '../DynamicViews/utils';
import DynamicViews from '../DynamicViews';

const DynamicTab = ({ entityType, viewConfig, editItem }) => {

    console.log(viewConfig, editItem);
    return (
        <div>
            {/* <DynamicForm schemas={viewConfig?.allocations} onFinish={(formData) => handleAllocations(formData, viewConfig?.data_config?.allocationsTable, editItem?.id)} /> */}
            <DynamicViews entityType={entityType} />
        </div>
    );
};

export default DynamicTab;