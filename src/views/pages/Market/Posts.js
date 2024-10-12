import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SocialMediaPosts = ({ hashtag }) => {
    const [facebookPosts, setFacebookPosts] = useState([]);
    const [instagramPosts, setInstagramPosts] = useState([]);
    const [twitterPosts, setTwitterPosts] = useState([]);

    useEffect(() => {
        // Function to fetch Facebook posts
        const fetchFacebookPosts = async () => {
            const accessToken = '15ec8284c84e00a749ac3f073249066c';
            const user_id = '1828645497624799';
            try {
                const response = await axios.get(
                    `https://graph.facebook.com/v10.0/ig_hashtag_search?user_id=${user_id}&q=${hashtag}&access_token=${accessToken}`
                );
                console.log("twitter", response)
                setFacebookPosts(response.data.data);
            } catch (error) {
                console.error('Error fetching Facebook posts', error);
            }
        };

        // Function to fetch Instagram posts
        // const fetchInstagramPosts = async () => {
        //     const accessToken = 'YOUR_INSTAGRAM_ACCESS_TOKEN';
        //     try {
        //         const response = await axios.get(
        //             `https://graph.instagram.com/v10.0/ig_hashtag_search?user_id=YOUR_USER_ID&q=${hashtag}&access_token=${accessToken}`
        //         );
        //         setInstagramPosts(response.data.data);
        //     } catch (error) {
        //         console.error('Error fetching Instagram posts', error);
        //     }
        // };

        // Function to fetch Twitter posts
        const fetchTwitterPosts = async () => {
            const bearerToken = 'AAAAAAAAAAAAAAAAAAAAAEe%2FtAEAAAAAu62nUh9vlhDazanA8EPTERy8hKI%3DfK3KYje5Ju64ib9jEwEqBkNrYZHQPRYUx5LHkv10hsduRCacHG';
            try {
                const response = await axios.get(
                    `https://api.twitter.com/2/tweets/search/recent?query=%23${hashtag}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${bearerToken}`,
                        },
                    }
                );
                console.log("twitter", response)
                setTwitterPosts(response.data.data);
            } catch (error) {
                console.error('Error fetching Twitter posts', error);
            }
        };

        fetchFacebookPosts();
        // fetchInstagramPosts();
        // fetchTwitterPosts();
    }, [hashtag]);

    return (
        <div>
            <h2>Posts for #{hashtag}</h2>
            <div class='sk-ww-facebook-hashtag-feed' data-embed-id='25430101'></div><script src='https://widgets.sociablekit.com/facebook-hashtag-posts/widget.js' async defer></script>
            {/* <h3>Facebook</h3>
            <ul>
                {facebookPosts.map(post => (
                    <li key={post.id}>{post.message}</li>
                ))}
            </ul>
            <h3>Instagram</h3>
            <ul>
                {instagramPosts.map(post => (
                    <li key={post.id}>{post.caption}</li>
                ))}
            </ul> */}
            <h3>Twitter</h3>
            <ul>
                {twitterPosts.map(tweet => (
                    <li key={tweet.id}>{tweet.text}</li>
                ))}
            </ul>
        </div>
    );
};

export default SocialMediaPosts;
