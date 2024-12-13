import React, { useState } from 'react';
import Timeline, { TimelineHeaders, DateHeader } from 'react-calendar-timeline';
import moment from 'moment';
import 'react-calendar-timeline/lib/Timeline.css';
import { Card, Select, Typography } from 'antd';
import './Schedule.css';

const { Option } = Select;
const { Title } = Typography;

const Schedule = ({ data1, viewConfig, updateData, deleteData, onFinish }) => {
    const [zoomLevel, setZoomLevel] = useState('weekly');
    const [viewType, setViewType] = useState('assignee');
    const [data, setData] = useState(data1);
    const [filteredData, setFilteredData] = useState(data1);
    const [filters, setFilters] = useState({});

    // Time ranges based on zoom level
    const today = moment();
    const timeRange = {
        hourly: { start: today.clone().set({ hour: 8 }), end: today.clone().set({ hour: 23 }) },
        weekly: { start: today.clone().startOf('week'), end: today.clone().endOf('week') },
        monthly: { start: today.clone().startOf('month'), end: today.clone().endOf('month') },
    };

    // Groups based on viewType
    const views = {
        assignee: filteredData
            ? Array.from(new Set(filteredData.map(task => task.assignee)))
                .map(assignee => ({
                    id: assignee,
                    title: assignee,
                }))
            : [],
    };

    // Items for the timeline
    const items = filteredData.map((task) => ({
        id: task?.id,
        group: task?.assignee, // Grouping based on the viewType
        title: task?.name,
        start_time: moment(task?.start_date + " 00:00:00", 'YYYY-MM-DD HH:mm:ss'),
        end_time: moment(task?.due_date + " 00:00:00", 'YYYY-MM-DD HH:mm:ss'),
        description: task?.description,
    }));
    console.log("II", items)
    // Dynamic Filters Configuration
    const filterConfig = [
        {
            type: 'select',
            label: 'Assignee',
            field: 'assignee',
            options: [...new Set(data?.map(task => task?.assignee))],
        },
        {
            type: 'select',
            label: 'Status',
            field: 'status',
            options: [...new Set(data.map(task => task?.status))],
        },
        {
            type: 'select',
            label: 'Priority',
            field: 'priority',
            options: [...new Set(data.map(task => task?.priority))],
        },
    ];

    const handleFilterChange = (field, value) => {
        setFilters((prevFilters) => ({ ...prevFilters, [field]: value }));
        const newFilteredData = data.filter((task) => {
            // Apply all filters dynamically
            return Object.entries({ ...filters, [field]: value }).every(([key, val]) => !val || task[key] === val);
        });
        setFilteredData(newFilteredData);
    };

    const renderFilters = () => {
        return filterConfig.map((filter, index) => (
            <div key={index} style={{ marginRight: 16 }}>
                {filter.label}:{' '}
                <Select
                    placeholder={`Select ${filter.label}`}
                    style={{ width: 200 }}
                    allowClear
                    onChange={(value) => handleFilterChange(filter.field, value)}
                >
                    {filter.options.map((option) => (
                        <Option key={option} value={option}>
                            {option}
                        </Option>
                    ))}
                </Select>
            </div>
        ));
    };

    return (
        <Card>
            <Title level={2}>Job Schedule</Title>

            {/* Zoom Level Dropdown */}
            <label>
                Zoom Level:
                <Select
                    value={zoomLevel}
                    onChange={setZoomLevel}
                    style={{ width: 120, margin: '0 10px' }}
                >
                    <Option value="hourly">Hourly</Option>
                    <Option value="weekly">Weekly</Option>
                    <Option value="monthly">Monthly</Option>
                </Select>
            </label>

            {/* Filters */}
            <div style={{ display: 'flex', margin: '20px 0' }}>{renderFilters()}</div>

            {/* Timeline */}
            <Timeline
                groups={views[viewType]}
                items={items}
                defaultTimeStart={timeRange[zoomLevel]?.start}
                defaultTimeEnd={timeRange[zoomLevel]?.end}
                visibleTimeStart={timeRange[zoomLevel]?.start?.valueOf()}
                visibleTimeEnd={timeRange[zoomLevel]?.end?.valueOf()}
                itemHeightRatio={0.75}
                minZoom={60 * 60 * 1000} // 1 hour
                maxZoom={30 * 24 * 60 * 60 * 1000} // 30 days
            >
                {/* <TimelineHeaders>
                    <DateHeader unit="primaryHeader" labelFormat="YYYY" />
                    <DateHeader
                        unit="day"
                        labelFormat={(date) => moment(date).format(zoomLevel === 'weekly' ? 'ddd D' : 'HH:mm')}
                    />
                </TimelineHeaders> */}
            </Timeline>
        </Card>
    );
};

export default Schedule;
