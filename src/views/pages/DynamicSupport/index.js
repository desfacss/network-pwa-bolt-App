import { Card, notification, Tabs } from 'antd';
import { supabase } from 'configs/SupabaseConfig';
import React, { useEffect, useState } from 'react';
import DynamicForm from '../DynamicForm';
import GridView from '../DynamicViews/GridView';
import KanbanView from '../DynamicViews/KanbanView';
import TableView from '../DynamicViews/TableView-R';
import Schedule from '../DynamicViews/TimelineView';

const entityType = 'y_support'

const Index = () => {
    const [viewConfig, setViewConfig] = useState(null);
    const [data, setData] = useState(null);

    const fetchData = async () => {
        let { data, error } = await supabase.from(entityType).select('*').order('details->>name', { ascending: true });
        if (data) {
            setData(data.map(task => ({ ...task.details, id: task?.id })));
        }
        if (error) {
            notification.error({ message: error?.message || "Failed to fetch Data" });
        }
    };

    const fetchViewConfigs = async () => {
        let { data, error } = await supabase.from('y_view_config').select('*').eq('entity_type', entityType);
        if (data) {
            setViewConfig(data[0]);
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
        const { id, created_at, details, organization_id, ...updates } = updatedRow;
        const { data, error } = await supabase.from(entityType).update({ details: updatedRow }).eq('id', updatedRow.id).select('*');
        if (error) {
            notification.error({ message: error.message });
        } else {
            notification.success({ message: "Updated Successfully" });
            fetchData(); // Refresh data after updating
        }
    };

    const deleteData = async (deleteRow) => {
        const { data, error } = await supabase.from(entityType).delete().eq('id', deleteRow?.id);
        if (error) {
            notification.error({ message: error.message });
        } else {
            fetchData(); // Refresh data after deleting
        }
    };

    const handleAddOrEdit = async (formData, editItem) => {
        delete formData?.id;
        if (editItem) {
            const { error } = await supabase.from(entityType).update({ details: formData }).eq('id', editItem.id);
            if (error) {
                notification.error({ message: 'Failed to update Client' });
            } else {
                fetchData();
                notification.success({ message: 'Client updated successfully' });
            }
        } else {
            const { error } = await supabase.from(entityType).insert([{ details: formData }]);
            if (error) {
                notification.error({ message: 'Failed to add Client' });
            } else {
                fetchData();
                notification.success({ message: 'Client added successfully' });
            }
        }
    };

    // Dynamically create tab items based on viewConfig
    const tabItems = [];
    if (viewConfig?.tableview) {
        tabItems.push({
            label: 'Table',
            key: '1',
            children: <TableView data={data} viewConfig={viewConfig} updateData={updateData} deleteData={deleteData} onFinish={handleAddOrEdit} />,
        });
    }
    if (viewConfig?.gridview) {
        tabItems.push({
            label: 'Grid',
            key: '2',
            children: <GridView data={data} viewConfig={viewConfig} updateData={updateData} deleteData={deleteData} onFinish={handleAddOrEdit} />,
        });
    }
    if (viewConfig?.kanbanview) {
        tabItems.push({
            label: 'Kanban',
            key: '3',
            children: <KanbanView data={data} viewConfig={viewConfig} updateData={updateData} deleteData={deleteData} onFinish={handleAddOrEdit} />,
        });
    }
    if (viewConfig?.timelineview) {
        tabItems.push({
            label: 'Timeline',
            key: '4',
            children: <Schedule data1={data} viewConfig={viewConfig} updateData={updateData} deleteData={deleteData} onFinish={handleAddOrEdit} />,
        });
    }
    if (viewConfig?.ganttview) {
        tabItems.push({
            label: 'Gantt',
            key: '5',
            children: <></>,
        });
    }
    if (viewConfig?.calendarview) {
        tabItems.push({
            label: 'Calendar',
            key: '6',
            children: <></>,
        });
    }

    return (
        <Card>
            {(data && viewConfig) && tabItems.length > 0 ? (
                <Tabs defaultActiveKey="1" items={tabItems} />
            ) : (
                <p>No view configurations available</p>
            )}
        </Card>
    );
};

export default Index;
