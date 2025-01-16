// Rules - If Lane by = Status, take complete value from workflow_configurations.name and show in sequence and color lany
// The lane dragdrop should be false
// - If Lane by = Priority, take complete value as static values for now (but can be from enum table or type table)
// The lane dragdrop is True
// FUTURE - ADD CONFIG IN KANBAN VIEW (SAME AS IN FORM STATIC OR ENUM TABLE >> COLUMN >> DETAIL >> NAME)

import { Button, Drawer, Dropdown, Menu, Select } from 'antd';
import React, { useState } from 'react';
import Board from 'react-trello';
import { ExportOutlined } from '@ant-design/icons';
import DynamicForm from '../DynamicForm';

const { Option } = Select;

const KanbanView = ({ data, viewConfig, workflowConfig, updateData, onFinish, openDrawer, deleteData }) => {

    const dynamicBulkActions = viewConfig?.tableview?.actions?.bulk?.filter(action =>
        action?.includes("add_new_")
    );
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

    // const priorityType = [{
    //     name: "Low", sequence: 1, color: "",
    //     name: "Medium", sequence: 2, color: "",
    //     name: "High", sequence: 3, color: "",
    //     name: "Critical", sequence: 4, color: ""
    // }]
    const { kanbanview } = viewConfig;
    console.log("tt", data)
    const priorityType = [
        { name: "Low", sequence: 1, color: "" },
        { name: "Medium", sequence: 2, color: "" },
        { name: "High", sequence: 3, color: "" },
        { name: "Critical", sequence: 4, color: "" }
    ];
    const [editingCard, setEditingCard] = useState(null); // Track the card being edited
    const [editedCard, setEditedCard] = useState(null); // Store edits temporarily
    const [groupBy, setGroupBy] = useState(kanbanview.groups[0]);


    // Function to group data dynamically based on config
    const groupData = (data, groupBy) => {
        return data.reduce((acc, item) => {
            const groupKey = item[groupBy] || 'Todo';
            if (!acc[groupKey]) {
                acc[groupKey] = [];
            }
            acc[groupKey].push(item);
            return acc;
        }, {});
    };

    // // Transform data to the format required by react-trello
    // const buildBoardData = () => {
    //     const groupedData = groupData(data, kanbanview?.groupBy);
    //     return {
    //         lanes: Object.keys(groupedData)?.map((key) => ({
    //             id: key,
    //             title: key,
    //             cards: groupedData[key]?.map((item) => ({
    //                 id: item?.id,
    //                 title: item?.name,
    //                 description: kanbanview?.fields?.includes('description') ? item?.description : '',
    //                 label: kanbanview?.fields?.includes('due_date') ? `Due: ${item?.due_date}` : '',
    //                 tags: item?.tags?.map((tag) => ({ title: tag })),
    //                 metadata: item,
    //             })),
    //         })),
    //     };
    // };

    const buildBoardData = () => {
        const groupedData = groupData(data, groupBy);

        // Determine the source based on the lane grouping type (status or priority)
        console.log("lk", workflowConfig, workflowConfig?.details?.stages?.map(stage => stage?.name))
        const source = groupBy === "priority"
            ? priorityType
            : workflowConfig?.details?.stages?.map(stage => ({ name: stage?.name, sequence: stage.sequence, color: stage?.color })) || [];

        return {
            lanes: source
                .sort((a, b) => a.sequence - b.sequence) // Sort by sequence
                .map((config) => ({
                    id: config.name,
                    title: config.name,
                    cards: (groupedData[config.name] || []).map((item) => ({
                        id: item?.id,
                        title: item?.name,
                        description: kanbanview?.fields?.includes('description') ? item?.description : '',
                        label: kanbanview?.fields?.includes('due_date') ? `Due: ${item?.due_date}` : '',
                        tags: item?.tags?.map((tag) => ({ title: tag })),
                        metadata: item,
                    })),
                    style: {
                        backgroundColor: config.color || '#f4f5f7',
                    },
                    // If lane is 'priority', disable drag/drop
                    canDrag: groupBy !== 'priority',
                    canAddCard: groupBy !== 'priority', // Disable adding new cards to priority lanes
                })),
        };
    };

    // // Transform data to the format required by react-trello
    // const buildBoardData = () => {
    //     const groupedData = groupData(data, kanbanview?.groupBy);
    //     const source =
    //         kanbanview?.groupBy === "priority"
    //             ? priorityType
    //             : workflowConfig?.stages || [];

    //     return {
    //         lanes: source
    //             .sort((a, b) => a.sequence - b.sequence) // Sort by sequence
    //             .map((config) => ({
    //                 id: config.name,
    //                 title: config.name,
    //                 cards: (groupedData[config.name] || []).map((item) => ({
    //                     id: item?.id,
    //                     title: item?.name,
    //                     description: kanbanview?.fields?.includes('description') ? item?.description : '',
    //                     label: kanbanview?.fields?.includes('due_date') ? `Due: ${item?.due_date}` : '',
    //                     tags: item?.tags?.map((tag) => ({ title: tag })),
    //                     metadata: item,
    //                 })),
    //                 style: {
    //                     backgroundColor: config.color,
    //                 },
    //             })),
    //     };
    // };




    // const buildBoardData = () => {
    //     // Define lanes based on groupBy
    //     const lanes = (kanbanview?.groupBy === "priority" ? priorityType : workflowConfig?.stages || [])
    //         .sort((a, b) => a.sequence - b.sequence) // Sort by sequence
    //         .map((config) => ({
    //             id: config.name,
    //             title: config.name,
    //             cards: [], // Initialize empty cards array
    //             style: { backgroundColor: config.color },
    //         }));

    //     // Create a map for quick access to lanes
    //     const laneMap = Object.fromEntries(lanes.map((lane) => [lane.id, lane]));

    //     // Assign items to lanes
    //     data.forEach((item) => {
    //         const groupKey = item[kanbanview?.groupBy] || 'Todo';
    //         if (laneMap[groupKey]) {
    //             laneMap[groupKey].cards.push({
    //                 id: item?.id,
    //                 title: item?.name,
    //                 description: kanbanview?.fields?.includes('description') ? item?.description : '',
    //                 label: kanbanview?.fields?.includes('due_date') ? `Due: ${item?.due_date}` : '',
    //                 tags: item?.tags?.map((tag) => ({ title: tag })),
    //                 metadata: item,
    //             });
    //         } else {
    //             // Handle uncategorized or invalid group
    //             if (!laneMap['Uncategorized']) {
    //                 laneMap['Uncategorized'] = {
    //                     id: 'Uncategorized',
    //                     title: 'Uncategorized',
    //                     cards: [],
    //                     style: { backgroundColor: '#f4f5f7' },
    //                 };
    //             }
    //             laneMap['Uncategorized'].cards.push({
    //                 id: item?.id,
    //                 title: item?.name,
    //                 description: kanbanview?.fields?.includes('description') ? item?.description : '',
    //                 label: kanbanview?.fields?.includes('due_date') ? `Due: ${item?.due_date}` : '',
    //                 tags: item?.tags?.map((tag) => ({ title: tag })),
    //                 metadata: item,
    //             });
    //         }
    //     });

    //     // Return the lanes array
    //     return { lanes: Object.values(laneMap) };
    // };


    const handleCardMove = (cardId, sourceLaneId, targetLaneId) => {
        const updatedItem = data.find((item) => item?.id === cardId);
        if (updatedItem) {
            const editItem = { ...updatedItem }
            updatedItem[groupBy] = targetLaneId;
            console.log("uP", updatedItem)
            onFinish(updatedItem, editItem);
        }
    };

    const handleCardClick = (cardId) => {
        const cardToEdit = data.find((item) => item?.id === cardId);
        setEditingCard(cardToEdit);
        setEditedCard({ ...cardToEdit }); // Create a copy for editing
    };

    const handleEditChange = (field, value) => {
        setEditedCard((prev) => ({ ...prev, [field]: value }));
    };

    const saveChanges = () => {
        updateData(editedCard);
        setEditingCard(null);
    };

    const cancelEditing = () => {
        setEditingCard(null);
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
                        {viewConfig.kanbanview.groups.map((group) => (
                            <Option key={group} value={group}>
                                {group.charAt(0).toUpperCase() + group.slice(1)}
                            </Option>
                        ))}
                    </Select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {/* Bulk Actions */}
                    {[
                        ...(dynamicBulkActions || []),
                        ...viewConfig?.tableview?.bulkActions//?.filter(action => !action.includes("add_new_"))
                    ].map((action) => (
                        <Button
                            key={action}
                            type="primary"
                            style={{ marginRight: 8 }}
                            onClick={() => handleBulkAction(action)}
                        >
                            {action
                                .split('_')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(' ')}
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
                data={buildBoardData()}
                draggable
                handleDragEnd={handleCardMove}
                onCardClick={(cardId, metadata) => openDrawer(metadata)} // Handle card click
                laneStyle={{
                    backgroundColor: '#f4f5f7',
                    borderRadius: '5px',
                    padding: '10px',
                }}
                cardStyle={{
                    borderRadius: '5px',
                    border: '1px solid #ddd',
                    padding: '10px',
                    backgroundColor: '#fff',
                }}
            />
            {/* Modal for editing card */}
            {/* {editingCard && (
                <div style={modalStyle}>
                    <h3>Edit Card</h3>
                    <label>
                        Title:
                        <input
                            type="text"
                            value={editedCard.name}
                            onChange={(e) => handleEditChange('name', e.target.value)}
                        />
                    </label>
                    <label>
                        Description:
                        <textarea
                            value={editedCard.description}
                            onChange={(e) => handleEditChange('description', e.target.value)}
                        />
                    </label>
                    <label>
                        Due Date:
                        <input
                            type="date"
                            value={editedCard.due_date}
                            onChange={(e) => handleEditChange('due_date', e.target.value)}
                        />
                    </label>
                    <button onClick={saveChanges}>Save</button>
                    <button onClick={cancelEditing}>Cancel</button>
                </div>
            )} */}
        </>
    );
};

// Basic styles for the modal
const modalStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '5px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    zIndex: 1000,
};

export default KanbanView;
