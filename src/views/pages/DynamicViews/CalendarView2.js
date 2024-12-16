import React from 'react';
import FullCalendar from '@fullcalendar/react'; // Import FullCalendar
import dayGridPlugin from '@fullcalendar/daygrid'; // Import the day grid plugin

const CalendarView = ({ tasks }) => {
    return (
        <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            events={tasks} // Pass events as props
        />
    );
};

export default CalendarView;
