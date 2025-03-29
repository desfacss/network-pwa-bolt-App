import React, { useEffect, useState } from 'react';
import { Row, Col, Typography, Button, message } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import QRCode from 'react-qr-code';
import './TicketPage.css';
import { supabase } from 'configs/SupabaseConfig';
import { useSelector } from 'react-redux';
import DynamicForm from '../DynamicForm';
import Drawer from 'antd/es/drawer';
import { useNavigate } from 'react-router-dom';
import ProfilePic from '../Profile/ProfilePic';

const { Title, Text } = Typography;

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
  const { session } = useSelector((state) => state.auth);
  const [userData, setUserData] = useState(null);
  const [edit, setEdit] = useState(false);
  const [schema, setSchema] = useState();
  const [formData, setFormData] = useState();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('details')
        .eq('id', session?.user?.id)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
      } else {
        const details = data?.details || {};
        setUserData({
          name: details.user_name || `${details.firstName} ${details.lastName}`,
          company: details.company || 'Company Name',
          city: details.location || 'Location',
          native: details.native || 'Native',
          kovil: details.kovil || 'Kovil',
          food: details.food || 'Veg',
          gender: details.gender || 'Male',
          primary_stream: details.primary_stream || 'Not Selected',
          secondary_stream: details.secondary_stream || 'Not Selected',
          room: details.room || 'Double Sharing',
        });
      }
    };

    if (session?.user?.id) fetchUserData();
  }, [session]);

  const trackColor = trackColors[userData?.primary_stream] || '#e6f7ff';
  const foodColor = foodColors[userData?.food] || '#fff';
  const qrUrl = `${window.location.origin}/app/members/${session?.user?.id}`;

  const getForms = async (formName) => {
    const { data } = await supabase
      .from('forms')
      .select('*')
      .eq('name', formName)
      .eq('organization_id', session?.user?.organization_id)
      .single();
    if (data) setSchema(data);
  };

  const showModal = async (data, formName) => {
    await getForms(formName);
    setFormData(data);
    setEdit(true);
  };

  const onFinish = async (values) => {
    const user_name = `${values?.firstName} ${values?.lastName}`;
    const updatedDetails = {
      ...userData,
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      mobile: values.mobile,
      kovil: values.kovil,
      native: values.native,
      location: values.location,
      company: values.company,
      user_name,
      food: values.food,
      gender: values.gender,
      primary_stream: values.primary_stream || userData.primary_stream,
      secondary_stream: values.secondary_stream || userData.secondary_stream,
    };

    const { error } = await supabase
      .from('users')
      .update({ details: updatedDetails })
      .eq('id', session?.user?.id);

    if (error) {
      console.log('Error updating users table:', error.message);
    } else {
      setUserData({
        name: user_name,
        company: values.company || userData.company,
        city: values.location || userData.city,
        native: values.native || userData.native,
        kovil: values.kovil || userData.kovil,
        food: values.food || userData.food,
        gender: values.gender || userData.gender,
        primary_stream: values.primary_stream || userData.primary_stream,
        secondary_stream: values.secondary_stream || userData.secondary_stream,
        room: values.room || userData.room,
      });
      setEdit(false);
      message.success('Updated Successfully');
      navigate(0);
    }
  };

  const handleClose = () => setEdit(false);

  if (!userData) return <div>Loading...</div>;

  const editProfileData = {
    ...userData,
    firstName: userData.name.split(' ')[0],
    lastName: userData.name.split(' ').slice(1).join(' '),
    company: userData.company,
    location: userData.city,
    food: userData.food,
    primary_stream: userData.primary_stream,
    secondary_stream: userData.secondary_stream,
    room: userData.room,
  };

  return (
    <div className="ticket-page">
      <div className="ticket-card">
        {/* Event Section */}
        <div className="ticket-section event-section">
          <Row justify="space-between" align="middle">
            <Col>
              <img src="/img/ibcn/ibcn.jpeg" alt="IBCN Logo" style={{ height: '50px' }} className="ticket-logo" />
            </Col>
            <Col>
              <h4 level={3}>IBCN 2025 Bengaluru</h4> 
            </Col>
            <Col>
              <img src="/img/ibcn/knba.png" alt="KNBA Logo" style={{ height: '50px' }} className="ticket-logo" />
            </Col>
          </Row>
        </div>

        {/* User Section */}
        <div className="ticket-section user-section" style={{ backgroundColor: trackColor }}>
          <div className="profile-placeholder">
            <ProfilePic />
          </div>
          <Title level={3}>{userData.name}</Title> 
          <Text>{userData.company}, {userData.city}</Text>
          <Text>
            {userData.native}, {userData.kovil}
          </Text>
          <br />
          <Text>
            Stream: <strong>{userData.primary_stream === "" ? "Not Selected" : userData.primary_stream}</strong>
          </Text>

          {!isMobile && session?.user?.id && (
            <Button
              icon={<EditOutlined />}
              onClick={() => showModal(editProfileData, 'user_self_edit_form')}
              className="edit-button"
            >
              Edit Profile
            </Button>
          )}
        </div>

        {/* QR Code Section */}
        <div className="ticket-section barcode-section">
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px' }}>
            <QRCode value={qrUrl} size={150} level="H" />
          </div>
        </div>

        {/* Food Section */}
        <div className="ticket-section food-section" style={{ backgroundColor: foodColor }}>
          <Row>
            <Col span={16}>
              <Text strong>Room No: </Text>
              <br />
              <Text>TBA - {userData.room}</Text>
            </Col>
            <Col span={8}>
              <Text strong>Food Pref: </Text>
              <br />
              <Text>{userData.food}</Text>
            </Col>
          </Row>
        </div>
      </div>

      {isMobile && session?.user?.id && (
        <Button
          type="primary"
          shape="circle"
          icon={<EditOutlined />}
          size="large"
          className="fab-button"
          onClick={() => showModal(editProfileData, 'user_self_edit_form')}
        />
      )}

      {edit && schema && (
        <Drawer
          title={schema?.data_schema?.title || 'Edit Profile'}
          open={edit}
          onClose={handleClose}
          width="90%"
        >
          <DynamicForm schemas={schema} formData={formData} onFinish={onFinish} />
        </Drawer>
      )}
    </div>
  );
};

export default TicketPage;