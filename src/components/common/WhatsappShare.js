import { WhatsAppOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React from 'react';

export default function ShareButton() {
    const shareToWhatsApp = () => {
        // Get current page URL
        const currentUrl = window.location.href;

        // WhatsApp sharing URL format
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
            'Check out this page: ' + currentUrl
        )}`;

        // Open WhatsApp with the share URL
        window.open(whatsappUrl, '_blank');
    };

    return (
        <Button
            onClick={shareToWhatsApp}
            style={{
                padding: '10px 20px',
                backgroundColor: '#25D366',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
            }}
        >
            <WhatsAppOutlined /> Share on WhatsApp
        </Button>
    );
}