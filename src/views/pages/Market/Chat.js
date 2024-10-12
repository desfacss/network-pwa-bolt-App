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
    const { user } = useSelector(
        (state) => state?.positions
    );
    useEffect(() => {
        const fetchChats = async () => {
            const { data, error } = await supabase.from('chats').select('*').contains('users', [user?.id])
            if (error) {
                console.error('Error fetching chats:', error)
            } else {
                setChats(data)
            }
        }
        user && fetchChats()
    }, [user])

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
        const chat = await createChat(name)
        if (chat) {
            setChats([...chats, chat])
        }
    }

    const handleAddMessage = async () => {
        if (newMessage.trim() === '' || !selectedChat) return
        const message = await addMessage(selectedChat?.id, user?.email?.slice(0, 5), newMessage, '26a9ae6c-b0b1-41dd-a1b7-44fb1d12b894') // Replace with actual client_id and owner_id
        // if (message) {
        //     console.log("M", message)
        //     setMessages([...messages, message])
        //     setNewMessage('')
        // }
        setMessages([...messages, { name: user?.email?.slice(0, 5), message: newMessage }])
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
