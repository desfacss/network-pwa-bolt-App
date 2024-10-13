import { Card, Input } from 'antd';
import { useNavigate } from 'react-router-dom'; // Use this for navigation
import { supabase } from 'configs/SupabaseConfig';
import React, { useEffect, useState } from 'react';
import Services from './Services/index';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate(); // Initialize navigate for routing

    const getInfo = async () => {
        const { data, error } = await supabase.from('members').select("*");
        if (error) {
            return console.log("Error", error.message);
        }
        if (data) {
            setUsers(data);
        }
    };

    useEffect(() => {
        getInfo();
    }, []);

    // Filter users based on the search term
    const filteredUsers = users.filter(user =>
        `${user.reg_info?.firstName} ${user.reg_info?.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            {/* Search bar */}
            <Services />
            {/* <Input
                placeholder="Search by first or last name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ marginBottom: 20, width: '300px' }}
            /> */}

            {/* Display user cards */}
            {/* <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                {filteredUsers.map(user => (
                    <Card
                        key={user.id}
                        title={`${user.reg_info?.firstName || ''} ${user.reg_info?.lastName || ''}`}
                        style={{ width: 300, cursor: 'pointer', transition: 'box-shadow 0.3s' }}
                        cover={
                            <img
                                alt="User Profile"
                                src={`https://via.placeholder.com/300x200?text=${user.reg_info?.firstName || 'User'}`}
                            />
                        }
                        onClick={() => navigate(`/auth/users/${user.user_id}`)} // Navigate on click
                        hoverable // Enable hover effect
                        bodyStyle={{ padding: '10px 20px' }} // Adjust padding for a cleaner look
                        onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0px 4px 12px rgba(0, 0, 0, 0.2)'} // Highlight on hover
                        onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'} // Reset on hover out
                    >
                        <p><strong>Email:</strong> {user.reg_info?.email}</p>
                        <p><strong>Mobile:</strong> {user.reg_info?.mobile}</p>
                        <p><strong>Location:</strong> {user.personal_info?.location || 'N/A'}</p>
                        <p><strong>Native Village:</strong> {user.reg_info?.nativeVillage}</p>
                        <p><strong>Associated Temple:</strong> {user.reg_info?.associatedTemple}</p>

                        {user.personal_info?.twitter || user.personal_info?.facebook || user.personal_info?.instagram || user.personal_info?.linkedin ? (
                            <div>
                                <h4>Social Media Links</h4>
                                {user.personal_info?.twitter && <p><strong>Twitter:</strong> {user.personal_info?.twitter}</p>}
                                {user.personal_info?.facebook && <p><strong>Facebook:</strong> {user.personal_info?.facebook}</p>}
                                {user.personal_info?.instagram && <p><strong>Instagram:</strong> {user.personal_info?.instagram}</p>}
                                {user.personal_info?.linkedin && <p><strong>LinkedIn:</strong> {user.personal_info?.linkedin}</p>}
                            </div>
                        ) : null}
                    </Card>
                ))}
            </div> */}
        </div>
    );
};

export default Users;
