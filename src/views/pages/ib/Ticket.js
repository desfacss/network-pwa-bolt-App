// import React, { useEffect, useState } from 'react';
// import { Row, Col, Typography, Button, message } from 'antd';
// import { PlusOutlined, EditOutlined } from '@ant-design/icons';
// import Barcode from 'react-barcode';
// import './TicketPage.css';
// import { supabase } from 'configs/SupabaseConfig'; // Assuming you have this configured
// import { useSelector } from 'react-redux';
// import DynamicForm from '../DynamicForm'; // Assuming this is available
// import Drawer from 'antd/es/drawer';
// import { useNavigate } from 'react-router-dom';
// import ProfilePic from '../Profile/ProfilePic';

// const { Title, Text } = Typography;

// const trackColors = {
//   'Finance & Fintech': '#e6f7ff',
//   'Realestate & Construction': '#fff1f0',
//   'Pharma & Healthcare': '#f6ffed',
//   'Nagarathar Enterprises': '#fffbe6',
//   'Aspiring Entrepreneurs': '#f0f5ff',
//   'IT and Electronics': '#f9f0ff',
//   'Industries & Edutech': '#e6fffb',
// };

// const foodColors = {
//   Veg: '#d4edda',
//   'Non-Veg': '#f8d7da',
// };

// const TicketPage = () => {
//   const { session } = useSelector((state) => state.auth); // Get authenticated user session
//   const [userData, setUserData] = useState(null);
//   const [edit, setEdit] = useState(false);
//   const [schema, setSchema] = useState();
//   const [formData, setFormData] = useState();

//   const navigate = useNavigate();

//   // Fetch user data from Supabase
//   useEffect(() => {
//     const fetchUserData = async () => {
//       const { data, error } = await supabase
//         .from('users')
//         .select('details, additional_details')
//         .eq('id', session?.user?.id) // Assuming you want the logged-in user's data
//         .single();

//       if (error) {
//         console.error("Error fetching user data:", error);
//       } else {
//         const details = data?.details || {};
//         const additionalDetails = data?.additional_details || {};

//         // Map the required fields from details and additional_details
//         const mappedData = {
//           ...details,
//           ...additionalDetails,
//           name: details.user_name || `${details.firstName} ${details.lastName}`,
//           company: details.company || 'N/A',
//           city: details.location || 'N/A',
//           native: details.native || 'N/A',
//           kovil: details.kovil || 'N/A',
//           foodPreference: additionalDetails.food || 'N/A',
//           gender: additionalDetails.gender || 'N/A',
//           streams: additionalDetails.streams,// || 'Finance & Fintech', // Default to first stream
//           streams_secondary: additionalDetails.streams_secondary,// || 'Finance & Fintech', // Default to first stream
//           roomNumber: additionalDetails.room_no || 'TBA',
//         };
//         setUserData(mappedData);
//       }
//     };

//     if (session?.user?.id) {
//       fetchUserData();
//     }
//   }, [session]);

//   const trackColor = trackColors[userData?.streams] || trackColors['Finance & Fintech'];
//   const foodColor = foodColors[userData?.foodPreference] || '#fff';

//   // Determine profile icon based on gender
//   const profileIcon = userData?.gender === 'Male'
//     ? 'https://cdn-icons-png.flaticon.com/512/0/93.png'
//     : 'https://cdn-icons-png.flaticon.com/512/0/94.png';

//   // Generate barcode value using name and kovil
//   const barcodeValue = userData
//     ? `${userData.name.replace(/\s/g, '')}-${userData.kovil.replace(/\s/g, '')}`
//     : 'Default-Barcode'; // Example: "Mr.RaviShankar-Mathoor"

//   // Edit profile logic
//   const getForms = async (formName) => {
//     const { data, error } = await supabase
//       .from('forms')
//       .select('*')
//       .eq('name', formName)
//       .eq('organization_id', session?.user?.organization_id)
//       .single();
//     if (data) {
//       setSchema(data);
//     }
//   };

//   const showModal = async (data, formName) => {
//     getForms(formName);
//     setFormData(data); // Pass current user data to form
//     setEdit(true);
//   };

//   const onFinish = async (values) => {
//     const user_name = values?.firstName + " " + values?.lastName;

