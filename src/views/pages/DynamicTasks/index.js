import { Card, DatePicker, notification, Select, Tabs } from 'antd';
import { supabase } from 'configs/SupabaseConfig';
import React, { useEffect, useState } from 'react';
import DynamicForm from '../DynamicForm';
import GridView from '../DynamicViews/GridView';
import TableView from '../DynamicViews/TableView-R';
import dayjs from 'dayjs';
import { renderFilters } from 'components/util-components/utils';
import Schedule from '../DynamicViews/TimelineView';
import KanbanView from '../DynamicViews/KanbanView';
import { useSelector } from 'react-redux';

const { RangePicker } = DatePicker;
const { Option } = Select;

const entityType = 'y_tasks'

const Index = () => {

    const defaultStartDate = dayjs().subtract(30, 'days');
    // const defaultStartDate = dayjs().subtract(30, 'days');
    const defaultEndDate = dayjs();
    const [dateRange, setDateRange] = useState([defaultStartDate, defaultEndDate]);
    const [visible, setVisible] = useState(false);
    const [vd, setVd] = useState();

    const { session } = useSelector((state) => state.auth);

    const handleModalOpen = (item) => {
        setVd(item)
        setVisible(true);
    };

    const handleWorkflowTransition = async (entityId, formData) => {
        const { data: vd, error } = await supabase
            .rpc('transition_workflow_stage_v4', {
                entitytype: entityType,
                entityid: entityId,
                newstagename: formData?.status,
                userid: session?.user?.id,
                reason: "",
            });

        if (error) {
            notification.error({ message: error.message });
            return;
        }
        console.log("vd", entityId, formData, vd, error)
        // const criteriaEmpty = Object.keys(vd?.entry_criteria || {}).length === 0 && Object.keys(vd?.exit_criteria || {}).length === 0
        const criteriaEmpty = vd
        if (vd) {
            // if (vd?.entry_criteria || vd?.exit_criteria) {
            // Reopen modal with the updated data
            handleModalOpen({ criteria: vd, id: entityId, details: formData });
            console.log("v")
        } else {
            // Fetch data to refresh the view
            console.log("d")
            fetchData();
            setVisible(false);
            notification.success({ message: 'Workflow stage transitioned successfully' });
        }
    };

    const onDateRangeChange = (dates) => {
        if (dates) {
            const [start, end] = dates;
            setDateRange([start, end]);
        } else {
            setDateRange([]);;
        }
    };

    const [viewConfig, setViewConfig] = useState()
    const [data, setData] = useState()

    const fetchData = async () => {
        let { data, error } = await supabase.from(entityType).select('*').order('details->>name', { ascending: true });
        if (data) {
            console.log("Data", data.map(task => ({ ...task.details, id: task?.id })))
            // setData(data.map(item => ({ ...item, ...item.details, details: undefined })));
            setData(data.map(task => ({ ...task.details, id: task?.id })));
        }
        if (error) {
            notification.error({ message: error?.message || "Failed to fetch Data" });
        }
    };

    const fetchViewConfigs = async () => {
        let { data, error } = await supabase.from('y_view_config').select('*').eq('entity_type', entityType);
        if (data) {
            console.log("viewConfig", data[0]?.tableview)
            setViewConfig(data && data[0]);
        }
        if (error) {
            notification.error({ message: error?.message || "Failed to fetch View Config" });
        }
    };

    useEffect(() => {
        fetchViewConfigs();
        fetchData();
    }, []);


    const updateData = async (updatedRow) => {
        const { id, ...updates } = updatedRow
        console.log("UR", updates)
        delete updatedRow?.id
        const { data, error } = await supabase.from(entityType).update({ details: updatedRow }).eq('id', id).select('*');

        if (error) {
            notification.error({ message: error.message });
        } else {
            notification.success({ message: "Updated Successfully" })
            fetchData(); // Refresh data after updating
        }
    };

    const deleteData = async (deleteRow) => {
        console.log("Del", deleteRow?.id)
        const { data, error } = await supabase.from(entityType).delete().eq('id', deleteRow?.id);
        if (error) {
            notification.error({ message: error.message });
        } else {
            fetchData(); // Refresh data after deleting
        }
    };

    const handleAddOrEdit = async (formData, editItem) => {
        console.log("ei", formData, editItem)
        let { status, related_data, date_time_range, id, ...details } = formData
        if (date_time_range && date_time_range.length === 2) {
            details.start_date = new Date(date_time_range[0]).toISOString();
            details.due_date = new Date(date_time_range[1]).toISOString();
        }
        if (editItem) {
            if (editItem?.status !== undefined) {
                details.status = status;
            }
            // Update logic
            const { data, error } = await supabase
                .from(entityType)
                .update({ details: details, organization_id: session?.user?.organization?.id })
                .eq('id', editItem.id)
                .select('*');

            if (error) {
                notification.error({ message: 'Failed to update' });
            } else {
                if (status !== editItem?.status) {   //TODO: can ui know the sequence to avoid transition down rpc call
                    await handleWorkflowTransition(editItem.id, formData);
                } else {
                    fetchData()
                }
            }
        } else {
            // Add logic
            const { data, error } = await supabase
                .from(entityType)
                .insert([{ details: details, organization_id: session?.user?.organization?.id }])
                .select('*');

            if (error) {
                notification.error({ message: 'Failed to add' });
            } else {
                const newEntityId = data[0]?.id;
                const { data: vd, error } = await supabase.rpc('initialize_workflow_instance_v4', {
                    entitytype: entityType,
                    entityid: newEntityId,
                });

                if (error) {
                    notification.error({ message: 'Failed to initialize workflow instance' });
                } else {
                    notification.success({ message: 'Added successfully' });
                    fetchData()
                    // await handleWorkflowTransition(newEntityId, formData);
                }
            }
        }
    };

    const tabItems = [];
    if (viewConfig?.tableview) {
        tabItems.push({
            label: 'Table',
            key: '1',
            children: <TableView data={data} viewConfig={viewConfig} updateData={updateData} deleteData={deleteData} onFinish={handleAddOrEdit} />,
        })
    }
    if (viewConfig?.gridview) {
        tabItems.push({
            label: 'Grid',
            key: '2',
            children: <GridView data={data} viewConfig={viewConfig} updateData={updateData} deleteData={deleteData} onFinish={handleAddOrEdit} />
        })
    }
    if (viewConfig?.timelineview) {
        tabItems.push({
            label: 'Timeline',
            key: '3',
            children: <Schedule data1={data} viewConfig={viewConfig} updateData={updateData} deleteData={deleteData} onFinish={handleAddOrEdit} />
        })
    }
    if (viewConfig?.kanbanview) {
        tabItems.push({
            label: 'Kanban',
            key: '4',
            children: <KanbanView data={data} viewConfig={viewConfig} updateData={updateData} deleteData={deleteData} onFinish={handleAddOrEdit} />
        })
    }
    // if (viewConfig?.ganttview) {
    //     tabItems.push({
    //         label: 'Gantt',
    //         key: '3',
    //         children: <GanttView
    //         // tasks={tasks} 
    //         />,
    //     })
    // }
    // if (viewConfig?.calendarview) {
    //     tabItems.push({
    //         label: 'Calendar',
    //         key: '4',
    //         children: <CalendarView tasks={tasks} />,
    //     })
    // }

    return (
        <Card>
            {(data && viewConfig) && <Tabs
                tabBarExtraContent={ //Global filters
                    <div style={{ display: "flex", alignItems: "center" }}>
                        {renderFilters(viewConfig?.global?.search, data)}
                    </div>
                }
                defaultActiveKey="1" items={tabItems} />}
        </Card>
    );
}

export default Index;