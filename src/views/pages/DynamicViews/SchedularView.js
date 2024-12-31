import React, { useState, useMemo } from 'react';
import Scheduler, { SchedulerData, ViewTypes, DATE_FORMAT } from 'react-big-scheduler';
import moment from 'moment';
import 'react-big-scheduler/lib/css/style.css';
import DynamicForm from '../DynamicForm';
import { Button, Drawer, Modal, Dropdown, Menu, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const SchedularView = ({ data, viewConfig, onFinish, deleteData }) => {
    const [schedulerData, setSchedulerData] = useState(
        new SchedulerData(moment().format(DATE_FORMAT), ViewTypes.Week, false, false, {
            schedulerWidth: '100%',
            schedulerMaxHeight: 600,
        })
    );
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const [editItem, setEditItem] = useState(null);

    // // Map resources (e.g., users or groups)
    // const resources = useMemo(() => {
    //     return viewConfig?.resources?.map(resource => ({
    //         id: resource.id,
    //         name: resource.name,
    //     }));
    // }, [viewConfig]);

    // // Map events (tasks or appointments)
    // const events = useMemo(() => {
    //     return data.map(item => ({
    //         id: item.id,
    //         start: moment(item.start_date).format(DATE_FORMAT),
    //         end: moment(item.due_date).format(DATE_FORMAT),
    //         resourceId: item.resourceId || item?.id,
    //         title: item.title || item?.name || " ",
    //         // resourceId: item.resourceId,
    //         // title: item.title,
    //     }));
    // }, [data]);
    console.log("rd", data)
    // const resources = data?.map((item, i) => {
    //     return {
    //         id: item?.assignee,  // Assuming assignee is the unique identifier for the resource
    //         name: item?.assignee,  // Assuming assignee is the unique identifier for the resource
    //     };
    // });
    const resources = data?.reduce((acc, item) => {
        // Check if assignee already exists in the accumulator
        if (!acc.some(resource => resource.id === item?.assignee)) {
            acc.push({
                id: item?.assignee,  // Assuming assignee is the unique identifier for the resource
                name: item?.assignee,  // Using assignee as the name
            });
        }
        return acc;
    }, []);


    const events = data?.map(item => {
        return {
            id: item?.id,
            // start: item.start_date,
            // end: item.due_date,
            start: '2022-12-18 09:30:00',
            end: '2022-12-19 09:30:00',
            resourceId: item?.assignee,  // Make sure this matches the resource's ID
            // name: item.name,
            // status: item.status,
            // description: item.description,
            // Add other event-specific properties as needed
        };
    });

    // Update scheduler data
    useMemo(() => {
        console.log("re", resources, events)
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
