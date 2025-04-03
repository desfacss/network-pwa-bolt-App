import React, { useEffect, useState } from "react";
import {
  Form,
  Button,
  List,
  message,
  Empty,
  Tag,
  Modal,
  Avatar,
  Badge,
} from "antd";
import { EditOutlined, DeleteOutlined, RocketOutlined, HeartOutlined } from "@ant-design/icons";
import "./styles.css";
import { supabase } from "configs/SupabaseConfig";
import { useSelector } from "react-redux";
import CategorySelector from "./CategorySelector";
import ChannelPostMessages from "./ChannelPostMessages";
import LoadingComponent from "components/layout-components/LoadingComponent";

const ForumComment = ({ channel_id, isPrivate = false, searchText, setSearchText, setDrawerVisible, setEditingMessage, drawerVisible, editingMessage }) => {
  const [form] = Form.useForm();
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [idToNameMap, setIdToNameMap] = useState(new Map());
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [chatDrawerVisible, setChatDrawerVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [likes, setLikes] = useState({}); // State to track likes for each post
  const [loading, setLoading] = useState(true);
  const [unreadPostCounts, setUnreadPostCounts] = useState({}); // New state for unread counts per post

  const { session } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!channel_id) return;
      setLoading(true);
      let query = supabase
        .from("channel_posts")
        .select(
          "*, user:users!channel_posts_user_id_fkey(user_name), receiver:users!channel_posts_receiver_user_id_fkey(user_name), channel:channels(slug), reply_count:channel_post_messages(count)"
        )
        .eq("channel_id", channel_id);

      if (isPrivate && session?.user?.id) {
        query = query.or(`receiver_user_id.eq.${session.user.id},user_id.eq.${session.user.id}`);
      }

      const { data, error } = await query.order("inserted_at", { ascending: false });

      if (error) {
        console.error("Error fetching messages:", error);
        setLoading(false);
        return;
      }

      if (idToNameMap.size === 0) {
        const { data: categories, error: lastError } = await supabase
          .from("ib_categories")
          .select("id, category_name, parent_category_id");

        if (!lastError) {
          const map = new Map(categories.map(cat => [cat.id, cat.category_name]));
          setIdToNameMap(map);
        }
      }

      const processedData = data.map(item => ({
        ...item,
        reply_count: item.reply_count[0]?.count || 0,
      }));
      setMessages(processedData);
      setFilteredMessages(processedData);

      // Initialize likes state for each post (for demo purposes)
      const initialLikes = {};
      processedData.forEach(item => {
        initialLikes[item.id] = 0; // In a real app, this would come from the backend
      });
      setLikes(initialLikes);

      // Fetch unread counts for posts
      const { data: unreadData, error: unreadError } = await supabase.rpc("get_unread_counts", {
        user_id: session.user.id,
      });

      if (unreadError) {
        console.error("Error fetching unread counts:", unreadError);
      } else {
        const unreadCounts = unreadData.reduce((acc, row) => {
          acc[row.channel_post_id] = row.unread_count;
          return acc;
        }, {});
        setUnreadPostCounts(unreadCounts);
      }

      setLoading(false);
    };
    fetchMessages();
  }, [channel_id, session]);

  useEffect(() => {
    const filterMessages = () => {
      const lowerCaseSearchText = searchText.toLowerCase();
      return messages.filter(message => {
        const userName = message.user?.user_name?.toLowerCase() || "";
        const messageContent = message.message?.toLowerCase() || "";
        const tags =
          message.details?.tags?.map(tag => idToNameMap.get(tag)?.toLowerCase() || "").join(" ") || "";
        const category = idToNameMap.get(message.details?.category_id)?.toLowerCase() || "";
        return (
          userName.includes(lowerCaseSearchText) ||
          messageContent.includes(lowerCaseSearchText) ||
          tags.includes(lowerCaseSearchText) ||
          category.includes(lowerCaseSearchText)
        );
      });
    };
    setFilteredMessages(filterMessages());
  }, [searchText, messages, idToNameMap]);

  const handleSubmit = (data, isUpdate) => {
    setIsSubmitting(false);
    if (isUpdate) {
      setMessages(messages.map(msg => (msg.id === data.id ? data : msg)));
    } else {
      setMessages([data, ...messages]);
    }
    setEditingMessage(null);
    form.resetFields();
  };

  const handleEdit = message => {
    setEditingMessage(message);
    setDrawerVisible(true);
  };

  const handleDelete = async messageId => {
    try {
      const { error } = await supabase.from("channel_posts").delete().eq("id", messageId);

      if (error) throw error;
      setMessages(messages.filter(msg => msg.id !== messageId));
      message.success("Message deleted successfully.");
    } catch (err) {
      console.error("Error deleting message:", err);
      message.error("Failed to delete message.");
    } finally {
      setDeleteModalVisible(false);
      setMessageToDelete(null);
    }
  };

  const showDeleteModal = messageId => {
    setMessageToDelete(messageId);
    setDeleteModalVisible(true);
  };

  const openChatDrawer = postId => {
    setSelectedPostId(postId);
    setChatDrawerVisible(true);
  };

  const handleLike = postId => {
    setLikes(prevLikes => ({
      ...prevLikes,
      [postId]: (prevLikes[postId] || 0) + 1,
    }));
  };

  const formatMessage = text => {
    const words = text.split(" ");
    const boldWords = words.slice(0, 5).join(" ");
    const restWords = words.slice(5).join(" ");
    return (
      <span>
        <strong>{boldWords}</strong> {restWords}
      </span>
    );
  };

  if (loading) {
    return (
      <LoadingComponent />
    );
  }

  return (
    <div className="forum-container">
      {!isPrivate && (
        <>
          <CategorySelector
            visible={drawerVisible}
            onClose={() => {
              setDrawerVisible(false);
              setEditingMessage(null);
              form.resetFields();
            }}
            chatId={editingMessage?.id}
            channel_id={channel_id}
            form={form}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            session={session}
          />
        </>
      )}

      {filteredMessages.length > 0 ? (
        <List
          dataSource={filteredMessages}
          renderItem={item => (
            <div
              className={`post ${item.user_id === session.user.id ? "post-own" : "post-other"}`}
              onClick={() => openChatDrawer(item.id)}
            >
              <div className="post-left-section">
                <Avatar size="small" className="post-avatar">
                  {isPrivate
                    ? item.user_id === session.user.id
                      ? item.receiver?.user_name?.charAt(0)
                      : item.user?.user_name?.charAt(0)
                    : item.user?.user_name?.charAt(0)}
                </Avatar>
                {(session.user.role_type === "superadmin" || session.user.id === item.user_id) && (
                  <div className="post-actions-below-avatar">
                    <Button
                      onClick={e => {
                        e.stopPropagation();
                        handleEdit(item);
                      }}
                      type="text"
                      size="small"
                      icon={<EditOutlined />}
                    />
                    <Button
                      onClick={e => {
                        e.stopPropagation();
                        showDeleteModal(item.id);
                      }}
                      type="text"
                      size="small"
                      icon={<DeleteOutlined />}
                    />
                  </div>
                )}
              </div>
              <div className="post-bubble">
                <div className="post-header">
                  <span className="post-author">
                    {isPrivate
                      ? item.user_id === session.user.id
                        ? item.receiver?.user_name
                        : item.user?.user_name
                      : item.user?.user_name}
                  </span>
                  <span className="post-timestamp">
                    {new Date(item.updated_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    ·{" "}
                    {new Date(item.updated_at).toLocaleDateString([], { month: "short", day: "numeric" })}
                  </span>
                </div>
                <div className="post-content">
                  <span>{formatMessage(item.message)}</span>
                </div>
                <div className="post-tags">
                  {/* GANESH - SHOW COUNT AND LIKE ICON LATER WITH COUNTS and show them in profile - posts.. */}
                  {/* WE ALSO NEED A NOTIFICATION ICON< SO WE CAN SHOW APPROVED CHANNEL REQUESTS, and messages from someone use RPC FUNCTION */}
                  {/* <span className="post-actions">
                    <Button
                      type="text"
                      size="small"
                      icon={<HeartOutlined />}
                      onClick={e => {
                        e.stopPropagation();
                        handleLike(item.id);
                      }}
                    />
                    {likes[item.id] > 0 && <span className="like-count">{likes[item.id]}</span>}
                    {item.reply_count > 0 && (
                      <span className="post-reply-count">
                        {item.reply_count} {item.reply_count === 1 ? "Reply" : "Replies"}
                      </span>
                    )}
                  </span> */}
                  {item?.reply_count > 0 && (
                    <span className="post-reply-count">
                      <span style={{ color: "#1890ff" }}>

                        {item?.reply_count} {item?.reply_count === 1 ? "Reply" : "Replies"}
                      </span>
                      {unreadPostCounts[item.id] > 0 && (
                        <Badge dot={unreadPostCounts[item.id]}
                          style={{ backgroundColor: '#f5222d' }} >
                          {/* <span style={{ color: "red", marginLeft: 8 }}>
                          ({unreadPostCounts[item.id]} new)
                        </span> */}
                        </Badge>
                      )}
                    </span>
                  )}
                  {item.details?.category_id && (
                    <Tag>
                      {idToNameMap.get(item.details.category_id) || item.details.category_id}
                    </Tag>
                  )}
                  {item.details?.tags?.map(tag => (
                    <Tag key={tag}>
                      {idToNameMap.get(tag) || tag}
                    </Tag>
                  ))}
                </div>
              </div>
            </div>
          )}
        />
      ) : (
        <Empty
          image={<RocketOutlined style={{ fontSize: "48px", color: "#333333" }} />}
          description={
            isPrivate ? (
              <span style={{ fontWeight: "bold", fontSize: "1.2rem", color: "#333333" }}>No Messages</span>
            ) : (
              <span>
                <span style={{ fontWeight: "bold", fontSize: "1.2rem", color: "#333333" }}>
                  Start the Conversation!
                </span>
                <br />
                This space is ready for your posts. Add one now!
              </span>
            )
          }
        />
      )}

      <Modal
        title="Delete Post"
        open={deleteModalVisible}
        onOk={() => handleDelete(messageToDelete)}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Yes"
        cancelText="No"
        centered
        footer={[
          <Button
            key="cancel"
            onClick={() => setDeleteModalVisible(false)}
            style={{ width: "45%", marginRight: "5%" }}
            size="large"
          >
            No
          </Button>,
          <Button
            key="ok"
            type="primary"
            danger
            onClick={() => handleDelete(messageToDelete)}
            style={{ width: "45%" }}
            size="large"
          >
            Yes
          </Button>,
        ]}
        bodyStyle={{ padding: "16px", textAlign: "center" }}
      >
        <p style={{ fontSize: "16px", color: "#333333" }}>Are you sure you want to delete this Post?</p>
      </Modal>

      <ChannelPostMessages
        visible={chatDrawerVisible}
        onClose={() => setChatDrawerVisible(false)}
        channel_post_id={selectedPostId}
      />
    </div>
  );
};

export default ForumComment;