import React, { useEffect } from 'react';

const InstagramHashtagFeed = () => {
    useEffect(() => {
        // Create a script element
        const script = document.createElement('script');
        script.src = 'https://widgets.sociablekit.com/instagram-hashtag-feed/widget.js';
        script.async = true;
        script.defer = true;

        // Append the script to the body
        document.body.appendChild(script);

        // Cleanup to remove the script when the component is unmounted
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return (
        <div className="sk-ww-instagram-hashtag-feed" data-embed-id="25430158"></div>
    );
};

export default InstagramHashtagFeed;