import React, { useState, useEffect } from 'react';
import { Table, Checkbox, Button, message } from 'antd';
import { useSelector } from 'react-redux';
import { camelCaseToTitleCase } from 'components/util-components/utils';
import { supabase } from 'api/supabaseClient';

const OrganizationFeatureEdit = ({ onSave }) => {
    const [organizationFeatures, setOrganizationFeatures] = useState({});
    const [features, setFeatures] = useState([]);
    const [loading, setLoading] = useState(true);

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
            console.error('Error fetching features:', error);
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
            onSave()
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
            </Table>

            <Button
                type="primary"
                onClick={handleSaveChanges}
                style={{ marginTop: 16 }}
            >
                Save Changes
            </Button>
        </div>
    );
};

export default OrganizationFeatureEdit;