import React from 'react';
import Board from 'react-trello';

const KanbanView = ({ data, viewConfig, updateData }) => {
    // console.log("DT", data)
    const { kanbanview } = viewConfig
    // Function to group data dynamically based on config
    const groupData = (data, groupBy) => {
        return data.reduce((acc, item) => {
            const groupKey = item[groupBy] || 'Uncategorized';
            if (!acc[groupKey]) {
                acc[groupKey] = [];
            }
            acc[groupKey].push(item);
            return acc;
        }, {});
    };

    // Transform data to the format required by react-trello
    const buildBoardData = () => {
        const groupedData = groupData(data, kanbanview?.groupBy);
        return {
            lanes: Object.keys(groupedData)?.map((key) => ({
                id: key,
                title: key,
                cards: groupedData[key]?.map((item) => ({
                    id: item?.id,
                    title: item?.name,
                    description: kanbanview?.fields?.includes('description') ? item?.description : '',
                    label: kanbanview?.fields?.includes('due_date') ? `Due: ${item?.due_date}` : '',
                    tags: item?.tags?.map((tag) => ({ title: tag })),
                    metadata: item,
                }))
            }))
        };
    };

    const handleCardMove = (cardId, sourceLaneId, targetLaneId) => {
        const updatedItem = data.find((item) => item?.id === cardId);
        if (updatedItem) {
            updatedItem[kanbanview?.groupBy] = targetLaneId;
            // console.log("UD", updatedItem, cardId, sourceLaneId, targetLaneId)
            updateData(updatedItem);
        }
    };

    return (
        <Board
            data={buildBoardData()}
            draggable
            handleDragEnd={handleCardMove}
            laneStyle={{
                backgroundColor: '#f4f5f7',
                borderRadius: '5px',
                padding: '10px',
            }}
            cardStyle={{
                borderRadius: '5px',
                border: '1px solid #ddd',
                padding: '10px',
                backgroundColor: '#fff'
            }}
        />
    );
};

export default KanbanView;