import { supabase } from '../lib/supabase';

export const getNotifications = async (userId, limit = 20, offset = 0) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    return { data: [], error: error.message };
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

export const markAllNotificationsAsRead = async (userId) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;

    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export const createNotification = async (userId, type, title, message, data = {}) => {
  try {
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert([{
        user_id: userId,
        type,
        title,
        message,
        data
      }])
      .select()
      .single();

    if (error) throw error;

    return { data: notification, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

export const getUnreadCount = async (userId) => {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;

    return { count: count || 0, error: null };
  } catch (error) {
    return { count: 0, error: error.message };
  }
};