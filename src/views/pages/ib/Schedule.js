// import { Card, Col, Row, Carousel } from 'antd';
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

//   // Sponsor images with specific file paths
//   const platinumSponsors = [
//     '/img/sponsors/platinum/1.png',
//     '/img/sponsors/platinum/2.png',
//     '/img/sponsors/platinum/3.png',
//   ];
//   const goldSponsors = [
//     '/img/sponsors/gold/2.png',
//     '/img/sponsors/gold/3.png',
//     '/img/sponsors/gold/4.png',
//     '/img/sponsors/gold/5.png',
//     '/img/sponsors/gold/6.png',
//     '/img/sponsors/gold/7.png',
//     '/img/sponsors/gold/8.png',
//   ];

//   // Carousel settings for sponsors
//   const sponsorCarouselSettings = {
//     dots: false,
//     infinite: true,
//     speed: 500,
//     slidesToShow: 4, // Default for desktop
//     slidesToScroll: 1, // Slide one at a time
//     autoplay: true,
//     autoplaySpeed: 3000,
//     responsive: [
//       {
//         breakpoint: 767, // Mobile (up to 767px)
//         settings: {
//           slidesToShow: 2, // Show 2 logos on mobile
//           slidesToScroll: 1,
//         },
//       },
//       {
//         breakpoint: 768, // Tablet and above
//         settings: {
//           slidesToShow: 4, // Show 4 logos on desktop
//           slidesToScroll: 1,
//         },
//       },
//     ],
//   };

//   return (
//     <div
//       style={{
//         position: 'relative',
//         minHeight: '100vh',
//         backgroundColor: '#f5f8fa',
//         fontFamily: 'Arial, sans-serif',
//       }}
//     >
//       {/* Background Cover - Mobile First */}
//       <div
//         style={{
//           height: '40vh',
//           minHeight: '300px',
//           // backgroundImage: `url(${window.location.origin}/img/ibcn/ibcn-banner.jpg)`, // Full URL for domain
//           // backgroundImage: `/img/ibcn/ibcn-banner.jpg`, 
//           backgroundImage: `url('/img/ibcn/ibcn-banner.jpg')`,
//           backgroundSize: 'cover',
//           backgroundPosition: 'center -55px', 
//           position: 'relative',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           width: '100%',
//         }}
//       >
//         {/* Gradient Overlay */}
//         <div
//           style={{
//             position: 'absolute',
//             inset: 0, // Simplified from top/left/right/bottom
//             background: 'linear-gradient(to bottom, transparent 50%, #f5f8fa 100%)', // Same for all screens
//           }}
//         />

//         {/* Event Header */}
//         <h1
//           style={{
//             textAlign: 'center',
//             fontSize: '1.5rem',
//             color: '#fff',
//             zIndex: 1,
//             padding: '0 15px',
//             lineHeight: '1.2',
//           }}
//         >
//           IBCN 2025 Bengaluru
//         </h1>
//       </div>

//       {/* Content Section */}
//       <div
//         style={{
//           position: 'relative',
//           top: '-100px',
//           padding: '15px',
//           maxWidth: '1200px',
//           margin: '0 auto',
//           zIndex: 2,
//         }}
//       >
//         {/* Event Dates and Venue */}
//         <Card style={{ marginBottom: '15px', textAlign: 'center' }}>
//           <h2 style={{ fontSize: '1.2rem' }}>Event Dates & Venue</h2>
//           <p style={{ fontSize: '1rem' }}>
//             <strong>Dates:</strong> 11, 12, 13 July 2025
//           </p>
//           <p style={{ fontSize: '1rem' }}>
//             <strong>Venue:</strong> Hilton Bengaluru, Embassy Manyata Business Park
//           </p>
//         </Card>

//         {/* Overall Schedule */}
//         <Card style={{ marginBottom: '15px' }}>
//           <h2 style={{ fontSize: '1.2rem' }}>Schedule</h2>
//           <p style={{ fontStyle: 'italic', fontSize: '1rem' }}>Coming Soon</p>
//         </Card>

//         {/* Key Speakers */}
//         <Card style={{ marginBottom: '15px' }}>
//           <h2 style={{ fontSize: '1.2rem' }}>Key Speakers</h2>
//           <p style={{ fontStyle: 'italic', fontSize: '1rem' }}>Coming Soon</p>
//         </Card>

