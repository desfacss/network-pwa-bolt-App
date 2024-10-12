// createChat.js

import { supabase } from "configs/SupabaseConfig"

async function createChat(name) {
    const { data, error } = await supabase
        .from('chats')
        .insert([{ name }])
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
        .from('posts')
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
        .from('posts')
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
