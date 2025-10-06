import { useEffect } from 'react';

// This component can be added to the MentorshipPage component for debugging
export function MentorshipDebug() {
  useEffect(() => {
    try {
      // Force user to be alumni
      const userStr = localStorage.getItem('user');
      const profileStr = localStorage.getItem('profile');
      
      const user = userStr ? JSON.parse(userStr) : null;
      const profile = profileStr ? JSON.parse(profileStr) : null;
      
      console.log('Current User:', user);
      console.log('Current Profile:', profile);
      
      if (user) {
        // Force user to be alumni if not already
        if (user.role !== 'alumni') {
          console.log('Changing user role to alumni');
          user.role = 'alumni';
          localStorage.setItem('user', JSON.stringify(user));
        }
      }
    } catch (error) {
      console.error('MentorshipDebug error:', error);
    }
  }, []);
  
  return null;
}