import { Button, Card, notification, Table, Drawer, Form, Modal, Tooltip, Input } from "antd";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { PlusOutlined, EditFilled, ExclamationCircleFilled, DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import { supabase } from "configs/SupabaseConfig";
import DynamicForm from "../DynamicForm";
import { useSelector } from "react-redux";
import { serverErrorParsing } from "components/util-components/serverErrorParsing";
import { getAllValues } from "components/common/utils";
const { confirm } = Modal;

const Clients = () => {
    const componentRef = useRef(null);
    const [clients, setClients] = useState([]);
    const [editItem, setEditItem] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [schema, setSchema] = useState();
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [clientToDelete, setClientToDelete] = useState(null);
    const [searchText, setSearchText] = useState('');

    const { session } = useSelector((state) => state.auth);

    const [form] = Form.useForm();

    const filteredClients = useMemo(() => {
        if (!searchText) return clients;
        return clients?.filter((item) => {
            // Use getAllValues to retrieve all values from the object
            return getAllValues(item).some((value) =>
                String(value).toLowerCase().includes(searchText?.toLowerCase())
            );
        });
    }, [clients, searchText]);

    const getForms = async () => {
        const { data, error } = await supabase.from('forms').select('*').eq('name', "client_add_edit_form").single()
        if (data) {
            setSchema(data)
        }
    }

    useEffect(() => {
        getForms()
        fetchClients();
    }, []);

    const fetchClients = async () => {
        let { data, error } = await supabase.from('crm_clients').select('*').eq('organization_id', session?.user?.organization_id).neq('default', true).order('name', { ascending: true });
        if (data) {
            setClients(data);
        }
        if (error) {
            notification.error({ message: error?.message || "Failed to fetch clients" });
        }
    };

    const handleAddOrEdit = async (values) => {
        const clientPayload = {
            details: values,
            name: values?.name,
            organization_id: session?.user?.organization_id,
            // organization_name: session?.user?.details?.orgName
        };

        try {
            const { data, error } = editItem
                ? await supabase.from('crm_clients').update(clientPayload).eq('id', editItem.id).select('*') // Update existing client
                : await supabase.from('crm_clients').insert([clientPayload]).select('*'); // Add new client

            if (data) {
                notification.success({
                    message: editItem ? `Client ${values?.name} Updated` : `New Client ${values?.name} Added`
                });
                setEditItem(null);
            } else if (error) {
                notification.error({
                    message: error?.message || (editItem ? `Failed to update Client ${values?.name}` : `Failed to add Client ${values?.name}`)
                });
            }
        } catch (err) {
            console.error("Error handling client:", err);
        }

        fetchClients();
        setIsDrawerOpen(false);
        form.resetFields();
        setEditItem(null);
    };

    const handleEdit = (record) => {
        setEditItem(record);
        form.setFieldsValue({
            service_name: record.details.service_name,
            cost: record.details.cost,
            duration: record.details.duration,
            description: record.details.description,
        });
        setIsDrawerOpen(true);
    };

    const confirmDelete = (id) => {
        setClientToDelete(id);
        setDeleteModalVisible(true);
    };

    const handleDelete = async () => {
        if (clientToDelete) {
            const { error } = await supabase.from('crm_clients').delete().eq('id', clientToDelete);
            if (!error) {
                notification.success({ message: "Client deleted successfully" });
                fetchClients();
            } else {
                notification.error({ message: serverErrorParsing(error?.message) });
            }
        }
        setDeleteModalVisible(false);
        setClientToDelete(null);
    };

    const showDeleteConfirm = async (record) => {
        confirm({
            title: `Confirm deletion of Client - ${record?.name} ?`,
            icon: <ExclamationCircleFilled />,
            //   content: 'Some descriptions',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                const { error } = await supabase.from('crm_clients').delete().eq('id', record?.id);
                if (!error) {
                    notification.success({ message: "Client deleted successfully" });
                    fetchClients();
                } else {
                    notification.error({ message: serverErrorParsing(error?.message) });
                }
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: ['details', 'name'],
            key: 'name',
            sorter: (a, b) => a?.details?.name?.localeCompare(b?.details?.name)
        },
        {
            title: 'Contact Person',
            dataIndex: ['details', 'primary_contact_name'],
            key: 'primary_contact_name',
            sorter: (a, b) => a?.details?.primary_contact_name?.localeCompare(b?.details?.primary_contact_name)
        },
        {
            title: 'Phone',
            dataIndex: ['details', 'phone'],
            key: 'phone',
        },
        {
            title: 'Email',
            dataIndex: ['details', 'email'],
            key: 'email',
            sorter: (a, b) => a?.details?.email?.localeCompare(b?.details?.email)
        },
        {
            title: 'Zip',
            dataIndex: ['details', 'zip'],
            key: 'zip',
            sorter: (a, b) => String(a?.details?.zip)?.localeCompare(String(b?.details?.zip))
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <div className="d-flex">
                    <Tooltip title="Edit">
                        <Button type="primary" icon={<EditFilled />} size="small" className="mr-2" onClick={() => handleEdit(record)} />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Button type="primary" ghost icon={<DeleteOutlined />} size="small" onClick={() => showDeleteConfirm(record)} />
                    </Tooltip>
                </div>
            ),
        },
    ];

    return (
        <Card styles={{ body: { padding: "0px" } }}>
            <div className="d-flex p-2 justify-content-between align-items-center" style={{ marginBottom: "16px" }}>
                <h2 style={{ margin: 0 }}>Clients</h2>
                <div>
                    <Input className="mr-2" placeholder="Search" value={searchText} onChange={(e) => setSearchText(e.target.value)} prefix={<SearchOutlined />} style={{ width: 200 }} />
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsDrawerOpen(true)} >
                        Add Client
                    </Button>
                </div>
            </div>
            <div className="table-responsive" ref={componentRef}>
                <Table size={'small'} columns={columns} dataSource={filteredClients}
                    rowKey={(record) => record.id} loading={!filteredClients} pagination={true} />
            </div>
            <Drawer footer={null} width={500} title={editItem ? "Edit Client" : "Add Client"}
                open={isDrawerOpen} maskClosable={false} onClose={() => { setIsDrawerOpen(false); setEditItem() }}
                onOk={() => form.submit()} okText="Save" >
                <DynamicForm schemas={schema} onFinish={handleAddOrEdit} formData={editItem && editItem?.details} />
            </Drawer>
            <Modal title="Confirm Delete" open={deleteModalVisible} onOk={handleDelete}
                onCancel={() => setDeleteModalVisible(false)} okText="Delete" okButtonProps={{ danger: true }} >
                <p>Are you sure you want to delete this client?</p>
            </Modal>
        </Card>
    );
};

export default Clients;
