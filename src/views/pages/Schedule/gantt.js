import { Card, notification } from 'antd';
import { supabase } from 'configs/SupabaseConfig';
import React, { useEffect, useState } from 'react';
import Gantt from 'react-gantt-antd';
import 'react-gantt-antd/lib/css/style.css'
import moment from 'moment';
import 'moment/locale/en-gb'; // Import the English locale

moment.locale('en-gb');

const Schedule = () => {
    const [tasks, setTasks] = useState([]); // Initialize as an empty array

    const fetchTasks = async () => {
        let { data, error } = await supabase?.from('jobs').select('*');
        if (data) {
            console.log("Fetched Tasks:", data);
            const formattedTasks = data
                .map(item => {
                    // Check if 'details' and necessary fields exist
                    const details = item?.details;
                    if (!details || !details.start_date || !details.end_date) {
                        return null; // Skip this item if required fields are missing
                    }

                    return {
                        id: item.id,
                        title: details.task_name || 'Untitled Task',
                        start: new Date(`${details.start_date}`), // Create Date object
                        end: new Date(`${details.end_date}`), // Create Date object
                        description: details.description || 'No description',
                        isCompleted: item.is_completed || false,
                        resource: details.user_name || 'Unknown User'
                    };
                })
                .filter(task => task); // Filter out null values

            console.log("Formatted Tasks:", formattedTasks); // Log formatted tasks
            setTasks(formattedTasks);
        }
        if (error) {
            notification.error({ message: "Failed to fetch tasks" });
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    return (
        <Card>
            {tasks.length > 0 ? ( // Check if there are tasks to render
                <Gantt
                    start={new Date('2024-10-08')}
                    end={new Date('2024-10-25')}
                    now={new Date('2024-10-14')}
                    tasks={tasks}
                    locale="en"
                    viewMode="Day" // Options: "Day", "Week", "Month"
                    onClick={task => console.log("Clicked task:", task)}
                    onDateChange={(task, start, end) => console.log("Date changed:", start, end)}
                    onProgressChange={(task, progress) => console.log("Progress changed:", progress)}
                    onDoubleClick={task => alert(`Double clicked on task: ${task.title}`)}
                />
            ) : (
                <p>No tasks available to display.</p> // Display a message if no tasks
            )}
        </Card>
    );
};

export default Schedule;
