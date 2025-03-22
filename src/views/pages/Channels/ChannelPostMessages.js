import { Button, Drawer, Input, Modal, Avatar, Tooltip } from "antd";
import { supabase } from "configs/SupabaseConfig";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import PostCard from "./Post";
import { addMessage, fetchMessages } from "./utils";
import { EditOutlined } from "@ant-design/icons";
import moment from "moment";
import "./message.css";

const ChannelPostMessages = ({ visible, onClose, channel_post_id }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editMessageId, setEditMessageId] = useState(null);
  const [editMessageContent, setEditMessageContent] = useState("");
  const { session } = useSelector((state) => state.auth);
  const [isInbox, setIsInbox] = useState(null);

  useEffect(() => {
    const fetchMessagesForChat = async () => {
      if (channel_post_id) {
        const messages = await fetchMessages(channel_post_id);
        setMessages(messages);

        const { data: postData, error: postError } = await supabase
          .from("channel_posts")
          .select("channel_id")
          .eq("id", channel_post_id)
          .single();

        if (postError) {
          console.error("Error fetching channel_post:", postError);
          return;
        }

        if (postData && postData?.channel_id) {
          const { data: channelData, error: channelError } = await supabase
            .from("channels")
            .select("is_inbox")
            .eq("id", postData?.channel_id)
            .single();

          if (channelError) {
            console.error("Error fetching channel:", channelError);
            return;
          }

          if (channelData) {
            setIsInbox(channelData?.is_inbox);
          }
        }
      }
    };
    if (visible) {
      fetchMessagesForChat();
    }

    const channel = supabase
      .channel(`realtime-messages-${channel_post_id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "channel_post_messages",
          filter: `channel_post_id=eq.${channel_post_id}`,
        },
        payload => {
          setMessages(prevMessages => [...prevMessages, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channel_post_id, visible]);

  const handleAddMessage = async () => {
    if (newMessage.trim() === "" || !channel_post_id) return;
    await addMessage(channel_post_id, session?.user?.user_name, newMessage, session?.user?.id, isInbox);
    setNewMessage("");
  };

  const convertMessageToLinks = messageText => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    let messageWithLinks = [];

    if (messageText?.match(urlRegex)) {
      const parts = messageText?.split(urlRegex);
      for (let i = 0; i < parts.length; i++) {
        if (i % 2 === 1) {
          messageWithLinks?.push(
            <a key={i} href={parts[i]} target="_blank" rel="noopener noreferrer">
              {parts[i]}
            </a>
          );
        } else {
          messageWithLinks?.push(parts[i]);
        }
      }
    } else {
      messageWithLinks = [messageText];
    }

    return messageWithLinks;
  };

  const showEditModal = (messageId, content) => {
    setEditMessageId(messageId);
    setEditMessageContent(content);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleUpdateMessage = async () => {
    if (editMessageId && editMessageContent.trim() !== "") {
      const { error } = await supabase
        .from("channel_post_messages")
        .update({ message: editMessageContent })
        .eq("id", editMessageId);

      if (error) {
        console.error("Error updating message:", error);
      } else {
        const updatedMessages = await fetchMessages(channel_post_id);
        setMessages(updatedMessages);
        setIsModalVisible(false);
      }
    }
  };

  return (
    <Drawer
      title={
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 32 }}>
          <span style={{ fontSize: "16px" }}>Messages</span>
          <Button onClick={onClose} size="small">
            Back
          </Button>
        </div>
      }
      placement="bottom"
      height="100%"
      open={visible}
      onClose={onClose}
      bodyStyle={{ padding: "10px", display: "flex", flexDirection: "column" }}
      headerStyle={{ padding: "8px 16px" }}
      footer={
        <div className="message-input">
          <Input.TextArea
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            autoSize={{ minRows: 1, maxRows: 2 }}
            onPressEnter={e => {
              e.preventDefault();
              handleAddMessage();
            }}
            placeholder="Type a reply or a message..."
            className="message-textarea"
            style={{ flex: 1, marginRight: 8 }}
          />
          <Button
            onClick={handleAddMessage}
            type="primary"
            size="large"
            style={{ width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            Send
          </Button>
        </div>
      }
      footerStyle={{ padding: "10px", borderTop: "1px solid #e8e8e8" }}
    >
      <PostCard channel_post_id={channel_post_id} />
      <ul className="message-list">
        {messages?.map(message => (
          <li
            key={message.id}
            className={`message ${message.user_id === session?.user?.id ? "message-own" : "message-other"}`}
          >
            <Tooltip title={moment(message.created_at).format("LLL")}>
              <Avatar size="medium" className="message-avatar">
                {message.name?.charAt(0)}
              </Avatar>
            </Tooltip>
            <div className="message-bubble">
              <div className="message-header">
                <span className="message-author">{message?.name}</span>
                {message?.user_id === session?.user?.id && (
                  <Button
                    onClick={() => showEditModal(message.id, message.message)}
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    className="message-actions"
                  />
                )}
              </div>
              <div className="message-content">
                <span>{convertMessageToLinks(message?.message)}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <Modal
        title="Edit Message"
        open={isModalVisible}
        onOk={handleUpdateMessage}
        onCancel={handleCancel}
        okText="Save"
        cancelText="Cancel"
        centered
        bodyStyle={{ padding: "16px" }}
        footer={[
          <Button key="cancel" onClick={handleCancel} size="large" style={{ width: "45%", marginRight: "5%" }}>
            Cancel
          </Button>,
          <Button
            key="ok"
            type="primary"
            onClick={handleUpdateMessage}
            size="large"
            style={{ width: "45%" }}
          >
            Save
          </Button>,
        ]}
      >
        <Input.TextArea
          value={editMessageContent}
          onChange={e => setEditMessageContent(e.target.value)}
          autoSize={{ minRows: 3, maxRows: 6 }}
        />
      </Modal>
    </Drawer>
  );
};

export default ChannelPostMessages;