import React, { useEffect, useRef, useState } from 'react';
import { Button, Card, notification, Tabs } from 'antd';
import { FullscreenOutlined, FullscreenExitOutlined } from "@ant-design/icons";
import { supabase } from 'configs/SupabaseConfig';
import dayjs from 'dayjs';
import TableView from '../DynamicViews/TableView-R';
import GridView from '../DynamicViews/GridView';
import KanbanView from '../DynamicViews/KanbanView';
import GanttView from '../DynamicViews/GanttView';
import CalendarView from '../DynamicViews/CalendarView';
import { renderFilters } from 'components/util-components/utils';
import Schedule from '../DynamicViews/TimelineView';
import { useSelector } from 'react-redux';
import WorkflowStageModal from '../DynamicViews/WorkflowStageModal';
import { toggleFullscreen } from 'components/common/utils';
import useTabWithHistory from 'components/common/TabHistory';
import Dashboard from '../DynamicViews/Dashboard';
import ExportImportButtons from '../DynamicViews/CSVOptions';
// import MyScheduler from '../DynamicViews/Dk';
// import DynamicTable from '../DynamicTable/index';
// import SchedulerView from '../DynamicViews/SchedularView';

import SchedularView from '../DynamicViews/SchedularView';
import ScheduleView from '../DynamicViews/ScheduleView';

const entityType = 'y_projects'

const dataConfig = {
    mainTable: {
        table: 'y_projects',
        column: 'details', // Column where the entire or specific formData will be stored
    },
    allocationsTable: {
        table: 'alloc_duplicate',
        rows: 'userList', // Field in `formData` that contains the array for allocations
        mapping: {
            user_name: 'name',
            day: 'day'
        },
        additionalFields: { // Additional fields to include in each row
            // mainEntityId: 'project_id', // Adding the mainEntityId to allocations rows
            project_id: 'mainEntityId', // `project_id` in allocations table will map to `formData.id`
            // name: '10dad5b9-43c2-45c4-b7fa-d876323f52fz', // `project_id` in allocations table will map to `formData.id`
            // fixedField: 'fixedValue' // Can also use a fixed value if needed
        },
        wholeRowColumn: 'details' // Optional: Specify if the entire row should be stored in one column (set to column name or `null`)
    }
};


