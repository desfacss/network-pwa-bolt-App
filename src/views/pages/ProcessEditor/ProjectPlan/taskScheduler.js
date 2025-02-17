export const calculateTaskDates = (tasks, startDateTime) => {
    const taskDates = {};

    // Validate dependencies
    const taskIds = new Set(tasks.map((task) => task.id));
    tasks.forEach((task) => {
        task.dependencies.forEach((dep) => {
            if (!taskIds.has(dep.taskId)) {
                console.error(`Invalid dependency: Task ${task.id} depends on non-existent task ${dep.taskId}`);
            }
        });
    });

    // Topological sort to handle dependencies
    const sortedTasks = topologicalSort(tasks);

    sortedTasks.forEach((task) => {
        const leadTime = task.lead_time;

        // Default start date is the project start date
        let taskStart = new Date(startDateTime);

        // Adjust start date based on dependencies
        task.dependencies.forEach((dep) => {
            const depTaskId = dep.taskId;
            const depType = dep.type;
            const lag = dep.lag || 0;

            // Skip self-referencing dependencies
            if (depTaskId === task.id) {
                console.warn(`Self-referencing dependency detected for task ${task.id}. Skipping.`);
                return;
            }

            // Ensure the dependency has been calculated
            if (!taskDates[depTaskId]) {
                console.error(`Dependency ${depTaskId} for task ${task.id} has not been calculated yet.`);
                return;
            }

            if (depType === "FS") {
                taskStart = new Date(
                    Math.max(taskStart.getTime(), taskDates[depTaskId].end.getTime() + lag * 3600 * 1000)
                );
            } else if (depType === "SS") {
                taskStart = new Date(
                    Math.max(taskStart.getTime(), taskDates[depTaskId].start.getTime() + lag * 3600 * 1000)
                );
            }
        });

        // Calculate end date
        const taskEnd = new Date(taskStart.getTime() + leadTime * 3600 * 1000);

        // Store calculated dates
        taskDates[task.id] = { start: taskStart, end: taskEnd };
    });

    return taskDates;
};


// export const calculateTaskDates = (tasks, startDateTime) => {
//     const taskDates = {};

//     // Topological sort to handle dependencies
//     const sortedTasks = topologicalSort(tasks);

//     sortedTasks.forEach((task) => {
//         const leadTime = task?.lead_time;

//         // Default start date is the project start date
//         let taskStart = new Date(startDateTime);

//         // Adjust start date based on dependencies
//         task?.dependencies?.forEach((dep) => {
//             const depTaskId = dep.taskId;
//             const depType = dep.type;
//             const lag = dep.lag || 0;

//             if (depType === "FS") {
//                 taskStart = new Date(
//                     Math.max(taskStart, taskDates[depTaskId].end.getTime() + lag * 3600 * 1000)
//                 );
//             } else if (depType === "SS") {
//                 taskStart = new Date(
//                     Math.max(taskStart, taskDates[depTaskId].start.getTime() + lag * 3600 * 1000)
//                 );
//             }
//             // Add logic for FF and SF if needed
//         });

//         // Calculate end date
//         const taskEnd = new Date(taskStart.getTime() + leadTime * 3600 * 1000);

//         // Store calculated dates
//         taskDates[task?.id] = { start: taskStart, end: taskEnd };
//     });

//     return taskDates;
// };

const topologicalSort = (tasks) => {
    const graph = {};
    const inDegree = {};

    // Initialize graph and in-degree map
    tasks.forEach((task) => {
        graph[task.id] = [];
        inDegree[task.id] = 0;
    });

    // // Build the dependency graph
    // tasks.forEach((task) => {
    //     task.dependencies.forEach((dep) => {
    //         graph[dep.taskId].push(task.id);
    //         inDegree[task.id]++;
    //     });
    // });

    // After this, add any task IDs mentioned in dependencies if they're not already in the graph
    tasks.forEach((task) => {
        task.dependencies.forEach((dep) => {
            if (!graph[dep.taskId]) {
                graph[dep.taskId] = [];
                inDegree[dep.taskId] = 0;  // Initialize inDegree for new tasks as well
            }
        });
    });

    tasks.forEach((task) => {
        task.dependencies.forEach((dep) => {
            if (!graph[dep.taskId]) {
                console.error("Missing task ID in graph:", dep.taskId, "for task:", task.id);
            }
            graph[dep.taskId].push(task.id);
            inDegree[task.id]++;
        });
    });

    // Perform topological sort
    const queue = [];
    for (const taskId in inDegree) {
        if (inDegree[taskId] === 0) queue.push(taskId);
    }

    const sortedTasks = [];
    while (queue.length > 0) {
        const taskId = queue.shift();
        const task = tasks.find((t) => t.id === taskId);
        sortedTasks.push(task);

        graph[taskId].forEach((neighbor) => {
            inDegree[neighbor]--;
            if (inDegree[neighbor] === 0) queue.push(neighbor);
        });
    }

    return sortedTasks;
};