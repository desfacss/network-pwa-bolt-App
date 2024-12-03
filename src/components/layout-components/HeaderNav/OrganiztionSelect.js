import React, { useEffect, useState } from 'react';
import { Select, Spin } from 'antd';
import { supabase } from 'configs/SupabaseConfig';
import { setSelectedOrganization, setSession } from 'store/slices/authSlice';
import { useSelector } from 'react-redux';
import { store } from 'store';

const { Option } = Select;

const OrganizationSelect = () => {
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(false);

    const { session, selectedOrganization } = useSelector((state) => state.auth);

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

    useEffect(() => {
        fetchOrganizations();
    }, []);

    const onChange = (id) => {
        // console.log(id)
        // const updatedSession = {
        //     ...session,
        //     user: {
        //         ...session.user,
        //         organization_id: id,
        //         organization: organizations?.find(org => org?.id === id),
        //     }
        // }
        // store.dispatch(setSession(updatedSession));
        store.dispatch(setSelectedOrganization(organizations?.find(org => org?.id === id)));
        window.location.reload();
    }

    return (
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
    );
};

export default OrganizationSelect;
