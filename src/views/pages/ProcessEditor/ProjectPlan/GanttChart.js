import React from "react";
import { Gantt } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { calculateTaskDates } from "./taskScheduler";

const GanttChart = ({ processBlueprint, orderDetails, scenario }) => {
    const tasks = processBlueprint?.blueprint?.workflows[0]?.steps?.flatMap((step) =>
        step.tasks.map((task) => ({
            id: task?.id || `task-${Math.random()}`,
            name: task?.name || "Unnamed Task",
            lead_time: task?.lead_time?.[scenario] ?? 0,
            dependencies: task?.dependencies || [],
        }))
    ) || [];

    // More robust filtering
    const validTasks = tasks.filter(task => 
        task !== undefined && 
        task !== null && 
        typeof task.id === 'string' && 
        typeof task.lead_time === 'number'
    );

    // Check if we have any valid tasks before proceeding
    if (validTasks.length === 0) {
        console.error("No valid tasks found for scenario:", scenario);
        return (
            <div>
                <h2>Gantt Chart - {scenario?.charAt(0).toUpperCase() + scenario?.slice(1)}</h2>
                <p>No valid tasks available for this scenario.</p>
            </div>
        );
    }

    const taskDates = calculateTaskDates(validTasks, orderDetails?.startDateTime || new Date());

    // Format tasks for gantt-task-react
    const formattedTasks = validTasks.map((task) => {
        const dates = taskDates[task.id] || {};
        return {
            id: task.id,
            name: task.name,
            start: dates.start || new Date(),
            end: dates.end || new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
            progress: 0,
            type: "task",
            isDisabled: false,
        };
    });

    return (
        <div>
            <h2>Gantt Chart - {scenario?.charAt(0).toUpperCase() + scenario?.slice(1)}</h2>
            {formattedTasks.length > 0 ? (
                <Gantt tasks={formattedTasks} />
            ) : (
                <p>No valid tasks available to display.</p>
            )}
        </div>
    );
};

export default GanttChart;