import React, { useEffect, useState } from 'react';
import { WeeklyCalendar } from 'antd-weekly-calendar'; // Named import
import 'antd/dist/antd.css';

const Schedule = () => {
    const [events, setEvents] = useState([]);

    const data = [
        {
            id: '21522eaf-8341-472d-86f2-413f5ddee7c1',
            details: {
                date: '2024-10-14',
                to_time: '22:29:00',
                from_time: '10:29:00',
                task_name: 'ta',
                user_name: 'ganesh raikar',
                description: 'sfhkhk fh',
            }
        },
        {
            id: 'b17d29d1-1ea3-419e-867b-fa6834f07bcd',
            details: {
                date: '2024-10-14',
                to_time: '14:42:00',
                from_time: '12:42:00',
                task_name: 'da',
                user_name: 'ganesh raikar',
                description: 'dg\n',
            }
        }
    ];

    useEffect(() => {
        const formattedEvents = data.map(event => ({
            title: `${event.details.task_name} - ${event.details.user_name}`,
            start: new Date(`${event.details.date}T${event.details.from_time}`),
            end: new Date(`${event.details.date}T${event.details.to_time}`),
            description: event.details.description,
        }));

        setEvents(formattedEvents);
    }, []);

    return (
        <div>
            <h2>Weekly Schedule</h2>
            <WeeklyCalendar
                events={events}
                onSelectEvent={event => alert(event.description)}
                style={{ height: '100vh' }}
            />
        </div>
    );
};

export default Schedule;
