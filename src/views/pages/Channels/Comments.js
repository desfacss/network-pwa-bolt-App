import React, { useEffect, useState } from "react";
import {
  Card,
  Form,
  Button,
  List,
  Flex,
  message,
  Empty,
  ConfigProvider,
  theme,
  Tag,
  Modal,
  Input,
  Avatar,
} from "antd";
import { EditOutlined, DeleteOutlined, RocketOutlined } from "@ant-design/icons";
import "./styles.css";
import { supabase } from "configs/SupabaseConfig";
import { useSelector } from "react-redux";
import CategorySelector from "./CategorySelector";
import ChannelPostMessages from "./ChannelPostMessages";

const ForumComment = ({ channel_id, isPrivate = false }) => {
  const [form] = Form.useForm();
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [editingMessage, setEditingMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [idToNameMap, setIdToNameMap] = useState(new Map());
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [chatDrawerVisible, setChatDrawerVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);

  const { session } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!channel_id) return;

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

  return (
    <div className="forum-container">
      {!isPrivate && (
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 16,
            flexWrap: "wrap",
            width: "100%",
          }}
        >
          <Input
            placeholder="Search by user name, message or tag"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ flex: 1, minWidth: "58%" }}
          />
          <Button
            type="primary"
            onClick={() => {
              setEditingMessage(null);
              setDrawerVisible(true);
            }}
            style={{ flex: 1, minWidth: "38%" }}
          >
            New Post
          </Button>
        </div>
      )}
      {!isPrivate && (
        <>
          {/* <ConfigProvider
          theme={{
            algorithm: theme.defaultAlgorithm,
            token: { colorBorder: "#ccceee", borderRadius: 4, fontFamily: "Inter, sans-serif" },
          }}
        > */}
          <CategorySelector //Ravi Post message Post categorySelector
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
          {/* </ConfigProvider> */}
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
              <Avatar size="medium" className="post-avatar">
                {isPrivate
                  ? item.user_id === session.user.id
                    ? item.receiver?.user_name?.charAt(0)
                    : item.user?.user_name?.charAt(0)
                  : item.user?.user_name?.charAt(0)}
              </Avatar>
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
                    {new Date(item.inserted_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    ·{" "}
                    {new Date(item.inserted_at).toLocaleDateString([], { month: "short", day: "numeric" })}
                  </span>
                  {(session.user.role_type === "superadmin" || session.user.id === item.user_id) && (
                    <div className="post-actions">
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
                <div className="post-content">
                  <span>{formatMessage(item.message)}</span>
                </div>
                <div className="post-tags">
                  {item.details?.category_id && (
                    <Tag
                    // style={{
                    //   borderRadius: 8,
                    //   // background: "#e3e3e3",
                    //   // color: "#222",
                    //   border: "none",
                    //   fontSize: 11,
                    //   padding: "2px 6px",
                    // }}
                    // color="blue"
                    >
                      {idToNameMap.get(item.details.category_id) || item.details.category_id}
                    </Tag>
                  )}
                  {item.details?.tags?.map(tag => (
                    <Tag
                      key={tag}
                    // style={{
                    //   borderRadius: 8,
                    //   background: "#e3e3e3",
                    //   color: "#222",
                    //   border: "1px",
                    //   fontSize: 11,
                    //   padding: "2px 6px",
                    // }}
                    >
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