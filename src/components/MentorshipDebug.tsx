import { useEffect } from 'react';

// This component can be added to the MentorshipPage component for debugging
export function MentorshipDebug() {
  useEffect(() => {
    // Force user to be alumni
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const profile = JSON.parse(localStorage.getItem('profile') || 'null');
    
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
  }, []);
  
  return null;
}