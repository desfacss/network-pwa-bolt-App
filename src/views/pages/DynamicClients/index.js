import { Card, notification, Tabs } from 'antd';
import { supabase } from 'configs/SupabaseConfig';
import React, { useEffect, useState } from 'react';
import DynamicForm from '../DynamicForm';
import GridView from '../DynamicViews/GridView';
import TableView from '../DynamicViews/TableView';

const db_table_name = 'clients'

const Index = () => {
    const [viewConfig, setViewConfig] = useState()
    const [data, setData] = useState()

    const fetchData = async () => {
        let { data, error } = await supabase.from(db_table_name).select('*').order('details->>name', { ascending: true });
        if (data) {
            console.log("Data", data.map(task => ({ ...task.details, id: task?.id })), data.map(item => ({ ...item, ...item.details, details: undefined })))
            // setData(data.map(item => ({ ...item, ...item.details, details: undefined })));
            setData(data.map(task => ({ ...task.details, id: task?.id })));
        }
        if (error) {
            notification.error({ message: error?.message || "Failed to fetch Data" });
        }
    };

    const fetchViewConfigs = async () => {
        let { data, error } = await supabase.from('y_view_config').select('*').eq('db_table_name', db_table_name);
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
        const { id, created_at, details, organization_id, ...updates } = updatedRow
        console.log("UR", updates)
        const { data, error } = await supabase.from(db_table_name).update({ details: updatedRow }).eq('id', updatedRow.id).select('*');

        if (error) {
            notification.error({ message: error.message });
        } else {
            notification.success({ message: "Updated Successfully" })
            fetchData(); // Refresh data after updating
        }
    };

    const deleteData = async (deleteRow) => {
        console.log("Del", deleteRow?.id)
        const { data, error } = await supabase.from(db_table_name).delete().eq('id', deleteRow?.id);
        if (error) {
            notification.error({ message: error.message });
        } else {
            fetchData(); // Refresh data after deleting
        }
    };

    const handleAddOrEdit = async (formData, editItem) => {
        console.log(formData, editItem)
        delete formData?.id
        if (editItem) {
            // Update logic
            const { error } = await supabase.from(db_table_name).update({ details: formData }).eq('id', editItem.id);
            if (error) {
                notification.error({ message: 'Failed to update task' });
            } else {
                fetchData();
                notification.success({ message: 'Task updated successfully' });
            }
        } else {
            // Add logic
            const { error } = await supabase.from(db_table_name).insert([{ details: formData }]);
            if (error) {
                notification.error({ message: 'Failed to add task' });
            } else {
                fetchData();
                notification.success({ message: 'Task added successfully' });
            }
        }
    };



    const tabItems = [
        {
            label: 'Table',
            key: '1',
            children: <TableView data={data} viewConfig={viewConfig} updateData={updateData} deleteData={deleteData} onFinish={handleAddOrEdit} />,
        },
        {
            label: 'Grid',
            key: '2',
            children: <GridView data={data} viewConfig={viewConfig} updateData={updateData} deleteData={deleteData} onFinish={handleAddOrEdit} />
        },
        // {
        //     label: 'Gantt',
        //     key: '3',
        //     children: <GanttView
        //     // tasks={tasks} 
        //     />,
        // },
        // {
        //     label: 'Calendar',
        //     key: '4',
        //     children: <CalendarView tasks={tasks} />,
        // },
    ];

    return (
        <Card>
            {/* <DynamicForm schemas={viewConfig} /> */}
            {(data && viewConfig) && <Tabs defaultActiveKey="1" items={tabItems} />}
        </Card>
    );
}

export default Index;