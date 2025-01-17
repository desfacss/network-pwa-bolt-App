import { Card, Tag, Typography } from 'antd';
import { supabase } from 'api/supabaseClient';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const PostCard = ({ chatId }) => {
    // const { chatId } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [createdBy, setCreatedBy] = useState(null);
    const [tags, setTags] = useState([]);

    useEffect(() => {
        const fetchPost = async () => {
            if (!chatId) return;

            setLoading(true);
            const { data, error } = await supabase
                .from('ib_posts')
                .select('id, title, created_by, details')
                .eq('id', chatId)
                .single();

            if (error) {
                console.error('Error fetching post:', error);
                setLoading(false);
                return;
            }

            setPost(data);

            // Fetch created_by user
            if (data?.created_by) {
                const { data: userData } = await supabase
                    .from('users')
                    .select('user_name') // Assuming `users` table has `name`
                    .eq('id', data?.created_by)
                    .single();

                setCreatedBy(userData?.user_name || 'Unknown');
            }

            // Fetch tags (user names)
            if (data?.details?.tags?.length) {
                const { data: tagUsers } = await supabase
                    .from('ib_categories')
                    .select('id, category_name')
                    .in('id', data?.details?.tags);

                setTags(tagUsers || []);
            }

            setLoading(false);
        };

        fetchPost();
    }, [chatId]);

    if (loading) return <Card loading />;

    return (
        <Card title={post?.title}>
            <Paragraph>
                <strong>Created by:</strong> {createdBy || 'N/A'}
            </Paragraph>
            <Paragraph>
                <strong>Description:</strong> {post?.details?.description || 'No description'}
            </Paragraph>
            <Paragraph>
                <strong>Tags:</strong>{' '}
                {tags?.length > 0 ? tags.map((tag) => (
                    <Tag key={tag?.id}>{tag?.category_name}</Tag>
                )) : 'No tags'}
            </Paragraph>
        </Card>
    );
};

export default PostCard;
