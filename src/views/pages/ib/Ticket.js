import React from 'react';
import { Row, Col, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import Barcode from 'react-barcode';
import './TicketPage.css';

const { Title, Text } = Typography;

const userData = {
  track: 'Finance & Fintech', // Only track is needed
  name: 'Mr. Ravi Shankar',
  company: 'TechCorp',
  gender: 'Male',
  city: 'Bengaluru',
  native: 'Karaikudi',
  kovil: 'Mathoor',
  foodPreference: 'Veg',
  roomNumber: '200',
};

const trackColors = {
  'Finance & Fintech': '#e6f7ff',
  'Realestate & Construction': '#fff1f0',
  'Pharma & Healthcare': '#f6ffed',
  'Nagarathar Enterprises': '#fffbe6',
  'Aspiring Entrepreneurs': '#f0f5ff',
  'IT and Electronics': '#f9f0ff',
  'Industries & Edutech': '#e6fffb',
};

const foodColors = {
  Veg: '#d4edda',
  'Non-Veg': '#f8d7da',
};

const TicketPage = () => {
  const trackColor = trackColors[userData.track] || trackColors['Finance & Fintech'];
  const foodColor = foodColors[userData.foodPreference] || '#fff';

  // Determine profile icon based on gender
  const profileIcon = userData.gender === 'Male'
    ? 'https://cdn-icons-png.flaticon.com/512/0/93.png'
    : 'https://cdn-icons-png.flaticon.com/512/0/94.png';

  // Generate barcode value using name and kovil
  const barcodeValue = `${userData.name.replace(/\s/g, '')}-${userData.kovil.replace(/\s/g, '')}`; // Example: "Mr.RaviShankar-Mathoor"

  return (
    <div className="ticket-page">
      <div className="ticket-card">
        {/* Event Section */}
        <div className="ticket-section event-section">
          <Row justify="space-between" align="middle" className="ticket-header">
            <Col>
              <img src="/img/ibcn/ibcn.jpeg" alt="IBCN Logo" style={{ height: '70px' }} />
            </Col>
            <Col>
              <h1>IBCN 2025 Bengaluru</h1>
            </Col>
            <Col>
              <img src="/img/ibcn/knba.png" alt="KNBA Logo" style={{ height: '70px' }} />
            </Col>
          </Row>
        </div>

        {/* User Section */}
        <div className="ticket-section user-section">
          <div className="color-overlay" style={{ backgroundColor: trackColor }}></div>
          <div className="profile-placeholder">
            <img src={profileIcon} alt="Profile" className="profile-image" />
            <div
              className="upload-button"
              onClick={() => alert('Add profile image')}
              style={{ cursor: 'pointer' }}
            >
              <PlusOutlined style={{ fontSize: '20px', color: '#fff' }} />
            </div>
          </div>
          <Title level={3} className="user-name">
            {userData.name}
          </Title>
          <Text>{userData.company}, {userData.city}</Text>
          <Text>
            {userData.native} --- {userData.kovil}
          </Text>
          <div style={{ marginTop: '20px' }}>
            <h3>Track: {userData.track}</h3> {/* Using track directly */}
            <p>2 Nights @ Hilton (Double Sharing)</p>
            <p>Award Nights Party</p>
          </div>
        </div>

        {/* Barcode Section */}
        <div className="ticket-section barcode-section">
          <div className="color-overlay" style={{ backgroundColor: '#fff' }}></div>
          <Barcode
            value={barcodeValue}
            width={1}
            height={50}
            displayValue={true}
            fontSize={14}
            margin={0}
          />
        </div>

        {/* Food Section */}
        <div className="ticket-section food-section">
          <div className="color-overlay" style={{ backgroundColor: foodColor }}></div>
          <Row>
            <Col span={12}>
              <Text strong>Room No:</Text>
              <p>{userData.roomNumber}</p>
            </Col>
            <Col span={12}>
              <Text strong>Food Preference:</Text>
              <p>{userData.foodPreference}</p>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default TicketPage;