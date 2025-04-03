// createChat.js

import { supabase } from "configs/SupabaseConfig"

async function createChat(name, user_id) {
    // let users = []
    // users.push(user_id)
    const { data, error } = await supabase
        .from('channel_posts')
        .insert([{ name, users: [user_id] }])
        .single()

    if (error) {
        console.error('Error creating chat:', error)
        return null
    }

    return data
}

// addMessage.js

async function addMessage(channel_post_id, name, message, user_id, isInbox) {
    const { data, error } = await supabase
        .from('channel_post_messages')
        .insert([{ channel_post_id, name, message, user_id }])
        .single();

    if (error) {
        console.error('Error adding message:', error);
        return null;
    }

    // Prepare the update object
    const updateData = {
        updated_at: new Date().toISOString() // Ensure UTC timestamp
    };

    // If it's inbox, include message in the update
    if (isInbox) {
        updateData.message = message;
    }

    // Update channel_posts table
    const { error: updateError } = await supabase
        .from('channel_posts')
        .update(updateData)
        .eq('id', channel_post_id)
    // Add condition to check if user_id matches
    // .eq('user_id', user_id);

    if (updateError) {
        console.error('Error updating channel_post:', updateError);
        return null;
    }

    return data;

    // if (isInbox) { // Use the cached isInbox value
    //     const { error: updateError } = await supabase
    //         .from('channel_posts')
    //         .update({ message: message })
    //         .eq('id', channel_post_id);
    //     console.log("gt", isInbox, channel_post_id)

    //     if (updateError) {
    //         console.error('Error updating channel_post:', updateError);
    //     }
    // }

    // const { updateError } = await supabase.rpc('increment_chat_count', { channel_post_id });

    // if (updateError) {
    //     console.error('Error updating count in ib_posts:', updateError);
    // }
}

// fetchMessages.js

async function fetchMessages(channel_post_id) {
    // const ses = await supabase.auth.getSession()
    // console.log("SEssion", ses)
    const { data, error } = await supabase
        .from('channel_post_messages')
        .select('*')
        // .select('*, users!channel_posts_user_id_fkey(*)')
        .eq('channel_post_id', channel_post_id)
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching messages:', error)
        return []
    }

    return data
}

export { createChat, addMessage, fetchMessages }
