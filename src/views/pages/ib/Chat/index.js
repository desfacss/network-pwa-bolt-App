import { Button, Card, Input } from 'antd';
import { supabase } from 'api/supabaseClient';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import PostCard from './Post';
import { addMessage, fetchMessages } from './utils';

const Chat2 = () => {
    const { chatId } = useParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const { session } = useSelector((state) => state.auth);

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
        setMessages([...messages, { name: session?.user?.user_name, message: newMessage }])
        setNewMessage('')
    };

    return (
        <Card>
            <PostCard chatId={chatId} />
            <h2>Messages</h2>
            <ul>
                {messages?.map((message, index) => (
                    <li key={index}>
                        <strong>{message?.name}:</strong> {message?.message}
                    </li>
                ))}
            </ul>
            <Input.TextArea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
            />
            <Button onClick={handleAddMessage} type='primary'>Send</Button>
        </Card>
    );
};

export default Chat2;
