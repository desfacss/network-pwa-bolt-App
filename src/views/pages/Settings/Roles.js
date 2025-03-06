import React, { useState, useEffect } from 'react';
import { Table, Checkbox, Button, message, Modal, Form, InputNumber, Input } from 'antd';
import { useSelector } from 'react-redux';
import { camelCaseToTitleCase } from 'components/util-components/utils';
import { supabase } from 'api/supabaseClient';

const RoleFeatureEdit = () => {
    const [roles, setRoles] = useState([]);
    const [features, setFeatures] = useState([]); // State for features
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState('add'); // 'add', 'edit', 'delete'
    const [selectedRole, setSelectedRole] = useState(null);
    const [form] = Form.useForm();

    const { session } = useSelector((state) => state.auth);
    const organizationId = session?.user?.organization_id;

    // Fetch roles from Supabase
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

    return (
        <div>
            <Table size={'small'} dataSource={features.map(feature => ({ feature }))}
                loading={loading} pagination={false} rowKey="feature" >
                {/* <Table.Column title="Feature" dataIndex="feature" key="feature" /> */}
                <Table.Column title="Feature" dataIndex="feature" key="feature" render={(text) => camelCaseToTitleCase(text)} />
                {roles?.map(role => (
                    <Table.Column
                        key={role?.id}
                        title={camelCaseToTitleCase(role?.role_name)}
                        render={(text, record) => (
                            <Checkbox checked={role?.feature[record?.feature] || false}
                                onChange={(e) => handleFeatureChange(record?.feature, role?.id, e.target.checked)}
                            />
                        )}
                    />
                ))}
            </Table>

            <Button type="primary" onClick={handleSaveChanges} style={{ marginTop: 16 }} >
                Save Changes
            </Button>
            <Table dataSource={roles} rowKey="id" pagination={false} style={{ marginTop: "20px" }}>
                <Table.Column title="Role Name" dataIndex="role_name" key="role_name" />
                <Table.Column title="UI Order" dataIndex="ui_order" key="ui_order" />
                <Table.Column
                    title="Actions"
                    key="actions"
                    render={(text, record) => (
                        <span>
                            <Button type="link" size="small" onClick={() => showModal('edit', record)}>Edit</Button>
                            <Button type="link" size="small" danger onClick={() => showModal('delete', record)}>Delete</Button>
                        </span>
                    )}
                />
            </Table>
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
            <Button type="primary" onClick={() => showModal('add')} style={{ marginTop: 16 }} >Add Role</Button>
        </div>
    );
};

export default RoleFeatureEdit;
