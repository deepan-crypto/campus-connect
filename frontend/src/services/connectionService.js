import { supabase } from '../lib/supabase';

export const getConnections = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('connections')
      .select(`
        *,
        sender:sender_id (
          id,
          full_name,
          avatar_url,
          role,
          department,
          graduation_year,
          current_employer
        ),
        receiver:receiver_id (
          id,
          full_name,
          avatar_url,
          role,
          department,
          graduation_year,
          current_employer
        )
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .eq('status', 'accepted')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    return { data: [], error: error.message };
  }
};

export const getConnectionRequests = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('connections')
      .select(`
        *,
        sender:sender_id (
          id,
          full_name,
          avatar_url,
          role,
          department,
          graduation_year,
          current_employer
        ),
        receiver:receiver_id (
          id,
          full_name,
          avatar_url,
          role,
          department,
          graduation_year,
          current_employer
        )
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .neq('status', 'accepted')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    return { data: [], error: error.message };
  }
};

export const sendConnectionRequest = async (senderId, receiverId) => {
  try {
    const { data, error } = await supabase
      .from('connections')
      .insert([{
        sender_id: senderId,
        receiver_id: receiverId,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

export const updateConnectionRequest = async (connectionId, status) => {
  try {
    const { data, error } = await supabase
      .from('connections')
      .update({ status })
      .eq('id', connectionId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

export const getSuggestedConnections = async (userId) => {
  try {
    // Get user profile
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    // Get existing connections
    const { data: existingConnections, error: connError } = await supabase
      .from('connections')
      .select('sender_id, receiver_id')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

    if (connError) throw connError;

    const connectedUserIds = new Set();
    existingConnections.forEach(conn => {
      if (conn.sender_id !== userId) connectedUserIds.add(conn.sender_id);
      if (conn.receiver_id !== userId) connectedUserIds.add(conn.receiver_id);
    });

    // Get potential connections (same department, similar graduation year, etc.)
    let query = supabase
      .from('profiles')
      .select('*')
      .neq('id', userId)
      .not('id', 'in', `(${Array.from(connectedUserIds).join(',')})`);

    // Filter by department if user has one
    if (user.department) {
      query = query.eq('department', user.department);
    }

    // Filter by graduation year range
    if (user.graduation_year) {
      const minYear = user.graduation_year - 2;
      const maxYear = user.graduation_year + 2;
      query = query.gte('graduation_year', minYear).lte('graduation_year', maxYear);
    }

    const { data: suggestions, error: suggError } = await query.limit(10);

    if (suggError) throw suggError;

    return { data: suggestions || [], error: null };
  } catch (error) {
    return { data: [], error: error.message };
  }
};