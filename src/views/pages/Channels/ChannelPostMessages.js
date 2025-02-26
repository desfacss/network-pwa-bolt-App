import { Button, Card, Input, Modal, Avatar, Tooltip } from 'antd';
import { supabase } from 'api/supabaseClient';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import PostCard from './Post';
import { addMessage, fetchMessages } from './utils';
import { EditOutlined } from '@ant-design/icons';
import moment from 'moment';
import './message.css';

const ChannelPostMessages = () => {
    const { channel_post_id } = useParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editMessageId, setEditMessageId] = useState(null);
    const [editMessageContent, setEditMessageContent] = useState('');
    const { session } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMessagesForChat = async () => {
            if (channel_post_id) {
                const messages = await fetchMessages(channel_post_id);
                console.log("msg", messages);
                setMessages(messages);
            }
        };
        fetchMessagesForChat();

        // Subscribe to real-time message updates
        const channel = supabase
            .channel(`realtime-messages-${channel_post_id}`)
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'channel_post_messages', filter: `channel_post_id=eq.${channel_post_id}` },
                async (payload) => {
                    // console.log('New message received:', payload, messages, channel_post_id);
                    setMessages((prevMessages) => [...prevMessages, payload.new]);
                    // const messages = await fetchMessages(channel_post_id);
                    // setMessages(messages);
                }
            )
            .subscribe();

        // Cleanup subscription on unmount
        return () => {
            supabase.removeChannel(channel);
        };
    }, [channel_post_id]);

    const handleAddMessage = async () => {
        // if (newMessage.trim() === '' || !channel_post_id) return;
        // setMessages([...messages, { name: session?.user?.user_name, message: newMessage }]);
        // setNewMessage('');

        if (newMessage.trim() === '' || !channel_post_id) return
        const message = await addMessage(channel_post_id, session?.user?.user_name, newMessage, session?.user?.id) // Replace with actual client_id and owner_id
        // setMessages([...messages, { name: session?.user?.user_name, message: newMessage }])
        setNewMessage('')
    };

    // Helper function to convert message text into clickable links
    const convertMessageToLinks = (messageText) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        let messageWithLinks = [];

        if (messageText?.match(urlRegex)) {
            const parts = messageText?.split(urlRegex);
            for (let i = 0; i < parts.length; i++) {
                if (i % 2 === 1) { // Odd indices are URLs
                    messageWithLinks?.push(<a key={i} href={parts[i]} target="_blank" rel="noopener noreferrer">{parts[i]}</a>);
                } else {
                    messageWithLinks?.push(parts[i]);
                }
            }
        } else {
            messageWithLinks = [messageText]; // No URL found, just push the whole message
        }

        return messageWithLinks;
    };

    // Function to show edit modal
    const showEditModal = (messageId, content) => {
        setEditMessageId(messageId);
        setEditMessageContent(content);
        setIsModalVisible(true);
    };

    // Handle closing the modal
    const handleCancel = () => {
        setIsModalVisible(false);
    };

    // Update message in Supabase
    const handleUpdateMessage = async () => {
        if (editMessageId && editMessageContent.trim() !== '') {
            const { error } = await supabase
                .from('channel_post_messages')
                .update({ message: editMessageContent })
                .eq('id', editMessageId);

            if (error) {
                console.error('Error updating message:', error);
            } else {
                // Fetch updated messages
                const updatedMessages = await fetchMessages(channel_post_id);
                setMessages(updatedMessages);
                setIsModalVisible(false);
            }
        }
    };

    return (
        <Card>
            {/* <Button onClick={() => navigate(`app/networking`)}>Back</Button>
            <PostCard channel_post_id={channel_post_id} />
            <h2>Messages</h2>
            <ul>
                {messages?.map((message, index) => (
                    <li key={index} style={{ marginBottom: '10px', position: 'relative' }}>
                        <div style={{
                            wordWrap: 'break-word',
                            whiteSpace: 'pre-wrap',
                            textAlign: 'left'
                        }}>
                            <span>{convertMessageToLinks(message?.message)}</span>
                            {message?.user_id === session?.user?.id && (
                                <Button onClick={() => showEditModal(message.id, message.message)} type='text'
                                    size="small" style={{ padding: '0', marginLeft: '5px', verticalAlign: 'middle' }}><EditOutlined /></Button>
                            )}
                        </div>
                        <div style={{
                            fontSize: '0.8em', color: 'gray', position: 'absolute', left: '2.8em', // Adjust this value based on your bullet size
                            textAlign: 'left'
                        }}>
                            <strong>{message?.name}</strong>
                        </div>
                    </li>
                ))}
            </ul>
            <Input.TextArea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
            />
            <Button onClick={handleAddMessage} type='primary'>Send</Button>
            <Modal title="Edit Message" visible={isModalVisible} onOk={handleUpdateMessage} onCancel={handleCancel}>
                <Input.TextArea
                    value={editMessageContent}
                    onChange={(e) => setEditMessageContent(e.target.value)}
                    autoSize={{ minRows: 3, maxRows: 6 }}
                />
            </Modal> */}
            <Button onClick={() => navigate(`app/networking`)}>Back</Button>
            <PostCard channel_post_id={channel_post_id} />
            <div className="message-container"> {/* Container for messages */}
                <h2>Messages</h2>
                <ul className="message-list">
                    {messages?.map((message) => (
                        <li key={message.id} className={`message ${message.user_id === session?.user?.id ? 'message-own' : ''}`}> {/* Add conditional class */}
                            <Tooltip title={moment(message.created_at).format('LLL')}> {/* Display timestamp tooltip */}
                                <Avatar size="medium" className="message-avatar">{message.name?.charAt(0)}</Avatar> {/* Display avatar */}
                            </Tooltip>
                            <div className="message-content">
                                <div className="message-bubble">
                                    <span>{convertMessageToLinks(message?.message)}</span>
                                    {message?.user_id === session?.user?.id && (
                                        <div className="message-actions"> {/* Container for actions */}
                                            <Button onClick={() => showEditModal(message.id, message.message)} type='text' size="small" icon={<EditOutlined />} />
                                        </div>
                                    )}
                                </div>
                                <div className="message-info">
                                    <span className="message-author">{message?.name}</span>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
                <div className="message-input"> {/* Container for input */}
                    <Input.TextArea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        autoSize={{ minRows: 1, maxRows: 3 }}
                        onPressEnter={handleAddMessage}  // Send on Enter
                    />
                    <Button onClick={handleAddMessage} type='primary'>Send</Button>
                </div>
            </div>
            <Modal title="Edit Message" visible={isModalVisible} onOk={handleUpdateMessage} onCancel={handleCancel}>
                <Input.TextArea
                    value={editMessageContent}
                    onChange={(e) => setEditMessageContent(e.target.value)}
                    autoSize={{ minRows: 3, maxRows: 6 }}
                />
            </Modal>
        </Card >
    );
};

export default ChannelPostMessages;
