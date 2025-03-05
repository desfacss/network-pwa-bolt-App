// Rules - If Lane by = Status, take complete value from workflow_configurations.name and show in sequence and color lany
// The lane dragdrop should be false
// - If Lane by = Priority, take complete value as static values for now (but can be from enum table or type table)
// The lane dragdrop is True
// FUTURE - ADD CONFIG IN KANBAN VIEW (SAME AS IN FORM STATIC OR ENUM TABLE >> COLUMN >> DETAIL >> NAME)

import { Button, Dropdown, Menu, Select } from 'antd';
import React, { useState, useMemo } from 'react';
import Board from 'react-trello';
import { ExportOutlined } from '@ant-design/icons';

const { Option } = Select;

const KanbanView = ({ data, viewConfig, workflowConfig, updateData, onFinish, openDrawer, deleteData }) => {

    const { showFeatures, exportOptions, globalSearch } = viewConfig?.tableview;

    const handleExport = (type) => {
        console.log(`Export to ${type} triggered`);
    };

    const handleBulkAction = (action) => {
        if (action === "add_new_task") {
            openDrawer();
        } else {
            console.log(`Bulk action "${action}" triggered. Placeholder for now.`);
        }
    };

    const { kanbanview } = viewConfig;

    const [groupBy, setGroupBy] = useState(kanbanview?.groupBy || 'priority');

    // Function to group data dynamically based on config and fieldPath
    const groupData = (data, groupBy) => {
        const fieldPath = viewConfig?.kanbanview?.types[groupBy]?.fieldPath || groupBy;
        return data?.reduce((acc, item) => {
            const groupKey = item[fieldPath] || 'Todo';
            if (!acc[groupKey]) {
                acc[groupKey] = [];
            }
            acc[groupKey].push(item);
            return acc;
        }, {});
    };

    const buildBoardData = useMemo(() => {
        return () => { // Make it a function to be called in useMemo
            const groupedData = groupData(data, groupBy);

            const source = viewConfig?.kanbanview?.types[groupBy]?.lanes?.map(type => ({
                name: type?.name,
                sequence: type?.sequence,
                color: type?.color
            }));

            return {
                lanes: (source || [])
                    .sort((a, b) => a?.sequence - b?.sequence)
                    .map((config) => ({
                        id: config?.name,
                        title: config?.name,
                        // cards: (groupedData[config?.name] || [])?.map((item) => ({
                        //     id: item?.id,
                        //     title: item?.name,
                        //     description: kanbanview?.fields?.includes('description') ? item?.description : '',
                        //     label: kanbanview?.fields?.includes('due_date') ? `Due: ${item?.due_date}` : '',
                        //     tags: item?.tags?.map((tag) => ({ title: tag })),
                        //     metadata: item,
                        // })),
                        cards: (groupedData[config?.name] || [])?.map((item) => {
                            const cardFields = kanbanview?.cardFields || {};
                            return {
                                id: item?.id,
                                title: item[cardFields.title] || '',
                                description: item[cardFields.description] || '',
                                label: cardFields.label ? `Due: ${item[cardFields.label]}` : '',
                                tags: (item[cardFields.tags] || [])?.map((tag) => ({ title: tag })),
                                metadata: item,
                            };
                        }),
                        style: {
                            backgroundColor: config.color || '#f4f5f7',
                        },
                        canDrag: groupBy === 'status',
                        canAddCard: groupBy === 'status',
                    })),
            };
        };
    }, [data, groupBy, viewConfig, workflowConfig]); // Dependencies for useMemo

    const handleCardMove = (cardId, sourceLaneId, targetLaneId) => {
        const updatedItem = data.find((item) => item?.id === cardId);
        if (updatedItem) {
            const editItem = { ...updatedItem }
            const fieldPath = viewConfig?.kanbanview?.types[groupBy]?.fieldPath || groupBy;
            updatedItem[fieldPath] = targetLaneId;
            onFinish(updatedItem, editItem);
        }
    };

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'nowrap', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <Select
                        value={groupBy}
                        onChange={(value) => setGroupBy(value)}
                        style={{ width: 200 }}
                    >
                        {Object.keys(viewConfig?.kanbanview?.types || {}).map((group) => (
                            <Option key={group} value={group}>
                                {group?.charAt(0)?.toUpperCase() + group?.slice(1)}
                            </Option>
                        ))}
                    </Select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {/* Bulk Actions */}
                    {[
                        ...viewConfig?.tableview?.actions?.bulk//?.filter(action => !action.includes("add_new_"))
                    ].map((action) => (
                        <Button
                            key={action}
                            type="primary"
                            style={{ marginRight: 8 }}
                            onClick={() => handleBulkAction(action)}
                        >
                            {action
                                ?.split('_')
                                ?.map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                ?.join(' ')}
                        </Button>
                    ))}

                    {/* Export Dropdown with Icon */}
                    {exportOptions?.length > 0 && (
                        <Dropdown
                            overlay={
                                <Menu>
                                    {exportOptions.includes('csv') && (
                                        <Menu.Item key="csv" onClick={() => handleExport('CSV')}>
                                            Export to CSV
                                        </Menu.Item>
                                    )}
                                    {exportOptions.includes('pdf') && (
                                        <Menu.Item key="pdf" onClick={() => handleExport('PDF')}>
                                            Export to PDF
                                        </Menu.Item>
                                    )}
                                </Menu>
                            }
                            trigger={['click']}
                        >
                            <Button icon={<ExportOutlined />} style={{ marginLeft: 8 }} />
                        </Dropdown>
                    )}
                </div>
            </div>
            <Board editable canAddLanes
                style={boardStyle}
                cardStyle={cardStyle}
                laneStyle={laneStyle}
                laneTitleStyle={laneTitleStyle}
                data={buildBoardData()}
                draggable
                handleDragEnd={handleCardMove}
                onCardClick={(cardId, metadata) => openDrawer(metadata)}
            // laneStyle={{
            //     backgroundColor: '#f4f5f7',
            //     borderRadius: '5px',
            //     padding: '10px',
            // }}
            // cardStyle={{
            //     borderRadius: '5px',
            //     border: '1px solid #ddd',
            //     padding: '10px',
            //     backgroundColor: '#fff',
            // }}
            />
        </>
    );
};

const boardStyle = {
    backgroundColor: '#f8f8f8', // Very light background
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Subtle shadow
};

const laneStyle = {
    backgroundColor: '#f0f0f0', // Slightly darker lane background
    borderRadius: '8px',
    margin: '15px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
};

const laneTitleStyle = {
    backgroundColor: '#e8e8e8', // Subtle title background
    padding: '12px',
    borderRadius: '8px 8px 0 0',
    fontWeight: '600', // Slightly bolder title
    fontSize: '1.1em',
};

const cardStyle = {
    backgroundColor: '#ffffff', // White cards
    borderRadius: '6px',
    boxShadow: '0 3px 6px rgba(0, 0, 0, 0.1)', // Card shadow
    padding: '15px',
    transition: 'box-shadow 0.3s ease', // Smooth hover effect
    '&:hover': {
        boxShadow: '0 5px 10px rgba(0, 0, 0, 0.15)', // Enhanced hover shadow
    },
};

export default KanbanView;