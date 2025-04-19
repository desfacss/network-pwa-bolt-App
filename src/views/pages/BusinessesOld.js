import { Card, Input } from 'antd';
import { useNavigate } from 'react-router-dom'; // Use this for navigation
import { supabase } from 'configs/SupabaseConfig';
import React, { useEffect, useState } from 'react';

const Businesses = () => {
    const [businesses, setBusinesses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate(); // Initialize navigate for routing

    const getInfo = async () => {
        const { data, error } = await supabase.from('businesses').select("*");
        if (error) {
            return console.log("Error", error.message);
        }
        if (data) {
            setBusinesses(data);
        }
    };

    useEffect(() => {
        getInfo();
    }, []);

    // Filter businesses based on the search term
    const filteredBusinesses = businesses.filter(business =>
        business.info?.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            {/* Search bar */}
            <Input
                placeholder="Search by company name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ marginBottom: 20, width: '300px' }}
            />

            {/* Display business cards */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                {filteredBusinesses.map(business => (
                    <Card
                        key={business.id}
                        title={business.info?.companyName || 'Business Name'}
                        style={{ width: 300, cursor: 'pointer', transition: 'box-shadow 0.3s' }}
                        cover={
                            <img loading="lazy"
                                alt="Business Profile"
                                src={`https://via.placeholder.com/300x200?text=${business.info?.companyName || 'Business'}`}
                            />
                        }
                        onClick={() => navigate(`/auth/businesses/${business.id}`)} // Navigate on click
                        hoverable // Enable hover effect
                        styles={{ body: { padding: '10px 20px' } }}// Adjust padding for a cleaner look
                        onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0px 4px 12px rgba(0, 0, 0, 0.2)'} // Highlight on hover
                        onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'} // Reset on hover out
                    >
                        {/* Display business info */}
                        <p><strong>Location:</strong> {business.info?.location || 'N/A'}</p>

                        {/* Social Media Links */}
                        {business.info?.web || business.info?.facebook || business.info?.instagram || business.info?.twitter || business.info?.linkedin ? (
                            <div>
                                <h4>Social Media Links</h4>
                                {business.info?.web && <p><strong>Website:</strong> {business.info?.web}</p>}
                                {business.info?.facebook && <p><strong>Facebook:</strong> {business.info?.facebook}</p>}
                                {business.info?.instagram && <p><strong>Instagram:</strong> {business.info?.instagram}</p>}
                                {business.info?.twitter && <p><strong>Twitter:</strong> {business.info?.twitter}</p>}
                                {business.info?.linkedin && <p><strong>LinkedIn:</strong> {business.info?.linkedin}</p>}
                            </div>
                        ) : null}
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Businesses;