//         {/* Streams Carousel */}
//       <Card style={{ marginBottom: '15px' }}>
//         <h2 style={{ fontSize: '1.2rem' }}>Parallel Streams</h2>
//         <Carousel
//           autoplay
//           dots={{ className: 'carousel-dots' }}
//           slidesToShow={4} // Default for desktop
//           slidesToScroll={1} // Scroll one at a time
//           autoplaySpeed={3000}
//           responsive={[
//             {
//               breakpoint: 767, // Mobile
//               settings: {
//                 slidesToShow: 2, // 2 cards on mobile
//                 slidesToScroll: 1,
//               },
//             },
//             {
//               breakpoint: 768, // Tablet and above
//               settings: {
//                 slidesToShow: 4, // 4 cards on desktop
//                 slidesToScroll: 1,
//               },
//             },
//           ]}
//           style={{ padding: '15px' }}
//         >
//           {streams.map((stream, index) => (
//             <div key={index} style={{ padding: '0 8px' }}>
//               <Card
//                 hoverable
//                 style={{
//                   textAlign: 'center',
//                   background: '#f0f2f5',
//                   height: '120px',
//                   display: 'flex',
//                   flexDirection: 'column',
//                   justifyContent: 'center',
//                   alignItems: 'center',
//                 }}
//               >
//                 <div style={{ fontSize: '1.5em', marginBottom: '8px' }}>
//                   {stream.icon}
//                 </div>
//                 <p style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
//                   {stream.name}
//                 </p>
//               </Card>
//             </div>
//           ))}
//         </Carousel>
//       </Card>

//         {/* Platinum Sponsors */}
//         <h3 style={{ textAlign: 'center', marginBottom: '10px', fontSize: '1.2rem' }}>
//           Platinum Sponsors
//         </h3>
//         <Carousel {...sponsorCarouselSettings} style={{ marginBottom: '15px' }}>
//           {platinumSponsors.map((src, index) => (
//             <div key={index} style={{ textAlign: 'center' }}>
//               <img
//                 src={`${window.location.origin}${src}`} // Full URL for domain
//                 alt={`Platinum Sponsor ${index + 1}`}
//                 style={{
//                   maxWidth: '100px',
//                   height: 'auto',
//                   objectFit: 'contain',
//                   display: 'block',
//                   margin: '0 auto',
//                 }}
//                 onError={(e) => {
//                   console.log(`Failed to load Platinum Sponsor image: ${src}`);
//                   e.target.style.display = 'none';
//                 }}
//               />
//             </div>
//           ))}
//         </Carousel>

//         {/* Gold Sponsors */}
//         <h3 style={{ textAlign: 'center', marginBottom: '10px', fontSize: '1.2rem' }}>
//           Gold Sponsors
//         </h3>
//         <Carousel {...sponsorCarouselSettings}>
//           {goldSponsors.map((src, index) => (
//             <div key={index} style={{ textAlign: 'center' }}>
//               <img
//                 src={`${window.location.origin}${src}`} // Full URL for domain
//                 alt={`Gold Sponsor ${index + 1}`}
//                 style={{
//                   maxWidth: '100px',
//                   height: 'auto',
//                   objectFit: 'contain',
//                   display: 'block',
//                   margin: '0 auto',
//                 }}
//                 onError={(e) => {
//                   console.log(`Failed to load Gold Sponsor image: ${src}`);
//                   e.target.style.display = 'none';
//                 }}
//               />
//             </div>
//           ))}
//         </Carousel>

//         {/* Footer Link */}
//         <p
//           style={{
//             textAlign: 'center',
//             fontSize: '0.85rem',
//             color: '#888',
//             marginTop: '15px',
//           }}
//         >
//           Visit{' '}
//           <a href="https://www.ibcn2025.com" target="_blank" rel="noopener noreferrer">
//             www.ibcn2025.com
//           </a>{' '}
//           for more details.
//         </p>
//       </div>

