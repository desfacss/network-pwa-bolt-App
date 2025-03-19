import React, { useState, useEffect } from 'react';
import { Table, Checkbox, Button, message, Input, Space } from 'antd';
import { useSelector } from 'react-redux';
import { camelCaseToTitleCase } from 'components/util-components/utils';
import { supabase } from 'configs/SupabaseConfig';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const OrganizationFeatureEdit = ({ onSave }) => {
    const [organizationFeatures, setOrganizationFeatures] = useState({});
    const [features, setFeatures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newFeature, setNewFeature] = useState('');
    const [editingFeature, setEditingFeature] = useState(null);

    const { session } = useSelector((state) => state.auth);
    const organizationId = session?.user?.organization_id;

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
            setOrganizationFeatures(data?.module_features || {});
        }
    };

    const fetchFeatures = async () => {
        const { data, error } = await supabase
            .from('enums')
            .select('options')
            .eq('name', 'features')
            .single();

        if (error) {
            console.error('Error fetching features from Enum table:', error);
            message.error('Failed to fetch available features.');
        } else {
            setFeatures(data?.options || []);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!organizationId) {
                setLoading(false);
                return;
            }
            await fetchFeatures();
            await fetchOrganizationFeatures();
            setLoading(false);
        };

        fetchData();
    }, [organizationId]);

    const handleFeatureChange = (featureKey, checked) => {
        setOrganizationFeatures((prev) => ({
            ...prev,
            [featureKey]: checked,
        }));
    };

    const handleSaveChanges = async () => {
        if (!organizationId) {
            message.error('Organization ID not found.');
            return;
        }

        const { error } = await supabase
            .from('organizations')
            .update({ module_features: organizationFeatures })
            .eq('id', organizationId);

        if (error) {
            console.error('Error updating organization features:', error);
            message.error('Failed to save changes.');
        } else {
            message.success('Changes saved successfully!');
            onSave();
        }
    };

    const handleAddOrEditFeature = async () => {
        if (!newFeature.trim()) {
            message.error('Please enter a feature name');
            return;
        }

        const formattedFeature = newFeature
            .trim()
            .replace(/\s+/g, '')
            .replace(/^(.)(.*)$/, (_, first, rest) =>
                first.toLowerCase() + rest
            );

        if (editingFeature) {
            // Edit mode
            if (features.includes(formattedFeature) && formattedFeature !== editingFeature) {
                message.error('Feature name already exists');
                return;
            }

            const updatedFeatures = features.map(f =>
                f === editingFeature ? formattedFeature : f
            );

            const { error } = await supabase
                .from('enums')
                .update({ options: updatedFeatures })
                .eq('name', 'features');

            if (error) {
                console.error('Error updating feature:', error);
                message.error('Failed to update feature');
            } else {
                // Update organizationFeatures with new key
                const updatedOrgFeatures = { ...organizationFeatures };
                if (formattedFeature !== editingFeature) {
                    updatedOrgFeatures[formattedFeature] = updatedOrgFeatures[editingFeature];
                    delete updatedOrgFeatures[editingFeature];
                }
                setOrganizationFeatures(updatedOrgFeatures);
                setFeatures(updatedFeatures);
                message.success('Feature updated successfully');
                setNewFeature('');
                setEditingFeature(null);
            }
        } else {
            // Add mode
            if (features.includes(formattedFeature)) {
                message.error('Feature already exists');
                setNewFeature('');
                return;
            }

            const updatedFeatures = [...features, formattedFeature];
            const { error } = await supabase
                .from('enums')
                .update({ options: updatedFeatures })
                .eq('name', 'features');

            if (error) {
                console.error('Error adding new feature:', error);
                message.error('Failed to add feature');
            } else {
                setFeatures(updatedFeatures);
                setOrganizationFeatures((prev) => ({
                    ...prev,
                    [formattedFeature]: false
                }));
                message.success('Feature added successfully');
                setNewFeature('');
            }
        }
    };

    const handleEdit = (feature) => {
        setEditingFeature(feature);
        setNewFeature(feature);
    };

    const handleDelete = async (feature) => {
        const updatedFeatures = features.filter(f => f !== feature);
        const { error } = await supabase
            .from('enums')
            .update({ options: updatedFeatures })
            .eq('name', 'features');

        if (error) {
            console.error('Error deleting feature:', error);
            message.error('Failed to delete feature');
        } else {
            const updatedOrgFeatures = { ...organizationFeatures };
            delete updatedOrgFeatures[feature];
            setOrganizationFeatures(updatedOrgFeatures);
            setFeatures(updatedFeatures);
            message.success('Feature deleted successfully');
        }
    };

    return (
        <div>
            <Table
                size={'small'}
                dataSource={features.map((feature) => ({ feature }))}
                loading={loading}
                pagination={false}
                rowKey="feature"
            >
                <Table.Column
                    title="Feature"
                    dataIndex="feature"
                    key="feature"
                    render={(text) => camelCaseToTitleCase(text)}
                />
                <Table.Column
                    title="Enabled"
                    key="enabled"
                    render={(text, record) => (
                        <Checkbox
                            checked={organizationFeatures[record.feature] || false}
                            onChange={(e) => handleFeatureChange(record.feature, e.target.checked)}
                        />
                    )}
                />
                <Table.Column
                    title="Actions"
                    key="actions"
                    render={(text, record) => (
                        <Space>
                            <Button
                                icon={<EditOutlined />}
                                onClick={() => handleEdit(record.feature)}
                                size="small"
                            />
                            <Button
                                icon={<DeleteOutlined />}
                                onClick={() => handleDelete(record.feature)}
                                size="small"
                                danger
                            />
                        </Space>
                    )}
                />
            </Table>

            <Space style={{ marginTop: 16, width: '100%', justifyContent: 'space-between' }}>
                <Button
                    type="primary"
                    onClick={handleSaveChanges}
                >
                    Save Changes
                </Button>
                <Space>
                    <Input
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        placeholder={editingFeature ? "Edit feature" : "Enter new feature"}
                        style={{ width: 200 }}
                    />
                    <Button
                        onClick={handleAddOrEditFeature}
                    >
                        {editingFeature ? 'Edit' : 'Add'}
                    </Button>
                </Space>
            </Space>
        </div>
    );
};

export default OrganizationFeatureEdit;