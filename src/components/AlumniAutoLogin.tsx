import { useEffect } from 'react';

// A simple component to auto-login as alumni for testing
export function AlumniAutoLogin() {
  useEffect(() => {
    const mockUser = {
      id: '1',
      email: 'alumni@example.com',
      role: 'alumni',
      emailVerified: true,
      createdAt: new Date().toISOString(),
    };
    
    const mockProfile = {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      bio: 'Alumni working at Microsoft. Passionate about mentoring and helping students grow.',
      department: 'Computer Science',
      graduationYear: 2018,
      currentEmployer: 'Microsoft',
      profileVisibility: 'public',
      skills: [
        { id: '1', skillName: 'React', endorsements: 15 },
        { id: '2', skillName: 'TypeScript', endorsements: 10 },
      ],
      interests: ['Mentorship', 'Web Development', 'Software Architecture'],
    };

    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('profile', JSON.stringify(mockProfile));
    
    // Force a reload to apply the login
    window.location.reload();
  }, []);
  
  return <div>Loading alumni account...</div>;
}