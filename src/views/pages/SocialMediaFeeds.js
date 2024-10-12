import { Card, Carousel } from 'antd'
import React from 'react'
import FacebookHashtagFeed from './Market/FacebookPosts'
import InstagramHashtagFeed from './Market/InstagramPosts'
import LinkedinHashtagFeed from './Market/LinkedinPosts'
import TwitterHashtagFeed from './Market/TwitterPosts'

const SocialMediaFeeds = () => {
    return (
        <Card>
            <Carousel autoplay autoplaySpeed={20000}>
                <div>
                    <FacebookHashtagFeed />
                </div>
                <div>
                    <InstagramHashtagFeed />
                </div>
                <div>
                    <LinkedinHashtagFeed />
                </div>
                <div>
                    <TwitterHashtagFeed />
                </div>
            </Carousel>
        </Card>
    )
}

export default SocialMediaFeeds
