import React, { useEffect, useState } from 'react';
import Timeline from 'react-calendar-timeline';
import moment from 'moment';
import 'react-calendar-timeline/lib/Timeline.css';
import { Card, notification, Select, Typography } from 'antd';
import { supabase } from 'configs/SupabaseConfig';

const { Option } = Select;
const { Title } = Typography;

const Schedule = () => {
    // State to manage the zoom level
    const [zoomLevel, setZoomLevel] = useState('hourly');
    const [viewType, setViewType] = useState('team');
    const [data, setData] = useState()

    const fetchTasks = async () => {
        let { data, error } = await supabase.from('tasks').select('*');
        if (data) {
            console.log("Tasks", data)
            setData(data);
        }
        if (error) {
            notification.error({ message: "Failed to fetch tasks" });
        }
    };
    useEffect(() => {
        fetchTasks()
    }, [])
    // Static data with different users and non-overlapping tasks
    // const data = [
    //     {
    //         date: "2024-10-14",
    //         job_id: "jobs2",
    //         to_time: "22:29:00",
    //         user_id: "3c29dcca-c386-4ca3-b690-015ff156913b",
    //         billable: true,
    //         from_time: "10:29:00",
    //         task_name: "Task A",
    //         user_name: "Ganesh Raikar",
    //         project_id: "project3",
    //         description: "Some description for Task A"
    //     },
    //     {
    //         date: "2024-10-14",
    //         job_id: "jobs3",
    //         to_time: "14:42:00",
    //         user_id: "3c29dcca-c386-4ca3-b690-015ff156913b",
    //         billable: true,
    //         from_time: "12:42:00",
    //         task_name: "Task B",
    //         user_name: "Ganesh Raikar",
    //         project_id: "project3",
    //         description: "Description for Task B"
    //     },
    //     {
    //         date: "2024-10-14",
    //         job_id: "jobs4",
    //         to_time: "11:30:00",
    //         user_id: "74fcbf1b-77f1-414a-b003-e7c17db13a84",
    //         billable: false,
    //         from_time: "09:30:00",
    //         task_name: "Task C",
    //         user_name: "Anil Kumar",
    //         project_id: "project1",
    //         description: "Description for Task C"
    //     },
    //     {
    //         date: "2024-10-14",
    //         job_id: "jobs5",
    //         to_time: "17:00:00",
    //         user_id: "74fcbf1b-77f1-414a-b003-e7c17db13a84",
    //         billable: true,
    //         from_time: "15:00:00",
    //         task_name: "Task D",
    //         user_name: "Anil Kumar",
    //         project_id: "project1",
    //         description: "Description for Task D"
    //     },
    //     {
    //         date: "2024-10-14",
    //         job_id: "jobs6",
    //         to_time: "19:30:00",
    //         user_id: "44c8b33a-b827-4bb7-93f4-fdf8d41b55a7",
    //         billable: true,
    //         from_time: "17:30:00",
    //         task_name: "Task E",
    //         user_name: "Shweta Patil",
    //         project_id: "project2",
    //         description: "Description for Task E"
    //     },
    //     {
    //         date: "2024-10-14",
    //         job_id: "jobs7",
    //         to_time: "21:00:00",
    //         user_id: "44c8b33a-b827-4bb7-93f4-fdf8d41b55a7",
    //         billable: true,
    //         from_time: "19:45:00",
    //         task_name: "Task F",
    //         user_name: "Shweta Patil",
    //         project_id: "project2",
    //         description: "Description for Task F"
    //     }
    // ];

    // Time ranges based on zoom level
    const today = moment('2024-10-14', 'YYYY-MM-DD');
    const timeRange = {
        hourly: { start: today.clone().set({ hour: 8 }), end: today.clone().set({ hour: 23 }) },
        daily: { start: today.clone().startOf('day'), end: today.clone().endOf('day') },
        weekly: { start: today.clone().startOf('week'), end: today.clone().endOf('week') }
    };

    // Y-Axis View Groups based on viewType
    const views = {
        team: data ? Array.from(new Set(data?.map(task => task?.details?.user_id)))
            .map(user_id => ({
                id: user_id,
                title: data?.find(task => task.details.user_id === user_id)?.details.user_name
            })) : [],

        project: data ? Array.from(new Set(data?.map(task => task?.details?.project_id)))
            .map(project_id => ({
                id: project_id,
                title: project_id
            })) : [],

        jobs: data ? Array.from(new Set(data?.map(task => task?.details?.job_id)))
            .map(job_id => ({
                id: job_id,
                title: job_id
            })) : []
    };
    // const views = {
    //     team: [       // by Users
    //         { id: '3c29dcca-c386-4ca3-b690-015ff156913b', title: 'Ganesh Raikar' },
    //         { id: '74fcbf1b-77f1-414a-b003-e7c17db13a84', title: 'Anil Kumar' },
    //         { id: '44c8b33a-b827-4bb7-93f4-fdf8d41b55a7', title: 'Shweta Patil' }
    //     ],
    //     project: [    // by projects
    //         { id: 'project1', title: 'Project 1' },
    //         { id: 'project2', title: 'Project 2' },
    //         { id: 'project3', title: 'Project 3' }
    //     ],
    //     jobs: [    // by projects
    //         { id: 'job1', title: 'Jobs 1' },
    //         { id: 'job2', title: 'Jobs 2' },
    //         { id: 'job3', title: 'Jobs 3' }
    //     ],
    //     // tasks: data?.map((task) => ({ id: task?.details?.job_id, title: task?.details?.task_name }))
    // };

    // Items: map your tasks data
    const items = data?.map((task, index) => ({
        id: index,
        group: viewType === 'team' ? task?.details?.user_id : (viewType === 'project' ? task?.details?.project_id : task?.details?.job_id),
        title: `${task?.details?.task_name} - ${task?.details?.user_name}`,
        start_time: moment(`${task?.details?.date} ${task?.details?.from_time}`, 'YYYY-MM-DD HH:mm:ss'),
        end_time: moment(`${task?.details?.date} ${task?.details?.to_time}`, 'YYYY-MM-DD HH:mm:ss'),
        description: task?.details?.description
    }));

    // Dropdown for Zoom Level Control
    const handleZoomChange = (value) => setZoomLevel(value);

    // Dropdown for View Type Control (Users/Projects/Tasks)
    const handleViewTypeChange = (value) => setViewType(value);

    return (
        <Card>
            <Title level={2}>Schedule Timeline</Title>

            {/* Dropdown for Zoom Level */}
            <label>
                Zoom Level:
                <Select value={zoomLevel} onChange={handleZoomChange} style={{ width: 120, margin: '0 10px' }}>
                    <Option value="hourly">Hourly</Option>
                    <Option value="daily">Daily</Option>
                    <Option value="weekly">Weekly</Option>
                </Select>
            </label>

            {/* Dropdown for Y-axis View */}
            <label>
                View Type:
                <Select value={viewType} onChange={handleViewTypeChange} style={{ width: 200, margin: '0 10px' }}>
                    <Option value="team">Team View (Users)</Option>
                    <Option value="project">Project View</Option>
                    <Option value="jobs">Jobs View</Option>
                </Select>
            </label>

            {/* Timeline */}
            {(data && views) && <Timeline className='mt-2'
                groups={views && views[viewType]}
                items={items}
                defaultTimeStart={timeRange[zoomLevel]?.start}
                defaultTimeEnd={timeRange[zoomLevel]?.end}
                visibleTimeStart={timeRange[zoomLevel]?.start?.valueOf()}
                visibleTimeEnd={timeRange[zoomLevel]?.end?.valueOf()}
                itemHeightRatio={0.75}  // Adjusts the item height display
                minZoom={60 * 60 * 1000}  // Minimum zoom level: 1 hour
                maxZoom={24 * 60 * 60 * 1000 * 7}  // Maximum zoom level: 1 week
            />}
        </Card>
    );
};

export default Schedule;