import { supabase } from '../lib/supabase';

export const getEvents = async (filters = {}) => {
  try {
    let query = supabase
      .from('events')
      .select(`
        *,
        created_by (
          full_name,
          avatar_url
        ),
        event_rsvps (
          status,
          user_id
        )
      `)
      .eq('is_active', true)
      .order('start_date', { ascending: true });

    if (filters.type) {
      query = query.eq('event_type', filters.type);
    }

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    return { data: [], error: error.message };
  }
};

export const getEventById = async (eventId) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        created_by (
          full_name,
          avatar_url
        ),
        event_rsvps (
          status,
          user_id,
          profiles (
            full_name,
            avatar_url
          )
        ),
        event_feedback (
          rating,
          feedback,
          profiles (
            full_name
          )
        )
      `)
      .eq('id', eventId)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

export const createEvent = async (eventData) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .insert([eventData])
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

export const updateEventRSVP = async (eventId, userId, status) => {
  try {
    const { data, error } = await supabase
      .from('event_rsvps')
      .upsert({
        event_id: eventId,
        user_id: userId,
        status
      })
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

export const submitEventFeedback = async (eventId, userId, rating, feedback) => {
  try {
    const { data, error } = await supabase
      .from('event_feedback')
      .upsert({
        event_id: eventId,
        user_id: userId,
        rating,
        feedback
      })
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};