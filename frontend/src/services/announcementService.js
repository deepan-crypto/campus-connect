import { supabase } from '../lib/supabase';

export const getAnnouncements = async (limit = 20, offset = 0) => {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select(`
        *,
        author:author_id (
          full_name,
          avatar_url,
          role
        ),
        announcement_likes (
          user_id
        ),
        announcement_comments (
          id,
          content,
          created_at,
          user:user_id (
            full_name,
            avatar_url
          )
        )
      `)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Process data to add like counts and user's like status
    const processedData = data.map(announcement => ({
      ...announcement,
      likeCount: announcement.announcement_likes?.length || 0,
      commentCount: announcement.announcement_comments?.length || 0,
      // Note: userLikeStatus would need to be checked per user
    }));

    return { data: processedData, error: null };
  } catch (error) {
    return { data: [], error: error.message };
  }
};

export const createAnnouncement = async (title, content, authorId, isPinned = false) => {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .insert([{
        title,
        content,
        author_id: authorId,
        is_pinned: isPinned
      }])
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

export const likeAnnouncement = async (announcementId, userId) => {
  try {
    const { data, error } = await supabase
      .from('announcement_likes')
      .insert([{
        announcement_id: announcementId,
        user_id: userId
      }])
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

export const unlikeAnnouncement = async (announcementId, userId) => {
  try {
    const { error } = await supabase
      .from('announcement_likes')
      .delete()
      .eq('announcement_id', announcementId)
      .eq('user_id', userId);

    if (error) throw error;

    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export const addComment = async (announcementId, userId, content) => {
  try {
    const { data, error } = await supabase
      .from('announcement_comments')
      .insert([{
        announcement_id: announcementId,
        user_id: userId,
        content
      }])
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

export const getAnnouncementLikes = async (announcementId) => {
  try {
    const { data, error } = await supabase
      .from('announcement_likes')
      .select(`
        user:user_id (
          full_name,
          avatar_url
        )
      `)
      .eq('announcement_id', announcementId);

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    return { data: [], error: error.message };
  }
};