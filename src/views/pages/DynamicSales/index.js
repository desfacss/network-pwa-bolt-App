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
import WorkflowStageModal from '../DynamicViews/WorkflowStageModal';

const { RangePicker } = DatePicker;
const { Option } = Select;

const entityType = 'y_sales'

const Index = () => {

    const defaultStartDate = dayjs().subtract(30, 'days');
    // const defaultStartDate = dayjs().subtract(30, 'days');
    const defaultEndDate = dayjs();
    const [dateRange, setDateRange] = useState([defaultStartDate, defaultEndDate]);
    const [visible, setVisible] = useState(false);
    const [vd, setVd] = useState();

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

    const fetchUsers = async () => {
        const { data, error } = await supabase.from('users').select('*').eq('organization_id', session?.user?.organization_id);
        if (error) {
            console.error('Error fetching users:', error);
        } else {
            setUsers(data || []);
        }
    };


    const fetchData = async () => {
        // let { data, error } = await supabase.from(entityType).select('*').order('details->>name', { ascending: true });
        const { data, error } = await supabase.from('task_entities_with_workflow')
            .select('id, organization_id, created_at, details, current_stage, general_state, workflow_metadata')
            .eq('organization_id', session?.user?.organization?.id).order('created_at', { ascending: false });
        if (data) {
            console.log("Data", data)// data.map(task => ({ ...task.details, id: task?.id })))
            // setData(data.map(item => ({ ...item, ...item.details, details: undefined })));
            setData(data.map(item => ({ ...item.details, id: item?.id, status: item?.current_stage?.name })));
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

    const handleAddOrEdit = async (formData, editItem) => {
        console.log(formData, editItem)
        delete formData?.id
        if (editItem) {
            // Update logic
            const { data, error } = await supabase.from(entityType).update({ details: formData, organization_id: session?.user?.organization?.id }).eq('id', editItem.id).select('*');
            if (error) {
                notification.error({ message: 'Failed to update task' });
            } else {
                const { data: vd, error } = await supabase
                    .rpc('transitionworkflowstage', {
                        entitytype: entityType,
                        entityid: data[0]?.id,
                        newstagename: formData?.status,
                        userid: session?.user?.id,
                        reason: "",
                    });
                console.log("q", data[0]?.id, error, formData, editItem, vd)
                if (error) {
                    console.error('Error fetching data:', error);
                } else {
                    handleModalOpen({ ...vd, id: editItem.id, details: formData })
                    fetchData();
                    notification.success({ message: 'Task updated successfully' });
                }
            }
        } else {
            // Add logic
            const { data, error } = await supabase.from(entityType).insert([{ details: formData, organization_id: session?.user?.organization?.id }]).select('*');
            if (error) {
                notification.error({ message: 'Failed to add task' });
            } else {
                console.log("q", data[0]?.id, formData?.name)
                const { data: vd, error } = await supabase
                    .rpc('initialize_workflow_instance', {
                        entitytype: entityType,
                        entityid: data[0]?.id,
                    });
                console.log("w", error, vd)
                if (error) {
                    console.error('Error fetching data:', error);
                } else {
                    fetchData();
                    notification.success({ message: 'Added successfully' });
                }
            }
        }
    };

    const tabItems = [
        {
            label: 'Table',
            key: '1',
            children: <TableView data={data} viewConfig={viewConfig} users={users} updateData={updateData} deleteData={deleteData} onFinish={handleAddOrEdit} />,
        },
        {
            label: 'Grid',
            key: '2',
            children: <GridView data={data} viewConfig={viewConfig} updateData={updateData} deleteData={deleteData} onFinish={handleAddOrEdit} />
        },
        {
            label: 'Timeline',
            key: '3',
            children: <Schedule data1={data} viewConfig={viewConfig} updateData={updateData} deleteData={deleteData} onFinish={handleAddOrEdit} />
        },
        {
            label: 'Kanban',
            key: '4',
            children: <KanbanView data={data} viewConfig={viewConfig} workflowConfig={workflowConfig} updateData={updateData} deleteData={deleteData} onFinish={handleAddOrEdit} />
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
            {(data && viewConfig) && <Tabs
                tabBarExtraContent={ //Global filters
                    <div style={{ display: "flex", alignItems: "center" }}>
                        {renderFilters(viewConfig?.global?.search, data)}
                    </div>
                }
                defaultActiveKey="1" items={tabItems} />}
            {vd && <WorkflowStageModal
                visible={visible}
                onCancel={handleModalCancel}
                data={vd}  // Pass the response data (vd) to the modal
            />}
        </Card>
    );
}

export default Index;