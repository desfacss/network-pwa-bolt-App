import React, { useState, useEffect } from 'react';
import { Table, Checkbox, Button, message } from 'antd';
import { supabase } from 'configs/SupabaseConfig';
import { useSelector } from 'react-redux';
import { camelCaseToTitleCase } from 'components/util-components/utils';

const RoleFeatureEdit = () => {
    const [roles, setRoles] = useState([]);
    const [features, setFeatures] = useState([]); // State for features
    const [loading, setLoading] = useState(true);

    const { session } = useSelector((state) => state.auth);

    // Fetch roles from Supabase
    const fetchRoles = async () => {
        const { data, error } = await supabase.from('roles').select('id, role_name, feature')
            .neq('is_superadmin', true).eq('organization_id', session?.user?.organization_id).order('ui_order', { ascending: true });

        if (error) {
            console.error('Error fetching roles:', error);
        } else {
            setRoles(data);
        }
    };

    // Fetch features from enums table where name === 'features'
    const fetchFeatures = async () => {
        const { data, error } = await supabase.from('enums').select('options')
            .eq('name', 'features').eq('organization_id', session?.user?.organization_id)
            .single();

        if (error) {
            console.error('Error fetching features:', error);
        } else {
            // Assuming options is a JSON array
            setFeatures(data?.options || []);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await fetchRoles();
            await fetchFeatures();
            setLoading(false);
        };

        fetchData();
    }, []);

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
        </div>
    );
};

export default RoleFeatureEdit;
