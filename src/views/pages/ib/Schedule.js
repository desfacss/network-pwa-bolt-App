// // import { Card } from 'antd'
// // import React from 'react'

// // const Schedule = () => {
// //     return (
// //         <Card>Conference Schedule</Card>
// //     )
// // }

// // export default Schedule

// import { Card, Col, Row, Divider } from 'antd';
// import React from 'react';

// const Schedule = () => {
//   return (
//     <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
//       {/* Event Header */}
//       <h1 style={{ textAlign: 'center', fontSize: '2.5em', marginBottom: '20px' }}>
//         IBCN 2025 Bengaluru
//       </h1>

//       {/* Event Dates and Venue */}
//       <Card style={{ marginBottom: '20px', textAlign: 'center' }}>
//         <h2>Event Dates & Venue</h2>
//         <p style={{ fontSize: '1.2em' }}>
//           <strong>Dates:</strong> 11, 12, 13 July 2025
//         </p>
//         <p style={{ fontSize: '1.2em' }}>
//           <strong>Venue:</strong> Hilton Bengaluru, Embassy Manyata Business Park
//         </p>
//       </Card>

//       {/* Overall Schedule */}
//       <Card style={{ marginBottom: '20px' }}>
//         <h2>Overall Schedule</h2>
//         <p style={{ fontStyle: 'italic' }}>Coming Soon</p>
//       </Card>

//       {/* Key Speakers */}
//       <Card style={{ marginBottom: '20px' }}>
//         <h2>Key Speakers</h2>
//         <p style={{ fontStyle: 'italic' }}>Coming Soon</p>
//       </Card>

//       {/* 7 Streams */}
//       <Card style={{ marginBottom: '20px' }}>
//         <h2>Parallel Streams</h2>
//         <Row gutter={[16, 16]}>
//           {[
//             'Real Estate & Construction',
//             'Pharma & Healthcare',
//             'Finance & Fintech',
//             'Nagarathar Enterprises',
//             'IT & Electronics',
//             'Industries & Edutech',
//             'Aspiring Entrepreneurs',
//           ].map((stream, index) => (
//             <Col xs={24} sm={12} md={8} key={index}>
//               <Card hoverable style={{ textAlign: 'center' }}>
//                 {stream}
//               </Card>
//             </Col>
//           ))}
//         </Row>
//       </Card>

//       {/* Sponsor Images Section */}
//       <Divider>Sponsors</Divider>
//       <div style={{ textAlign: 'center' }}>
//         <p>
//           {/* Placeholder for sponsor images */}
//           {/* Replace these with actual <img> tags sourced from https://www.ibcn2025.com */}
//           [Sponsor Images from https://www.ibcn2025.com will be displayed here]
//         </p>
//         <p style={{ fontSize: '0.9em', color: '#888' }}>
//           Visit <a href="https://www.ibcn2025.com" target="_blank" rel="noopener noreferrer">www.ibcn2025.com</a> for more details.
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Schedule;

// import { Card, Col, Row, Divider, Carousel } from 'antd';
// import {
//   HomeOutlined,
//   MedicineBoxOutlined,
//   BankOutlined,
//   ShopOutlined,
//   LaptopOutlined,
//   AccountBookFilled,
//   RocketOutlined,
// } from '@ant-design/icons';
// import React from 'react';

// const Schedule = () => {
//   // Stream data with corresponding icons
//   const streams = [
//     { name: 'Real Estate & Construction', icon: <HomeOutlined /> },
//     { name: 'Pharma & Healthcare', icon: <MedicineBoxOutlined /> },
//     { name: 'Finance & Fintech', icon: <BankOutlined /> },
//     { name: 'Nagarathar Enterprises', icon: <ShopOutlined /> },
//     { name: 'IT & Electronics', icon: <LaptopOutlined /> },
//     { name: 'Industries & Edutech', icon: <AccountBookFilled /> },
//     { name: 'Aspiring Entrepreneurs', icon: <RocketOutlined /> },
//   ];

