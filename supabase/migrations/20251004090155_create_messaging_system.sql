-- Location: supabase/migrations/20251004090155_create_messaging_system.sql
-- Schema Analysis: Existing campus platform with profiles table, authentication system in place
-- Integration Type: NEW_MODULE - Adding complete real-time messaging system
-- Dependencies: public.profiles (existing table)

-- 1. Create message-related types
CREATE TYPE public.message_status AS ENUM ('sending', 'sent', 'delivered', 'read');
CREATE TYPE public.message_type AS ENUM ('text', 'file', 'image');
CREATE TYPE public.conversation_type AS ENUM ('direct', 'group');

-- 2. Create conversations table
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type public.conversation_type DEFAULT 'direct'::public.conversation_type,
    name TEXT,
    description TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create conversation_participants table (junction table)
CREATE TABLE public.conversation_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_read_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(conversation_id, user_id)
);

-- 4. Create messages table
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT,
    message_type public.message_type DEFAULT 'text'::public.message_type,
    file_path TEXT,
    file_name TEXT,
    file_size BIGINT,
    file_type TEXT,
    reply_to UUID REFERENCES public.messages(id) ON DELETE SET NULL,
    status public.message_status DEFAULT 'sending'::public.message_status,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create storage bucket for message attachments (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'message-attachments',
    'message-attachments',
    false,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif', 
          'application/pdf', 'text/plain', 'application/msword', 
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- 6. Create indexes for performance
CREATE INDEX idx_conversations_created_by ON public.conversations(created_by);
CREATE INDEX idx_conversation_participants_conversation_id ON public.conversation_participants(conversation_id);
CREATE INDEX idx_conversation_participants_user_id ON public.conversation_participants(user_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_messages_reply_to ON public.messages(reply_to);

-- 7. Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies

-- Conversations: Users can only see conversations they participate in
CREATE POLICY "users_view_own_conversations"
ON public.conversations
FOR SELECT
TO authenticated
USING (
    id IN (
        SELECT conversation_id FROM public.conversation_participants
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "users_create_conversations"
ON public.conversations
FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "participants_update_conversations"
ON public.conversations
FOR UPDATE
TO authenticated
USING (
    id IN (
        SELECT conversation_id FROM public.conversation_participants
        WHERE user_id = auth.uid()
    )
);

-- Conversation participants: Users can manage their own participation
CREATE POLICY "users_view_conversation_participants"
ON public.conversation_participants
FOR SELECT
TO authenticated
USING (
    conversation_id IN (
        SELECT conversation_id FROM public.conversation_participants
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "users_manage_conversation_participants"
ON public.conversation_participants
FOR ALL
TO authenticated
USING (
    conversation_id IN (
        SELECT conversation_id FROM public.conversation_participants
        WHERE user_id = auth.uid()
    )
);

-- Messages: Users can only see messages in conversations they participate in
CREATE POLICY "users_view_conversation_messages"
ON public.messages
FOR SELECT
TO authenticated
USING (
    conversation_id IN (
        SELECT conversation_id FROM public.conversation_participants
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "users_send_messages"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (
        SELECT conversation_id FROM public.conversation_participants
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "users_update_own_messages"
ON public.messages
FOR UPDATE
TO authenticated
USING (sender_id = auth.uid())
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "users_delete_own_messages"
ON public.messages
FOR DELETE
TO authenticated
USING (sender_id = auth.uid());

-- 9. Storage RLS policies for message attachments

-- Users can view files in conversations they participate in
CREATE POLICY "users_view_conversation_attachments"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'message-attachments' AND
    (storage.foldername(name))[1] IN (
        SELECT conversation_id::text FROM public.conversation_participants
        WHERE user_id = auth.uid()
    )
);

-- Users can upload files to conversations they participate in
CREATE POLICY "users_upload_conversation_attachments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'message-attachments' AND
    owner = auth.uid() AND
    (storage.foldername(name))[1] IN (
        SELECT conversation_id::text FROM public.conversation_participants
        WHERE user_id = auth.uid()
    )
);

-- Users can delete their own uploaded files
CREATE POLICY "users_delete_own_attachments"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'message-attachments' AND
    owner = auth.uid()
);

-- 10. Functions for conversation management
CREATE OR REPLACE FUNCTION public.get_user_conversations(user_uuid UUID)
RETURNS TABLE(
    conversation_id UUID,
    conversation_type public.conversation_type,
    conversation_name TEXT,
    last_message_content TEXT,
    last_message_created_at TIMESTAMPTZ,
    unread_count BIGINT,
    participant_count BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT 
    c.id as conversation_id,
    c.type as conversation_type,
    CASE 
        WHEN c.type = 'group' THEN c.name
        ELSE (
            SELECT p.display_name 
            FROM public.profiles p
            JOIN public.conversation_participants cp ON p.id = cp.user_id
            WHERE cp.conversation_id = c.id AND cp.user_id != user_uuid
            LIMIT 1
        )
    END as conversation_name,
    (
        SELECT m.content 
        FROM public.messages m
        WHERE m.conversation_id = c.id
        ORDER BY m.created_at DESC
        LIMIT 1
    ) as last_message_content,
    (
        SELECT m.created_at 
        FROM public.messages m
        WHERE m.conversation_id = c.id
        ORDER BY m.created_at DESC
        LIMIT 1
    ) as last_message_created_at,
    (
        SELECT COUNT(*)
        FROM public.messages m
        WHERE m.conversation_id = c.id 
        AND m.created_at > COALESCE(
            (SELECT cp2.last_read_at FROM public.conversation_participants cp2 
             WHERE cp2.conversation_id = c.id AND cp2.user_id = user_uuid), 
            '1970-01-01'::timestamptz
        )
        AND m.sender_id != user_uuid
    ) as unread_count,
    (
        SELECT COUNT(*)
        FROM public.conversation_participants cp3
        WHERE cp3.conversation_id = c.id
    ) as participant_count
FROM public.conversations c
JOIN public.conversation_participants cp ON c.id = cp.conversation_id
WHERE cp.user_id = user_uuid
ORDER BY last_message_created_at DESC NULLS LAST;
$$;

-- 11. Function to create direct conversation
CREATE OR REPLACE FUNCTION public.create_direct_conversation(participant1_id UUID, participant2_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    conversation_uuid UUID;
    existing_conversation UUID;
BEGIN
    -- Check if direct conversation already exists between these users
    SELECT c.id INTO existing_conversation
    FROM public.conversations c
    JOIN public.conversation_participants cp1 ON c.id = cp1.conversation_id
    JOIN public.conversation_participants cp2 ON c.id = cp2.conversation_id
    WHERE c.type = 'direct'
    AND cp1.user_id = participant1_id
    AND cp2.user_id = participant2_id
    AND (SELECT COUNT(*) FROM public.conversation_participants cp WHERE cp.conversation_id = c.id) = 2;

    IF existing_conversation IS NOT NULL THEN
        RETURN existing_conversation;
    END IF;

    -- Create new conversation
    INSERT INTO public.conversations (type, created_by)
    VALUES ('direct', participant1_id)
    RETURNING id INTO conversation_uuid;

    -- Add participants
    INSERT INTO public.conversation_participants (conversation_id, user_id)
    VALUES 
        (conversation_uuid, participant1_id),
        (conversation_uuid, participant2_id);

    RETURN conversation_uuid;
END;
$$;

-- 12. Mock data for testing
DO $$
DECLARE
    user1_id UUID;
    user2_id UUID;
    conversation_id UUID;
    message_id UUID;
BEGIN
    -- Get existing user IDs (using existing profiles)
    SELECT id INTO user1_id FROM public.profiles ORDER BY created_at LIMIT 1;
    
    -- Create second user if not exists (for demo purposes)
    IF user1_id IS NULL THEN
        RAISE NOTICE 'No users found. Please ensure users exist in the profiles table first.';
        RETURN;
    END IF;
    
    -- Try to get a second user
    SELECT id INTO user2_id FROM public.profiles WHERE id != user1_id ORDER BY created_at LIMIT 1;
    
    IF user2_id IS NULL THEN
        -- Create a demo conversation with self (for testing)
        conversation_id := public.create_direct_conversation(user1_id, user1_id);
    ELSE
        -- Create conversation between two users
        conversation_id := public.create_direct_conversation(user1_id, user2_id);
    END IF;

    -- Insert some sample messages
    INSERT INTO public.messages (conversation_id, sender_id, content, message_type, status)
    VALUES 
        (conversation_id, user1_id, 'Hello! How are you doing?', 'text', 'delivered'),
        (conversation_id, COALESCE(user2_id, user1_id), 'Hi there! I am doing great, thanks for asking. How about you?', 'text', 'read'),
        (conversation_id, user1_id, 'I am doing well too! Are you ready for the upcoming project?', 'text', 'delivered'),
        (conversation_id, COALESCE(user2_id, user1_id), 'Yes, I am excited about it. When do we start?', 'text', 'read');

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating mock data: %', SQLERRM;
END $$;
