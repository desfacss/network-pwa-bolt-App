import React, { useState, useMemo } from 'react';
import DynamicForm from '../DynamicForm';
import { Button, Drawer, Modal, Dropdown, Menu, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Scheduler, SchedulerData, ViewType, DemoData, DATE_FORMAT } from 'react-big-schedule';
import Schedular from './Sched';
import dayjs from 'dayjs';

const SchedularView = ({ data, viewConfig, onFinish, deleteData }) => {
    const [schedulerData, setSchedulerData] = useState(
        new SchedulerData(dayjs().format(DATE_FORMAT), ViewType.Week, false, false, {
            schedulerWidth: '85%',
            schedulerMaxHeight: 500,
        })
    );
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const [editItem, setEditItem] = useState(null);

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
                resourceId: item?.assignee,
                name: item?.name,
                title: item?.name,
                bgColor: "#D9D9D9",
            }));
    }, [data]);

    // Update scheduler data
    console.log("re", resources, events)
    schedulerData?.setResources(resources);
    schedulerData?.setEvents(events);
    // useMemo(() => {

    //     if (!resources || !Array.isArray(resources) || resources.some(r => !r.id || !r.name)) {
    //         console.error("Invalid resources array", resources);
    //         return;
    //     }

    //     if (!events || !Array.isArray(events) || events.some(e => !e.id || !e.start || !e.end || !e.resourceId)) {
    //         console.error("Invalid events array", events);
    //         return;
    //     }
    //     schedulerData?.setResources(resources);
    //     schedulerData?.setEvents(events);
    //     setSchedulerData(schedulerData);
    // }, [resources, events, schedulerData]);

    const handleEventClick = (schedulerEvent) => {
        const item = data.find(item => item.id === schedulerEvent.id);
        setEditItem(item);
        setIsDrawerVisible(true);
    };

    const handleDelete = (event) => {
        Modal.confirm({
            title: 'Are you sure?',
            content: `Delete event: ${event.title}?`,
            okText: 'Yes',
            cancelText: 'No',
            onOk: () => {
                deleteData(event);
            },
        });
    };

    const handleAddEvent = () => {
        setEditItem(null);
        setIsDrawerVisible(true);
    };

    return (
        <div>
            {/* Toolbar for Adding New Events */}
            <Space style={{ marginBottom: 16 }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddEvent}>
                    Add Event
                </Button>
            </Space>
            <Schedular data={data} deleteData={deleteData} />
            {/* Scheduler */}
            {/* <DndProvider backend={HTML5Backend}>
                <Scheduler
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
                    deleteEventClick={(e) => handleDelete(e)}
                />
            </DndProvider> */}

            {/* Drawer for Editing/Adding Events */}
            <Drawer
                title={editItem ? 'Edit Event' : 'Add New Event'}
                visible={isDrawerVisible}
                onClose={() => setIsDrawerVisible(false)}
                footer={null}
            >
                <DynamicForm
                    schemas={viewConfig}
                    formData={editItem || {}}
                    onFinish={(formData) => {
                        onFinish(formData, editItem);
                        setIsDrawerVisible(false);
                    }}
                />
            </Drawer>
        </div>
    );
};

export default SchedularView;
