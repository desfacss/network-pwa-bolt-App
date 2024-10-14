import { Card, notification } from 'antd';
import { supabase } from 'configs/SupabaseConfig';
import React, { useEffect, useState } from 'react';
import Timeline from 'react-timelines'; // Import react-timelines
import 'react-timelines/lib/css/style.css';

const MIN_ZOOM = 2;
const MAX_ZOOM = 20;

const Schedule = () => {
    const [tasks, setTasks] = useState([]);
    const [zoom, setZoom] = useState(2);
    const [open, setOpen] = useState(false);

    const fetchTasks = async () => {
        let { data, error } = await supabase?.from('jobs').select('*');
        if (data) {
            console.log("Fetched Tasks:", data);
            const formattedTasks = data
                .map(item => {
                    const details = item?.details;
                    if (!details || !details.start_date || !details.end_date) {
                        return null;
                    }

                    return {
                        id: item.id,
                        title: details.task_name || 'Untitled Task',
                        start: new Date(details.start_date),
                        end: new Date(details.end_date),
                        description: details.description || 'No description',
                        isCompleted: item.is_completed || false,
                        resource: details.user_name || 'Unknown User'
                    };
                })
                .filter(task => task);

            console.log("Formatted Tasks:", formattedTasks);
            setTasks(formattedTasks);
        }
        if (error) {
            notification.error({ message: "Failed to fetch tasks" });
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleZoomIn = () => {
        setZoom(Math.min(zoom + 1, MAX_ZOOM));
    };

    const handleZoomOut = () => {
        setZoom(Math.max(zoom - 1, MIN_ZOOM));
    };

    const handleToggleOpen = () => {
        setOpen(!open);
    };

    return (
        <Card>
            {tasks.length > 0 ? (
                <Timeline
                    scale={{
                        start: new Date('2024-10-08'),
                        end: new Date('2024-10-25'),
                        zoom,
                        zoomMin: MIN_ZOOM,
                        zoomMax: MAX_ZOOM
                    }}
                    isOpen={open}
                    toggleOpen={handleToggleOpen}
                    zoomIn={handleZoomIn}
                    zoomOut={handleZoomOut}
                    clickElement={(element) => alert(`Clicked element\n${JSON.stringify(element, null, 2)}`)}
                    timebar={[]} // Replace with your actual timebar configuration if needed
                    tracks={[
                        {
                            id: '1',
                            title: 'Tasks',
                            elements: tasks.map(task => ({
                                id: task.id,
                                title: task.title,
                                start: task.start,
                                end: task.end,
                                isOpen: false,
                                style: {},
                            })),
                        },
                    ]}
                    now={new Date()}
                    enableSticky
                    scrollToNow
                />
            ) : (
                <p>No tasks available to display.</p>
            )}
        </Card>
    );
};

export default Schedule;
