import React from 'react'
import DynamicViews from '../../DynamicViews/index2';

const ChatList = ({ addEditFunction }) => {
    return (
        <div><DynamicViews entityType={'ib_posts'} addEditFunction={addEditFunction} /></div>
    )
}

export default ChatList