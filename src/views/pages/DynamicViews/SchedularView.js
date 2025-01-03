import React, { useState, useMemo } from 'react';
import 'react-big-scheduler/lib/css/style.css';
import DynamicForm from '../DynamicForm';
import { Button, Drawer, Modal, Dropdown, Menu, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

import { Scheduler, SchedulerData, ViewType, DemoData } from 'react-big-schedule';

const SchedularView = ({ data, viewConfig, onFinish, deleteData }) => {
    const [schedulerData, setSchedulerData] = useState(
        new SchedulerData('2025-01-01', ViewType.Week, false, false, {
            schedulerWidth: '85%',
            schedulerMaxHeight: 500,
        })
    );
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const [editItem, setEditItem] = useState(null);

    console.log("rd", data)

    // const resources = data?.reduce((acc, item) => {
    //     // Check if assignee already exists in the accumulator
    //     if (!acc.some(resource => resource.id === item?.assignee)) {
    //         acc.push({
    //             id: item?.assignee,  // Assuming assignee is the unique identifier for the resource
    //             name: item?.assignee,  // Using assignee as the name
    //         });
    //     }
    //     return acc;
    // }, []);

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
            ?.sort((a, b) => new Date(a?.date_time_range?.[0]) - new Date(b?.date_time_range?.[0]))
            ?.map(item => ({
                id: parseInt(item?.id, 10),
                start: item?.date_time_range?.[0] || '2025-01-05 09:30:00',
                end: item?.date_time_range?.[1] || '2025-01-10 09:30:00',
                resourceId: item?.assignee,
                name: item?.name,
                title: item?.name,
                bgColor: "#D9D9D9",
            }));
    }, [data]);

    // const events = data?.map((item, index) => {
    //     let uniqueIdCounter = 1; // Start with an initial counter for unique IDs
    //     const parsedId = parseInt(item?.id, 10);
    //     return {
    //         // id: !isNaN(parsedId) ? parsedId : uniqueIdCounter++, // Use counter for fallback unique numeric IDs
    //         id: uniqueIdCounter++,
    //         // id: parseInt(item?.id, 10),
    //         ip: item?.id,
    //         // id: item?.id,
    //         start: item?.date_time_range[0] || '2025-01-05 09:30:00',
    //         end: item?.date_time_range[1] || '2025-01-10 09:30:00',
    //         // start: '2022-12-18 09:30:00',
    //         // end: '2022-12-19 09:30:00',
    //         resourceId: item?.assignee,  // Make sure this matches the resource's ID
    //         name: item?.name,
    //         title: item?.name,
    //         showPopover: false,
    //         bgColor: "#D9D9D9",
    //         // status: item.status,
    //         // description: item.description,
    //         // Add other event-specific properties as needed
    //     };
    // });

    // const events = data
    //     ?.sort((a, b) => {
    //         const dateA = new Date(a?.date_time_range?.[0] || '1970-01-01');
    //         const dateB = new Date(b?.date_time_range?.[0] || '1970-01-01');
    //         return dateA - dateB; // Sort by start date
    //     })
    //     ?.map((item, index) => ({
    //         id: parseInt(item?.id, 10),
    //         // id: index + 1, // Use the sorted index as the unique integer ID for display
    //         actual_id: item?.id, // Retain the actual UUID from the database
    //         start: item?.date_time_range?.[0] || '2025-01-05 09:30:00',
    //         end: item?.date_time_range?.[1] || '2025-01-10 09:30:00',
    //         resourceId: item?.assignee, // Ensure this matches the resource's ID
    //         name: item?.name,
    //         title: item?.name,
    //         showPopover: false,
    //         bgColor: "#D9D9D9",
    //     }));


    // Update scheduler data
    useMemo(() => {
        console.log("re", resources, events)

        if (!resources || !Array.isArray(resources) || resources.some(r => !r.id || !r.name)) {
            console.error("Invalid resources array", resources);
            return;
        }

        if (!events || !Array.isArray(events) || events.some(e => !e.id || !e.start || !e.end || !e.resourceId)) {
            console.error("Invalid events array", events);
            return;
        }
        schedulerData?.setResources(resources);
        schedulerData?.setEvents(events);
        setSchedulerData(schedulerData);
    }, [resources, events, schedulerData]);

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

            {/* Scheduler */}
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