//   // Group streams into sets of 4 for each carousel slide
//   const groupedStreams = [];
//   for (let i = 0; i < streams.length; i += 4) {
//     groupedStreams.push(streams.slice(i, i + 4));
//   }

//   // Sponsor images (adjust length based on actual files)
//   const platinumSponsors = Array.from({ length: 5 }, (_, i) => `/img/sponsors/platinum/${i + 1}.jpg`);
//   const goldSponsors = Array.from({ length: 5 }, (_, i) => `/img/sponsors/gold/${i + 1}.jpg`);

//   return (
//     <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
//       {/* Event Header */}
//       <h1 style={{ textAlign: 'center', fontSize: '2.5em', marginBottom: '20px' }}>
//         IBCN 2025 Bengaluru
//       </h1>

//       {/* Event Dates and Venue */}
//       <Card style={{ marginBottom: '20px', textAlign: 'center' }}>
//         <h2>Event Dates & Venue</h2>
//         <p style={{ fontSize: '1.2em' }}>
//           <strong>Dates:</strong> 11, 12, 13 July 2025
//         </p>
//         <p style={{ fontSize: '1.2em' }}>
//           <strong>Venue:</strong> Hilton Bengaluru, Embassy Manyata Business Park
//         </p>
//       </Card>

//       {/* Overall Schedule */}
//       <Card style={{ marginBottom: '20px' }}>
//         <h2>Overall Schedule</h2>
//         <p style={{ fontStyle: 'italic' }}>Coming Soon</p>
//       </Card>

//       {/* Key Speakers */}
//       <Card style={{ marginBottom: '20px' }}>
//         <h2>Key Speakers</h2>
//         <p style={{ fontStyle: 'italic' }}>Coming Soon</p>
//       </Card>

//       {/* Streams Carousel */}
//       <Card style={{ marginBottom: '20px' }}>
//         <h2>Parallel Streams</h2>
//         <Carousel autoplay dots={{ className: 'carousel-dots' }} style={{ padding: '20px' }}>
//           {groupedStreams.map((group, groupIndex) => (
//             <div key={groupIndex}>
//               <Row gutter={[16, 16]} justify="center">
//                 {group.map((stream, index) => (
//                   <Col xs={24} sm={12} md={6} key={index}>
//                     <Card
//                       hoverable
//                       style={{
//                         textAlign: 'center',
//                         background: '#f0f2f5',
//                         height: '150px', // Fixed height for consistency
//                       }}
//                     >
//                       <div style={{ fontSize: '2em', marginBottom: '10px' }}>{stream.icon}</div>
//                       <p style={{ fontSize: '1em', fontWeight: 'bold' }}>{stream.name}</p>
//                     </Card>
//                   </Col>
//                 ))}
//               </Row>
//             </div>
//           ))}
//         </Carousel>
//       </Card>

//       {/* Sponsors Section */}
//       {/* <Divider>Sponsors</Divider> */}

//       {/* Platinum Sponsors */}
//       <h3 style={{ textAlign: 'center', marginBottom: '15px' }}>Platinum Sponsors</h3>
//       <Row gutter={[16, 16]} justify="center" style={{ marginBottom: '20px' }}>
//         {platinumSponsors.map((src, index) => (
//           <Col key={index}>
//             <img
//               src={src}
//               alt={`Platinum Sponsor ${index + 1}`}
//               style={{ maxWidth: '150px', height: 'auto', objectFit: 'contain' }}
//               onError={(e) => (e.target.style.display = 'none')} // Hide if image doesn't exist
//             />
//           </Col>
//         ))}
//       </Row>

//       {/* Gold Sponsors */}
//       <h3 style={{ textAlign: 'center', marginBottom: '15px' }}>Gold Sponsors</h3>
//       <Row gutter={[16, 16]} justify="center">
//         {goldSponsors.map((src, index) => (
//           <Col key={index}>
//             <img
//               src={src}
//               alt={`Gold Sponsor ${index + 1}`}
//               style={{ maxWidth: '150px', height: 'auto', objectFit: 'contain' }}
//               onError={(e) => (e.target.style.display = 'none')} // Hide if image doesn't exist
//             />
//           </Col>
//         ))}
//       </Row>

