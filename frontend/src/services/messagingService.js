import { supabase } from '../lib/supabase';

// Get user conversations with real-time data
export const getUserConversations = async (userId) => {
  try {
    const { data, error } = await supabase?.rpc('get_user_conversations', { user_uuid: userId })

    if (error) {
      throw error
    }

    return { data: data || [], error: null }
  } catch (error) {
    return { data: [], error: error?.message };
  }
}

// Create or get direct conversation between two users
export const createDirectConversation = async (participant1Id, participant2Id) => {
  try {
    const { data, error } = await supabase?.rpc('create_direct_conversation', {
        participant1_id: participant1Id,
        participant2_id: participant2Id
      })

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    return { data: null, error: error?.message };
  }
}

// Get messages for a conversation
export const getConversationMessages = async (conversationId, limit = 50, offset = 0) => {
  try {
    const { data, error } = await supabase?.from('messages')?.select(`
        id,
        content,
        message_type,
        file_path,
        file_name,
        file_size,
        file_type,
        reply_to,
        status,
        created_at,
        updated_at,
        sender:sender_id(id, display_name, avatar_url),
        reply_message:reply_to(id, content, sender_id)
      `)?.eq('conversation_id', conversationId)?.order('created_at', { ascending: true })?.range(offset, offset + limit - 1)

    if (error) {
      throw error
    }

    return { data: data || [], error: null }
  } catch (error) {
    return { data: [], error: error?.message };
  }
}

// Send a text message
export const sendMessage = async (conversationId, senderId, content, replyTo = null) => {
  try {
    const { data, error } = await supabase?.from('messages')?.insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content,
        message_type: 'text',
        reply_to: replyTo,
        status: 'sent'
      })?.select(`
        id,
        content,
        message_type,
        file_path,
        file_name,
        file_size,
        file_type,
        reply_to,
        status,
        created_at,
        updated_at,
        sender:sender_id(id, display_name, avatar_url),
        reply_message:reply_to(id, content, sender_id)
      `)?.single()

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    return { data: null, error: error?.message };
  }
}

// Upload file and send file message
export const sendFileMessage = async (conversationId, senderId, file, replyTo = null) => {
  try {
    // Generate unique file path
    const fileExt = file?.name?.split('.')?.pop()
    const fileName = `${Date.now()}_${Math.random()?.toString(36)?.substring(2)}.${fileExt}`
    const filePath = `${conversationId}/${fileName}`

    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase?.storage?.from('message-attachments')?.upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    // Determine message type based on file type
    const isImage = file?.type?.startsWith('image/')
    const messageType = isImage ? 'image' : 'file'

    // Create message record
    const { data, error } = await supabase?.from('messages')?.insert({
        conversation_id: conversationId,
        sender_id: senderId,
        message_type: messageType,
        file_path: filePath,
        file_name: file?.name,
        file_size: file?.size,
        file_type: file?.type,
        reply_to: replyTo,
        status: 'sent'
      })?.select(`
        id,
        content,
        message_type,
        file_path,
        file_name,
        file_size,
        file_type,
        reply_to,
        status,
        created_at,
        updated_at,
        sender:sender_id(id, display_name, avatar_url),
        reply_message:reply_to(id, content, sender_id)
      `)?.single()

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    return { data: null, error: error?.message };
  }
}

// Get signed URL for private file
export const getFileSignedUrl = async (filePath, expiresIn = 3600) => {
  try {
    const { data, error } = await supabase?.storage?.from('message-attachments')?.createSignedUrl(filePath, expiresIn)

    if (error) {
      throw error
    }

    return { data: data?.signedUrl, error: null }
  } catch (error) {
    return { data: null, error: error?.message };
  }
}

// Update message status (read, delivered)
export const updateMessageStatus = async (messageId, status) => {
  try {
    const { data, error } = await supabase?.from('messages')?.update({ status, updated_at: new Date()?.toISOString() })?.eq('id', messageId)?.select()?.single()

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    return { data: null, error: error?.message };
  }
}

// Mark conversation as read
export const markConversationAsRead = async (conversationId, userId) => {
  try {
    const { data, error } = await supabase?.from('conversation_participants')?.update({ last_read_at: new Date()?.toISOString() })?.eq('conversation_id', conversationId)?.eq('user_id', userId)

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    return { data: null, error: error?.message };
  }
}

// Delete message
export const deleteMessage = async (messageId) => {
  try {
    const { data, error } = await supabase?.from('messages')?.delete()?.eq('id', messageId)

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    return { data: null, error: error?.message };
  }
}

// Search conversations
export const searchConversations = async (userId, searchQuery) => {
  try {
    const { data, error } = await supabase?.from('conversations')?.select(`
        id,
        type,
        name,
        description,
        created_at,
        conversation_participants!inner(user_id),
        messages(content, created_at)
      `)?.eq('conversation_participants.user_id', userId)?.or(`name.ilike.%${searchQuery}%, messages.content.ilike.%${searchQuery}%`)?.order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return { data: data || [], error: null }
  } catch (error) {
    return { data: [], error: error?.message };
  }
}

// Real-time subscriptions
export const subscribeToConversations = (userId, callback) => {
  const subscription = supabase?.channel('user-conversations')?.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `id=in.(select conversation_id from conversation_participants where user_id=eq.${userId})`
      },
      callback
    )?.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=in.(select conversation_id from conversation_participants where user_id=eq.${userId})`
      },
      callback
    )?.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'conversation_participants',
        filter: `user_id=eq.${userId}`
      },
      callback
    )?.subscribe()

  return subscription
}

// Subscribe to messages in a specific conversation
export const subscribeToMessages = (conversationId, callback) => {
  const subscription = supabase?.channel(`conversation-${conversationId}`)?.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      callback
    )?.subscribe()

  return subscription
}

export default {
  getUserConversations,
  createDirectConversation,
  getConversationMessages,
  sendMessage,
  sendFileMessage,
  getFileSignedUrl,
  updateMessageStatus,
  markConversationAsRead,
  deleteMessage,
  searchConversations,
  subscribeToConversations,
  subscribeToMessages
}