import React, { useState, useEffect } from 'react';
import { Table, Checkbox, Button } from 'antd';
import { supabase } from 'configs/SupabaseConfig';

const RoleFeatureEdit = () => {
    const [roles, setRoles] = useState([]);
    const [features, setFeatures] = useState([]); // State for features
    const [loading, setLoading] = useState(true);

    // Fetch roles from Supabase
    const fetchRoles = async () => {
        const { data, error } = await supabase
            .from('roles')
            .select('id, role_name, feature');

        if (error) {
            console.error('Error fetching roles:', error);
        } else {
            setRoles(data);
        }
    };

    // Fetch features from enums table where name === 'features'
    const fetchFeatures = async () => {
        const { data, error } = await supabase
            .from('enums')
            .select('options')
            .eq('name', 'features')
            .single(); // Get the single row

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
                console.error('Error updating role:', error);
            }
        }
        alert('Changes saved successfully!');
    };

    return (
        <div>
            <Table
                dataSource={features.map(feature => ({ feature }))}
                loading={loading}
                pagination={false}
                rowKey="feature"
            >
                <Table.Column title="Feature" dataIndex="feature" key="feature" />

                {roles.map(role => (
                    <Table.Column
                        key={role.id}
                        title={role.role_name}
                        render={(text, record) => (
                            <Checkbox
                                checked={role.feature[record.feature] || false} // Default to false if undefined
                                onChange={(e) => handleFeatureChange(record.feature, role.id, e.target.checked)}
                            />
                        )}
                    />
                ))}
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

export default RoleFeatureEdit;
