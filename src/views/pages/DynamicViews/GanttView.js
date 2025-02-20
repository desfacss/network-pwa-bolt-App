import React, { useState } from "react";
import { Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { Button, Drawer, Dropdown, Menu } from "antd";
import DynamicForm from "../DynamicForm";
import { ExportOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const GanttChart = ({ data, onFinish, openDrawer, deleteData, viewConfig }) => {
    const [viewMode, setViewMode] = useState(ViewMode.Day);

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

    const tasks = data?.map(event => ({
        id: event?.id || "default-id",
        name: event?.name || "Unnamed Task",
        start: event?.start_date ? new Date(event.start_date) : new Date(),
        end: event?.due_date ? new Date(event.due_date) : new Date(),
        progress: event?.progress || 0,
        type: "task",
        isDisabled: false,
    }));

    const handleZoomChange = (mode) => {
        setViewMode(mode);
    };

    const updateTask = (task, children) => {

        // Find the corresponding event in `data`
        const updatedEvent = data.find(event => event.id === task.id);
        if (updatedEvent) {
            // Update the date range in the event object
            updatedEvent.date_time_range = [
                // task.start.toISOString(),
                // task.end.toISOString(),
                dayjs(task.start).format("YYYY-MM-DD HH:mm:ss"),
                dayjs(task.end).format("YYYY-MM-DD HH:mm:ss")
            ];
            console.log("EU", updatedEvent)
            // Call the `onFinish` function with the updated event
            onFinish(updatedEvent, updatedEvent); // Use second argument for editing context
        }
    }

    const editTask = (task, children) => {

        // Find the corresponding event in `data`
        const updatedEvent = data.find(event => event.id === task.id);
        if (updatedEvent) {
            // Update the date range in the event object
            updatedEvent.date_time_range = [
                // task.start.toISOString(),
                // task.end.toISOString(),
                dayjs(task.start).format("YYYY-MM-DD HH:mm:ss"),
                dayjs(task.end).format("YYYY-MM-DD HH:mm:ss")
            ];
            console.log("ET", updatedEvent)
            // Call the `onFinish` function with the updated event
            openDrawer(updatedEvent); // Use second argument for editing context
        }
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'nowrap', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <Button onClick={() => handleZoomChange(ViewMode.Hour)}>Hour</Button>
                    <Button onClick={() => handleZoomChange(ViewMode.Day)}>Day</Button>
                    <Button onClick={() => handleZoomChange(ViewMode.Week)}>Week</Button>
                    <Button onClick={() => handleZoomChange(ViewMode.Month)}>Month</Button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {/* Bulk Actions */}
                    {[
                        ...viewConfig?.tableview?.actions?.bulk//?.filter(action => !action.includes("add_new_"))
                        //...(dynamicBulkActions || []),
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
            <Gantt
                tasks={tasks}
                viewMode={viewMode}
                columnWidth={viewMode === ViewMode.Month ? 300 : 65} // Adjust column width dynamically
                onDateChange={updateTask}
                onProgressChange={(task) => {
                    console.log("Progress updated:", task);
                }}
                onDoubleClick={editTask}
                onSelect={(task, isSelected) => {
                    console.log(`${task.name} ${isSelected ? "selected" : "deselected"}`);
                }}
            />
        </div>
    );
};

export default GanttChart;