//     const updatedDetails = {
//       ...userData,
//       firstName: values.firstName,
//       lastName: values.lastName,
//       intro: values.intro,
//       membership_type: values.membership_type,
//       email: values.email,
//       mobile: values.mobile,
//       kovil: values.kovil,
//       native: values.native,
//       location: values.location,
//       address: values.address,
//       web: values.web,
//       twitter: values.twitter,
//       linkedin: values.linkedin,
//       facebook: values.facebook,
//       instagram: values.instagram,
//       company: values.company,
//       user_name,
//       // orgName: values.orgName,
//     };

//     const updatedAdditionalDetails = {
//       food: values.food,
//       gender: values.gender,
//       streams: values.streams || [userData.streams],
//       streams_secondary: values.streams_secondary || [userData.streams_secondary],
//       // room_no: values.room_no || userData.roomNumber,
//     };

//     const { error: userError } = await supabase
//       .from('users')
//       .update({
//         details: updatedDetails,
//         additional_details: updatedAdditionalDetails,
//       })
//       .eq('id', session?.user?.id);

//     if (userError) {
//       console.log("Error updating users table:", userError.message);
//     } else {
//       setUserData({
//         name: user_name,
//         company: values.company || userData.company,
//         city: values.location || userData.city,
//         native: values.native || userData.native,
//         kovil: values.kovil || userData.kovil,
//         foodPreference: values.food || userData.foodPreference,
//         gender: values.gender || userData.gender,
//         streams: values.streams || userData.streams,
//         streams_secondary: values.streams_secondary || userData.streams_secondary,
//         roomNumber: values.room_no || userData.roomNumber,
//       });
//       setEdit(false);
//       message.success("Updated Sucessfully")
//     }
//     navigate(0);
//   };

//   const handleOk = () => setEdit(false);
//   const handleCancel = () => setEdit(false);

//   if (!userData) {
//     return <div>Loading...</div>; // Show loading state while fetching data
//   }

//   return (
//     <div className="ticket-page">
//       <div className="ticket-card">
//         {/* Event Section */}
//         <div className="ticket-section event-section">
//           <Row justify="space-between" align="middle" className="ticket-header">
//             <Col>
//               <img src="/img/ibcn/ibcn.jpeg" alt="IBCN Logo" style={{ height: '70px' }} />
//             </Col>
//             <Col>
//               <h1>IBCN 2025 Bengaluru</h1>
//             </Col>
//             <Col>
//               <img src="/img/ibcn/knba.png" alt="KNBA Logo" style={{ height: '70px' }} />
//             </Col>
//           </Row>
//         </div>

//         {/* User Section */}
//         <div className="ticket-section user-section">
//           <div className="color-overlay" style={{ backgroundColor: trackColor }}></div>
//           <div className="profile-placeholder">
//             {/* <img src={profileIcon} alt="Profile" className="profile-image" />
//             <div
//               className="upload-button"
//               onClick={() => alert('Add profile image')}
//               style={{ cursor: 'pointer' }}
//             >
//               <PlusOutlined style={{ fontSize: '20px', color: '#fff' }} />
//             </div> */}
//             <ProfilePic />
//           </div>
//           <Title level={3} className="user-name">
//             {userData.name}
//           </Title>
//           <Text>{userData.company}, {userData.city}</Text>
//           <Text>
//             {userData.native} --- {userData.kovil}
//           </Text>
//           <div style={{ marginTop: '20px' }}>
//             <h3>Track: {userData.streams}</h3> {/* Using streams directly */}
//             <p>2 Nights @ Hilton (Double Sharing)</p>
//             <p>Award Nights Party</p>
//           </div>
//           {/* Edit Profile Button */}
//           {session?.user?.id && (
//             <Button
//               icon={<EditOutlined />}
//               onClick={() => showModal(
//                 {
//                   ...userData,
//                   firstName: userData.name.split(' ')[0],
//                   lastName: userData.name.split(' ').slice(1).join(' '),
//                   company: userData.company,
//                   location: userData.city,
//                   food: userData.foodPreference,
//                   streams: userData.streams,
//                   streams_secondary: userData.streams_secondary,
//                   room_no: userData.roomNumber,
//                 },
//                 'user_self_edit_form' // Adjust form name as per your setup
//               )}
//               style={{ marginTop: '10px' }}
//             >
//               Edit Profile
//             </Button>
//           )}
//         </div>