const Index = () => {

    const defaultStartDate = dayjs().subtract(30, 'days');
    // const defaultStartDate = dayjs().subtract(30, 'days');
    const defaultEndDate = dayjs();
    const [dateRange, setDateRange] = useState([defaultStartDate, defaultEndDate]);
    const [visible, setVisible] = useState(false);
    const [vd, setVd] = useState();
    const [isFullscreen, setIsFullscreen] = useState(false);
    const { activeTab, onTabChange } = useTabWithHistory("1");

    const divRef = useRef(null);

    const handleFullscreenToggle = () => {
        if (divRef.current) {
            toggleFullscreen(divRef.current);
        }
    };

    const handleModalOpen = (item) => {
        setVd(item)
        setVisible(true);
    };

    const handleModalCancel = () => {
        setVisible(false);
    };

    const { session } = useSelector((state) => state.auth);

    const onDateRangeChange = (dates) => {
        if (dates) {
            const [start, end] = dates;
            setDateRange([start, end]);
        } else {
            setDateRange([]);;
        }
    };

    const [viewConfig, setViewConfig] = useState()
    const [workflowConfig, setWorkflowConfig] = useState()
    const [data, setData] = useState()
    const [rawData, setRawData] = useState()
    const [users, setUsers] = useState();

    const fetchConfig = {
        assignee: { table: 'users', column: 'user_name' },
        // foreignKey2: { table: 'table2', column: 'uuid', fields: ['title'] },
        // foreignKey3: { table: 'table3', column: 'key', fields: ['value'] },
    };

    const fetchUsers = async () => {
        const { data, error } = await supabase.from('users').select('*').eq('organization_id', session?.user?.organization_id).eq('is_active', true);
        if (error) {
            console.error('Error fetching users:', error);
        } else {
            setUsers(data || []);
        }
    };


    // const fetchData = async () => {  //TODO: revisit direct status views with instance or merge tables later
    //     let { data, error } = await supabase.from(entityType).select('*').order('details->>name', { ascending: true });
    //     // const { data, error } = await supabase.from('task_entities_with_workflow')
    //     //     .select('id, organization_id, created_at, details, current_stage, general_state, workflow_metadata')
    //     //     .eq('organization_id', session?.user?.organization?.id).order('created_at', { ascending: false });
    //     if (data) {
    //         // console.log("Data", data.map(item => ({ ...item.details, id: item?.id, status: item?.current_stage?.name })))// data.map(task => ({ ...task.details, id: task?.id })))
    //         // setData(data.map(item => ({ ...item.details, id: item?.id, status: item?.current_stage?.name })));
    //         console.log("Data", data.map(item => ({ ...item.details, id: item?.id })))// data.map(task => ({ ...task.details, id: task?.id })))
    //         setData(data.map(item => ({ ...item.details, id: item?.id })));
    //     }
    //     if (error) {
    //         notification.error({ message: error?.message || "Failed to fetch Data" });
    //     }
    // };

    const fetchData = async () => {  //TODO: revisit direct status views with instance or merge tables later
        let { data, error } = await supabase.from(entityType).select('*').order('details->>name', { ascending: true });
        if (error) throw error;
        if (data) {
            let sales = []
            // Loop through each sale and process foreign keys from the details field
            for (let sale of data) {
                const details = sale.details;

                // Loop through each foreign key in the details and fetch related data based on config
                for (const key in details) {
                    const foreignKey = details[key];
                    if (fetchConfig[key]) {
                        const { table, column } = fetchConfig[key];

                        // Fetch data from the related table
                        const { data: relatedData, error: relatedError } = await supabase
                            .from(table)
                            .select('*') // Use * to fetch all columns if no specific column is mentioned
                            .eq('id', foreignKey);

                        if (relatedError) throw relatedError;

                        // Store the related data in a separate object for now
                        sale.related_data = sale.related_data || {};
                        sale.related_data[key] = relatedData[0]; // Store by key
                    }
                }
            }
            console.log("Data", data, data.map(item => ({ ...item.details, id: item?.id })))// data.map(task => ({ ...task.details, id: task?.id })))
            setRawData(data);
            setData(data.map(item => ({ ...item.details, id: item?.id, related_data: item?.related_data })));
        }
        if (error) {
            notification.error({ message: error?.message || "Failed to fetch Data" });
        }
    };
    const fetchWorkflowConfiguration = async () => {
        const { data, error } = await supabase.from('workflow_configurations').select('*').eq('entity_type', entityType)
            .eq('organization_id', session?.user?.organization?.id);
        if (data) {
            console.log("WorkflowConfig", data)
            setWorkflowConfig(data[0]);
        }
        if (error) {
            notification.error({ message: error?.message || "Failed to fetch Workflow Config" });
        }
    };

    const fetchViewConfigs = async () => {
        let { data, error } = await supabase.from('y_view_config').select('*').eq('entity_type', entityType);
        if (data) {
            console.log("viewConfig", data[0])
            setViewConfig(data && data[0]);
        }
        if (error) {
            notification.error({ message: error?.message || "Failed to fetch View Config" });
        }
    };

    useEffect(() => {
        fetchViewConfigs();
        fetchData();
        fetchWorkflowConfiguration()
        fetchUsers()
    }, []);


    const updateData = async (updatedRow) => {
        const { id, ...updates } = updatedRow
        console.log("UR", updates)
        delete updatedRow?.id
        const { data, error } = await supabase.from(entityType).update({ details: updatedRow, organization_id: session?.user?.organization?.id }).eq('id', id).select('*');

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

    const handleAddOrEdit = async (formData, editItem) => {
        const { mainTable, allocationsTable } = dataConfig;

        // Handle main table
        if (editItem) {
            // Update main table with formData or specific object
            const { data, error } = await supabase
                .from(mainTable.table)
                .update({ [mainTable.column]: formData })
                .eq('id', editItem.id)
                .select('*');

            if (error) {
                notification.error({ message: 'Failed to update main table' });
                return;
            }
        } else {
            // Insert into main table
            const { data, error } = await supabase
                .from(mainTable.table)
                .insert([{ [mainTable.column]: formData, organization_id: session?.user?.organization_id }])
                .select('*');

            if (error) {
                notification.error({ message: 'Failed to add to main table' });
                return;
            }

            const newEntityId = data[0]?.id;

            // Handle allocations
            await handleAllocations(formData, allocationsTable, newEntityId);

            notification.success({ message: 'Added successfully' });
        }
    };

    const handleAllocations = async (formData, allocationsTable, mainEntityId) => {
        const { table, rows, mapping, additionalFields, wholeRowColumn } = allocationsTable;
        const itemsList = formData[rows];

        if (Array.isArray(itemsList)) {
            const formattedRows = itemsList?.map(item => {
                const newRow = {};

                // If wholeRowColumn is specified, store the entire row as a single value
                if (wholeRowColumn) {
                    newRow[wholeRowColumn] = item;
                } else {
                    // Map specific fields to columns
                    Object.keys(mapping).forEach(key => {
                        newRow[mapping[key]] = item[key];
                    });
                }

                // Add additional fields to each row
                if (additionalFields) {
                    Object.keys(additionalFields).forEach(fieldKey => {
                        const fieldValue = additionalFields[fieldKey];

                        // If the value in additionalFields is 'mainEntityId', use the mainEntityId
                        if (fieldValue === 'mainEntityId') {
                            newRow[fieldKey] = mainEntityId;
                        } else if (formData[fieldValue] !== undefined) {
                            // Otherwise, use the value from formData
                            newRow[fieldKey] = formData[fieldValue];
                        } else {
                            // If no value in formData, use the fixed value specified in additionalFields
                            newRow[fieldKey] = fieldValue;
                        }
                    });
                }

                return { ...newRow, organization_id: session?.user?.organization_id };
            });
            console.log("rw", formattedRows)
            // Insert rows into allocations table
            const { data, error } = await supabase
                .from(table)
                .insert(formattedRows);

            if (error) {
                notification.error({ message: `Failed to add to ${table}` });
                console.error('Error:', error);
            }
        }
    };

    const tabItems = [];
    if (viewConfig?.tableview) {
        tabItems.push({
            label: 'Table',
            key: '1',
            children: <TableView data={data} viewConfig={viewConfig} fetchConfig={fetchConfig} users={users} updateData={updateData} deleteData={deleteData} onFinish={handleAddOrEdit} />,
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
            children: <KanbanView data={data} viewConfig={viewConfig} workflowConfig={workflowConfig} updateData={updateData} deleteData={deleteData} onFinish={handleAddOrEdit} />
        })
    }
    if (viewConfig?.ganttview) {
        tabItems.push({
            label: 'Gantt',
            key: '5',
            children: <GanttView data={data} viewConfig={viewConfig} workflowConfig={workflowConfig} updateData={updateData} deleteData={deleteData} onFinish={handleAddOrEdit} />,
        })
    }
    if (viewConfig?.calendarview) {
        tabItems.push({
            label: 'Calendar',
            key: '6',
            children: <CalendarView data={data} viewConfig={viewConfig} workflowConfig={workflowConfig} updateData={updateData} deleteData={deleteData} onFinish={handleAddOrEdit} />,
        })
    }
    if (viewConfig?.calendarview) {
        tabItems.push({
            label: 'Schedule',
            key: '7',
            children: <SchedularView data={data} viewConfig={viewConfig} workflowConfig={workflowConfig} updateData={updateData} deleteData={deleteData} onFinish={handleAddOrEdit} />,
            // children: <ScheduleView />,
        })
    }
    if (viewConfig?.dashboardview) {
        tabItems.push({
            label: 'Dashboard',
            key: '8',
            children: <Dashboard data={data} viewConfig={viewConfig} workflowConfig={workflowConfig} updateData={updateData} deleteData={deleteData} onFinish={handleAddOrEdit} />,
        })
    }


    const required = {
        exit_criteria: {
            lead_score: {
                minimum: "50"
            },
            has_contacted: true,
            qualification_complete: true
        },
        entry_criteria: {}
    };

    const schemas = {
        data_schema: {
            viewBy: "projects",
            title: "Project User Time",
            type: "array",
            // items: [
            //     { type: "string", title: "User" },
            //     { type: "string", title: "Project" },
            //     { type: "number", title: "Time" },
            // ],
            items: [
                {
                    type: "string",
                    title: "User",
                    field: "user_id", // User selection field
                },
                // {
                //     type: "string",
                //     title: "Project",
                //     field: "project_id", // Project selection field
                // },
                {
                    type: "number",
                    title: "Allocated Hr",
                    field: "allocated_hours", // Field for allocated hours input
                },
                {
                    type: "string",
                    title: "Start Date",
                    field: "start_date", // Start date field
                },
                {
                    type: "string",
                    title: "End Date",
                    field: "end_date", // End date field
                },
                {
                    type: "number",
                    title: "Rate/Hr",
                    field: "rate", // Hourly rate field
                },
                {
                    type: "number",
                    title: "Expensed Hr",
                    field: "expensed_hours", // Expensed hours, which may be calculated or disabled
                },
            ],
        },
        ui_schema: {
            "ui:widget": "EditableTableWidget",  // Referencing the custom widget
        }
    }

    const onFinish = (data) => {
        console.log(data)
    }
    return (
        <Card ref={divRef}>
            {(data && viewConfig) && <Tabs
                tabBarExtraContent={ //Global filters
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <ExportImportButtons data={rawData} fetchData={fetchData} entityType={entityType} viewConfig={viewConfig} />
                        {renderFilters(viewConfig?.global?.search, data)}
                        <Button onClick={handleFullscreenToggle} style={{ fontSize: "16px", padding: "8px", cursor: "pointer" }}>
                            {isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                            {/* {isFullscreen ? " Exit Fullscreen" : " Go Fullscreen"} */}
                        </Button>
                    </div>
                }
                defaultActiveKey="1" items={tabItems} activeKey={activeTab} onChange={onTabChange} />}
            {vd && <WorkflowStageModal handleWorkflowTransition={handleWorkflowTransition} entityType={entityType}
                visible={visible} viewConfig={viewConfig}
                onCancel={() => { fetchData(); setVisible(false); console.log("e") }}
                data={vd}  // Pass the response data (vd) to the modal
            />}
        </Card>
    );
}

export default Index;