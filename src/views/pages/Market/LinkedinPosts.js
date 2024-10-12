import React, { useEffect } from 'react';

const LinkedinHashtagFeed = () => {
    useEffect(() => {
        // Create a script element
        const script = document.createElement('script');
        script.src = 'https://widgets.sociablekit.com/linkedin-hashtag-posts/widget.js';
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
        <div className="sk-ww-linkedin-hashtag-posts" data-embed-id="25430626"></div>
    );
};

export default LinkedinHashtagFeed;