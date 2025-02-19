import React from "react";
import RcBannerAnim, { Element } from 'rc-banner-anim';
import TweenOne from 'rc-tween-one';
import 'rc-banner-anim/assets/index.css';

const { BgElement } = Element;

const Survey = () => {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Slider Section */}
      <RcBannerAnim prefixCls="banner-mobile" autoPlay>
        {/* Slide 1: Networking */}
        <Element prefixCls="banner-mobile-elem" key="0">
          <BgElement
            key="bg"
            className="bg"
            style={{
              background: '#364D79',
            }}
          />
          <TweenOne
            className="banner-mobile-title"
            animation={{ y: 30, opacity: 0, type: 'from' }}
          >
            Connect with the Nagarathar Business Community
          </TweenOne>
          <TweenOne
            className="banner-mobile-text"
            animation={{ y: 30, opacity: 0, type: 'from', delay: 100 }}
          >
            Foster collaboration through networking opportunities.
          </TweenOne>
        </Element>

        {/* Slide 2: Survey */}
        <Element prefixCls="banner-mobile-elem" key="1">
          <BgElement
            key="bg"
            className="bg"
            style={{
              background: '#64CBCC',
            }}
          />
          <TweenOne
            className="banner-mobile-title"
            animation={{ y: 30, opacity: 0, type: 'from' }}
          >
            Share Your Insights
          </TweenOne>
          <TweenOne
            className="banner-mobile-text"
            animation={{ y: 30, opacity: 0, type: 'from', delay: 100 }}
          >
            Participate in our survey to help shape community initiatives.
          </TweenOne>
        </Element>

        {/* Slide 3: Privacy */}
        <Element prefixCls="banner-mobile-elem" key="2">
          <BgElement
            key="bg"
            className="bg"
            style={{
              background: '#4CAF50',
            }}
          />
          <TweenOne
            className="banner-mobile-title"
            animation={{ y: 30, opacity: 0, type: 'from' }}
          >
            Your Privacy Matters
          </TweenOne>
          <TweenOne
            className="banner-mobile-text"
            animation={{ y: 30, opacity: 0, type: 'from', delay: 100 }}
          >
            All survey responses are kept confidential and used only for statistical purposes.
          </TweenOne>
        </Element>
      </RcBannerAnim>

      {/* Static Buttons Section */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          padding: '10px',
          backgroundColor: '#fff',
          borderTop: '1px solid #ddd',
        }}
      >
        <button
          style={{
            padding: '10px 20px',
            backgroundColor: '#364D79',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
          onClick={() => console.log('Register clicked')} // Placeholder for real action
        >
          Register
        </button>
        <button
          style={{
            padding: '10px 20px',
            backgroundColor: '#64CBCC',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
          onClick={() => console.log('Login clicked')} // Placeholder for real action
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default Survey;