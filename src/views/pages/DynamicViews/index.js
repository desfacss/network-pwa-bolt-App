import React, { useEffect, useRef, useState } from 'react';
import { Button, Card, Drawer, notification, Tabs } from 'antd';
import { FullscreenOutlined, FullscreenExitOutlined } from "@ant-design/icons";
import { supabase } from 'configs/SupabaseConfig';
import dayjs from 'dayjs';
import TableView from './TableView-R';
import GridView from './GridView';
import KanbanView from './KanbanView';
import GanttView from './GanttView';
import CalendarView from './CalendarView';
import { renderFilters } from 'components/util-components/utils';
import Schedule from './TimelineView';
import { useSelector } from 'react-redux';
import WorkflowStageModal from './WorkflowStageModal';
import { toggleFullscreen } from 'components/common/utils';
import useTabWithHistory from 'components/common/TabHistory';
import Dashboard from './Dashboard';
import ExportImportButtons from './CSVOptions';
import DynamicForm from '../DynamicForm';
// import SchedularView from './SchedularView';

// const entityType = 'y_sales'

const Index = ({ entityType }) => {

    const defaultStartDate = dayjs().subtract(30, 'days');
    // const defaultStartDate = dayjs().subtract(30, 'days');
    const defaultEndDate = dayjs();
    const [dateRange, setDateRange] = useState([defaultStartDate, defaultEndDate]);
    const [visible, setVisible] = useState(false);
    const [vd, setVd] = useState();
    const [isFullscreen, setIsFullscreen] = useState(false);
    const { activeTab, onTabChange } = useTabWithHistory("1");

    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const [editItem, setEditItem] = useState(null);

    const openDrawer = (item = null) => {
        setEditItem(item);
        setIsDrawerVisible(true);
    };

    const closeDrawer = () => {
        setIsDrawerVisible(false);
        setEditItem(null);
    };

    // useEffect(() => {
    //     const handleFullscreenChange = () => {
    //         setIsFullscreen(!!document.fullscreenElement);
    //     };

    //     document.addEventListener("fullscreenchange", handleFullscreenChange);
    //     return () => {
    //         document.removeEventListener("fullscreenchange", handleFullscreenChange);
    //     };
    // }, []);

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
    const [users, setUsers] = useState();

    const fetchConfig = {
        // assignee: { table: 'users', column: 'user_name' },
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
        console.log("Da", data)
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
            console.log("Data", sales, data, data.map(item => ({ ...item.details, id: item?.id })))// data.map(task => ({ ...task.details, id: task?.id })))
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



    // const handleAddOrEdit = async (formData, editItem) => {
    //     console.log(formData, editItem)
    //     delete formData?.id
    //     if (editItem) {
    //         // Update logic
    //         const { data, error } = await supabase.from(entityType).update({ details: formData, organization_id: session?.user?.organization?.id }).eq('id', editItem.id).select('*');
    //         if (error) {
    //             notification.error({ message: 'Failed to update task' });
    //         } else {
    //             const { data: vd, error } = await supabase
    //                 .rpc('transition_workflow_stage_v4', {
    //                     entitytype: entityType,
    //                     entityid: data[0]?.id,
    //                     newstagename: formData?.status,
    //                     userid: session?.user?.id,
    //                     reason: "",
    //                 });
    //             console.log("q", data[0]?.id, error, formData, editItem, vd)
    //             if (error) {
    //                 console.error('Error fetching data:', error);
    //             } else {
    //                 handleModalOpen({ ...vd, id: editItem.id, details: formData })
    //                 fetchData();
    //                 notification.success({ message: 'Task updated successfully' });
    //             }
    //         }
    //     } else {
    //         // Add logic
    //         const { data, error } = await supabase.from(entityType).insert([{ details: formData, organization_id: session?.user?.organization?.id }]).select('*');
    //         if (error) {
    //             notification.error({ message: 'Failed to add task' });
    //         } else {
    //             console.log("q", data[0]?.id, formData?.name)
    //             const { data: vd, error } = await supabase
    //                 .rpc('initialize_workflow_instance_v4', {
    //                     entitytype: entityType,
    //                     entityid: data[0]?.id,
    //                 });
    //             console.log("w", error, vd)
    //             if (error) {
    //                 console.error('Error fetching data:', error);
    //             } else {
    //                 fetchData();
    //                 notification.success({ message: 'Added successfully' });
    //             }
    //         }
    //     }
    // };
    const tabItems = [];
    if (viewConfig?.tableview) {
        tabItems.push({
            label: 'Table',
            key: '1',
            children: <TableView data={data} viewConfig={viewConfig} fetchConfig={fetchConfig} users={users} updateData={updateData} deleteData={deleteData} openDrawer={openDrawer} />,
        })
    }
    if (viewConfig?.gridview) {
        tabItems.push({
            label: 'Grid',
            key: '2',
            children: <GridView data={data} viewConfig={viewConfig} updateData={updateData} deleteData={deleteData} openDrawer={openDrawer} />
        })
    }
    if (viewConfig?.timelineview) {
        tabItems.push({
            label: 'Timeline',
            key: '3',
            children: <Schedule data1={data} viewConfig={viewConfig} updateData={updateData} deleteData={deleteData} openDrawer={openDrawer} />
        })
    }
    if (viewConfig?.kanbanview) {
        tabItems.push({
            label: 'Kanban',
            key: '4',
            children: <KanbanView data={data} viewConfig={viewConfig} workflowConfig={workflowConfig} updateData={updateData} deleteData={deleteData} openDrawer={openDrawer} onFinish={handleAddOrEdit} />
        })
    }
    if (viewConfig?.ganttview) {
        tabItems.push({
            label: 'Gantt',
            key: '5',
            children: <GanttView data={data} viewConfig={viewConfig} workflowConfig={workflowConfig} updateData={updateData} deleteData={deleteData} openDrawer={openDrawer} onFinish={handleAddOrEdit} />,
        })
    }
    if (viewConfig?.calendarview) {
        tabItems.push({
            label: 'Calendar',
            key: '6',
            children: <CalendarView data={data} viewConfig={viewConfig} workflowConfig={workflowConfig} updateData={updateData} deleteData={deleteData} openDrawer={openDrawer} onFinish={handleAddOrEdit} />,
        })
    }
    // if (viewConfig?.calendarview) {
    //     tabItems.push({
    //         label: 'Schedule',
    //         key: '7',
    //         children: <SchedularView data={data} viewConfig={viewConfig} workflowConfig={workflowConfig} updateData={updateData} deleteData={deleteData} openDrawer={openDrawer} />,
    //     })
    // }
    if (viewConfig?.dashboardview) {
        tabItems.push({
            label: 'Dashboard',
            key: '8',
            children: <Dashboard data={data} viewConfig={viewConfig} workflowConfig={workflowConfig} updateData={updateData} deleteData={deleteData} openDrawer={openDrawer} onFinish={handleAddOrEdit} />,
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

    return (
        <Card ref={divRef}>
            {(data && viewConfig) && (
                tabItems.length > 1 ? (
                    <Tabs
                        tabBarExtraContent={ //Global filters
                            <div style={{ display: "flex", alignItems: "center" }}>
                                {/* <ExportImportButtons data={data} fetchData={fetchData} /> */}
                                {renderFilters(viewConfig?.global?.search, data)}
                                <Button onClick={handleFullscreenToggle} style={{ fontSize: "16px", padding: "8px", cursor: "pointer" }}>
                                    {isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                                    {/* {isFullscreen ? " Exit Fullscreen" : " Go Fullscreen"} */}
                                </Button>
                            </div>
                        }
                        defaultActiveKey="1" items={tabItems} activeKey={activeTab} onChange={onTabChange} />
                ) : (
                    // Display the only available view directly (no tabs)
                    tabItems[0]?.children
                )
            )}
            {vd && <WorkflowStageModal handleWorkflowTransition={handleWorkflowTransition} entityType={entityType}
                visible={visible} viewConfig={viewConfig}
                onCancel={() => { fetchData(); setVisible(false); console.log("e") }}
                data={vd}  // Pass the response data (vd) to the modal
            />}
            <Drawer
                width="50%"
                title={editItem ? 'Edit Task' : 'Add New Task'}
                open={isDrawerVisible}
                onClose={closeDrawer}
                footer={null}
            >
                <DynamicForm
                    schemas={viewConfig} // Replace with actual schemas
                    formData={editItem || {}}
                    onFinish={(formData) => {
                        handleAddOrEdit(formData, editItem);
                        closeDrawer();
                    }}
                />
            </Drawer>
        </Card>
    );
}

export default Index;