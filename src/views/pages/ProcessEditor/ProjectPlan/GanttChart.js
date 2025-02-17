import React from "react";
import { Gantt } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { calculateTaskDates } from "./taskScheduler";

const GanttChart = ({ processBlueprint, orderDetails, scenario }) => {
    // Extract tasks from the process blueprint
    const tasks = processBlueprint?.blueprint?.workflows[0]?.steps?.flatMap((step) =>
        step.tasks.map((task) => ({
            id: task?.id,
            name: task?.name,
            lead_time: task?.lead_time[scenario],
            dependencies: task?.dependencies || [],
        }))
    );

    // Calculate task dates using the utility function
    const taskDates = calculateTaskDates(tasks, orderDetails?.startDateTime);

    // Format tasks for gantt-task-react
    const formattedTasks = tasks?.map((task) => ({
        id: task.id,
        name: task.name,
        start: taskDates[task?.id]?.start,
        end: taskDates[task?.id]?.end,
        progress: 0,
        type: "task",
        isDisabled: false,
    }));
    console.log("tt", tasks, taskDates, orderDetails?.startDateTime);
    return (
        <div>
            <h2>Gantt Chart - {scenario?.charAt(0).toUpperCase() + scenario?.slice(1)}</h2>
            <Gantt tasks={formattedTasks} />
        </div>
    );
};

export default GanttChart;