//       {/* Footer Link */}
//       <p style={{ textAlign: 'center', fontSize: '0.9em', color: '#888', marginTop: '20px' }}>
//         Visit{' '}
//         <a href="https://www.ibcn2025.com" target="_blank" rel="noopener noreferrer">
//           www.ibcn2025.com
//         </a>{' '}
//         for more details.
//       </p>
//     </div>
//   );
// };

// export default Schedule;



// WORKINGGGGGG
// import { Card, Col, Row, Divider, Carousel } from 'antd';
// import {
//   HomeOutlined,
//   MedicineBoxOutlined,
//   BankOutlined,
//   ShopOutlined,
//   LaptopOutlined,
//   AccountBookFilled,
//   RocketOutlined,
// } from '@ant-design/icons';
// import React from 'react';

// const Schedule = () => {
//   // Stream data with corresponding icons
//   const streams = [
//     { name: 'Real Estate & Construction', icon: <HomeOutlined /> },
//     { name: 'Pharma & Healthcare', icon: <MedicineBoxOutlined /> },
//     { name: 'Finance & Fintech', icon: <BankOutlined /> },
//     { name: 'Nagarathar Enterprises', icon: <ShopOutlined /> },
//     { name: 'IT & Electronics', icon: <LaptopOutlined /> },
//     { name: 'Industries & Edutech', icon: <AccountBookFilled /> },
//     { name: 'Aspiring Entrepreneurs', icon: <RocketOutlined /> },
//   ];

//   // Group streams into sets of 4 for each carousel slide
//   const groupedStreams = [];
//   for (let i = 0; i < streams.length; i += 4) {
//     groupedStreams.push(streams.slice(i, i + 4));
//   }

//   // Sponsor images (adjust length based on actual files)
//   const platinumSponsors = Array.from({ length: 5 }, (_, i) => `/img/sponsors/platinum/${i + 1}.jpg`);
//   const goldSponsors = Array.from({ length: 5 }, (_, i) => `/img/sponsors/gold/${i + 1}.jpg`);

//   return (
//     <div style={{ position: 'relative', minHeight: '100vh', backgroundColor: '#f5f8fa' }}>
//       {/* Background Cover */}
//       <div
//         style={{
//           height: '400px', // Adjusted height for the banner
//           backgroundImage: `url(/img/ibcn/ibcn-banner.jpg)`, // Using the provided image path
//           backgroundSize: 'cover',
//           backgroundPosition: 'center',
//           position: 'relative',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//         }}
//       >
//         {/* Overlay for better contrast */}
//         <div
//           style={{
//             position: 'absolute',
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0))', // Gradient overlay for smooth transition
//           }}
//         />
//         {/* Event Header inside the banner */}
//         <h1 style={{ textAlign: 'center', fontSize: '2.5em', color: '#fff', zIndex: 1 }}>
//           IBCN 2025 Bengaluru
//         </h1>
//       </div>

//       {/* Content Section */}
//       <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
//         {/* Event Dates and Venue */}
//         <Card style={{ marginBottom: '20px', textAlign: 'center' }}>
//           <h2>Event Dates & Venue</h2>
//           <p style={{ fontSize: '1.2em' }}>
//             <strong>Dates:</strong> 11, 12, 13 July 2025
//           </p>
//           <p style={{ fontSize: '1.2em' }}>
//             <strong>Venue:</strong> Hilton Bengaluru, Embassy Manyata Business Park
//           </p>
//         </Card>

//         {/* Overall Schedule */}
//         <Card style={{ marginBottom: '20px' }}>
//           <h2>Overall Schedule</h2>
//           <p style={{ fontStyle: 'italic' }}>Coming Soon</p>
//         </Card>

//         {/* Key Speakers */}
//         <Card style={{ marginBottom: '20px' }}>
//           <h2>Key Speakers</h2>
//           <p style={{ fontStyle: 'italic' }}>Coming Soon</p>
//         </Card>

