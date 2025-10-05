// This is a test component to be used for debugging the alumni mentorship page issues
// It artificially sets the user to be an alumni and checks the mentorship data
import { useAuth } from '../contexts/AuthContext';
import { MentorshipPage } from '../pages/MentorshipPage';
import { mockMentorshipRequests, mockMentorshipTasks, mockMentorshipProjects, mockMentorshipDoubts } from '../data/mockData';

export function TestMentorshipPage() {
  const { user, profile } = useAuth();

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Mentorship Page Test</h2>
      
      <div className="bg-gray-100 p-4 rounded mb-6">
        <h3 className="text-lg font-bold mb-2">Current User</h3>
        <pre className="bg-white p-2 rounded overflow-auto">
          {JSON.stringify({ user, profile }, null, 2)}
        </pre>
      </div>
      
      <div className="bg-gray-100 p-4 rounded mb-6">
        <h3 className="text-lg font-bold mb-2">Mentorship Requests</h3>
        <pre className="bg-white p-2 rounded overflow-auto">
          {JSON.stringify(
            mockMentorshipRequests.filter(req => req.mentorId === profile?.id),
            null, 
            2
          )}
        </pre>
      </div>
      
      <div className="bg-gray-100 p-4 rounded mb-6">
        <h3 className="text-lg font-bold mb-2">Active Mentees</h3>
        <pre className="bg-white p-2 rounded overflow-auto">
          {JSON.stringify(
            mockMentorshipRequests.filter(req => req.mentorId === profile?.id && req.status === 'active'),
            null, 
            2
          )}
        </pre>
      </div>
      
      <div className="bg-gray-100 p-4 rounded mb-6">
        <h3 className="text-lg font-bold mb-2">Mentorship Tasks</h3>
        <pre className="bg-white p-2 rounded overflow-auto">
          {JSON.stringify(
            mockMentorshipTasks.filter(task => task.mentorId === profile?.id),
            null, 
            2
          )}
        </pre>
      </div>

      <div className="bg-gray-100 p-4 rounded mb-6">
        <h3 className="text-lg font-bold mb-2">Mentorship Projects</h3>
        <pre className="bg-white p-2 rounded overflow-auto">
          {JSON.stringify(
            mockMentorshipProjects.filter(project => project.mentorId === profile?.id),
            null, 
            2
          )}
        </pre>
      </div>

      <div className="bg-gray-100 p-4 rounded mb-6">
        <h3 className="text-lg font-bold mb-2">Mentorship Doubts</h3>
        <pre className="bg-white p-2 rounded overflow-auto">
          {JSON.stringify(
            mockMentorshipDoubts.filter(doubt => doubt.mentorId === profile?.id),
            null, 
            2
          )}
        </pre>
      </div>
      
      <hr className="my-8" />
      
      <h3 className="text-xl font-bold mb-4">Actual Mentorship Page</h3>
      <MentorshipPage />
    </div>
  );
}