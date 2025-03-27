import React, { useState, useEffect } from 'react';
import { Swiper, Button } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import { APP_PREFIX_PATH } from 'configs/AppConfig';
import './landing.css'; // Import the CSS file

const IntroScreen = () => {
  const slides = [
    {
      title: "Welcome IBCN NetworkX",
      // content: "Keep track of the event schedule, speakers and prorgam...",
      content: "Stay updated with the event schedule, speakers, & plan for your breakout sessions...",
//         "Access details on keynote sessions and breakout discussions.",
      image: "/img/ibcn/landing/Chetti1.png",
      leaves: [
        {
          color: 'red', // Light red
          position: { top: '10%', left: '20%' }, // Clipped on the left
          size: { width: '450px', height: '300px' }, // Adjusted for leaf shape
        },
        {
          color: 'blue', // Light blue
          position: { top: '60%', left: '-10%' }, // Positioned more centrally
          size: { width: '550px', height: '280px' },
        },
      ],
    },
    {
      title: "Meet & Connect",
      content: "Engage with industry leaders and fellow attendees & Discover new collaborations and business opportunities.",
      image: "/img/ibcn/landing/Chetti2.png",
      leaves: [
        {
          color: 'yellow', // Light yellow
          position: { top: '28%', left: '20%' }, // Clipped on the right, continues from Slide 1
          size: { width: '400px', height: '300px' },
        },
        {
          color: 'green', // Light green
          position: { top: '60%', left: '-20%' }, // Clipped on the left
          size: { width: '450px', height: '280px' },
        },
        {
          color: 'red', // Light red
          position: { top: '10%', left: '30%' }, // Positioned more centrally
          size: { width: '500px', height: '250px' },
        },
      ],
    },
    {
      title: "Join the Survey & List in Directory...",
      content: "Get insights into entrepreneurship landscape within the Nagarathar community & collaborate with each other...",

      // title: "Participate in Business Survey",
//       content: [
//         "Get insights into entrepreneurship within the Nagarathar community.",
//         "Understand the aspirations of the next generation.",
//         "Support collaboration and business growth through networking."

      image: "/img/ibcn/landing/Chetti3.png",
      leaves: [
        {
          color: 'blue', // Light blue
          position: { top: '40%', left: '10%' }, // Clipped on the right, continues from Slide 2
          size: { width: '450px', height: '280px' },
        },
        {
          color: 'yellow', // Light yellow
          position: { top: '0%', left: '40%' }, // Positioned more centrally
          size: { width: '400px', height: '250px' },
        },
        {
          color: 'red', // Light red
          position: { top: '60%', left: '-10%' }, // Positioned more centrally
          size: { width: '500px', height: '300px' },
        },
      ],
    },
  ];

  const navigate = useNavigate();
  const [autoPlay, setAutoPlay] = useState(false);

  useEffect(() => {
    setAutoPlay(true);
    return () => setAutoPlay(false);
  }, []);

  const headerHeight = 90;
  const footerHeight = 80;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px',
          color: '#003764',
          height: `${headerHeight}px`,
          background: '#fff',
        }}
      >
        <img src="/img/ibcn/ibcn.jpeg" alt="IBCN Logo" style={{ height: '70px' }} />
        <h2 style={{ margin: 0 }}>IBCN NetworkX</h2>
        <img src="/img/ibcn/knba.png" alt="KNBA Logo" style={{ height: '70px' }} />
      </div>

      <main
        style={{
          flex: '1 0 auto',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative', // To position the leaves relative to the main section
        }}
        className="animated-background" // Apply the animated background class
      >
        <Swiper
          autoplay={autoPlay}
          loop
          effect="fade"
          autoplayInterval={4000}
          style={{
            flex: '1 0 auto',
            height: `calc(100vh - ${headerHeight + footerHeight}px)`,
          }}
        >
          {slides.map((slide, index) => (
            <Swiper.Item key={index}>
              <div
                style={{
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden', // Clip the leaves within the container
                }}
              >
                {/* Leaf shapes for the slide */}
                {slide.leaves.map((leaf, leafIndex) => (
                  <div
                    key={leafIndex}
                    className={`leaf leaf-${leaf.color}`}
                    style={{
                      width: leaf.size.width,
                      height: leaf.size.height,
                      top: leaf.position.top,
                      left: leaf.position.left,
                      zIndex: 1, // Behind the avatar, above the background
                    }}
                  />
                ))}

                <img
                  src={slide.image}
                  alt={`Slide ${index + 1}`}
                  style={{
                    width: '150%',
                    height: '150%',
                    objectFit: 'contain',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)', // Center the avatar
                    zIndex: 2,
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '25%', // Reduced height
                    backgroundColor: 'rgba(255, 255, 255, 0.5)', // More transparent
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '15px',
                    textAlign: 'center',
                    zIndex: 2, // Ensure the text overlay is above the leaves
                    margin: '30px',
                  }}
                >
                  <h2
                    style={{
                      margin: 0,
                      fontSize: '1.2rem',
                      color: '#003764',
                    }}
                  >
                    {slide.title}
                  </h2>
                  <p
                    style={{
                      margin: '5px 0 0 0',
                      fontSize: '1rem',
                      color: '#333',
                    }}
                  >
                    {slide.content}
                  </p>
                </div>
              </div>
            </Swiper.Item>
          ))}
        </Swiper>

        <footer
          style={{
            padding: '15px',
            flexShrink: 0,
            background: '#fff',
            borderTop: '1px solid #eee',
            height: `${footerHeight}px`,
            zIndex: 2, // Ensure the footer is above the leaves
          }}
        >
          <Button
            color="primary"
            style={{ marginBottom: '10px', fontSize: '1rem', width: '48%' }}
            
          >
            Register
          </Button>
          <Button
            color="primary"
            style={{ marginBottom: '10px', marginLeft: 5, fontSize: '1rem', width: '48%' }}
            onClick={() => navigate(`${APP_PREFIX_PATH}/login`)}
          >
            Login
          </Button>

        </footer>
      </main>
    </div>
  );
};

export default IntroScreen;