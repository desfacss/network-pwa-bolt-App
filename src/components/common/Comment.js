import React from 'react';
import { Avatar, Typography, Space } from 'antd';

const { Text } = Typography;

const Comment = ({ content, author, avatarUrl, datetime, actions }) => (
    <Space align="start" style={{ width: '100%' }}>
        <Avatar src={avatarUrl} alt={author} />
        <Space direction="vertical">
            <Text strong>{author}</Text>
            <Text>{content}</Text>
            <Text type="secondary">{datetime}</Text>
            {actions && <Space>{actions}</Space>}
        </Space>
    </Space>
);

export default Comment;
