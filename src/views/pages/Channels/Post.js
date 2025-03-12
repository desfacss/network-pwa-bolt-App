import { Card, Tag, Typography } from 'antd';
import { supabase } from 'configs/SupabaseConfig';
import { useEffect, useState } from 'react';

const { Paragraph } = Typography;

const PostCard = ({ channel_post_id }) => {
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [createdBy, setCreatedBy] = useState(null);
    const [tags, setTags] = useState([]);
    const [isPrivate, setIsPrivate] = useState(false);

    useEffect(() => {
        const fetchPostAndChannel = async () => {
            if (!channel_post_id) return;

            setLoading(true);

            // Fetch the post
            const { data: postData, error: postError } = await supabase
                .from('channel_posts')
                .select('id, channel_id, message, details, user:users!channel_posts_user_id_fkey(user_name)')
                .eq('id', channel_post_id)
                .single();

            console.log("channel_post", postData);
            if (postError) {
                console.error('Error fetching post:', postError);
                setLoading(false);
                return;
            }

            // Fetch the channel using channel_id
            const { data: channelData, error: channelError } = await supabase
                .from('channels')
                .select('id, is_inbox')
                .eq('id', postData?.channel_id)
                .single();

            if (channelError) {
                console.error('Error fetching channel:', channelError);
                setLoading(false);
                return;
            }

            // Check if the channel is private (is_inbox === true)
            if (channelData?.is_inbox === true) {
                setIsPrivate(true);
                setLoading(false);
                return; // Stop further processing if private
            }

            // If not private, proceed with setting post data
            setPost(postData);

            // Fetch created_by user (if needed separately)
            if (postData?.created_by) {
                const { data: userData } = await supabase
                    .from('users')
                    .select('user_name')
                    .eq('id', postData?.created_by)
                    .single();

                setCreatedBy(userData?.user_name || 'Unknown');
            }

            // Fetch tags
            if (postData?.details?.tags?.length) {
                const { data: tagUsers } = await supabase
                    .from('ib_categories')
                    .select('id, category_name')
                    .in('id', postData?.details?.tags);

                setTags(tagUsers || []);
            }

            setLoading(false);
        };

        fetchPostAndChannel();
    }, [channel_post_id]);

    if (loading) return <Card loading />;

    // If the channel is private (is_inbox === true), don't show the post
    if (isPrivate) {
        return (
            <></>
        );
    }

    // Render the post if not private
    return (
        <Card title={post?.title}>
            <Paragraph>
                <strong>Created by:</strong> {post?.user?.user_name || 'N/A'}
            </Paragraph>
            <Paragraph>
                <strong>Description:</strong> {post?.message || 'No message'}
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