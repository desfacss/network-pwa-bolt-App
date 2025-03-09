// // views/landing/index.js
// import SurveyPage from './SurveyPage';
// export default SurveyPage;


// import React, { useState, useEffect } from 'react';
// import { Swiper, Button } from 'antd-mobile';
// import { Drawer } from 'antd';
// import { useNavigate } from 'react-router-dom';
// import { APP_PREFIX_PATH } from 'configs/AppConfig';
// import DynamicForm from 'views/pages/DynamicForm';

// const IntroScreen = () => {
//   const slides = [
//     {
//       title: "Connect with Community",
//       content: [
//         "Foster collaboration through networking opportunities.",
//         "Access a network of like-minded professionals.",
//         "Discover new business ventures and partnerships."
//       ]
//     },
//     {
//       title: "Share Your Insights",
//       content: [
//         "Participate in our survey to help shape community initiatives.",
//         "Influence the future direction of our community projects.",
//         "Contribute to a collective knowledge base."
//       ]
//     },
//     {
//       title: "Privacy Matters",
//       content: [
//         "All responses are kept confidential and used only for statistical purposes.",
//         "Your data is secure and anonymized.",
//         "We respect your privacy in all interactions."
//       ]
//     }
//   ];

//   const navigate = useNavigate();
//   const [visible, setVisible] = useState(false);
//   const [schema, setSchema] = useState(null);
//   const [autoPlay, setAutoPlay] = useState(false);

//   const generateAbstractShape = (text) => {
//     const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
//     const size = 100 + (hash % 50); // Size based on text content
//     const rotate = (hash % 360) + 'deg'; // Rotation based on text content
//     const bgColor = `hsl(${(hash % 360)}, 70%, 80%)`; // Color based on text content

//     return {
//       width: `${size}px`,
//       height: `${size}px`,
//       backgroundColor: bgColor,
//       position: 'absolute',
//       top: '20px',
//       right: '20px',
//       borderRadius: '50% 0',
//       transform: `rotate(${rotate})`,
//       opacity: 0.6
//     };
//   };

//   useEffect(() => {
//     setAutoPlay(true);
//     return () => setAutoPlay(false);
//   }, []);

//   const showDrawer = () => setVisible(true);
//   const onClose = () => setVisible(false);
//   const onFinish = (values) => {
//     console.log('Form submitted:', values);
//     onClose();
//   };

//   // Calculate dynamic height for Swiper based on viewport height minus header
//   const headerHeight = 90; // Height of the header
//   const getSwiperHeight = () => {
//     const vh = window.innerHeight;
//     return Math.max(400, vh - headerHeight); // Min height of 400px or dynamic based on screen size
//   };

//   return (
//     <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
//       <div style={{ 
//         display: 'flex', 
//         justifyContent: 'space-between', 
//         alignItems: 'center', 
//         padding: '20px',
//         color: '#003764',
//         height: `${headerHeight}px`
//       }}>
//         <img src="/img/ibcn/ibcn.jpeg" alt="IBCN Logo" style={{ height: '70px' }} />
//         <h1 style={{ margin: 0 }}>IBCN NetworkX</h1>
//         <img src="/img/ibcn/knba.png" alt="KNBA Logo" style={{ height: '70px' }} />
//       </div>

//       <div style={{ flexGrow: 1, overflow: 'hidden' }}>
//         <Swiper
//           autoplay={autoPlay}
//           loop
//           autoplayInterval={4000}
//           style={{ height: `${getSwiperHeight()}px` }} // Dynamic height
//         >
//           {slides.map((slide, index) => {
//             const shapeStyle = generateAbstractShape(slide.title + slide.content.join(''));
//             return (
//               <Swiper.Item key={index}>
//                 <div style={{ 
//                   height: '100%', 
//                   display: 'flex', 
//                   flexDirection: 'column', 
//                   justifyContent: 'flex-start', 
//                   alignItems: 'flex-start',
//                   padding: '20px 20px 40px', 
//                   background: '#f8f9fa', 
//                   borderRadius: '10px',
//                   position: 'relative',
//                   overflowY: 'auto'
//                 }}>
//                   <div style={shapeStyle}></div>
//                   <h2 style={{ 
//                     marginBottom: '20px', 
//                     textAlign: 'left', 
//                     width: '100%'
//                   }}>{slide.title}</h2>
//                   <ul style={{ 
//                     textAlign: 'left', 
//                     paddingLeft: '20px',
//                     listStyleType: 'none',
//                     padding: 0,
//                     maxWidth: '100%',
//                     width: '100%'
//                   }}>
//                     {slide.content.map((bullet, bulletIndex) => (
//                       <li key={bulletIndex} style={{ 
//                         marginBottom: '15px', 
//                         paddingLeft: '10px'
//                       }}>
//                         <span style={{ marginLeft: '-10px', fontWeight: 'bold' }}>•</span> {bullet}
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               </Swiper.Item>
//             );
//           })}
//         </Swiper>
//       </div>

