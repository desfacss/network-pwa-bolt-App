import React, { useState, useMemo } from 'react';
import { Scheduler, SchedulerData, ViewType, DemoData, DATE_FORMAT } from 'react-big-schedule';
import dayjs from 'dayjs';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const Schedular = ({ data }) => {
    const [schedulerData, setSchedulerData] = useState(
        //TODO:dynamic date
        new SchedulerData(dayjs().format(DATE_FORMAT), ViewType.Week, false, false, {
            schedulerWidth: '80%',
            schedulerMaxHeight: 500,
        })
    );

    console.log("rd", data)

    const resources = useMemo(() => {
        return data?.reduce((acc, item) => {
            if (!acc.some(resource => resource.id === item?.assignee)) {
                acc.push({
                    id: item?.assignee,
                    name: item?.assignee,
                });
            }
            return acc;
        }, []);
    }, [data]);

    const events = useMemo(() => {
        return data
            ?.sort((a, b) => new Date(a?.start_date) - new Date(b?.start_date))
            ?.map((item, i) => ({
                // id: parseInt(item?.id, 10),
                id: parseInt(i, 10),
                start: item?.start_date || dayjs().format('YYYY-MM-DD 09:30:00'),
                end: item?.due_date || dayjs().format('YYYY-MM-DD 09:30:00'),//dayjs().add(5, 'days').format('YYYY-MM-DD 09:30:00')
                // start: dayjs(item?.start_date).format('YYYY-MM-DD HH:mm:ss') || '2025-01-05 09:30:00',
                // end: dayjs(item?.due_date).format('YYYY-MM-DD HH:mm:ss') || '2025-01-10 09:30:00',
                resourceId: item?.assignee,
                name: item?.name,
                title: item?.name,
                bgColor: "#D9D9D9",
            }));
    }, [data]);
    schedulerData?.setResources(resources);
    schedulerData?.setEvents(events);

    const handleEventClick = (schedulerEvent) => {
        const item = data.find(item => item.id === schedulerEvent.id);
    };

    const updateScheduler = () => {
        setSchedulerData(new SchedulerData(schedulerData.date, schedulerData.viewType, false, false));
    };
    return (
        <div>
            <DndProvider backend={HTML5Backend}>
                {<Scheduler
                    schedulerData={schedulerData}
                    prevClick={() => schedulerData.prev() && setSchedulerData({ ...schedulerData })}
                    nextClick={() => schedulerData.next() && setSchedulerData({ ...schedulerData })}
                    onSelectDate={(date) => schedulerData.setDate(date) && setSchedulerData({ ...schedulerData })}
                    onViewChange={(viewType) => schedulerData.setViewType(viewType) && setSchedulerData({ ...schedulerData })}
                    eventItemClick={handleEventClick}
                    updateEventStart={(e, newStart) => console.log('Update Start', e, newStart)}
                    updateEventEnd={(e, newEnd) => console.log('Update End', e, newEnd)}
                    moveEvent={(e, newStart, newEnd, newResourceId) =>
                        console.log('Move', e, newStart, newEnd, newResourceId)
                    }
                    viewEventClick={(e) => console.log('View Event', e)}
                    viewEventText="Details"
                />}
            </DndProvider>
        </div>
    );
};

export default Schedular;
