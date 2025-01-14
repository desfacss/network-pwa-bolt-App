// createChat.js

import { supabase } from "configs/SupabaseConfig"

async function createChat(name, user_id) {
    // let users = []
    // users.push(user_id)
    const { data, error } = await supabase
        .from('ib_chats')
        .insert([{ name, users: [user_id] }])
        .single()

    if (error) {
        console.error('Error creating chat:', error)
        return null
    }

    return data
}

// addMessage.js

async function addMessage(chat_id, name, message, user_id) {
    const { data, error } = await supabase
        .from('ib_chat_messages')
        .insert([{ chat_id, name, message, user_id }])
        .single()

    if (error) {
        console.error('Error adding message:', error)
        return null
    }

    return data
}

// fetchMessages.js

async function fetchMessages(chat_id) {
    const ses = await supabase.auth.getSession()
    console.log("SEssion", ses)
    const { data, error } = await supabase
        .from('ib_chat_messages')
        .select('*')
        .eq('chat_id', chat_id)
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching messages:', error)
        return []
    }

    return data
}

export { createChat, addMessage, fetchMessages }
