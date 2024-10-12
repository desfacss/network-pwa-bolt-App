import React, { useEffect } from 'react';

const FacebookHashtagFeed = () => {
    useEffect(() => {
        // Create a script element
        const script = document.createElement('script');
        script.src = 'https://widgets.sociablekit.com/facebook-hashtag-posts/widget.js';
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
        <div className="sk-ww-facebook-hashtag-feed" data-embed-id="25430151"></div>
    );
};

export default FacebookHashtagFeed;