import React from 'react';
import Timeline from 'react-calendar-timeline';
import moment from 'moment';
import 'react-calendar-timeline/lib/Timeline.css';

const TimelineChart = ({ tasks, taskDates }) => {
    const groups = tasks.map((task, index) => ({ id: task.id, title: task.name }));
    const items = tasks.map(task => ({
        id: task.id,
        group: task.id,
        title: task.name,
        start_time: moment(taskDates[task.id].start).valueOf(),
        end_time: moment(taskDates[task.id].end).valueOf(),
    }));

    return (
        <Timeline
            groups={groups}
            items={items}
            defaultTimeStart={moment(taskDates[tasks[0].id].start)} // Assuming first task starts at project start
            defaultTimeEnd={moment(taskDates[tasks[tasks.length - 1].id].end)} // Assuming last task ends at project end
        />
    );
};

export default TimelineChart;