import React, { useState } from "react";
import GanttChart from "./GanttChart";
import processBlueprint from '../processv5.json';
import { calculateTaskDates } from "./taskScheduler";
import { Input, Tabs } from "antd";
import CalendarChart from "./CalendarChart";
import TimelineChart from "./TimelineChart";

const ProjectPlan = () => {
    const [scenario, setScenario] = useState("likely"); // Default scenario
    const [startDate, setStartDate] = useState(new Date()); // Default to current time

    const orderDetails = {
        orderId: "123",
        startDateTime: startDate,
    };

    const tasks = processBlueprint?.blueprint?.workflows[0]?.steps?.flatMap((step) =>
        step.tasks.map((task) => ({
            id: task?.id,
            name: task?.name,
            lead_time: task?.lead_time[scenario],
            dependencies: task?.dependencies || [],
        }))
    );
    console.log("dd", tasks, orderDetails.startDateTime);
    const taskDates = calculateTaskDates(tasks, orderDetails.startDateTime);

    const tabItems = [
        {
            key: '1',
            label: 'Gantt Chart',
            children: (
                <GanttChart
                    processBlueprint={processBlueprint}
                    orderDetails={orderDetails}
                    scenario={scenario}
                />
            )
        },
        // {
        //     key: '2',
        //     label: 'Calendar',
        //     children: <CalendarChart tasks={processBlueprint.blueprint.workflows[0].steps.flatMap(step => step.tasks)} scenario={scenario} startDateTime={orderDetails.startDateTime} />
        // },
        // {
        //     key: '3',
        //     label: 'Timeline',
        //     children: <TimelineChart tasks={processBlueprint.blueprint.workflows[0].steps.flatMap(step => step.tasks)} scenario={scenario} startDateTime={orderDetails.startDateTime} />
        // }
        {
            key: '2',
            label: 'Calendar',
            children: <CalendarChart tasks={tasks} taskDates={taskDates} />
        },
        {
            key: '3',
            label: 'Timeline',
            children: <TimelineChart tasks={tasks} taskDates={taskDates} />
        }
    ];

    return (
        <div>
            <h1>Project Plan for Order #{orderDetails.orderId}</h1>
            <Input
                type="datetime-local"
                value={startDate.toISOString().slice(0, 16)}
                onChange={(e) => setStartDate(new Date(e.target.value))}
            />
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <button onClick={() => setScenario("optimistic")}>Optimistic</button>
                <button onClick={() => setScenario("likely")}>Likely</button>
                <button onClick={() => setScenario("pessimistic")}>Pessimistic</button>
                <button onClick={() => setScenario("aspirational")}>Aspirational</button>
            </div>
            {/* <GanttChart
                processBlueprint={processBlueprint}
                orderDetails={orderDetails}
                scenario={scenario}
            /> */}
            <Tabs defaultActiveKey="1" items={tabItems} />
        </div>
    );
};

export default ProjectPlan;