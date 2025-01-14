import React, { useEffect, useState } from 'react';
import { List, Button, Input, Tag } from 'antd';
import { supabase } from 'configs/SupabaseConfig';
import Comment from 'components/common/Comment';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    // Fetch posts from Supabase
    const fetchPosts = async () => {
      let { data, error } = await supabase.from('posts').select('*');
      if (error) {
        console.error(error);
      } else {
        setPosts(data);
      }
    };

    fetchPosts();
  }, []);

  const fetchComments = async (postId) => {
    let { data, error } = await supabase.from('comments').select('*').eq('post_id', postId);
    if (error) {
      console.error(error);
    } else {
      setComments(prev => ({ ...prev, [postId]: data }));
    }
  };

  const handleAddComment = async (postId, parentCommentId = null) => {
    if (newComment.trim()) {
      const { error } = await supabase.from('comments').insert([{ post_id: postId, parent_comment_id: parentCommentId, content: newComment }]);
      if (!error) {
        setNewComment("");
        fetchComments(postId); // Refresh comments after adding
      }
    }
  };

  return (
    <List
      itemLayout="vertical"
      dataSource={posts}
      renderItem={post => (
        <List.Item>
          <h2>{post.title}</h2>
          <p>{post.description}</p>
          <Tag>{post.tag}</Tag>
          <div>
            <Button onClick={() => fetchComments(post.id)}>View Comments</Button>
          </div>

          {/* Comment Section */}
          {comments[post.id] && comments[post.id].map(comment => (
            <Comment
              key={comment.id}
              author="Username"  // Replace with actual user info
              content={comment.content}
              datetime="DateTime"  // Replace with actual timestamp
              avatarUrl="https://www.example.com/avatar.jpg"  // Replace with actual avatar URL
              actions={[
                <Input
                  placeholder="Reply..."
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  onPressEnter={() => handleAddComment(post.id, comment.id)}
                />
              ]}
            />
          ))}

          {/* New Comment Input */}
          <Input
            placeholder="Add a comment"
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            onPressEnter={() => handleAddComment(post.id)}
          />
        </List.Item>
      )}
    />
  );
};

export default PostList;
