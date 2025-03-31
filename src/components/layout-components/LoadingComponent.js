// src/components/LoadingSpinner.jsx
import React from 'react';
import { Spin } from 'antd';
import styled from 'styled-components';

// Centralized styling for the loading container
const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: ${props => props.fullScreen ? '100vh' : '200px'};
  background: ${props => props.background || 'transparent'};
`;

// Customizable loading component
const LoadingComponent = ({
    spinning = true,           // Control loading state
    tip = 'Loading...',        // Custom loading message
    size = 'large',           // 'small' | 'default' | 'large'
    fullScreen = false,       // Whether to take full screen
    background = 'transparent', // Background color
    customStyle = {},         // Additional styles
}) => {
    return (
        <LoadingContainer fullScreen={fullScreen} background={background} style={customStyle}>
            <Spin
                size={size}
                spinning={spinning}
                tip={tip}
            />
        </LoadingContainer>
    );
};

export default LoadingComponent;