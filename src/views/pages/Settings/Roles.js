import React, { useState, useEffect } from 'react';
import { Table, Checkbox, Button, message, Modal, Form, InputNumber, Input, Space, Drawer } from 'antd';
import { useSelector } from 'react-redux';
import { camelCaseToTitleCase } from 'components/util-components/utils';
import { supabase } from 'configs/SupabaseConfig';
import { DeleteOutlined, EditOutlined, PlusOutlined, SettingOutlined } from '@ant-design/icons';
import OrganizationFeatureEdit from './OrganizationFeatures';

const RoleFeatureEdit = () => {
    const [roles, setRoles] = useState([]);
    const [features, setFeatures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState('add');
    const [selectedRole, setSelectedRole] = useState(null);
    const [drawerVisible, setDrawerVisible] = useState(false);

    const [form] = Form.useForm();

    const { session } = useSelector((state) => state.auth);
    const organizationId = session?.user?.organization_id;

    const fetchRoles = async () => {
        const { data, error } = await supabase.from('roles').select('id, role_name, feature, ui_order')
            .neq('is_superadmin', true).eq('organization_id', session?.user?.organization_id)
            .order('ui_order', { ascending: true });

        if (error) {
            console.error('Error fetching roles:', error);
        } else {
            setRoles(data);
        }
    };

    const fetchOrganizationFeatures = async () => {
        if (!organizationId) {
            setLoading(false);
            return;
        }

        const { data, error } = await supabase
            .from('organizations')
            .select('module_features')
            .eq('id', organizationId)
            .single();

        if (error) {
            console.error('Error fetching organization features:', error);
            message.error('Failed to fetch organization features.');
        } else {
            const moduleFeatures = data?.module_features || {};
            const enabledFeatures = Object.keys(moduleFeatures).filter(key => moduleFeatures[key]);
            setFeatures(enabledFeatures);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!organizationId) {
                setLoading(false);
                return;
            }
            await fetchRoles();
            await fetchOrganizationFeatures();
            setLoading(false);
        };

        fetchData();
    }, [organizationId]);

    const handleFeatureChange = (featureKey, roleId, checked) => {
        const updatedRoles = roles.map((role) => {
            if (role.id === roleId) {
                return {
                    ...role,
                    feature: {
                        ...role.feature,
                        [featureKey]: checked,
                    },
                };
            }
            return role;
        });

        setRoles(updatedRoles);
    };

    const handleSaveChanges = async () => {
        for (const role of roles) {
            const { error } = await supabase
                .from('roles')
                .update({ feature: role.feature })
                .eq('id', role.id);

            if (error) {
                message.error('Error updating role:', error);
                console.error('Error updating role:', error);
            }
        }
        message.success('Changes saved successfully!');
        fetchRoles();
    };

    const showModal = (type, role = null) => {
        setModalType(type);
        setSelectedRole(role);
        form.resetFields();
        if (role) {
            form.setFieldsValue({
                role_name: role.role_name,
                ui_order: role.ui_order,
            });
        }
        setModalVisible(true);
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            if (modalType === 'add') {
                const { error } = await supabase.from('roles').insert([{
                    role_name: values.role_name,
                    ui_order: values.ui_order,
                    feature: {},
                    organization_id: organizationId,
                }]);
                if (error) throw error;
                message.success('Role added successfully!');
            } else if (modalType === 'edit') {
                const { error } = await supabase.from('roles').update({
                    role_name: values.role_name,
                    ui_order: values.ui_order,
                }).eq('id', selectedRole.id);
                if (error) throw error;
                message.success('Role updated successfully!');
            } else if (modalType === 'delete') {
                const { error } = await supabase.from('roles').delete().eq('id', selectedRole.id);
                if (error) throw error;
                message.success('Role deleted successfully!');
            }
            fetchRoles();
            setModalVisible(false);
        } catch (error) {
            message.error(error.message || 'Failed to perform action.');
        }
    };

    const handleModalCancel = () => {
        setModalVisible(false);
    };

    const handleAddRoleColumn = () => {
        showModal('add');
    };

    const handleEditRoleColumn = (role) => {
        showModal('edit', role);
    };

    const handleDeleteRoleColumn = (role) => {
        showModal('delete', role);
    };

    const showDrawer = () => {
        setDrawerVisible(true);
    };

    const closeDrawer = () => {
        setDrawerVisible(false);
    };

    const handleTableChange = (pagination, filters, sorter) => {
        if (sorter.field === 'ui_order') {
            const sortedRoles = [...roles].sort((a, b) => {
                if (sorter.order === 'ascend') {
                    return a.ui_order - b.ui_order;
                } else {
                    return b.ui_order - a.ui_order;
                }
            });
            setRoles(sortedRoles);
        }
    };

    const columns = [
        {
            // title: 'Feature',
            title: (
                <>
                    Feature
                    <Button onClick={handleAddRoleColumn} style={{ marginLeft: 16 }} icon={<PlusOutlined />}>
                        Add Role
                    </Button>
                </>
            ),
            dataIndex: 'feature',
            key: 'feature',
            render: (text) => camelCaseToTitleCase(text)
        },
        ...roles.map((role) => ({
            key: role?.id,
            title: (
                <>
                    {camelCaseToTitleCase(role?.role_name)}
                    <Button type="link" size="small" onClick={() => handleEditRoleColumn(role)} icon={<EditOutlined />}></Button>
                    <Button type="link" size="small" danger onClick={() => handleDeleteRoleColumn(role)} icon={<DeleteOutlined />}></Button>
                </>
            ),
            render: (text, record) => (
                <Checkbox checked={role?.feature[record?.feature] || false}
                    onChange={(e) => handleFeatureChange(record?.feature, role?.id, e.target.checked)}
                />
            ),
        })),
    ];

    return (
        <div>
            <Table size={'small'} dataSource={features.map(feature => ({ feature }))}
                loading={loading} pagination={false} rowKey="feature" columns={columns} onChange={handleTableChange}
            >
            </Table>

            <Space style={{ marginTop: 16, justifyContent: 'space-between', display: 'flex' }}>
                <Button type="primary" onClick={handleSaveChanges}>
                    Save Changes
                </Button>
                <Button onClick={showDrawer} icon={<SettingOutlined />}>
                    Manage Features
                </Button>
            </Space>
            {/* <Button onClick={handleAddRoleColumn} style={{ marginTop: 16, marginLeft: 16 }}>
                Add Role
            </Button> */}
            <Modal
                title={`${camelCaseToTitleCase(modalType)} Role`}
                visible={modalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="role_name" label="Role Name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="ui_order" label="UI Order" rules={[{ required: true }]}>
                        <InputNumber style={{ width: "100%" }} />
                    </Form.Item>
                </Form>
            </Modal>
            <Drawer
                title="Organization Features"
                placement="right"
                closable={true}
                onClose={closeDrawer}
                visible={drawerVisible}
                width={"30%"}
            >
                <OrganizationFeatureEdit onSave={() => { fetchOrganizationFeatures(); setDrawerVisible(false) }} />
            </Drawer>
        </div>
    );
};

export default RoleFeatureEdit;