//         {/* Barcode Section */}
//         <div className="ticket-section barcode-section">
//           <div className="color-overlay" style={{ backgroundColor: '#fff' }}></div>
//           <Barcode
//             value={barcodeValue}
//             width={1}
//             height={50}
//             displayValue={true}
//             fontSize={14}
//             margin={0}
//           />
//         </div>

//         {/* Food Section */}
//         <div className="ticket-section food-section">
//           <div className="color-overlay" style={{ backgroundColor: foodColor }}></div>
//           <Row>
//             <Col span={12}>
//               <Text strong>Room No:</Text>
//               <p>{userData.roomNumber} (Double Sharing)</p> 
//             </Col>
//             <Col span={12}>
//               <Text strong>Food Preference:</Text>
//               <p>{userData.foodPreference}</p>
//             </Col>
//           </Row>
//         </div>
//       </div>

//       {/* Drawer for Editing Profile */}
//       {edit && schema && (
//         <Drawer
//           title={schema?.data_schema?.title || "Edit Profile"}
//           open={edit}
//           onOk={handleOk}
//           onClose={handleCancel}
//           width={"90%"}
//         >
//           <DynamicForm
//             schemas={schema}
//             formData={formData}
//             onFinish={onFinish}
//           />
//         </Drawer>

//       )}
//     </div>
//   );
// };

// export default TicketPage;


// import React, { useEffect, useState } from 'react';
// import { Row, Col, Typography, Button, message } from 'antd';
// import { PlusOutlined, EditOutlined } from '@ant-design/icons';
// import Barcode from 'react-barcode';
// import './TicketPage.css';
// import { supabase } from 'configs/SupabaseConfig';
// import { useSelector } from 'react-redux';
// import DynamicForm from '../DynamicForm';
// import Drawer from 'antd/es/drawer';
// import { useNavigate } from 'react-router-dom';
// import ProfilePic from '../Profile/ProfilePic';

// const { Title, Text } = Typography;

// const trackColors = {
//   'Finance & Fintech': '#e6f7ff',
//   'Realestate & Construction': '#fff1f0',
//   'Pharma & Healthcare': '#f6ffed',
//   'Nagarathar Enterprises': '#fffbe6',
//   'Aspiring Entrepreneurs': '#f0f5ff',
//   'IT and Electronics': '#f9f0ff',
//   'Industries & Edutech': '#e6fffb',
// };

// const foodColors = {
//   Veg: '#d4edda',
//   'Non-Veg': '#f8d7da',
// };

// const TicketPage = () => {
//   const { session } = useSelector((state) => state.auth);
//   const [userData, setUserData] = useState(null);
//   const [edit, setEdit] = useState(false);
//   const [schema, setSchema] = useState();
//   const [formData, setFormData] = useState();

//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchUserData = async () => {
//       const { data, error } = await supabase
//         .from('users')
//         .select('details, additional_details')
//         .eq('id', session?.user?.id)
//         .single();

//       if (error) {
//         console.error("Error fetching user data:", error);
//       } else {
//         const details = data?.details || {};
//         const additionalDetails = data?.additional_details || {};
//         const mappedData = {
//           ...details,
//           ...additionalDetails,
//           name: details.user_name || `${details.firstName} ${details.lastName}`,
//           company: details.company || 'Company',
//           city: details.location || 'Location',
//           native: details.native || 'Native',
//           kovil: details.kovil || 'Kovil',
//           foodPreference: additionalDetails.food || 'Veg',
//           gender: additionalDetails.gender || 'Male',
//           streams: additionalDetails.streams,
//           streams_secondary: additionalDetails.streams_secondary,
//           roomNumber: additionalDetails.room_no || 'TBA',
//         };
//         setUserData(mappedData);
//       }
//     };

//     if (session?.user?.id) {
//       fetchUserData();
//     }
//   }, [session]);

//   const trackColor = trackColors[userData?.streams] || trackColors['Finance & Fintech'];
//   const foodColor = foodColors[userData?.foodPreference] || '#fff';

//   const profileIcon = userData?.gender === 'Male'
//     ? 'https://cdn-icons-png.flaticon.com/512/0/93.png'
//     : 'https://cdn-icons-png.flaticon.com/512/0/94.png';

//   const barcodeValue = userData
//     ? `${userData.name.replace(/\s/g, '')}-${userData.kovil.replace(/\s/g, '')}`
//     : 'Default-Barcode';

