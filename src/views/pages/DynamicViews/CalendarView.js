import React, { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import { ExportOutlined } from '@ant-design/icons';
import DynamicForm from '../DynamicForm';
import { Button, Drawer, Dropdown, Menu } from "antd";

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

const CalendarView = ({ data, onFinish, deleteData, viewConfig }) => {

    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const [editItem, setEditItem] = useState(null);

    const dynamicBulkActions = viewConfig?.tableview?.actions?.bulk?.filter(action =>
        action?.includes("add_new_")
    );
    const { showFeatures, exportOptions, globalSearch } = viewConfig?.tableview;

    const openModal = (item = null) => {
        setEditItem(item);
        setIsDrawerVisible(true);
    };

    const handleExport = (type) => {
        console.log(`Export to ${type} triggered`);
    };

    const handleBulkAction = (action) => {
        if (action === "add_new_task") {
            openModal();
        } else {
            console.log(`Bulk action "${action}" triggered. Placeholder for now.`);
        }
    };

    const transformedEvents = data.map(event => ({
        ...event,
        title: event?.name,
        // start: event?.date_time_range && event?.date_time_range[0] ? new Date(event?.date_time_range[0]) : new Date(),
        // end: event?.date_time_range && event?.date_time_range[1] ? new Date(event?.date_time_range[1]) : new Date(),
        start: event?.start_date ? new Date(event.start_date) : new Date(),
        end: event?.due_date ? new Date(event.due_date) : new Date(),
    }));
    return (
        <div style={{ height: "80vh", margin: "20px" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'nowrap', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>

                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {/* Bulk Actions */}
                    {[
                        ...(dynamicBulkActions || []),
                        ...viewConfig?.tableview?.bulkActions//?.filter(action => !action.includes("add_new_"))
                    ].map((action) => (
                        <Button
                            key={action}
                            type="primary"
                            style={{ marginRight: 8 }}
                            onClick={() => handleBulkAction(action)}
                        >
                            {action
                                .split('_')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(' ')}
                        </Button>
                    ))}

                    {/* Export Dropdown with Icon */}
                    {exportOptions?.length > 0 && (
                        <Dropdown
                            overlay={
                                <Menu>
                                    {exportOptions.includes('csv') && (
                                        <Menu.Item key="csv" onClick={() => handleExport('CSV')}>
                                            Export to CSV
                                        </Menu.Item>
                                    )}
                                    {exportOptions.includes('pdf') && (
                                        <Menu.Item key="pdf" onClick={() => handleExport('PDF')}>
                                            Export to PDF
                                        </Menu.Item>
                                    )}
                                </Menu>
                            }
                            trigger={['click']}
                        >
                            <Button icon={<ExportOutlined />} style={{ marginLeft: 8 }} />
                        </Dropdown>
                    )}
                </div>
            </div>
            <Calendar onSelectEvent={(event) => { delete event.start; delete event?.end; openModal(event) }}
                localizer={localizer}
                events={transformedEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
            />
            <Drawer width="50%"
                title={editItem ? 'Edit Task' : 'Add New Task'}
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

export default CalendarView;