//         {/* Streams Carousel */}
//         <Card style={{ marginBottom: '20px' }}>
//           <h2>Parallel Streams</h2>
//           <Carousel autoplay dots={{ className: 'carousel-dots' }} style={{ padding: '20px' }}>
//             {groupedStreams.map((group, groupIndex) => (
//               <div key={groupIndex}>
//                 <Row gutter={[16, 16]} justify="center">
//                   {group.map((stream, index) => (
//                     <Col xs={24} sm={12} md={6} key={index}>
//                       <Card
//                         hoverable
//                         style={{
//                           textAlign: 'center',
//                           background: '#f0f2f5',
//                           height: '150px', // Fixed height for consistency
//                         }}
//                       >
//                         <div style={{ fontSize: '2em', marginBottom: '10px' }}>{stream.icon}</div>
//                         <p style={{ fontSize: '1em', fontWeight: 'bold' }}>{stream.name}</p>
//                       </Card>
//                     </Col>
//                   ))}
//                 </Row>
//               </div>
//             ))}
//           </Carousel>
//         </Card>

//         {/* Sponsors Section */}
//         {/* <Divider>Sponsors</Divider> */}

//         {/* Platinum Sponsors */}
//         <h3 style={{ textAlign: 'center', marginBottom: '15px' }}>Platinum Sponsors</h3>
//         <Row gutter={[16, 16]} justify="center" style={{ marginBottom: '20px' }}>
//           {platinumSponsors.map((src, index) => (
//             <Col key={index}>
//               <img
//                 src={src}
//                 alt={`Platinum Sponsor ${index + 1}`}
//                 style={{ maxWidth: '150px', height: 'auto', objectFit: 'contain' }}
//                 onError={(e) => (e.target.style.display = 'none')} // Hide if image doesn't exist
//               />
//             </Col>
//           ))}
//         </Row>

//         {/* Gold Sponsors */}
//         <h3 style={{ textAlign: 'center', marginBottom: '15px' }}>Gold Sponsors</h3>
//         <Row gutter={[16, 16]} justify="center">
//           {goldSponsors.map((src, index) => (
//             <Col key={index}>
//               <img
//                 src={src}
//                 alt={`Gold Sponsor ${index + 1}`}
//                 style={{ maxWidth: '150px', height: 'auto', objectFit: 'contain' }}
//                 onError={(e) => (e.target.style.display = 'none')} // Hide if image doesn't exist
//               />
//             </Col>
//           ))}
//         </Row>

//         {/* Footer Link */}
//         <p style={{ textAlign: 'center', fontSize: '0.9em', color: '#888', marginTop: '20px' }}>
//           Visit{' '}
//           <a href="https://www.ibcn2025.com" target="_blank" rel="noopener noreferrer">
//             www.ibcn2025.com
//           </a>{' '}
//           for more details.
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Schedule;



import { Card, Col, Row, Divider, Carousel } from 'antd';
import {
  HomeOutlined,
  MedicineBoxOutlined,
  BankOutlined,
  ShopOutlined,
  LaptopOutlined,
  AccountBookFilled,
  RocketOutlined,
} from '@ant-design/icons';
import React from 'react';

