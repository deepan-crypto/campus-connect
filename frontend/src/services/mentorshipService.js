import { supabase } from '../lib/supabase';

export const getMentorshipRequests = async (userId, userRole) => {
  try {
    let query = supabase
      .from('mentorship_requests')
      .select(`
        *,
        student:student_id (
          full_name,
          avatar_url,
          department,
          graduation_year,
          skills
        ),
        mentor:mentor_id (
          full_name,
          avatar_url,
          department,
          graduation_year,
          skills,
          current_employer
        )
      `);

    if (userRole === 'student') {
      query = query.eq('student_id', userId);
    } else {
      query = query.eq('mentor_id', userId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    return { data: [], error: error.message };
  }
};

export const getRecommendedMentors = async (studentId) => {
  try {
    // Get student profile
    const { data: student, error: studentError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', studentId)
      .single();

    if (studentError) throw studentError;

    // Get potential mentors (alumni and faculty)
    const { data: mentors, error: mentorsError } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['alumni', 'faculty'])
      .neq('id', studentId);

    if (mentorsError) throw mentorsError;

    // Calculate match scores
    const recommendedMentors = mentors.map(mentor => {
      let score = 0;
      const maxScore = 100;

      // Skills overlap
      const studentSkills = student.skills || [];
      const mentorSkills = mentor.skills || [];
      const commonSkills = studentSkills.filter(skill =>
        mentorSkills.some(mSkill => mSkill.toLowerCase() === skill.toLowerCase())
      );
      score += (commonSkills.length / Math.max(studentSkills.length, 1)) * 40;

      // Graduation year difference (closer is better)
      const yearDiff = Math.abs((mentor.graduation_year || 2020) - (student.graduation_year || 2024));
      score += Math.max(0, 30 - yearDiff * 2);

      // Department match
      if (student.department && mentor.department &&
          student.department.toLowerCase() === mentor.department.toLowerCase()) {
        score += 20;
      }

      // Interests overlap
      const studentInterests = student.interests || [];
      const mentorInterests = mentor.interests || [];
      const commonInterests = studentInterests.filter(interest =>
        mentorInterests.some(mInterest => mInterest.toLowerCase() === interest.toLowerCase())
      );
      score += (commonInterests.length / Math.max(studentInterests.length, 1)) * 10;

      return {
        ...mentor,
        matchScore: Math.round(Math.min(score, maxScore)),
        matchingSkills: commonSkills,
        matchingInterests: commonInterests
      };
    });

    // Sort by score and return top matches
    return {
      data: recommendedMentors
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 10),
      error: null
    };
  } catch (error) {
    return { data: [], error: error.message };
  }
};

export const createMentorshipRequest = async (studentId, mentorId, message) => {
  try {
    const { data, error } = await supabase
      .from('mentorship_requests')
      .insert([{
        student_id: studentId,
        mentor_id: mentorId,
        message,
        status: 'requested'
      }])
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

export const updateMentorshipRequest = async (requestId, updates) => {
  try {
    const { data, error } = await supabase
      .from('mentorship_requests')
      .update(updates)
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};