//       <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
//         <div style={{ display: 'flex', gap: '10px' }}>
//           <Button type="primary" block onClick={() => navigate(`${APP_PREFIX_PATH}/register`)}>Register</Button>
//           <Button type="ghost" block onClick={() => navigate(`${APP_PREFIX_PATH}/login`)}>Login</Button>
//         </div>
//         <Button type='primary' block onClick={showDrawer}>Anonymous Survey</Button>
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

import React, { useState, useEffect } from 'react';
import { Swiper, Button } from 'antd-mobile';
import { Drawer } from 'antd';
import { useNavigate } from 'react-router-dom';
import { APP_PREFIX_PATH } from 'configs/AppConfig';
import DynamicForm from 'views/pages/DynamicForm';

const IntroScreen = () => {
  const slides = [
    {
      title: "Explore IBCN 2025 Bengaluru",
      content: [
        "Stay updated with the event schedule, speakers, and session tracks.",
        "Access details on keynote sessions and breakout discussions.",
        "Plan your agenda and make the most of your experience."
      ]
    },
    {
      title: "Connect & Network",
      content: [
        "Engage with industry leaders and fellow attendees.",
        "Discover new collaborations and business opportunities.",
        "Join exclusive networking sessions and community meetups."
      ]
    },
    {
      title: "Participate in Business Survey",
      content: [
        "Get insights into entrepreneurship within the Nagarathar community.",
        "Understand the aspirations of the next generation.",
        "Support collaboration and business growth through networking."
      ]
    }
];

  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [schema, setSchema] = useState(null);
  const [autoPlay, setAutoPlay] = useState(false);

  const generateAbstractShapes = (text) => {
    const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const shapes = [];
    const getRandom = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    const shapeCount = getRandom(3, 4); // Randomly choose between 3 or 4 shapes

    for (let i = 0; i < shapeCount; i++) {
        const size = getRandom(70, 110); // Random size between 50px and 120px
        const rotate = `${getRandom(0, 360)}deg`; // Random rotation
        const lightness = getRandom(60, 85); // Random lightness for HSL color
        const bgColor = `hsl(${(hash + i * 40) % 360}, 70%, ${lightness}%)`; // Vary color slightly
        const bottom = getRandom(100, 400); // Random vertical position
        const right = getRandom(20, 300); // Random horizontal position

        shapes.push({
            width: `${size}px`,
            height: `${size}px`,
            backgroundColor: bgColor,
            position: 'absolute',
            bottom: `${bottom}px`, // Random Y position
            right: `${right}px`, // Random X position
            borderRadius: '50% 0',
            transform: `rotate(${rotate})`,
            opacity: getRandom(40, 70) / 100, // Random opacity between 0.4 and 0.7
            zIndex: getRandom(50, 100) // Random z-index to mix layering
        });
    }

    return shapes;
};

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
  const headerHeight = 90; // Height of the header
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
          autoplay={autoPlay}
          loop
          autoplayInterval={4000}
          style={{ height: `${getSwiperHeight()}px` }} // Dynamic height
        >
          {slides.map((slide, index) => {
            const shapeStyles = generateAbstractShapes(slide.title + slide.content.join(''));
            return (
              <Swiper.Item key={index}>
                <div style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                  padding: '20px 20px 40px',
                  background: '#f8f9fa',
                  borderRadius: '10px',
                  position: 'relative',
                  overflowY: 'auto'
                }}>
                  {shapeStyles.map((style, idx) => <div key={idx} style={style}></div>)}
                  <h2 style={{
                    marginBottom: '20px',
                    textAlign: 'left',
                    width: '100%'
                  }}>{slide.title}</h2>
                  <ul style={{
                    textAlign: 'left',
                    paddingLeft: '20px',
                    listStyleType: 'none',
                    padding: 0,
                    maxWidth: '100%',
                    width: '100%'
                  }}>
                    {slide.content.map((bullet, bulletIndex) => (
                      <li key={bulletIndex} style={{
                        marginBottom: '15px',
                        paddingLeft: '10px'
                      }}>
                        <span style={{ marginLeft: '-10px', fontWeight: 'bold' }}>•</span> {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              </Swiper.Item>
            );
          })}
        </Swiper>
      </div>

      <div style={{ padding: '20px', margin: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button mb-20 type="primary" block onClick={() => navigate(`${APP_PREFIX_PATH}/register`)}>Register</Button>
          <Button mb-20 type="ghost" block onClick={() => navigate(`${APP_PREFIX_PATH}/login`)}>Login</Button>
        </div>
        {/* <Button type='primary' block onClick={showDrawer}>Anonymous Survey</Button> */}
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