//   const getForms = async (formName) => {
//     const { data, error } = await supabase
//       .from('forms')
//       .select('*')
//       .eq('name', formName)
//       .eq('organization_id', session?.user?.organization_id)
//       .single();
//     if (data) {
//       setSchema(data);
//     }
//   };

//   const showModal = async (data, formName) => {
//     getForms(formName);
//     setFormData(data);
//     setEdit(true);
//   };

//   const onFinish = async (values) => {
//     const user_name = values?.firstName + " " + values?.lastName;
//     const updatedDetails = {
//       ...userData,
//       firstName: values.firstName,
//       lastName: values.lastName,
//       intro: values.intro,
//       membership_type: values.membership_type,
//       email: values.email,
//       mobile: values.mobile,
//       kovil: values.kovil,
//       native: values.native,
//       location: values.location,
//       address: values.address,
//       web: values.web,
//       twitter: values.twitter,
//       linkedin: values.linkedin,
//       facebook: values.facebook,
//       instagram: values.instagram,
//       company: values.company,
//       user_name,
//     };
//     const updatedAdditionalDetails = {
//       food: values.food,
//       gender: values.gender,
//       streams: values.streams || [userData.streams],
//       streams_secondary: values.streams_secondary || [userData.streams_secondary],
//     };

//     const { error: userError } = await supabase
//       .from('users')
//       .update({
//         details: updatedDetails,
//         additional_details: updatedAdditionalDetails,
//       })
//       .eq('id', session?.user?.id);

//     if (userError) {
//       console.log("Error updating users table:", userError.message);
//     } else {
//       setUserData({
//         name: user_name,
//         company: values.company || userData.company,
//         city: values.location || userData.city,
//         native: values.native || userData.native,
//         kovil: values.kovil || userData.kovil,
//         foodPreference: values.food || userData.foodPreference,
//         gender: values.gender || userData.gender,
//         streams: values.streams || userData.streams,
//         streams_secondary: values.streams_secondary || userData.streams_secondary,
//         roomNumber: values.room_no || userData.roomNumber,
//       });
//       setEdit(false);
//       message.success("Updated Successfully");
//     }
//     navigate(0);
//   };

//   const handleOk = () => setEdit(false);
//   const handleCancel = () => setEdit(false);

//   if (!userData) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div className="ticket-page">
//       <div className="ticket-card">
//         {/* Event Section */}
//         <div className="ticket-section event-section">
//           <Row justify="space-between" align="middle" className="ticket-header">
//             <Col>
//               <img src="/img/ibcn/ibcn.jpeg" alt="IBCN Logo" style={{ height: '70px' }} />
//             </Col>
//             <Col>
//               <h1>IBCN 2025 Bengaluru</h1>
//             </Col>
//             <Col>
//               <img src="/img/ibcn/knba.png" alt="KNBA Logo" style={{ height: '70px' }} />
//             </Col>
//           </Row>
//         </div>

//         {/* User Section */}
//         <div className="ticket-section user-section">
//           <div className="color-overlay" style={{ backgroundColor: trackColor }}></div>
//           <div className="profile-placeholder">
//             <ProfilePic />
//           </div>
//           <Title level={3} className="user-name">
//             {userData.name}
//           </Title>
//           <Text>{userData.company}, {userData.city}</Text>
//           <Text>
//             {userData.native} --- {userData.kovil}
//           </Text>
//           <div style={{ marginTop: '20px' }}>
//             <h3>Track: {userData.streams}</h3>
//             <p>2 Nights @ Hilton (Double Sharing)</p>
//             <p>Award Nights Party</p>
//           </div>
//         </div>

//         {/* Barcode Section */}
//         <div className="ticket-section barcode-section">
//           <div className="color-overlay" style={{ backgroundColor: '#fff' }}></div>
//           <Barcode
//             value={barcodeValue}
//             width={1}
//             height={50}
//             displayValue={true}
//             fontSize={14}
//             margin={0}
//           />
//         </div>

//         {/* Food Section */}
//         <div className="ticket-section food-section">
//           <div className="color-overlay" style={{ backgroundColor: foodColor }}></div>
//           <Row>
//             <Col span={12}>
//               <Text strong>Room No:</Text>
//               <p>{userData.roomNumber} (Double Sharing)</p>
//             </Col>
//             <Col span={12}>
//               <Text strong>Food Preference:</Text>
//               <p>{userData.foodPreference}</p>
//             </Col>
//           </Row>
//         </div>
//       </div>

