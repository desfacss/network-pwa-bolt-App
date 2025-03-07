import { Button, Card, Input, Modal } from 'antd';
import { supabase } from 'configs/SupabaseConfig';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import PostCard from './Post';
import { addMessage, fetchMessages } from './utils';
import { EditOutlined } from '@ant-design/icons';

const Chat = () => {
    const { chatId } = useParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editMessageId, setEditMessageId] = useState(null);
    const [editMessageContent, setEditMessageContent] = useState('');
    const { session } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMessagesForChat = async () => {
            if (chatId) {
                const messages = await fetchMessages(chatId);
                setMessages(messages);
            }
        };
        fetchMessagesForChat();

        // Subscribe to real-time message updates
        const channel = supabase
            .channel(`realtime-messages-${chatId}`)
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'ib_post_messages', filter: `chat_id=eq.${chatId}` },
                async (payload) => {
                    console.log('New message received:', payload.new);
                    setMessages((prevMessages) => [...prevMessages, payload.new]);
                    // const messages = await fetchMessages(chatId);
                    // setMessages(messages);
                }
            )
            .subscribe();

        // Cleanup subscription on unmount
        return () => {
            supabase.removeChannel(channel);
        };
    }, [chatId]);

    const handleAddMessage = async () => {
        // if (newMessage.trim() === '' || !chatId) return;
        // setMessages([...messages, { name: session?.user?.user_name, message: newMessage }]);
        // setNewMessage('');

        if (newMessage.trim() === '' || !chatId) return
        const message = await addMessage(chatId, session?.user?.user_name, newMessage, session?.user?.id) // Replace with actual client_id and owner_id
        // setMessages([...messages, { name: session?.user?.user_name, message: newMessage }])
        setNewMessage('')
    };

    // Helper function to convert message text into clickable links
    const convertMessageToLinks = (messageText) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        let messageWithLinks = [];

        if (messageText.match(urlRegex)) {
            const parts = messageText.split(urlRegex);
            for (let i = 0; i < parts.length; i++) {
                if (i % 2 === 1) { // Odd indices are URLs
                    messageWithLinks.push(<a key={i} href={parts[i]} target="_blank" rel="noopener noreferrer">{parts[i]}</a>);
                } else {
                    messageWithLinks.push(parts[i]);
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
                .from('ib_post_messages')
                .update({ message: editMessageContent })
                .eq('id', editMessageId);

            if (error) {
                console.error('Error updating message:', error);
            } else {
                // Fetch updated messages
                const updatedMessages = await fetchMessages(chatId);
                setMessages(updatedMessages);
                setIsModalVisible(false);
            }
        }
    };

    return (
        <Card>
            <Button onClick={() => navigate(`app/networking`)}>Back</Button>
            <PostCard chatId={chatId} />
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
            </Modal>
        </Card >
    );
};

export default Chat;
