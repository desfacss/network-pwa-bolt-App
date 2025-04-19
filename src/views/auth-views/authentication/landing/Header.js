import React from 'react';

const CustomHeader = ({ title, headerHeight = 80 }) => {  // Added default headerHeight
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px',
            color: '#003764',
            height: `${headerHeight}px`
        }}>
            <img src="/img/ibcn/ibcn.png" alt="IBCN Logo" style={{ height: '70px' }} loading="lazy" />
            <h1 style={{ margin: 0 }}>{title}</h1> {/* Use the title prop here */}
            <img src="/img/ibcn/knba.png" alt="KNBA Logo" style={{ height: '70px' }} loading="lazy" />
        </div>
    );
};

export default CustomHeader;