//       {/* FAB Button for Edit Profile */}
//       {session?.user?.id && (
//         <Button
//           type="primary"
//           shape="circle"
//           icon={<EditOutlined />}
//           size="large"
//           className="fixed bottom-6 right-6 bg-blue-500 text-white shadow-lg hover:bg-blue-600 z-10"
//           onClick={() => showModal(
//             {
//               ...userData,
//               firstName: userData.name.split(' ')[0],
//               lastName: userData.name.split(' ').slice(1).join(' '),
//               company: userData.company,
//               location: userData.city,
//               food: userData.foodPreference,
//               streams: userData.streams,
//               streams_secondary: userData.streams_secondary,
//               room_no: userData.roomNumber,
//             },
//             'user_self_edit_form'
//           )}
//         />
//       )}

//       {/* Drawer for Editing Profile */}
//       {edit && schema && (
//         <Drawer
//           title={schema?.data_schema?.title || "Edit Profile"}
//           open={edit}
//           onOk={handleOk}
//           onClose={handleCancel}
//           width={"90%"}
//         >
//           <DynamicForm
//             schemas={schema}
//             formData={formData}
//             onFinish={onFinish}
//           />
//         </Drawer>
//       )}
//     </div>
//   );
// };

// export default TicketPage;





// import React, { useEffect, useState } from 'react';
// import { Row, Col, Typography, Button, message } from 'antd';
// import { PlusOutlined, EditOutlined } from '@ant-design/icons';
// import Barcode from 'react-barcode';
// import './TicketPage.css';
// import { supabase } from 'configs/SupabaseConfig';
// import { useSelector } from 'react-redux';
// import DynamicForm from '../DynamicForm';
// import Drawer from 'antd/es/drawer';
// import { useNavigate } from 'react-router-dom';
// import ProfilePic from '../Profile/ProfilePic';

// const { Title, Text } = Typography;

// const trackColors = {
//   'Finance & Fintech': '#e6f7ff',
//   'Realestate & Construction': '#fff1f0',
//   'Pharma & Healthcare': '#f6ffed',
//   'Nagarathar Enterprises': '#fffbe6',
//   'Aspiring Entrepreneurs': '#f0f5ff',
//   'IT and Electronics': '#f9f0ff',
//   'Industries & Edutech': '#e6fffb',
// };

// const foodColors = {
//   Veg: '#d4edda',
//   'Non-Veg': '#f8d7da',
// };

// const TicketPage = () => {
//   const { session } = useSelector((state) => state.auth);
//   const [userData, setUserData] = useState(null);
//   const [edit, setEdit] = useState(false);
//   const [schema, setSchema] = useState();
//   const [formData, setFormData] = useState();
//   const [isMobile, setIsMobile] = useState(window.innerWidth <= 768); // 768px as mobile breakpoint

//   const navigate = useNavigate();