//       {/* Inline CSS for Media Queries */}
//       <style jsx>{`
//         /* Mobile devices (up to 767px) */
//         @media (max-width: 767px) {
//           img[style*="max-width: 100px"] {
//             max-width: 80px !important;
//             display: block !important;
//             margin: 0 auto;
//           }
//         }
//         /* Tablet (iPad) and larger */
//         @media (min-width: 768px) {
//           .ant-carousel .slick-slide {
//             height: auto !important;
//           }
//           div[style*="height: 50vh"] {
//             height: 60vh;
//             background-position: center 50px !important; // Adjusted for desktop
//           }
//           h1 {
//             font-size: 2rem !important;
//           }
//           div[style*="top: -100px"] {
//             top: -150px;
//           }
//           div[style*="padding: 15px"] {
//             padding: 20px;
//           }
//           h2 {
//             fontSize: 1.5rem !important;
//           }
//           p {
//             font-size: 1.1rem !important;
//           }
//           div[style*="height: 120px"] {
//             height: 150px !important;
//           }
//           div[style*="font-size: 1.5em"] {
//             font-size: 2em !important;
//           }
//           p[style*="font-size: 0.9rem"] {
//             font-size: 1rem !important;
//           }
//           img[style*="max-width: 100px"] {
//             max-width: 150px !important;
//           }
//         }

//         /* Desktop */
//         @media (min-width: 992px) {
//           div[style*="height: 50vh"] {
//             height: 70vh;
//             max-height: 500px;
//           }
//           h1 {
//             font-size: 2.5rem !important;
//           }
//           div[style*="top: -100px"] {
//             top: -180px;
//           }
//           h2 {
//             font-size: 1.7rem !important;
//           }
//           p {
//             font-size: 1.2rem !important;
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default Schedule;



