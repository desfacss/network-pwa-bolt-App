import React, { useEffect, useState } from 'react';
import { Select, Spin } from 'antd';
import { supabase } from 'configs/SupabaseConfig';
import { setSelectedOrganization, setSelectedUser, setSession } from 'store/slices/authSlice';
import { useSelector } from 'react-redux';
import { store } from 'store';

const { Option } = Select;

const OrganizationSelect = () => {
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(false);

    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    const { selectedOrganization, selectedUser } = useSelector((state) => state.auth);

    // Fetch organizations from the database
    const fetchOrganizations = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('organizations')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;
            setOrganizations(data);
        } catch (err) {
            console.error('Error fetching organizations:', err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch users for the selected organization
    const fetchUsers = async (organizationId) => {
        setLoadingUsers(true);
        try {
            const { data, error } = await supabase
                .from('users')
                .select('id, user_name')
                .eq('organization_id', organizationId);

            if (error) throw error;
            setUsers(data);
        } catch (err) {
            console.error('Error fetching users:', err.message);
        } finally {
            setLoadingUsers(false);
        }
    };

    // Effect to load users when organization changes
    useEffect(() => {
        if (selectedOrganization?.id) {
            fetchUsers(selectedOrganization.id);
        } else {
            setUsers([]);
        }
    }, [selectedOrganization]);

    useEffect(() => {
        fetchOrganizations();
    }, []);

    const onChange = (id) => {
        store.dispatch(setSelectedUser(null));
        store.dispatch(setSelectedOrganization(organizations?.find(org => org?.id === id)));
        window.location.reload();
    }

    // Handle user selection
    const handleUserChange = (id) => {
        const user = users?.find((user) => user?.id === id);
        store.dispatch(setSelectedUser(user || null));
        window.location.reload();
    };

    return (
        <>
            <Select className='mr-2'
                showSearch allowClear
                placeholder="Select an organization"
                optionFilterProp="children"
                onChange={onChange}
                loading={loading} value={selectedOrganization?.id}
                notFoundContent={loading ? <Spin size="small" /> : 'No organizations found'}
                style={{ width: '100%' }}
            >
                {organizations?.map(org => (
                    <Option key={org.id} value={org.id}>
                        {org.name}
                    </Option>
                ))}
            </Select>

            <Select
                showSearch
                allowClear
                placeholder="Select a user"
                optionFilterProp="children"
                onChange={handleUserChange}
                loading={loadingUsers}
                value={selectedUser?.id}
                notFoundContent={loadingUsers ? <Spin size="small" /> : 'No users found'}
                style={{ width: '100%' }}
                disabled={!selectedOrganization}
            >
                {users?.map((user) => (
                    <Option key={user?.id} value={user?.id}>
                        {user?.user_name}
                    </Option>
                ))}
            </Select>
        </>
    );
};

export default OrganizationSelect;