//   // Detect screen size changes
//   useEffect(() => {
//     const handleResize = () => {
//       setIsMobile(window.innerWidth <= 768);
//     };
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   useEffect(() => {
//     const fetchUserData = async () => {
//       const { data, error } = await supabase
//         .from('users')
//         .select('details, additional_details')
//         .eq('id', session?.user?.id)
//         .single();

//       if (error) {
//         console.error("Error fetching user data:", error);
//       } else {
//         const details = data?.details || {};
//         const additionalDetails = data?.additional_details || {};
//         const mappedData = {
//           ...details,
//           ...additionalDetails,
//           name: details.user_name || `${details.firstName} ${details.lastName}`,
//           company: details.company || 'Company Name',
//           city: details.location || 'Location',
//           native: details.native || 'Native',
//           kovil: details.kovil || 'Kovil',
//           foodPreference: additionalDetails.food || 'Veg',
//           gender: additionalDetails.gender || 'Male',
//           streams: additionalDetails.streams,
//           streams_secondary: additionalDetails.streams_secondary,
//           roomNumber: additionalDetails.room_no || 'TBA',
//         };
//         setUserData(mappedData);
//       }
//     };

//     if (session?.user?.id) {
//       fetchUserData();
//     }
//   }, [session]);

//   const trackColor = trackColors[userData?.streams] || trackColors['Finance & Fintech'];
//   const foodColor = foodColors[userData?.foodPreference] || '#fff';

//   const profileIcon = userData?.gender === 'Male'
//     ? 'https://cdn-icons-png.flaticon.com/512/0/93.png'
//     : 'https://cdn-icons-png.flaticon.com/512/0/94.png';

//   const barcodeValue = userData
//     ? `${userData.name.replace(/\s/g, '')}-${userData.kovil.replace(/\s/g, '')}`
//     : 'Default-Barcode';

//   const getForms = async (formName) => {
//     const { data, error } = await supabase
//       .from('forms')
//       .select('*')
//       .eq('name', formName)
//       .eq('organization_id', session?.user?.organization_id)
//       .single();
//     if (data) {
//       setSchema(data);
//     }
//   };

//   const showModal = async (data, formName) => {
//     getForms(formName);
//     setFormData(data);
//     setEdit(true);
//   };

//   const onFinish = async (values) => {
//     const user_name = values?.firstName + " " + values?.lastName;
//     const updatedDetails = {
//       ...userData,
//       firstName: values.firstName,
//       lastName: values.lastName,
//       intro: values.intro,
//       membership_type: values.membership_type,
//       email: values.email,
//       mobile: values.mobile,
//       kovil: values.kovil,
//       native: values.native,
//       location: values.location,
//       address: values.address,
//       web: values.web,
//       twitter: values.twitter,
//       linkedin: values.linkedin,
//       facebook: values.facebook,
//       instagram: values.instagram,
//       company: values.company,
//       user_name,
//     };
//     const updatedAdditionalDetails = {
//       food: values.food,
//       gender: values.gender,
//       streams: values.streams || [userData.streams],
//       streams_secondary: values.streams_secondary || [userData.streams_secondary],
//     };

//     const { error: userError } = await supabase
//       .from('users')
//       .update({
//         details: updatedDetails,
//         additional_details: updatedAdditionalDetails,
//       })
//       .eq('id', session?.user?.id);

//     if (userError) {
//       console.log("Error updating users table:", userError.message);
//     } else {
//       setUserData({
//         name: user_name,
//         company: values.company || userData.company,
//         city: values.location || userData.city,
//         native: values.native || userData.native,
//         kovil: values.kovil || userData.kovil,
//         foodPreference: values.food || userData.foodPreference,
//         gender: values.gender || userData.gender,
//         streams: values.streams || userData.streams,
//         streams_secondary: values.streams_secondary || userData.streams_secondary,
//         roomNumber: values.room_no || userData.roomNumber,
//       });
//       setEdit(false);
//       message.success("Updated Successfully");
//     }
//     navigate(0);
//   };

//   const handleOk = () => setEdit(false);
//   const handleCancel = () => setEdit(false);

//   if (!userData) {
//     return <div>Loading...</div>;
//   }

//   const editProfileData = {
//     ...userData,
//     firstName: userData.name.split(' ')[0],
//     lastName: userData.name.split(' ').slice(1).join(' '),
//     company: userData.company,
//     location: userData.city,
//     food: userData.foodPreference,
//     streams: userData.streams,
//     streams_secondary: userData.streams_secondary,
//     room_no: userData.roomNumber,
//   };

//   return (
//     <div className="ticket-page">
//       <div className="ticket-card">
//         {/* Event Section */}
//         <div className="ticket-section event-section">
//           <Row justify="space-between" align="middle" className="ticket-header">
//             <Col>
//               <img src="/img/ibcn/ibcn.jpeg" alt="IBCN Logo" style={{ height: '50px' }} />
//             </Col>
//             <Col>
//               <h1>IBCN 2025 Bengaluru</h1>
//             </Col>
//             <Col>
//               <img src="/img/ibcn/knba.png" alt="KNBA Logo" style={{ height: '50px' }} />
//             </Col>
//           </Row>
//         </div>

//         {/* User Section */}
//         <div className="ticket-section user-section">
//           <div className="color-overlay" style={{ backgroundColor: trackColor }}></div>
//           <div className="profile-placeholder">
//             <ProfilePic />
//           </div>
//           <Title level={3} className="user-name">
//             {userData.name}
//           </Title>
//           <Text>{userData.company}, {userData.city}</Text>
//           <Text>
//             {userData.native} --- {userData.kovil}
//           </Text>
//           <div className="user-name" style={{ marginTop: '20px' }}>
//             <h3>Track: {userData.streams}</h3>
//             {/* <p>2 Nights @ Hilton (Double Sharing)</p>
//             <p>Award Nights Party</p> */}
//           </div>
//           {/* Inline Edit Button for Desktop */}
//           {session?.user?.id && !isMobile && (
//             <Button
//               icon={<EditOutlined />}
//               onClick={() => showModal(editProfileData, 'user_self_edit_form')}
//               style={{ marginTop: '10px' }}
//             >
//               Edit Profile
//             </Button>
//           )}
//         </div>

//         {/* Barcode Section */}
//         <div className="ticket-section barcode-section">
//           <div className="color-overlay" style={{ backgroundColor: '#fff' }}></div>
//           <Barcode
//             value={barcodeValue}
//             width={1}
//             height={50}
//             displayValue={true}
//             fontSize={14}
//             margin={0}
//           />
//         </div>

//         {/* Food Section */}
//         <div className="ticket-section food-section">
//           <div className="color-overlay" style={{ backgroundColor: foodColor }}></div>
//           <Row>
//             <Col span={12}>
//               <Text strong>Room No:</Text>
//               <p>{userData.roomNumber} (Double Sharing)</p>
//             </Col>
//             <Col span={12}>
//               <Text strong>Food Preference:</Text>
//               <p>{userData.foodPreference}</p>
//             </Col>
//           </Row>
//         </div>
//       </div>

//       {/* FAB Button for Mobile */}
//       {session?.user?.id && isMobile && (
//         <Button
//           type="primary"
//           shape="circle"
//           icon={<EditOutlined />}
//           size="large"
//           className="fab-button"
//           onClick={() => showModal(editProfileData, 'user_self_edit_form')}
//         />
//       )}

//       {/* Drawer for Editing Profile */}
//       {edit && schema && (
//         <Drawer
//           title={schema?.data_schema?.title || "Edit Profile"}
//           open={edit}
//           onOk={handleOk}
//           onClose={handleCancel}
//           width={"90%"}
//         >
//           <DynamicForm
//             schemas={schema}
//             formData={formData}
//             onFinish={onFinish}
//           />
//         </Drawer>
//       )}
//     </div>
//   );
// };

// export default TicketPage;





import React, { useEffect, useState } from 'react';
import { Row, Col, Typography, Button, message } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import QRCode from 'react-qr-code'; // Replace Barcode with QRCode
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
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('details, additional_details')
        .eq('id', session?.user?.id)
        .single();

      if (error) {
        console.error("Error fetching user data:", error);
      } else {
        const details = data?.details || {};
        const additionalDetails = data?.additional_details || {};
        const mappedData = {
          ...details,
          ...additionalDetails,
          name: details.user_name || `${details.firstName} ${details.lastName}`,
          company: details.company || 'Company Name',
          city: details.location || 'Location',
          native: details.native || 'Native',
          kovil: details.kovil || 'Kovil',
          foodPreference: additionalDetails.food || 'Veg',
          gender: additionalDetails.gender || 'Male',
          streams: additionalDetails.streams,
          streams_secondary: additionalDetails.streams_secondary,
          roomNumber: additionalDetails.room_no || 'TBA',
        };
        setUserData(mappedData);
      }
    };

    if (session?.user?.id) {
      fetchUserData();
    }
  }, [session]);

  const trackColor = trackColors[userData?.streams] || trackColors['Finance & Fintech'];
  const foodColor = foodColors[userData?.foodPreference] || '#fff';

  // Updated QR code URL
  const qrUrl = `${window.location.origin}/app/members/${session?.user?.id}`;

  const getForms = async (formName) => {
    const { data, error } = await supabase
      .from('forms')
      .select('*')
      .eq('name', formName)
      .eq('organization_id', session?.user?.organization_id)
      .single();
    if (data) {
      setSchema(data);
    }
  };

  const showModal = async (data, formName) => {
    getForms(formName);
    setFormData(data);
    setEdit(true);
  };

  const onFinish = async (values) => {
    const user_name = values?.firstName + " " + values?.lastName;
    const updatedDetails = {
      ...userData,
      firstName: values.firstName,
      lastName: values.lastName,
      intro: values.intro,
      membership_type: values.membership_type,
      email: values.email,
      mobile: values.mobile,
      kovil: values.kovil,
      native: values.native,
      location: values.location,
      address: values.address,
      web: values.web,
      twitter: values.twitter,
      linkedin: values.linkedin,
      facebook: values.facebook,
      instagram: values.instagram,
      company: values.company,
      user_name,
    };
    const updatedAdditionalDetails = {
      food: values.food,
      gender: values.gender,
      streams: values.streams || [userData.streams],
      streams_secondary: values.streams_secondary || [userData.streams_secondary],
    };

    const { error: userError } = await supabase
      .from('users')
      .update({
        details: updatedDetails,
        additional_details: updatedAdditionalDetails,
      })
      .eq('id', session?.user?.id);

    if (userError) {
      console.log("Error updating users table:", userError.message);
    } else {
      setUserData({
        name: user_name,
        company: values.company || userData.company,
        city: values.location || userData.city,
        native: values.native || userData.native,
        kovil: values.kovil || userData.kovil,
        foodPreference: values.food || userData.foodPreference,
        gender: values.gender || userData.gender,
        streams: values.streams || userData.streams,
        streams_secondary: values.streams_secondary || userData.streams_secondary,
        roomNumber: values.room_no || userData.roomNumber,
      });
      setEdit(false);
      message.success("Updated Successfully");
    }
    navigate(0);
  };

  const handleOk = () => setEdit(false);
  const handleCancel = () => setEdit(false);

  if (!userData) {
    return <div>Loading...</div>;
  }

  const editProfileData = {
    ...userData,
    firstName: userData.name.split(' ')[0],
    lastName: userData.name.split(' ').slice(1).join(' '),
    company: userData.company,
    location: userData.city,
    food: userData.foodPreference,
    streams: userData.streams,
    streams_secondary: userData.streams_secondary,
    room_no: userData.roomNumber,
  };

  return (
    <div className="ticket-page">
      <div className="ticket-card">
        {/* Event Section */}
        <div className="ticket-section event-section">
          <Row justify="space-between" align="middle" className="ticket-header">
            <Col>
              <img src="/img/ibcn/ibcn.jpeg" alt="IBCN Logo" style={{ height: '50px' }} />
            </Col>
            <Col>
              <h1>IBCN 2025 Bengaluru</h1>
            </Col>
            <Col>
              <img src="/img/ibcn/knba.png" alt="KNBA Logo" style={{ height: '50px' }} />
            </Col>
          </Row>
        </div>

        {/* User Section */}
        <div className="ticket-section user-section">
          <div className="color-overlay" style={{ backgroundColor: trackColor }}></div>
          <div className="profile-placeholder">
            <ProfilePic />
          </div>
          <Title level={3} className="user-name">
            {userData.name}
          </Title>
          <Text>{userData.company}, {userData.city}</Text>
          <Text>
            {userData.native} --- {userData.kovil}
          </Text>
          <Title level={3} className="user-name">
            {userData.streams}
          </Title>
          {session?.user?.id && !isMobile && (
            <Button
              icon={<EditOutlined />}
              onClick={() => showModal(editProfileData, 'user_self_edit_form')}
              style={{ marginTop: '10px' }}
            >
              Edit Profile
            </Button>
          )}
        </div>

        {/* QR Code Section - Replaced Barcode */}
        <div className="ticket-section barcode-section">
          <div className="color-overlay" style={{ backgroundColor: '#fff' }}></div>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px' }}>
            <QRCode
              value={qrUrl}
              size={150}
              level="H"
            />
          </div>
        </div>

        {/* Food Section */}
        <div className="ticket-section food-section">
          <div className="color-overlay" style={{ backgroundColor: foodColor }}></div>
          <Row>
            <Col span={12}>
              <Text strong>Room No:</Text>
              <p>{userData.roomNumber} (Double Sharing)</p>
            </Col>
            <Col span={12}>
              <Text strong>Food Preference:</Text>
              <p>{userData.foodPreference}</p>
            </Col>
          </Row>
        </div>
      </div>

      {session?.user?.id && isMobile && (
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
          title={schema?.data_schema?.title || "Edit Profile"}
          open={edit}
          onOk={handleOk}
          onClose={handleCancel}
          width={"90%"}
        >
          <DynamicForm
            schemas={schema}
            formData={formData}
            onFinish={onFinish}
          />
        </Drawer>
      )}
    </div>
  );
};

export default TicketPage;