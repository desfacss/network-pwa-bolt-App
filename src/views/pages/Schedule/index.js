import React, { useEffect, useState } from 'react';
import Timeline, { TimelineHeaders, DateHeader } from 'react-calendar-timeline';
import moment from 'moment';
import 'react-calendar-timeline/lib/Timeline.css';
import { Card, notification, Select, Typography } from 'antd';
import { supabase } from 'configs/SupabaseConfig';
import './Schedule.css';

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
    }, []);

    // Time ranges based on zoom level (hourly and weekly only)
    const today = moment('2024-10-14', 'YYYY-MM-DD');
    const timeRange = {
        hourly: { start: today.clone().set({ hour: 8 }), end: today.clone().set({ hour: 23 }) },
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
            <Title level={2}>Job Schedule</Title>

            {/* Dropdown for Zoom Level */}
            <label>
                Zoom Level:
                <Select value={zoomLevel} onChange={handleZoomChange} style={{ width: 120, margin: '0 10px' }}>
                    <Option value="hourly">Hourly</Option>
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
            {(data && views) && <Timeline className='mt-2' calendarHeaderStyle={{ backgroundColor: "#3498db", color: "#ffffff" }}
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
           {/* <Timeline
  groups={views[viewType] ? views[viewType] : []}
  items={items ? items : []}
  defaultTimeStart={moment(timeRange[zoomLevel]?.start).isValid() ? timeRange[zoomLevel]?.start : new Date()}
  defaultTimeEnd={moment(timeRange[zoomLevel]?.end).isValid() ? timeRange[zoomLevel]?.end : new Date()}
  visibleTimeStart={moment(timeRange[zoomLevel]?.start).isValid() ? timeRange[zoomLevel]?.start.valueOf() : Date.now()}
  visibleTimeEnd={moment(timeRange[zoomLevel]?.end).isValid() ? timeRange[zoomLevel]?.end.valueOf() : Date.now()}
>
  <TimelineHeaders>
    <DateHeader unit="primaryHeader" labelFormat="YYYY" />
    <DateHeader
      unit="day"
      labelFormat={(date) => moment(date).isValid() ? moment(date).format(zoomLevel === 'weekly' ? 'ddd D' : 'HH:mm') : 'Invalid date'}
    />
  </TimelineHeaders>
</Timeline> */}
        </Card>
    );
};

export default Schedule;
