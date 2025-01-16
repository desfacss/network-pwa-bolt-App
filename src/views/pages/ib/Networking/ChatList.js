import React from 'react'
import DynamicViews from '../../DynamicViews';

const ChatList = () => {
    return (
        <div><DynamicViews entityType={'ib_posts'} /></div>
    )
}

export default ChatList