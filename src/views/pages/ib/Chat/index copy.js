// Chat.js
import { Card } from 'antd'
import { supabase } from 'configs/SupabaseConfig'
import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { addMessage, createChat, fetchMessages } from './utils'

function Chat2() {
    const [chats, setChats] = useState([])
    const [selectedChat, setSelectedChat] = useState(null)
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const { session } = useSelector((state) => state.auth);

    useEffect(() => {
        const fetchChats = async () => {
            const { data, error } = await supabase.from('ib_posts').select('*').contains('users', [session?.user?.id])
            if (error) {
                console.error('Error fetching chats:', error)
            } else {
                setChats(data)
            }
        }
        session && fetchChats()
    }, [session])

    useEffect(() => {
        if (selectedChat) {
            const fetchChatMessages = async () => {
                const messages = await fetchMessages(selectedChat.id)
                setMessages(messages)
            }
            fetchChatMessages()
        }
    }, [selectedChat])

    const handleNewChat = async (name) => {
        const chat = await createChat(name, session?.user?.id)
        if (chat) {
            setChats([...chats, chat])
        }
    }

    const handleAddMessage = async () => {
        if (newMessage.trim() === '' || !selectedChat) return
        const message = await addMessage(selectedChat?.id, session?.user?.user_name, newMessage, session?.user?.id) // Replace with actual client_id and owner_id
        // if (message) {
        //     console.log("M", message)
        //     setMessages([...messages, message])
        //     setNewMessage('')
        // }
        setMessages([...messages, { name: session?.user?.user_name, message: newMessage }])
        setNewMessage('')
    }

    return (
        <Card>
            <div>
                <h2>Chats</h2>
                <ul>
                    {chats.map(chat => (
                        <li key={chat?.id} onClick={() => setSelectedChat(chat)}>{chat?.name}</li>
                    ))}
                </ul>
                <button onClick={() => handleNewChat('New Chat')}>Create New Chat</button>
            </div>
            {selectedChat && (
                <div>
                    <h2>Messages in {selectedChat.name}</h2>
                    <ul>
                        {messages.map(message => (
                            <li key={message?.id}>
                                <strong>{message?.name}:</strong> {message?.message}
                            </li>
                        ))}
                    </ul>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e?.target?.value)}
                    />
                    <button onClick={handleAddMessage}>Send</button>
                </div>
            )}
        </Card>
    )
}

export default Chat2
