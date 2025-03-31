import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, Drawer, Input, Modal, notification, Tabs, Typography } from 'antd';
import { FullscreenOutlined, FullscreenExitOutlined, TableOutlined, AppstoreOutlined, ScheduleOutlined, BarsOutlined, FundOutlined, CalendarOutlined, DashboardOutlined, SearchOutlined } from "@ant-design/icons";
import { supabase } from 'configs/SupabaseConfig';
import { Route, Routes, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import TableView from './TableView';
import GridView from './GridView';
import KanbanView from './KanbanView';
import GanttView from './GanttView';
import CalendarView from './CalendarView';
import { renderFilters, snakeCaseToTitleCase } from 'components/util-components/utils';
import Schedule from './TimelineView';
import { useSelector } from 'react-redux';
import WorkflowStageModal from './WorkflowStageModal';
import { toggleFullscreen } from 'components/common/utils';
import useTabWithHistory from 'components/common/TabHistory';
import Dashboard from './Dashboard';
import ExportImportButtons from './CSVOptions';
import DynamicForm from '../DynamicForm';
import DetailsView from './DetailsView';
import { removeNullFields, transformData } from './utils';
import PostMessage from '../Channels/PostMessage';
import { protectedRoutes } from 'configs/RoutesConfig';
import LoadingComponent from 'components/layout-components/LoadingComponent';

const flattenData = (data, masterObject) => {
    let flatData = {};
    masterObject.forEach(field => {
        const keys = field.key.split('.');
        let value = data;
        for (const key of keys) {
            value = value?.[key];
            if (value === undefined) break;
        }
        if (field.foreign_key) {
            flatData[field.key] = value;
        } else {
            flatData[field.key] = value || null;
        }
    });
    return flatData;
};

const Index = ({ entityType, addEditFunction, setCallFetch, fetchFilters, uiFilters, tabs, tabOptions, customFilters, routes = [], EmptyMessage }) => {
    const defaultStartDate = dayjs().subtract(30, 'days');
    const defaultEndDate = dayjs();
    const [dateRange, setDateRange] = useState([defaultStartDate, defaultEndDate]);
    const [visible, setVisible] = useState(false);
    const [vd, setVd] = useState();
    const [schemas, setSchemas] = useState();
    const [isFullscreen, setIsFullscreen] = useState(false);
    const { activeTab, onTabChange } = useTabWithHistory(tabOptions?.[0]?.key || "1");
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [messageReceiverId, setMessageReceiverId] = useState(null);
    const [selectedTab, setSelectedTab] = useState(tabOptions?.[0]?.key || '');
    const [selectedView, setSelectedView] = useState(null); // Initially null, set after viewItems is computed

    const [drawerPath, setDrawerPath] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalPath, setModalPath] = useState(null);
    // const history = useHistory();
    const navigate = useNavigate();

    const openDrawerWithPath = (path) => {
        setDrawerPath(path);
        setIsDrawerVisible(true);
    };

    const closeDrawerWithPath = () => {
        setDrawerPath(null);
        setIsDrawerVisible(false);
    };

    const openModalWithPath = (path) => {
        setModalPath(path);
        setIsModalVisible(true);
    };

    const closeModalWithPath = () => {
        setModalPath(null);
        setIsModalVisible(false);
    };

    const enhancedOpenDrawer = (item = null, view = false, form = "", path = null, mode = 'navigate') => {
        if (path) {
            switch (mode) {
                case 'navigate':
                    navigate(path); // Navigate in current tab
                    break;
                case 'new-tab':
                    window.open(path, '_blank', 'noopener,noreferrer'); // Open in new tab
                    break;
                case 'modal':
                    openModalWithPath(path); // Open in Modal
                    break;
                case 'drawer':
                    openDrawerWithPath(path); // Open in Drawer
                    break;
                default:
                    navigate(path); // Default to navigate
            }
        } else {
            // Handle existing form/view logic
            setEditItem(item);
            setViewMode(view);
            setIsDrawerVisible(true);
            if (form) fetchFormSchema(form, item);
        }
    };

    // Render routes dynamically based on the provided routes prop
    const renderRoutes = (path) => {
        console.log('Rendering routes for path:', path); // Debug log
        return (
            <Routes>
                {/* {routes.map((route, index) => ( */}
                {protectedRoutes(session?.user?.features?.feature, session?.user?.organization?.module_features)?.map((route, index) => (
                    <Route
                        key={index}
                        path={route.path}
                        element={<route.component />}
                    />
                ))}
                <Route path="*" element={<div>Route not found</div>} />
            </Routes>
        );
    };

    const handleOpenMessageModal = (receiverId) => {
        setMessageReceiverId(receiverId);
    };

    const handleCloseModal = () => {
        setMessageReceiverId(null);
    };

    const openDrawer = addEditFunction || ((item = null, view = false, form = "") => {
        if (item) {
            const formData = removeNullFields(item);
            setEditItem(formData);
        }
        setIsDrawerVisible(true);
        setViewMode(view);
        if (form) {
            fetchFormSchema(form, item);
        }
    });

    const fetchFormSchema = async (formName, formData) => {
        try {
            const { data, error } = await supabase
                .from('forms')
                .select('*')
                .eq('name', formName)
                .single();

            if (error) {
                console.error("Error fetching form schema:", error);
                return;
            }
            if (data) {
                console.log("Data fetched:", data);
                setSchemas(data);
                console.log("ttr", formData, data?.data_config, transformData(formData, data?.data_config));
            } else {
                console.warn("No form found with name:", formName);
            }
        } catch (err) {
            console.error("Error in fetchFormSchema:", err);
        }
    };

    const closeDrawer = () => {
        setIsDrawerVisible(false);
        setEditItem(null);
    };

    const divRef = useRef(null);

    const handleFullscreenToggle = () => {
        if (divRef.current) {
            toggleFullscreen(divRef.current);
        }
    };

    const handleModalOpen = (item) => {
        setVd(item);
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
            setDateRange([]);
        }
    };

    const [viewConfig, setViewConfig] = useState();
    const [workflowConfig, setWorkflowConfig] = useState();
    const [data, setData] = useState();
    const [rawData, setRawData] = useState();
    const [allData, setAllData] = useState();
    const [users, setUsers] = useState();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [viewMode, setViewMode] = useState(false);
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        const filterData = () => {
            if (!uiFilters || uiFilters.length === 0) return allData;
            return allData?.filter(item => {
                const tags = item.details_tags || [];
                return uiFilters?.some(filter =>
                    filter.column === 'details_tags' &&
                    filter.value.some(value => tags.includes(value))
                );
            });
        };
        if (allData) {
            const filteredData = filterData();
            console.log("fd", uiFilters, filteredData);
            setData(filteredData);
        }
    }, [uiFilters]);

    const fetchConfig = {};

    const fetchUsers = async () => {
        const { data, error } = await supabase.from('users').select('*').eq('organization_id', session?.user?.organization_id).eq('is_active', true);
        if (error) {
            console.error('Error fetching users:', error);
        } else {
            setUsers(data || []);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        console.log("viewConfig", viewConfig);

        let query = supabase.from(entityType).select('*').eq('organization_id', session?.user?.organization_id).eq('is_active', true);

        // Apply fetchFilters from parent component
        if (fetchFilters && fetchFilters.length > 0) {
            fetchFilters.forEach(filter => {
                const { column, value } = filter;
                if (column && value !== undefined) {
                    if (column.includes('.')) {
                        const [jsonField, jsonKey] = column.split('.');
                        query = query.eq(`${jsonField}->>${jsonKey}`, value);
                    } else {
                        query = query.eq(column, value);
                    }
                }
            });
        }

        const currentTabFilters = tabOptions?.find(option => option.key === selectedTab)?.fetchFilters || [];
        currentTabFilters?.forEach(filter => {
            const { column, value } = filter;
            if (column && value !== undefined) {
                if (column.includes('.')) {
                    const [jsonField, jsonKey] = column.split('.');
                    query = query.eq(`${jsonField}->>${jsonKey}`, value);
                } else {
                    query = query.eq(column, value);
                }
            }
        });

        console.log("QR", fetchFilters, query);
        let { data, error } = await query;

        setRawData(data);
        data = data?.map(obj => flattenData(obj, viewConfig?.master_object));

        if (error) throw error;

        if (data) {
            // let sales = [];
            // for (let sale of data) {
            //     for (const field of viewConfig?.master_object) {
            //         if (field.foreign_key) {
            //             const foreignKeyValue = sale[field.key];
            //             if (foreignKeyValue) {
            //                 const { source_table, source_column, display_column } = field.foreign_key;
            //                 let relatedData;
            //                 let relatedError;
            //                 if (Array.isArray(foreignKeyValue)) {
            //                     ({ data: relatedData, error: relatedError } = await supabase
            //                         .from(source_table)
            //                         .select('*')
            //                         .in(source_column, foreignKeyValue));
            //                 } else {
            //                     ({ data: relatedData, error: relatedError } = await supabase
            //                         .from(source_table)
            //                         .select('*')
            //                         .eq(source_column, foreignKeyValue));
            //                 }
            //                 if (relatedError) throw relatedError;
            //                 sale.related_data = sale.related_data || {};
            //                 sale.related_data[field.key] = Array.isArray(foreignKeyValue) ? relatedData : relatedData?.[0];
            //             }
            //         }
            //     }
            // }
            console.log("Dtr", data);
            setAllData(data);
            setData(data);
        }

        if (error) {
            notification.error({ message: error?.message || "Failed to fetch Data" });
        }
        setLoading(false);
    };

    const fetchWorkflowConfiguration = async () => {
        const { data, error } = await supabase.from('workflow_configurations').select('*').eq('entity_type', entityType)
            .eq('organization_id', session?.user?.organization?.id);
        if (data) {
            console.log("WorkflowConfig", data);
            setWorkflowConfig(data[0]);
        }
        if (error) {
            notification.error({ message: error?.message || "Failed to fetch Workflow Config" });
        }
    };

    const fetchViewConfigs = async () => {
        let { data, error } = await supabase.from('y_view_config').select('*').eq('entity_type', entityType);
        if (data) {
            console.log("viewConfigT", data[0]);
            setViewConfig(data && data[0]);
        }
        if (error) {
            notification.error({ message: error?.message || "Failed to fetch View Config" });
        }
    };

    useEffect(() => {
        fetchViewConfigs();
        fetchWorkflowConfiguration();
        fetchUsers();
    }, []);

    useEffect(() => {
        if (viewConfig) {
            fetchData();
            if (setCallFetch && typeof setCallFetch === "function") {
                setCallFetch(() => fetchData);
            }
        }
    }, [currentPage, viewConfig, selectedTab, fetchFilters]);

    const updateData = async (updatedRow) => {
        const { id, ...updates } = updatedRow;
        console.log("UR", updates);
        delete updatedRow?.id;
        const { data, error } = await supabase.from(entityType).update({ details: updatedRow, organization_id: session?.user?.organization?.id }).eq('id', id).select('*');

        if (error) {
            notification.error({ message: error.message });
        } else {
            notification.success({ message: "Updated Successfully" });
            fetchData();
        }
    };

    const deleteData = async (deleteRow) => {
        console.log("Del", deleteRow?.id);
        if (session?.user?.role_type === "superadmin") {
            const { data, error } = await supabase.from(entityType).delete().eq('id', deleteRow?.id);
            if (error) {
                notification.error({ message: error.message });
            } else {
                fetchData();
            }
        } else {
            const { data, error } = await supabase.from(entityType).update({ is_active: false }).eq('id', deleteRow?.id);
            if (error) {
                notification.error({ message: error.message });
            } else {
                fetchData();
            }
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
        console.log("vd", entityId, formData, vd, error);
        const criteriaEmpty = vd;
        if (vd) {
            handleModalOpen({ criteria: vd, id: entityId, details: formData });
            console.log("v");
        } else {
            console.log("d");
            fetchData();
            setVisible(false);
            notification.success({ message: 'Workflow stage transitioned successfully' });
        }
    };

    const handleAddOrEdit = async (formData, editItem) => {
        console.log("ei", formData, editItem);
        let { status, related_data, date_time_range, id, ...rest } = formData;
        const details = {};
        for (const key in rest) {
            if (key.startsWith("details.")) {
                const nestedKey = key.substring("details.".length);
                details[nestedKey] = rest[key];
            }
        }
        if (date_time_range && date_time_range.length === 2) {
            details.start_date = new Date(date_time_range[0]).toISOString();
            details.due_date = new Date(date_time_range[1]).toISOString();
        }
        if (editItem) {
            if (editItem?.status !== undefined) {
                details.status = status;
            }
            const { data, error } = await supabase
                .from(entityType)
                .update({ details: details, organization_id: session?.user?.organization?.id })
                .eq('id', editItem.id)
                .select('*');

            if (error) {
                notification.error({ message: 'Failed to update' });
            } else {
                fetchData();
            }
        } else {
            const { data, error } = await supabase
                .from(entityType)
                .insert([{ details: details, organization_id: session?.user?.organization?.id, user_id: session?.user?.id }])
                .select('*');

            if (error) {
                notification.error({ message: 'Failed to add' });
            } else {
                fetchData();
            }
        }
    };

    console.log("GTD", data);

    // Define view items with icons
    const viewItems = [
        { key: '1', icon: <TableOutlined />, children: <TableView data={data} viewConfig={viewConfig} fetchConfig={fetchConfig} users={users} updateData={updateData} deleteData={deleteData} openDrawer={openDrawer} /> },
        { key: '2', icon: <AppstoreOutlined />, children: <GridView data={data} viewConfig={viewConfig} updateData={updateData} deleteData={deleteData} openDrawer={openDrawer} setCurrentPage={setCurrentPage} totalItems={totalItems} openMessageModal={handleOpenMessageModal} openDrawerWithPath={enhancedOpenDrawer} searchText={searchText} setSearchText={setSearchText} EmptyMessage={EmptyMessage} /> },
        { key: '3', icon: <ScheduleOutlined />, children: <Schedule data1={data} viewConfig={viewConfig} updateData={updateData} deleteData={deleteData} openDrawer={openDrawer} /> },
        { key: '4', icon: <BarsOutlined />, children: <KanbanView data={data} viewConfig={viewConfig} workflowConfig={workflowConfig} updateData={updateData} deleteData={deleteData} openDrawer={openDrawer} onFinish={handleAddOrEdit} /> },
        { key: '5', icon: <FundOutlined />, children: <GanttView data={data} viewConfig={viewConfig} workflowConfig={workflowConfig} updateData={updateData} deleteData={deleteData} openDrawer={openDrawer} onFinish={handleAddOrEdit} /> },
        { key: '6', icon: <CalendarOutlined />, children: <CalendarView data={data} viewConfig={viewConfig} workflowConfig={workflowConfig} updateData={updateData} deleteData={deleteData} openDrawer={openDrawer} onFinish={handleAddOrEdit} /> },
        { key: '8', icon: <DashboardOutlined />, children: <Dashboard data={data} viewConfig={viewConfig} workflowConfig={workflowConfig} updateData={updateData} deleteData={deleteData} openDrawer={openDrawer} onFinish={handleAddOrEdit} /> },
    ].filter(item =>
        (tabs ? tabs.includes(item.key === '1' ? 'tableview' : item.key === '2' ? 'gridview' : item.key === '3' ? 'timelineview' : item.key === '4' ? 'kanbanview' : item.key === '5' ? 'ganttview' : item.key === '6' ? 'calendarview' : 'dashboardview') : true) &&
        viewConfig?.[item.key === '1' ? 'tableview' : item.key === '2' ? 'gridview' : item.key === '3' ? 'timelineview' : item.key === '4' ? 'kanbanview' : item.key === '5' ? 'ganttview' : item.key === '6' ? 'calendarview' : 'dashboardview']?.showFeatures?.includes('enable_view')
    );

    // Set selectedView to the first available view’s key after viewItems is computed
    useEffect(() => {
        if (viewItems.length > 0 && !selectedView) {
            setSelectedView(viewItems[0].key);
        }
    }, [viewItems, selectedView]);

    // Define filter tab items from tabOptions
    const filterTabItems = tabOptions?.map(option => ({
        label: option.label,
        key: option.key,
        children: viewItems.length > 0 ? (viewItems.find(view => view.key === selectedView)?.children || viewItems[0].children) : null,
    })) || [];

    const memoizedViewConfig = useMemo(() => viewConfig, [viewConfig]);

    return (
        <Card ref={divRef}>
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <LoadingComponent />
                </div>
            ) : (data && viewConfig) ? (
                filterTabItems.length > 1 ? (
                    <Tabs
                        tabBarExtraContent={{
                            right: (
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <div style={{ marginRight: 8 }}>
                                        {customFilters}
                                    </div>
                                    {renderFilters(viewConfig?.global?.search, data)}
                                    {viewItems.length > 1 && viewItems.map(view => (
                                        <Button
                                            key={view.key}
                                            icon={view.icon}
                                            onClick={() => setSelectedView(view.key)}
                                            style={{
                                                marginRight: 8,
                                                color: selectedView === view.key ? '#1890ff' : '#000',
                                                border: selectedView === view.key ? '1px solid #1890ff' : '1px solid #d9d9d9',
                                            }}
                                        />
                                    ))}
                                    {viewConfig?.global?.showFeatures?.includes('fullScreenView') && <Button onClick={handleFullscreenToggle} style={{ fontSize: "16px", padding: "8px", cursor: "pointer" }}>
                                        {isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                                    </Button>}
                                </div>
                            ),
                        }}
                        activeKey={selectedTab}
                        onChange={setSelectedTab}
                        items={filterTabItems}
                    />
                ) : (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <Typography.Title level={4} style={{ margin: 0 }}>
                                {filterTabItems.length > 0 && (filterTabItems[0]?.label || 'Default View')}
                            </Typography.Title>
                            {/* <div style={{ display: 'flex', alignItems: 'center' }}> */}
                            {viewConfig?.global?.showFeatures?.includes('search') && (
                                <Input style={{ marginRight: 8, width: "50%" }} placeholder="Search" prefix={<SearchOutlined />} value={searchText} onChange={e => setSearchText(e.target.value)} />
                            )}
                            <div style={{ marginRight: 0, width: "50%" }}>
                                {customFilters}
                            </div>
                            {renderFilters(viewConfig?.global?.search, data)}
                            {viewItems.length > 1 && viewItems.map(view => (
                                <Button
                                    key={view.key}
                                    icon={view.icon}
                                    onClick={() => setSelectedView(view.key)}
                                    style={{
                                        marginRight: 8,
                                        color: selectedView === view.key ? '#1890ff' : '#000',
                                        border: selectedView === view.key ? '1px solid #1890ff' : '1px solid #d9d9d9',
                                    }}
                                />
                            ))}
                            {viewConfig?.global?.showFeatures?.includes('fullScreenView') && <Button onClick={handleFullscreenToggle} style={{ fontSize: "16px", padding: "8px", cursor: "pointer" }}>
                                {isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                            </Button>}
                            {/* </div> */}
                        </div>
                        {viewItems.length > 0 ? (viewItems.find(view => view.key === selectedView)?.children || viewItems[0].children) : <div>No views available</div>}
                    </div>
                )
            ) : (
                <div>No data or configuration available</div>
            )}
            {vd && <WorkflowStageModal handleWorkflowTransition={handleWorkflowTransition} entityType={entityType} visible={visible} viewConfig={viewConfig} onCancel={() => { fetchData(); setVisible(false); }} data={vd} />}
            <Drawer
                // width={viewMode ? "100%" : "50%"}
                width={"100%"}
                title={
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 32 }}>
                        <span style={{ fontSize: "16px" }}>{viewMode ? snakeCaseToTitleCase(entityType) : (editItem ? 'Edit' : 'Add New')}</span>
                        <Button onClick={closeDrawer} size="small">
                            Back
                        </Button>
                    </div>
                }
                // title={viewMode ? snakeCaseToTitleCase(entityType) : (editItem ? 'Edit' : 'Add New')}
                open={isDrawerVisible && !drawerPath}
                onClose={closeDrawer}
                footer={null}
            >
                {viewMode ?
                    (editItem && <DetailsView openMessageModal={handleOpenMessageModal} entityType={entityType}
                        viewConfig={memoizedViewConfig} editItem={editItem} rawData={rawData}
                        DetailsCard={<GridView data={data} viewConfig={memoizedViewConfig} updateData={updateData} deleteData={deleteData} openDrawer={openDrawer} setCurrentPage={setCurrentPage} totalItems={totalItems} />} />)
                    : <DynamicForm schemas={schemas} formData={editItem || {}} onFinish={(formData) => { handleAddOrEdit(formData, editItem); closeDrawer(); }} />}
            </Drawer>
            {messageReceiverId && (
                <Drawer placement="bottom"
                    // width={viewMode ? "100%" : "50%"}
                    height={"40%"}
                    title={
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 32 }}>
                            <span style={{ fontSize: "16px" }}>Send Message</span>
                            <Button onClick={handleCloseModal} size="small">
                                Back
                            </Button>
                        </div>
                    }
                    // title={viewMode ? snakeCaseToTitleCase(entityType) : (editItem ? 'Edit' : 'Add New')}
                    open={!!messageReceiverId}
                    onClose={handleCloseModal}
                    footer={null}
                >
                    <PostMessage user_id={session.user.id} receiver_user_id={messageReceiverId} closeModal={handleCloseModal} />
                    {/* <Modal title="Send Message" visible={!!messageReceiverId} onCancel={handleCloseModal} footer={null}>
                </Modal> */}
                </Drawer>
            )}
            {/* Drawer for mode: 'drawer' */}
            <Drawer
                width="90%"
                title="Details"
                open={isDrawerVisible && drawerPath}
                onClose={closeDrawerWithPath}
                footer={null}
            >
                {drawerPath && renderRoutes(drawerPath)}
            </Drawer>

            {/* Modal for mode: 'modal' */}
            <Modal
                title="Details"
                visible={isModalVisible}
                onCancel={closeModalWithPath}
                footer={null}
                width="80%"
            >
                {modalPath && renderRoutes(modalPath)}
            </Modal>
        </Card>
    );
};

export default Index;