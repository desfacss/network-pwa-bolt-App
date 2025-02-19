// // views/landing/index.js
// import SurveyPage from './SurveyPage';
// export default SurveyPage;


import React, { useState, useEffect } from 'react';
import { Swiper, Button } from 'antd-mobile';
import { Drawer } from 'antd';
import { useNavigate } from 'react-router-dom';
import { APP_PREFIX_PATH } from 'configs/AppConfig';
import DynamicForm from 'views/pages/DynamicForm';

const IntroScreen = () => {
  const slides = [
    {
      title: "Connect with Community",
      content: [
        "Foster collaboration through networking opportunities.",
        "Access a network of like-minded professionals.",
        "Discover new business ventures and partnerships."
      ]
    },
    {
      title: "Share Your Insights",
      content: [
        "Participate in our survey to help shape community initiatives.",
        "Influence the future direction of our community projects.",
        "Contribute to a collective knowledge base."
      ]
    },
    {
      title: "Privacy Matters",
      content: [
        "All responses are kept confidential and used only for statistical purposes.",
        "Your data is secure and anonymized.",
        "We respect your privacy in all interactions."
      ]
    }
  ];

  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [schema, setSchema] = useState(null);
  const [autoPlay, setAutoPlay] = useState(false);

  useEffect(() => {
    setAutoPlay(true);
    return () => setAutoPlay(false);
  }, []);

  const showDrawer = () => setVisible(true);
  const onClose = () => setVisible(false);
  const onFinish = (values) => {
    console.log('Form submitted:', values);
    onClose();
  };

  // Calculate dynamic height for Swiper based on viewport height minus header
  const headerHeight = 70; // Height of the header
  const getSwiperHeight = () => {
    const vh = window.innerHeight;
    return Math.max(400, vh - headerHeight); // Min height of 400px or dynamic based on screen size
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '20px',
        color: '#003764',
        height: `${headerHeight}px`
      }}>
        <img src="/img/ibcn/ibcn.jpeg" alt="IBCN Logo" style={{ height: '70px' }} />
        <h1 style={{ margin: 0 }}>IBCN NetworkX</h1>
        <img src="/img/ibcn/knba.png" alt="KNBA Logo" style={{ height: '70px' }} />
      </div>

      <div style={{ flexGrow: 1, overflow: 'hidden' }}>
        <Swiper
          autoplay={true}
          loop
          autoplayInterval={4000}
          style={{ height: `${getSwiperHeight()}px` }} // Dynamic height
        >
          {slides.map((slide, index) => (
            <Swiper.Item key={index}>
              <div style={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center',
                textAlign: 'center', 
                padding: '20px', 
                background: '#f0f0f0', 
                borderRadius: '10px' 
              }}>
                <h2 style={{ marginBottom: '20px' }}>{slide.title}</h2>
                <ul style={{ textAlign: 'left', paddingLeft: '20px' }}>
                  {slide.content.map((bullet, bulletIndex) => (
                    <li key={bulletIndex}>{bullet}</li>
                  ))}
                </ul>
              </div>
            </Swiper.Item>
          ))}
        </Swiper>
      </div>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button type="primary" block onClick={() => navigate(`${APP_PREFIX_PATH}/register`)}>Register</Button>
          <Button type="ghost" block onClick={() => navigate(`${APP_PREFIX_PATH}/login`)}>Login</Button>
        </div>
        <Button type='primary' block onClick={showDrawer}>Anonymous Survey</Button>
      </div>

      <Drawer
        title="Business Survey"
        placement="right"
        width={520}
        onClose={onClose}
        visible={visible}
      >
        {schema && <DynamicForm schemas={schema} onFinish={onFinish} />}
      </Drawer>
    </div>
  );
};

export default IntroScreen;


// import React, { useState } from 'react';
// import { Carousel, Button, Drawer } from 'antd';
// import { useNavigate } from 'react-router-dom';
// import { APP_PREFIX_PATH } from 'configs/AppConfig';
// import DynamicForm from 'views/pages/DynamicForm';

// const IntroScreen = () => {
//   const navigate = useNavigate();
//   const [visible, setVisible] = useState(false);
//   const [schema, setSchema] = useState(null); // Assuming schema is managed via state

//   const slides = [
//     {
//       title: "Connect with Community",
//       content: "Foster collaboration through networking opportunities."
//     },
//     {
//       title: "Share Your Insights",
//       content: "Participate in our survey to help shape community initiatives."
//     },
//     {
//       title: "Privacy Matters",
//       content: "All responses are kept confidential and used only for statistical purposes."
//     }
//   ];

//   const showDrawer = () => setVisible(true);
//   const onClose = () => setVisible(false);

//   // Placeholder for onFinish function
//   const onFinish = (values) => {
//     console.log('Form submitted:', values);
//     // Handle form submission
//   };

//   return (
//     <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
//       <div style={{ flexGrow: 1, overflow: 'hidden' }}>
//         <Carousel autoplay={false} effect="fade">
//           {slides.map((slide, index) => (
//             <div key={index} style={{ 
//               height: '100%', 
//               display: 'flex', 
//               justifyContent: 'center', 
//               alignItems: 'center',
//               textAlign: 'center', 
//               padding: '20px', 
//               background: '#f0f0f0', 
//               borderRadius: '10px' 
//             }}>
//               <div>
//                 <h2>{slide.title}</h2>
//                 <p>{slide.content}</p>
//               </div>
//             </div>
//           ))}
//         </Carousel>
//       </div>
//       <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
//         <Button onClick={() => navigate(`${APP_PREFIX_PATH}/register`)}>Register for Networking</Button>
//         <Button onClick={() => navigate(`${APP_PREFIX_PATH}/login`)}>Login Here</Button>
//         <Button type='primary' onClick={showDrawer}>Anonymous Survey</Button>
//       </div>
//       <Drawer
//         title="Business Survey"
//         placement="right"
//         width={520}
//         onClose={onClose}
//         visible={visible}
//       >
//         {schema && <DynamicForm schemas={schema} onFinish={onFinish} />}
//       </Drawer>
//     </div>
//   );
// };

// export default IntroScreen;