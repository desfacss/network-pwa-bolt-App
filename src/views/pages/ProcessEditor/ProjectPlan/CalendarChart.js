import React from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Set up date-fns localizer
const locales = {
    "en-US": enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
    getDay,
    locales,
});

const CalendarChart = ({ tasks, taskDates }) => {
    const events = tasks.map(task => ({
        title: task.name,
        start: taskDates[task.id].start,
        end: taskDates[task.id].end,
    }));
    console.log('Task Dates:', tasks, taskDates, events);
    return (
        <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
        />
    );
};

export default CalendarChart;