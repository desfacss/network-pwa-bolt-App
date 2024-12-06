import { Card, notification, Tabs } from 'antd';
import { supabase } from 'configs/SupabaseConfig';
import React, { useEffect, useState } from 'react';
import GridView from '../DynamicViews/GridView';
import TableView from '../DynamicViews/TableView';

const db_table_name = 'y_tasks'

// const TableviewConfig = {
//     viewName: "TableView",
//     fields: [
//         { fieldName: "name", order: 1 },
//         { fieldName: "priority", order: 2 },
//         { fieldName: "due_date", order: 3 },
//         { fieldName: "status", order: 4 },
//         { fieldName: "assignee", order: 5 }
//     ],
//     groupBy: ["status"],
//     actions: {
//         row: ["edit", "delete"],
//         bulk: ["assign", "mark_complete"]
//     }
// };


// const data = [
//     {
//         id: 1,
//         name: "Design wireframes",
//         priority: "High",
//         due_date: "2024-12-05",
//         status: "In Progress",
//         assignee: "John Doe"
//     },
//     {
//         id: 2,
//         name: "Develop API",
//         priority: "Critical",
//         due_date: "2024-12-06",
//         status: "Todo",
//         assignee: "Jane Smith"
//     },
//     {
//         id: 3,
//         name: "Test deployment",
//         priority: "Medium",
//         due_date: "2024-12-07",
//         status: "Todo",
//         assignee: "Alice Brown"
//     }
// ];

const Index = () => {
    const [viewConfig, setViewConfig] = useState()
    const [data, setData] = useState()

    const fetchData = async () => {
        let { data, error } = await supabase.from(db_table_name).select('*').order('details->>name', { ascending: true });
        if (data) {
            // console.log("Data", data.map(item => ({ ...item, ...item.details, details: undefined })))
            setData(data.map(item => ({ ...item, ...item.details, details: undefined })));
        }
        if (error) {
            notification.error({ message: error?.message || "Failed to fetch Data" });
        }
    };

    const fetchViewConfigs = async () => {
        let { data, error } = await supabase.from('y_view_config').select('*').eq('db_table_name', db_table_name);
        if (data) {
            // console.log("viewConfig", data[0])
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

    const tabItems = [
        {
            label: 'Table',
            key: '1',
            children: <TableView data={data} viewConfig={viewConfig?.tableview} />,
        },
        {
            label: 'Grid',
            key: '2',
            children: <GridView data={data} viewConfig={viewConfig?.gridview} />
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

    const onDelete = () => {
        console.log("")
    }

    const onEdit = () => {
        console.log("")
    }

    return (
        <Card>
            {(data && viewConfig) && <Tabs defaultActiveKey="1" items={tabItems} />}
        </Card>
    );
}

export default Index;