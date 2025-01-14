import { Card } from 'antd';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
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
            <h2>Messages</h2>
            <ul>
                {messages?.map((message, index) => (
                    <li key={index}>
                        <strong>{message?.name}:</strong> {message?.message}
                    </li>
                ))}
            </ul>
            <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
            />
            <button onClick={handleAddMessage}>Send</button>
        </Card>
    );
};

export default Chat2;
