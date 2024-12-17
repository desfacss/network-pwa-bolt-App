import React from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";

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

const CalendarView = ({ data }) => {
    const transformedEvents = data.map(event => ({
        ...event,
        title: event?.name,
        // start: new Date(event.start_date),
        // end: new Date(event.due_date),
        start: event?.date_time_range && event?.date_time_range[0] ? new Date(event?.date_time_range[0]) : new Date(),
        end: event?.date_time_range && event?.date_time_range[1] ? new Date(event?.date_time_range[1]) : new Date(),
        // start: event?.date_range && event?.date_range[0] ? new Date(event?.date_range[0]) : new Date(),
        // end: event?.date_range && event?.date_range[1] ? new Date(event?.date_range[1]) : new Date(),
    }));
    return (
        <div style={{ height: "80vh", margin: "20px" }}>
            <Calendar
                localizer={localizer}
                events={transformedEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
            />
        </div>
    );
};

export default CalendarView;