import { Card, Col, Row, Carousel } from 'antd';
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

  // Sponsor images with specific file paths
  const platinumSponsors = [
    '/img/sponsors/platinum/1.png',
    '/img/sponsors/platinum/2.png',
    '/img/sponsors/platinum/3.png',
  ];
  const goldSponsors = [
    '/img/sponsors/gold/2.png',
    '/img/sponsors/gold/3.png',
    '/img/sponsors/gold/4.png',
    '/img/sponsors/gold/5.png',
    '/img/sponsors/gold/6.png',
    '/img/sponsors/gold/7.png',
    '/img/sponsors/gold/8.png',
  ];

  // Carousel settings for sponsors (only used for Gold Sponsors now)
  const sponsorCarouselSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        backgroundColor: '#f5f8fa',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {/* Background Cover - Mobile First */}
      <div
        style={{
          height: '40vh',
          minHeight: '300px',
          backgroundImage: `url('/img/ibcn/ibcn-banner.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center -55px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        {/* Gradient Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, transparent 50%, #f5f8fa 100%)',
          }}
        />

        {/* Event Header */}
        <h1
          style={{
            textAlign: 'center',
            fontSize: '1.5rem',
            color: '#fff',
            zIndex: 1,
            padding: '0 15px',
            lineHeight: '1.2',
          }}
        >
          IBCN 2025 Bengaluru
        </h1>
      </div>

      {/* Content Section */}
      <div
        style={{
          position: 'relative',
          top: '-100px',
          padding: '15px',
          maxWidth: '1200px',
          margin: '0 auto',
          zIndex: 2,
        }}
      >
        {/* Event Dates and Venue */}
        <Card style={{ marginBottom: '15px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.2rem' }}>Event Dates & Venue</h2>
          <p style={{ fontSize: '1rem' }}>
            {/* <strong>Dates:</strong>  */}
            11, 12, 13 July 2025
          </p>
          <p style={{ fontSize: '1rem' }}>
            {/* <strong>Venue:</strong>  */}
            Hilton Bengaluru, Embassy Manyata Business Park
          </p>
        </Card>

        {/* Overall Schedule */}
        <Card style={{ marginBottom: '15px' }}>
          <h2 style={{ fontSize: '1.2rem' }}>Schedule</h2>
          <p style={{ fontStyle: 'italic', fontSize: '1rem' }}>Coming Soon</p>
        </Card>

        {/* Key Speakers */}

        
        <Card style={{ marginBottom: '15px' }}>
          <h2 style={{ fontSize: '1.2rem' }}>Key Speakers</h2>
          <p style={{ fontStyle: 'italic', fontSize: '1rem' }}>Coming Soon</p>
        </Card>
        
{/* Parallel Streams */}
        <Card style={{ marginBottom: '15px' }}>
  <h2 style={{ fontSize: '1.2rem' }}>Parallel Streams</h2>
  <Carousel
    autoplay
    dots={{ className: 'carousel-dots' }}
    slidesToShow={4}
    slidesToScroll={1}
    autoplaySpeed={3000}
    responsive={[
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
        },
      },
    ]}
    style={{ padding: '0px' }}
  >
    {streams.map((stream, index) => (
      <div key={index} style={{ padding: '0 16px' }}> {/* Keeping padding */}
        <Card
          hoverable
          style={{
            textAlign: 'center',
            background: '#f0f2f5',
            height: '120px', // Keeping reduced height
            width: '95%', // Explicit width to prevent elongation (adjust as needed)
            margin: '0 auto', // Centers the card within the slide
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: '1.2em', marginBottom: '6px' }}>
            {stream.icon}
          </div>
          <p style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>
            {stream.name}
          </p>
        </Card>
      </div>
    ))}
  </Carousel>
</Card>

        {/* Platinum Sponsors */}
        <h3 style={{ textAlign: 'center', marginBottom: '10px', fontSize: '1.2rem' }}>
          Platinum Sponsors
        </h3>
        <Row gutter={[16, 16]} justify="center" style={{ marginBottom: '15px' }}>
          {platinumSponsors.map((src, index) => (
            <Col xs={8} sm={8} md={4} key={index}>
              <img
                src={`${window.location.origin}${src}`}
                alt={`Platinum Sponsor ${index + 1}`}
                style={{
                  maxWidth: '100px',
                  height: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                  margin: '0 auto',
                }}
                onError={(e) => {
                  console.log(`Failed to load Platinum Sponsor image: ${src}`);
                  e.target.style.display = 'none';
                }}
              />
            </Col>
          ))}
        </Row>

        {/* Gold Sponsors */}
        <h3 style={{ textAlign: 'center', marginBottom: '10px', fontSize: '1.2rem' }}>
          Gold Sponsors
        </h3>
        <Carousel {...sponsorCarouselSettings}>
          {goldSponsors.map((src, index) => (
            <div key={index} style={{ textAlign: 'center' }}>
              <img
                src={`${window.location.origin}${src}`}
                alt={`Gold Sponsor ${index + 1}`}
                style={{
                  maxWidth: '100px',
                  height: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                  margin: '0 auto',
                }}
                onError={(e) => {
                  console.log(`Failed to load Gold Sponsor image: ${src}`);
                  e.target.style.display = 'none';
                }}
              />
            </div>
          ))}
        </Carousel>

        {/* Footer Link */}
        <p
          style={{
            textAlign: 'center',
            fontSize: '0.85rem',
            color: '#888',
            marginTop: '15px',
          }}
        >
          Visit{' '}
          <a href="https://www.ibcn2025.com" target="_blank" rel="noopener noreferrer">
            www.ibcn2025.com
          </a>{' '}
          for more details.
        </p>
      </div>

      {/* Inline CSS for Media Queries */}
      <style jsx>{`
        /* Mobile devices (up to 767px) */
        @media (max-width: 767px) {
          img[style*="max-width: 100px"] {
            max-width: 80px !important;
            display: block !important;
            margin: 0 auto;
          }
        }
        /* Tablet (iPad) and larger */
        @media (min-width: 768px) {
          .ant-carousel .slick-slide {
            height: auto !important;
          }
          div[style*="height: 50vh"] {
            height: 60vh;
            background-position: center 50px !important;
          }
          h1 {
            font-size: 2rem !important;
          }
          div[style*="top: -100px"] {
            top: -150px;
          }
          div[style*="padding: 15px"] {
            padding: 20px;
          }
          h2 {
            fontSize: 1.5rem !important;
          }
          p {
            font-size: 1.1rem !important;
          }
          div[style*="height: 120px"] {
            height: 150px !important;
          }
          div[style*="font-size: 1.5em"] {
            font-size: 2em !important;
          }
          p[style*="font-size: 0.9rem"] {
            font-size: 1rem !important;
          }
          img[style*="max-width: 100px"] {
            max-width: 150px !important;
          }
        }

        /* Desktop */
        @media (min-width: 992px) {
          div[style*="height: 50vh"] {
            height: 70vh;
            max-height: 500px;
          }
          h1 {
            font-size: 2.5rem !important;
          }
          div[style*="top: -100px"] {
            top: -180px;
          }
          h2 {
            fontSize: 1.7rem !important;
          }
          p {
            font-size: 1.2rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Schedule;