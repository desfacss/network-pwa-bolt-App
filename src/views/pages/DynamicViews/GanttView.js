import React, { useState } from "react";
import { Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";

const GanttChart = ({ data }) => {
    const [viewMode, setViewMode] = useState(ViewMode.Day);

    const tasks = data?.map(event => ({

        id: event?.id || "default-id",
        name: event?.name || "Unnamed Task",
        start: event?.start_date ? new Date(event?.start_date) : new Date(),
        end: event?.due_date ? new Date(event?.due_date) : new Date(),
        progress: event?.progress || 0,
        // dependencies: Array.isArray(event?.dependencies) ? event?.dependencies : [],
        type: "task",
        isDisabled: false, // Allows dragging and resizing
    }));

    const handleZoomChange = (mode) => {
        setViewMode(mode);
    };

    return (
        <div style={{ height: "600px" }}>
            <div style={{ marginBottom: "10px" }}>
                <button onClick={() => handleZoomChange(ViewMode.Hour)}>Hour</button>
                <button onClick={() => handleZoomChange(ViewMode.Day)}>Day</button>
                <button onClick={() => handleZoomChange(ViewMode.Week)}>Week</button>
                <button onClick={() => handleZoomChange(ViewMode.Month)}>Month</button>
            </div>
            <Gantt
                tasks={tasks}
                viewMode={viewMode}
                columnWidth={viewMode === ViewMode.Month ? 300 : 65} // Adjust column width dynamically
                onDateChange={(task, children) => {
                    console.log("Task updated:", task, children);
                }}
                onProgressChange={(task) => {
                    console.log("Progress updated:", task);
                }}
                onDoubleClick={(task) => {
                    console.log("Task double-clicked:", task);
                }}
                onSelect={(task, isSelected) => {
                    console.log(`${task.name} ${isSelected ? "selected" : "deselected"}`);
                }}
            />
        </div>
    );
};

export default GanttChart;
