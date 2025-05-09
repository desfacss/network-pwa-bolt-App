import React, { useEffect, useMemo, useRef, useState, Suspense } from 'react';
import { Button, Card, Drawer, Input, Modal, notification } from 'antd';
import { AppstoreOutlined, SearchOutlined } from "@ant-design/icons";
import { supabase } from 'configs/SupabaseConfig';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { snakeCaseToTitleCase } from 'components/util-components/utils';
import { useSelector } from 'react-redux';
import DynamicForm from '../DynamicForm';
import DetailsView from './DetailsView';
import { removeNullFields, transformData } from './utils';
import PostMessage from '../Channels/PostMessage';
import { protectedRoutes } from 'configs/RoutesConfig';
import LoadingComponent from 'components/layout-components/LoadingComponent';

// Lazy load view component
const GridView = React.lazy(() => import('./GridView'));

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
    const [schemas, setSchemas] = useState();
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false); // New state for "Load More"
    const [messageReceiverId, setMessageReceiverId] = useState(null);
    const [selectedTab, setSelectedTab] = useState(tabOptions?.[0]?.key || '');
    const [selectedView, setSelectedView] = useState(null);
    const [drawerPath, setDrawerPath] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalPath, setModalPath] = useState(null);
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
                    navigate(path);
                    break;
                case 'new-tab':
                    window.open(path, '_blank', 'noopener,noreferrer');
                    break;
                case 'modal':
                    openModalWithPath(path);
                    break;
                case 'drawer':
                    openDrawerWithPath(path);
                    break;
                default:
                    navigate(path);
            }
        } else {
            setEditItem(item);
            setViewMode(view);
            setIsDrawerVisible(true);
            if (form) fetchFormSchema(form, item);
        }
    };

    const renderRoutes = (path) => {
        console.log('Rendering routes for path:', path);
        return (
            <Routes>
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
            const response = await fetch(`/data/forms/${formName}.json`);
            if (!response.ok) {
                throw new Error(`Failed to fetch form schema: ${response.statusText}`);
            }
            const data = await response.json();
            console.log("Data fetched:", data);
            setSchemas(data[0]); // Use data[0] as requested
            console.log("ttr", formData, data[0]?.data_config, transformData(formData, data[0]?.data_config));
        } catch (err) {
            console.error("Error in fetchFormSchema:", err);
            notification.error({ message: err.message || "Failed to fetch form schema" });
        }
    };

    const closeDrawer = () => {
        setIsDrawerVisible(false);
        setEditItem(null);
    };

    const divRef = useRef(null);

    const { session } = useSelector((state) => state.auth);

    const [viewConfig, setViewConfig] = useState();
    const [data, setData] = useState([]);
    const [rawData, setRawData] = useState([]);
    const [allData, setAllData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [viewMode, setViewMode] = useState(false);
    const [searchText, setSearchText] = useState('');

    const ROWS_PER_PAGE = 30; // Set to 2 as requested

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
    }, [uiFilters, allData]);

    const fetchData = async (page = 1, append = false) => {
        if (append) {
            setIsLoadingMore(true); // Set loading state for "Load More"
        } else {
            setLoading(true); // Set loading state for initial fetch or reset
        }

        let query = supabase
            .from(entityType)
            .select('*', { count: 'exact' })
            .eq('organization_id', session?.user?.organization_id)
            .eq('is_active', true)
            .range((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE - 1);

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
        let { data: newData, error, count } = await query;

        if (error) {
            notification.error({ message: error?.message || "Failed to fetch Data" });
            setLoading(false);
            setIsLoadingMore(false);
            return;
        }

        const flattenedData = newData?.map(obj => flattenData(obj, viewConfig?.master_object)) || [];

        if (append) {
            setRawData(prev => [...prev, ...newData]);
            setAllData(prev => [...prev, ...flattenedData]);
            setData(prev => [...prev, ...flattenedData]);
        } else {
            setRawData(newData);
            setAllData(flattenedData);
            setData(flattenedData);
        }

        setTotalItems(count || 0);
        setLoading(false);
        setIsLoadingMore(false);
    };

    const loadMore = () => {
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        fetchData(nextPage, true);
    };

    const fetchViewConfigs = async () => {
        try {
            const response = await fetch(`/data/configs/${entityType}.json`);
            if (!response.ok) {
                throw new Error(`Failed to fetch view config: ${response.statusText}`);
            }
            const data = await response.json();
            console.log("viewConfigT", data);
            setViewConfig(data[0]); // Use data[0] as requested
        } catch (error) {
            console.error("Error in fetchViewConfigs:", error);
            notification.error({ message: error.message || "Failed to fetch View Config" });
        }
    };

    useEffect(() => {
        fetchViewConfigs();
    }, []);

    useEffect(() => {
        if (viewConfig) {
            setCurrentPage(1); // Reset currentPage when fetchFilters change
            setData([]); // Clear existing data
            setAllData([]);
            setRawData([]);
            setTotalItems(0);
            fetchData(1, false);
            if (setCallFetch && typeof setCallFetch === "function") {
                setCallFetch(() => () => fetchData(1, false));
            }
        }
    }, [viewConfig, selectedTab, fetchFilters]);

    const updateData = async (updatedRow) => {
        const { id, ...updates } = updatedRow;
        console.log("UR", updates);
        delete updatedRow?.id;
        const { data, error } = await supabase.from(entityType).update({ details: updatedRow, organization_id: session?.user?.organization?.id }).eq('id', id).select('*');

        if (error) {
            notification.error({ message: error.message });
        } else {
            notification.success({ message: "Updated Successfully" });
            fetchData(1, false);
        }
    };

    const deleteData = async (deleteRow) => {
        console.log("Del", deleteRow?.id);
        if (session?.user?.role_type === "superadmin") {
            const { data, error } = await supabase.from(entityType).delete().eq('id', deleteRow?.id);
            if (error) {
                notification.error({ message: error.message });
            } else {
                fetchData(1, false);
            }
        } else {
            const { data, error } = await supabase.from(entityType).update({ is_active: false }).eq('id', deleteRow?.id);
            if (error) {
                notification.error({ message: error.message });
            } else {
                fetchData(1, false);
            }
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
                fetchData(1, false);
            }
        } else {
            const { data, error } = await supabase
                .from(entityType)
                .insert([{ details: details, organization_id: session?.user?.organization?.id, user_id: session?.user?.id }])
                .select('*');

            if (error) {
                notification.error({ message: 'Failed to add' });
            } else {
                fetchData(1, false);
            }
        }
    };

    console.log("GTD", data);

    const viewItems = [
        {
            key: '2',
            icon: <AppstoreOutlined />,
            children: (
                <GridView
                    data={data}
                    viewConfig={viewConfig}
                    updateData={updateData}
                    deleteData={deleteData}
                    openDrawer={openDrawer}
                    setCurrentPage={setCurrentPage}
                    totalItems={totalItems}
                    openMessageModal={handleOpenMessageModal}
                    openDrawerWithPath={enhancedOpenDrawer}
                    searchText={searchText}
                    setSearchText={setSearchText}
                    EmptyMessage={EmptyMessage}
                    loadMore={loadMore}
                    isLoadingMore={isLoadingMore} // Pass new loading state
                />
            )
        },
    ]; /* .filter(item =>
        (tabs ? tabs.includes(item.key === '1' ? 'tableview' : item.key === '2' ? 'gridview' : item.key === '3' ? 'timelineview' : item.key === '4' ? 'kanbanview' : item.key === '5' ? 'ganttview' : item.key === '6' ? 'calendarview' : 'dashboardview') : true) &&
        viewConfig?.[item.key === '1' ? 'tableview' : item.key === '2' ? 'gridview' : item.key === '3' ? 'timelineview' : item.key === '4' ? 'kanbanview' : item.key === '5' ? 'ganttview' : item.key === '6' ? 'calendarview' : 'dashboardview']?.showFeatures?.includes('enable_view')
    ); */ // Commented out as requested

    useEffect(() => {
        if (viewItems.length > 0 && !selectedView) {
            setSelectedView(viewItems[0].key);
        }
    }, [viewItems, selectedView]);

    const memoizedViewConfig = useMemo(() => viewConfig, [viewConfig]);

    return (
        <Card ref={divRef}>
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <LoadingComponent />
                </div>
            ) : (data && viewConfig) ? (
                <Suspense fallback={<LoadingComponent />}>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            {viewConfig?.global?.showFeatures?.includes('search') && (
                                <Input style={{ marginRight: 8, width: "50%" }} placeholder="Search" prefix={<SearchOutlined />} value={searchText} onChange={e => setSearchText(e.target.value)} />
                            )}
                            <div style={{ marginRight: 0, width: "50%" }}>
                                {customFilters}
                            </div>
                        </div>
                        {viewItems.length > 0 ? (
                            <Suspense fallback={<LoadingComponent />}>
                                {viewItems.find(view => view.key === selectedView)?.children || viewItems[0].children}
                            </Suspense>
                        ) : <div>No views available</div>}
                    </div>
                </Suspense>
            ) : (
                <div>No data or configuration available</div>
            )}
            <Drawer
                width={"100%"}
                title={
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 32 }}>
                        {/* <span style={{ fontSize: "16px" }}>{viewMode ? snakeCaseToTitleCase(entityType) : (editItem ? 'Edit' : 'Add New')}</span> */}
                        <span style={{ fontSize: "16px" }}>{viewMode ? entityType==="users"?"Members Profile":snakeCaseToTitleCase(entityType) : (editItem ? 'Edit' : 'Add New')}</span>
                        <Button onClick={closeDrawer} size="small">
                            Back
                        </Button>
                    </div>
                }
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
                    height={"40%"}
                    title={
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 32 }}>
                            <span style={{ fontSize: "16px" }}>Send Message</span>
                            <Button onClick={handleCloseModal} size="small">
                                Back
                            </Button>
                        </div>
                    }
                    open={!!messageReceiverId}
                    onClose={handleCloseModal}
                    footer={null}
                >
                    <PostMessage user_id={session.user.id} receiver_user_id={messageReceiverId} closeModal={handleCloseModal} />
                </Drawer>
            )}
            <Drawer
                width="90%"
                title="Details"
                open={isDrawerVisible && drawerPath}
                onClose={closeDrawerWithPath}
                footer={null}
            >
                {drawerPath && renderRoutes(drawerPath)}
            </Drawer>
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