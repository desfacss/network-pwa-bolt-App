import React, { useState, useEffect } from 'react';
import { Swiper, Button } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import { APP_PREFIX_PATH } from 'configs/AppConfig';
import './landing.css'; // Import the CSS file

const IntroScreen = () => {
  const slides = [
    // Same slides data as in your original code
    {
      title: "Welcome IBCN NetworkX",
      content: "Stay updated with the event schedule, speakers, & plan for your breakout sessions...",
      image: "/img/ibcn/landing/Chetti1.webp",
      leaves: [
        { color: 'red', position: { top: '10%', left: '20%' }, size: { width: '350px', height: '200px' } },
        { color: 'blue', position: { top: '60%', left: '-10%' }, size: { width: '400px', height: '280px' } },
      ],
    },
    {
      title: "Meet & Connect",
      content: "Engage with industry leaders and fellow attendees & Discover new collaborations and business opportunities.",
      image: "/img/ibcn/landing/Chetti2.webp",
      leaves: [
        {
          color: 'yellow', // Light yellow
          position: { top: '3%', left: '40%' }, // Clipped on the right, continues from Slide 1
          size: { width: '300px', height: '200px' },
        },
        {
          color: 'green', // Light green
          position: { top: '60%', left: '-20%' }, // Clipped on the left
          size: { width: '450px', height: '280px' },
        },
        {
          color: 'red', // Light red
          position: { top: '25%', left: '10%' }, // Positioned more centrally
          size: { width: '300px', height: '200px' },
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

      image: "/img/ibcn/landing/Chetti3.webp",
      leaves: [
        {
          color: 'blue', // Light blue
          position: { top: '30%', left: '10%' }, // Clipped on the right, continues from Slide 2
          size: { width: '300px', height: '200px' },
        },
        {
          color: 'yellow', // Light yellow
          position: { top: '0%', left: '40%' }, // Positioned more centrally
          size: { width: '350px', height: '250px' },
        },
        {
          color: 'red', // Light red
          position: { top: '60%', left: '-10%' }, // Positioned more centrally
          size: { width: '400px', height: '220px' },
        },
      ],
    },
  ];

  const navigate = useNavigate();
  const [autoPlay, setAutoPlay] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);

  const headerHeight = 90;
  const footerHeight = 80;
  const bannerHeight = 50; // Height of the PWA install banner

  // Detect if the app is running in standalone mode (installed PWA)
  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsStandalone(true);
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault(); // Prevent the default mini-infobar
      setInstallPrompt(e); // Store the event for later use
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      setAutoPlay(false);
    };
  }, []);

  useEffect(() => {
    setAutoPlay(true);
  }, []);

  // Handle the install button click
  const handleInstallClick = async () => {
    if (installPrompt) {
      installPrompt.prompt(); // Show the install prompt
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallPrompt(null); // Clear the prompt after acceptance
      }
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* PWA Install Banner */}
      {!isStandalone && installPrompt && (
        <div
          style={{
            height: `${bannerHeight}px`,
            backgroundColor: '#1677ff',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem',
            cursor: 'pointer',
            zIndex: 3,
          }}
          onClick={handleInstallClick}
        >
          Install IBCN NetworkX as an app for a better experience!
        </div>
      )}

      {/* Header */}
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
        <img src="/img/ibcn/ibcn.png" alt="IBCN Logo" style={{ height: '70px' }} loading="lazy"/>
        <h2 style={{ margin: 0 }}>IBCN NetworkX</h2>
        <img src="/img/ibcn/knba.png" alt="KNBA Logo" style={{ height: '70px' }} loading="lazy"/>
      </div>

      {/* Main Content */}
      <main
        style={{
          flex: '1 0 auto',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
        className="animated-background"
      >
        <Swiper
          autoplay={autoPlay}
          loop
          effect="fade"
          autoplayInterval={4000}
          style={{
            flex: '1 0 auto',
            height: `calc(100vh - ${headerHeight + footerHeight + (isStandalone ? 0 : bannerHeight)}px)`,
          }}
        >
          {slides.map((slide, index) => (
            <Swiper.Item key={index}>
              <div
                style={{
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {slide.leaves.map((leaf, leafIndex) => (
                  <div
                    key={leafIndex}
                    className={`leaf leaf-${leaf.color}`}
                    style={{
                      width: leaf.size.width,
                      height: leaf.size.height,
                      top: leaf.position.top,
                      left: leaf.position.left,
                      zIndex: 1,
                    }}
                  />
                ))}
                <img loading="lazy"
                  src={slide.image}
                  alt={`Slide ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 2,
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '25%',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '15px',
                    textAlign: 'center',
                    zIndex: 2,
                    margin: '30px',
                  }}
                >
                  <h2 style={{ margin: 0, fontSize: '1rem', color: '#003764' }}>{slide.title}</h2>
                  <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: '#333' }}>{slide.content}</p>
                </div>
              </div>
            </Swiper.Item>
          ))}
        </Swiper>

        {/* Footer */}
        <footer
          style={{
            padding: '15px',
            flexShrink: 0,
            background: '#fff',
            borderTop: '1px solid #eee',
            height: `${footerHeight}px`,
            zIndex: 2,
          }}
        >
          <Button
            color="primary"
            style={{ marginBottom: '10px', fontSize: '1rem', width: '48%' }}
            onClick={() => navigate(`${APP_PREFIX_PATH}/register`)}
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