const Schedule = () => {
  // Stream data with corresponding icons
  const streams = [
    { name: 'Real Estate & Construction', icon: <HomeOutlined /> },
    { name: 'Pharma & Healthcare', icon: <MedicineBoxOutlined /> },
    { name: 'Finance & Fintech', icon: <BankOutlined /> },
    { name: 'Nagarathar Enterprises', icon: <ShopOutlined /> },
    { name: 'IT & Electronics', icon: <LaptopOutlined /> },
    { name: 'Industries & Edutech', icon: <AccountBookFilled /> },
    { name: 'Aspiring Entrepreneurs', icon: <RocketOutlined /> },
  ];

  // Group streams into sets of 4 for each carousel slide
  const groupedStreams = [];
  for (let i = 0; i < streams.length; i += 4) {
    groupedStreams.push(streams.slice(i, i + 4));
  }

  // Sponsor images (adjust length based on actual files)
  const platinumSponsors = Array.from({ length: 5 }, (_, i) => `/img/sponsors/platinum/${i + 1}.jpg`);
  const goldSponsors = Array.from({ length: 5 }, (_, i) => `/img/sponsors/gold/${i + 1}.jpg`);

  // return (
  //   <div
  //     style={{
  //       position: 'relative',
  //       minHeight: '100vh',
  //       backgroundColor: '#f5f8fa',
  //       fontFamily: 'Arial, sans-serif', // Clean typography
  //     }}
  //   >
  //     {/* Background Cover */}
  //     <div
  //       style={{
  //         height: '400px', // Base height for mobile
  //         backgroundImage: `url(/img/ibcn/ibcn-banner.jpg)`,
  //         backgroundSize: 'cover',
  //         backgroundPosition: 'center',
  //         position: 'relative',
  //         display: 'flex',
  //         alignItems: 'center',
  //         justifyContent: 'center',
  //       }}
  //     >
  //       {/* Gradient overlay with fade to #f5f8fa at the bottom */}
  //       <div
  //         style={{
  //           position: 'absolute',
  //           top: 0,
  //           left: 0,
  //           right: 0,
  //           bottom: 0,
  //           background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.5), #f5f8fa 100%)', // Fade into page background
  //         }}
  //       />
  //       {/* Event Header inside the banner */}
  //       <h1
  //         style={{
  //           textAlign: 'center',
  //           fontSize: '2rem',
  //           color: '#fff',
  //           zIndex: 1,
  //           padding: '0 20px',
  //         }}
  //       >
  //         IBCN 2025 Bengaluru
  //       </h1>
  //     </div>

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        backgroundColor: '#f5f8fa',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {/* Background Cover */}
      <div
        style={{
          height: '400px',
          backgroundImage: `url(/img/ibcn/ibcn-banner.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Gradient overlay with fade to #f5f8fa at the bottom */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0) 50%, #f5f8fa 100%, #f5f8fa 70%)', // Adjusted gradient
          }}
        />
        {/* Event Header inside the banner */}
        <h1
          style={{
            textAlign: 'center',
            fontSize: '2rem',
            color: '#fff',
            zIndex: 1,
            padding: '0 20px',
          }}
        >
          IBCN 2025 Bengaluru
        </h1>
      </div>

      {/* Content Section overlapping from 50% of banner height */}
      <div
        style={{
          position: 'relative',
          top: '-180px', // 50% of 400px banner height
          padding: '20px',
          maxWidth: '1200px',
          margin: '0 auto',
          // backgroundColor: '#f5f8fa',
          // backgroundColor: '#000000',
          // borderRadius: '8px',
          // boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Clean shadow for elevation
          zIndex: 2,
        }}
      >
        {/* Event Dates and Venue */}
        <Card style={{ marginBottom: '20px', textAlign: 'center' }}>
          <h2>Event Dates & Venue</h2>
          <p style={{ fontSize: '1.2em' }}>
            <strong>Dates:</strong> 11, 12, 13 July 2025
          </p>
          <p style={{ fontSize: '1.2em' }}>
            <strong>Venue:</strong> Hilton Bengaluru, Embassy Manyata Business Park
          </p>
        </Card>

        {/* Overall Schedule */}
        <Card style={{ marginBottom: '20px' }}>
          <h2>Schedule</h2>
          <p style={{ fontStyle: 'italic' }}>Coming Soon</p>
        </Card>

        {/* Key Speakers */}
        <Card style={{ marginBottom: '20px' }}>
          <h2>Key Speakers</h2>
          <p style={{ fontStyle: 'italic' }}>Coming Soon</p>
        </Card>

        {/* Streams Carousel */}
        <Card style={{ marginBottom: '20px' }}>
          <h2>Parallel Streams</h2>
          <Carousel autoplay dots={{ className: 'carousel-dots' }} style={{ padding: '20px' }}>
            {groupedStreams.map((group, groupIndex) => (
              <div key={groupIndex}>
                <Row gutter={[16, 16]} justify="center">
                  {group.map((stream, index) => (
                    <Col
                      xs={24}
                      sm={12}
                      md={6}
                      key={index}
                      style={{ marginBottom: '16px' }} // Responsive spacing
                    >
                      <Card
                        hoverable
                        style={{
                          textAlign: 'center',
                          background: '#f0f2f5',
                          height: '150px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <div style={{ fontSize: '2em', marginBottom: '10px' }}>{stream.icon}</div>
                        <p style={{ fontSize: '1em', fontWeight: 'bold' }}>{stream.name}</p>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            ))}
          </Carousel>
        </Card>

        {/* Streams Carousel (Responsive with fixed card width) */}
         <Card style={{ marginBottom: '20px' }}>
           <h2>Parallel Streams</h2>
          <Carousel
            autoplay
            dots={{ className: 'carousel-dots' }}
            slidesToShow={1} // Default for mobile
            slidesToScroll={1} // Scroll one card at a time
            responsive={[
              {
                breakpoint: 768, // iPad and larger (e.g., 768px)
                settings: {
                  slidesToShow: 3, // Show 3 cards on iPad
                  slidesToScroll: 1,
                },
              },
              {
                breakpoint: 992, // Desktop and larger (e.g., 992px)
                settings: {
                  slidesToShow: 4, // Show 4 cards on desktop
                  slidesToScroll: 1,
                },
              },
            ]}
            style={{ padding: '20px', overflow: 'hidden' }} // Ensure smooth sliding
          >
            {streams.map((stream, index) => (
              <div
                key={index}
                style={{
                  width: '250px', // Fixed width for each card
                  margin: '0 10px', // Add spacing between cards
                }}
              >
                <Card
                  hoverable
                  style={{
                    textAlign: 'center',
                    background: '#f0f2f5',
                    width: '100%', // Full width of the container div
                    height: '150px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ fontSize: '2em', marginBottom: '10px' }}>{stream.icon}</div>
                  <p style={{ fontSize: '1em', fontWeight: 'bold' }}>{stream.name}</p>
                </Card>
              </div>
            ))}
          </Carousel>
        </Card>

       

        {/* Sponsors Section */}
        {/* <Divider>Sponsors</Divider> */}

        {/* Platinum Sponsors */}
        <h3 style={{ textAlign: 'center', marginBottom: '15px' }}>Platinum Sponsors</h3>
        <Row gutter={[16, 16]} justify="center" style={{ marginBottom: '20px' }}>
          {platinumSponsors.map((src, index) => (
            <Col
              xs={12}
              sm={8}
              md={4}
              key={index}
              style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}
            >
              <img
                src={src}
                alt={`Platinum Sponsor ${index + 1}`}
                style={{ maxWidth: '150px', height: 'auto', objectFit: 'contain' }}
                onError={(e) => (e.target.style.display = 'none')}
              />
            </Col>
          ))}
        </Row>

        {/* Gold Sponsors */}
        <h3 style={{ textAlign: 'center', marginBottom: '15px' }}>Gold Sponsors</h3>
        <Row gutter={[16, 16]} justify="center">
          {goldSponsors.map((src, index) => (
            <Col
              xs={12}
              sm={8}
              md={4}
              key={index}
              style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}
            >
              <img
                src={src}
                alt={`Gold Sponsor ${index + 1}`}
                style={{ maxWidth: '150px', height: 'auto', objectFit: 'contain' }}
                onError={(e) => (e.target.style.display = 'none')}
              />
            </Col>
          ))}
        </Row>

        {/* Footer Link */}
        <p style={{ textAlign: 'center', fontSize: '0.9em', color: '#888', marginTop: '20px' }}>
          Visit{' '}
          <a href="https://www.ibcn2025.com" target="_blank" rel="noopener noreferrer">
            www.ibcn2025.com
          </a>{' '}
          for more details.
        </p>
      </div>
    </div>
  );
};

export default Schedule;

