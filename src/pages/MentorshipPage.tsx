import { useState } from 'react';
import { Users, Award, TrendingUp, MessageSquare, CheckCircle, Plus, Target, FolderOpen, HelpCircle, Star, Clock, Calendar, BarChart3 } from 'lucide-react';
import { mockProfiles, mockMentorshipRequests, mockMentorshipTasks, mockMentorshipProjects, mockMentorshipDoubts, mockMentorshipFeedback, mockDailyProgress, mockProjectUpdates } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
import { TaskStatus } from '../types';

export function MentorshipPage() {
  const { profile, user } = useAuth();
  const [mentorshipRequests, setMentorshipRequests] = useState(mockMentorshipRequests);
  const [selectedMentor, setSelectedMentor] = useState<string | null>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [mentorshipTasks, setMentorshipTasks] = useState(mockMentorshipTasks);
  const [mentorshipProjects] = useState(mockMentorshipProjects);
  const [mentorshipDoubts] = useState(mockMentorshipDoubts);
  const [mentorshipFeedback] = useState(mockMentorshipFeedback);
  const [dailyProgress] = useState(mockDailyProgress);
  const [projectUpdates] = useState(mockProjectUpdates);
  const [selectedMentee, setSelectedMentee] = useState<string | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '' });

  const isMentor = user?.role === 'alumni' || user?.role === 'faculty';

  // Debugging - log whenever user or profile changes
  console.log("=== MentorshipPage Render ===");
  console.log("User:", user);
  console.log("Profile:", profile);
  console.log("Is Mentor?", isMentor);
  console.log("User role:", user?.role);

  const calculateMatchScore = (mentorProfile: typeof mockProfiles[0]) => {
    if (!profile || !profile.skills || !mentorProfile.skills) return 0;

    let score = 0;
    const mySkills = profile.skills.map((s) => s.skillName.toLowerCase());
    const mentorSkills = mentorProfile.skills.map((s) => s.skillName.toLowerCase());

    const skillOverlap = mySkills.filter((skill) => mentorSkills.includes(skill)).length;
    score += skillOverlap * 0.3;

    if (mentorProfile.graduationYear && profile.graduationYear) {
      const yearDiff = Math.abs(mentorProfile.graduationYear - profile.graduationYear);
      if (yearDiff >= 3 && yearDiff <= 10) {
        score += 0.3;
      }
    }

    if (mentorProfile.department === profile.department) {
      score += 0.2;
    }

    if (mentorProfile.interests && profile.interests) {
      const myInterests = profile.interests.map((i) => i.toLowerCase());
      const mentorInterests = mentorProfile.interests.map((i) => i.toLowerCase());
      const interestOverlap = myInterests.filter((interest) =>
        mentorInterests.includes(interest)
      ).length;
      score += interestOverlap * 0.2;
    }

    return Math.min(score, 1);
  };

  const potentialMentors = mockProfiles
    .filter(
      (p) =>
        p.id !== profile?.id &&
        (p.graduationYear ?? 0) < (profile?.graduationYear ?? 9999) &&
        !mentorshipRequests.some((req) => req.mentorId === p.id && req.studentId === profile?.id)
    )
    .map((mentor) => ({
      ...mentor,
      matchScore: calculateMatchScore(mentor),
    }))
    .sort((a, b) => b.matchScore - a.matchScore);

  const activeMentorships = mentorshipRequests.filter(
    (req) => req.studentId === profile?.id && req.status === 'active'
  );

  const mentorRequests = isMentor ? mentorshipRequests.filter(
    (req) => req.mentorId === profile?.id
  ) : [];

  // Add debugging
  console.log("Current profile:", profile);
  console.log("Is mentor?", isMentor);
  console.log("All mentorship requests:", mentorshipRequests);
  console.log("Filtered mentor requests:", mentorRequests);

  const pendingMentorRequests = mentorRequests.filter(req => req.status === 'pending');
  const activeMentees = mentorRequests.filter(req => req.status === 'active');
  
  console.log("Pending mentor requests:", pendingMentorRequests);
  console.log("Active mentees:", activeMentees);

  const handleRequestMentorship = () => {
    if (!selectedMentor || !profile) return;

    const mentor = mockProfiles.find((p) => p.id === selectedMentor);
    if (!mentor) return;

    const newRequest = {
      id: Math.random().toString(36).substr(2, 9),
      studentId: profile.id,
      mentorId: selectedMentor,
      status: 'pending' as const,
      matchScore: calculateMatchScore(mentor),
      message: requestMessage,
      createdAt: new Date().toISOString(),
    };

    setMentorshipRequests([...mentorshipRequests, newRequest]);
    setSelectedMentor(null);
    setRequestMessage('');
  };

  const handleCreateTask = () => {
    if (!selectedMentee || !profile || !newTask.title) return;

    const newTaskObj = {
      id: Math.random().toString(36).substr(2, 9),
      mentorshipId: activeMentees.find(m => m.studentId === selectedMentee)?.id || '',
      mentorId: profile.id,
      studentId: selectedMentee,
      title: newTask.title,
      description: newTask.description,
      status: 'pending' as TaskStatus,
      dueDate: newTask.dueDate || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setMentorshipTasks([...mentorshipTasks, newTaskObj]);
    setNewTask({ title: '', description: '', dueDate: '' });
    setShowTaskModal(false);
  };

  const handleUpdateTaskStatus = (taskId: string, status: TaskStatus) => {
    setMentorshipTasks(tasks =>
      tasks.map(task =>
        task.id === taskId
          ? { ...task, status, updatedAt: new Date().toISOString() }
          : task
      )
    );
  };


  return (
    <div>
      {/* Debug Info Banner */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <HelpCircle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Debug Info:</strong> User Role: <code className="bg-yellow-100 px-1 rounded">{user?.role || 'undefined'}</code> | 
              Profile ID: <code className="bg-yellow-100 px-1 rounded">{profile?.id || 'undefined'}</code> | 
              Is Mentor: <code className="bg-yellow-100 px-1 rounded">{isMentor ? 'Yes' : 'No'}</code>
            </p>
          </div>
        </div>
      </div>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {isMentor ? 'Mentorship Management' : 'Mentorship Program'}
      </h1>

      {isMentor ? (
        // Mentor view
        <div>
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {activeMentees.length}
                  </p>
                  <p className="text-sm text-gray-600">Active Mentees</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <MessageSquare className="text-yellow-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {pendingMentorRequests.length}
                  </p>
                  <p className="text-sm text-gray-600">Pending Requests</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {mentorRequests.filter(req => req.status === 'completed').length}
                  </p>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
              </div>
            </div>
          </div>

          {pendingMentorRequests.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Pending Mentorship Requests</h2>
              <div className="space-y-4">
                {pendingMentorRequests.map((request) => {
                  const student = mockProfiles.find((p) => p.id === request.studentId);
                  if (!student) return null;

                  return (
                    <div
                      key={request.id}
                      className="bg-white rounded-xl border border-gray-200 p-6"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          {student.avatarUrl ? (
                            <img
                              src={student.avatarUrl}
                              alt={`${student.firstName} ${student.lastName}`}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-semibold">
                              {student.firstName[0]}
                              {student.lastName[0]}
                            </div>
                          )}

                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-900">
                              {student.firstName} {student.lastName}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {student.department} • Class of {student.graduationYear}
                            </p>
                            {request.message && (
                              <p className="text-sm text-gray-700 mb-3 italic">
                                "{request.message}"
                              </p>
                            )}
                            <div className="flex flex-wrap gap-1">
                              {student.skills.slice(0, 4).map((skill) => (
                                <span
                                  key={skill.id}
                                  className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                                >
                                  {skill.skillName}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setMentorshipRequests(requests =>
                                requests.map(req =>
                                  req.id === request.id
                                    ? { ...req, status: 'active' as const }
                                    : req
                                )
                              );
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => {
                              setMentorshipRequests(requests =>
                                requests.map(req =>
                                  req.id === request.id
                                    ? { ...req, status: 'rejected' as const }
                                    : req
                                )
                              );
                            }}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Alumni Profile & Feedback Section */}
          {profile && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">My Mentorship Profile & Feedback</h2>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start space-x-6 mb-6">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={`${profile.firstName} ${profile.lastName}`}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-semibold">
                      {profile.firstName?.[0] || 'U'}
                      {profile.lastName?.[0] || 'U'}
                    </div>
                  )}
                
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {profile?.firstName} {profile?.lastName}
                  </h3>
                  <p className="text-gray-600 mb-3">
                    {profile?.department} • Class of {profile?.graduationYear}
                  </p>
                  {profile?.currentEmployer && (
                    <p className="text-gray-700 mb-3">
                      Currently at <span className="font-semibold">{profile.currentEmployer}</span>
                    </p>
                  )}
                  {profile?.bio && (
                    <p className="text-gray-700 mb-4">{profile.bio}</p>
                  )}
                  
                  <div className="flex items-center space-x-6 mb-4">
                    <div className="flex items-center space-x-2">
                      <Star className="text-yellow-500 fill-yellow-500" size={24} />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {mentorshipFeedback.length > 0
                            ? (mentorshipFeedback.reduce((sum, fb) => sum + fb.rating, 0) / mentorshipFeedback.length).toFixed(1)
                            : '0.0'}
                        </p>
                        <p className="text-xs text-gray-600">Average Rating</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="text-blue-600" size={24} />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{mentorshipFeedback.length}</p>
                        <p className="text-xs text-gray-600">Reviews</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Users className="text-green-600" size={24} />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{activeMentees.length}</p>
                        <p className="text-xs text-gray-600">Active Mentees</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {profile?.skills.map((skill) => (
                      <span
                        key={skill.id}
                        className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
                      >
                        {skill.skillName}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Feedback Reviews */}
              {mentorshipFeedback.length > 0 && (
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-semibold text-lg text-gray-900 mb-4 flex items-center space-x-2">
                    <Star className="text-yellow-500" size={20} />
                    <span>Student Feedback</span>
                  </h4>
                  <div className="space-y-4">
                    {mentorshipFeedback.map((feedback) => {
                      const student = mockProfiles.find((p) => p.id === feedback.studentId);
                      if (!student) return null;

                      return (
                        <div key={feedback.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              {student.avatarUrl ? (
                                <img
                                  src={student.avatarUrl}
                                  alt={`${student.firstName} ${student.lastName}`}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                                  {student.firstName[0]}
                                  {student.lastName[0]}
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {student.firstName} {student.lastName}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {new Date(feedback.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={16}
                                  className={i < feedback.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-700 text-sm">{feedback.feedbackText}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
          )}

          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Manage Mentees</h2>
            {activeMentees.length > 0 ? (
              <div className="space-y-6">
                {activeMentees.map((mentorship) => {
                  const student = mockProfiles.find((p) => p.id === mentorship.studentId);
                  if (!student) return null;

                  const menteeTasks = mentorshipTasks.filter(task => task.studentId === student.id);
                  const menteeProjects = mentorshipProjects.filter(project => project.studentId === student.id);
                  const menteeDoubts = mentorshipDoubts.filter(doubt => doubt.studentId === student.id);

                  return (
                    <div
                      key={mentorship.id}
                      className="bg-white rounded-xl border border-gray-200 p-6"
                    >
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-start space-x-4">
                          {student.avatarUrl ? (
                            <img
                              src={student.avatarUrl}
                              alt={`${student.firstName} ${student.lastName}`}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-semibold">
                              {student.firstName[0]}
                              {student.lastName[0]}
                            </div>
                          )}

                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-900">
                              {student.firstName} {student.lastName}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {student.department} • Class of {student.graduationYear}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {student.skills.slice(0, 4).map((skill) => (
                                <span
                                  key={skill.id}
                                  className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                                >
                                  {skill.skillName}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedMentee(student.id);
                              setShowTaskModal(true);
                            }}
                            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                          >
                            <Plus size={18} />
                            <span>Add Task</span>
                          </button>
                          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                            <MessageSquare size={18} />
                            <span>Message</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid gap-6 md:grid-cols-3">
                        {/* Tasks Section */}
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Target className="text-blue-600" size={20} />
                            <h4 className="font-semibold text-gray-900">Tasks</h4>
                          </div>
                          {menteeTasks.length > 0 ? (
                            <div className="space-y-2">
                              {menteeTasks.slice(0, 3).map((task) => (
                                <div key={task.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                                    <p className={`text-xs ${
                                      task.status === 'completed' ? 'text-green-600' :
                                      task.status === 'in_progress' ? 'text-blue-600' :
                                      task.status === 'overdue' ? 'text-red-600' : 'text-gray-600'
                                    }`}>
                                      {task.status.replace('_', ' ')}
                                    </p>
                                  </div>
                                  <select
                                    value={task.status}
                                    onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value as TaskStatus)}
                                    className="text-xs border border-gray-300 rounded px-2 py-1"
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="overdue">Overdue</option>
                                  </select>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">No tasks assigned</p>
                          )}
                        </div>

                        {/* Projects Section */}
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <FolderOpen className="text-purple-600" size={20} />
                            <h4 className="font-semibold text-gray-900">Projects</h4>
                          </div>
                          {menteeProjects.length > 0 ? (
                            <div className="space-y-2">
                              {menteeProjects.slice(0, 2).map((project) => (
                                <div key={project.id} className="p-2 bg-gray-50 rounded">
                                  <p className="text-sm font-medium text-gray-900">{project.title}</p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-purple-600 h-2 rounded-full"
                                        style={{ width: `${project.progress}%` }}
                                      />
                                    </div>
                                    <span className="text-xs text-gray-600">{project.progress}%</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">No projects</p>
                          )}
                        </div>

                        {/* Doubts Section */}
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <HelpCircle className="text-orange-600" size={20} />
                            <h4 className="font-semibold text-gray-900">Doubts</h4>
                          </div>
                          {menteeDoubts.length > 0 ? (
                            <div className="space-y-2">
                              {menteeDoubts.slice(0, 2).map((doubt) => (
                                <div key={doubt.id} className="p-2 bg-gray-50 rounded">
                                  <p className="text-sm text-gray-900 line-clamp-2">{doubt.question}</p>
                                  <p className={`text-xs mt-1 ${
                                    doubt.status === 'resolved' ? 'text-green-600' : 'text-orange-600'
                                  }`}>
                                    {doubt.status}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">No doubts</p>
                          )}
                        </div>
                      </div>

                      {/* Daily Progress Section */}
                      <div className="border-t border-gray-200 mt-6 pt-6">
                        <div className="flex items-center space-x-2 mb-4">
                          <Clock className="text-indigo-600" size={20} />
                          <h4 className="font-semibold text-gray-900">Daily Progress</h4>
                        </div>
                        {dailyProgress.filter(p => p.studentId === student.id).length > 0 ? (
                          <div className="space-y-3">
                            {dailyProgress
                              .filter(p => p.studentId === student.id)
                              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                              .slice(0, 3)
                              .map((progress) => (
                                <div key={progress.id} className="bg-indigo-50 rounded-lg p-4">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                      <Calendar className="text-indigo-600" size={16} />
                                      <p className="text-sm font-semibold text-gray-900">
                                        {new Date(progress.date).toLocaleDateString('en-US', { 
                                          weekday: 'short', 
                                          month: 'short', 
                                          day: 'numeric' 
                                        })}
                                      </p>
                                    </div>
                                    <div className="flex items-center space-x-1 text-indigo-700">
                                      <Clock size={14} />
                                      <span className="text-xs font-medium">{progress.hoursWorked}h worked</span>
                                    </div>
                                  </div>
                                  <p className="text-sm text-gray-700 mb-2">{progress.summary}</p>
                                  {progress.tasksCompleted && progress.tasksCompleted.length > 0 && (
                                    <div className="mb-2">
                                      <p className="text-xs font-semibold text-gray-700 mb-1">Completed:</p>
                                      <ul className="list-disc list-inside space-y-1">
                                        {progress.tasksCompleted.map((task, idx) => (
                                          <li key={idx} className="text-xs text-gray-600">{task}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  {progress.challenges && (
                                    <div className="mt-2 p-2 bg-orange-50 rounded border-l-2 border-orange-400">
                                      <p className="text-xs font-semibold text-orange-800">Challenge:</p>
                                      <p className="text-xs text-orange-700">{progress.challenges}</p>
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No progress updates yet</p>
                        )}
                      </div>

                      {/* Project Updates Section */}
                      {menteeProjects.length > 0 && (
                        <div className="border-t border-gray-200 mt-6 pt-6">
                          <div className="flex items-center space-x-2 mb-4">
                            <BarChart3 className="text-purple-600" size={20} />
                            <h4 className="font-semibold text-gray-900">Project Updates</h4>
                          </div>
                          {projectUpdates
                            .filter(update => menteeProjects.some(p => p.id === update.projectId))
                            .length > 0 ? (
                            <div className="space-y-3">
                              {projectUpdates
                                .filter(update => menteeProjects.some(p => p.id === update.projectId))
                                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                .slice(0, 3)
                                .map((update) => {
                                  const project = menteeProjects.find(p => p.id === update.projectId);
                                  return (
                                    <div key={update.id} className="bg-purple-50 rounded-lg p-4">
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                          <p className="text-sm font-semibold text-purple-900">{update.title}</p>
                                          <p className="text-xs text-purple-600 mt-1">
                                            Project: {project?.title}
                                          </p>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                          {new Date(update.createdAt).toLocaleDateString()}
                                        </p>
                                      </div>
                                      <p className="text-sm text-gray-700">{update.description}</p>
                                      {update.attachments && update.attachments.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-2">
                                          {update.attachments.map((attachment, idx) => (
                                            <span key={idx} className="text-xs bg-white px-2 py-1 rounded border border-purple-200">
                                              📎 {attachment}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">No project updates yet</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                <div className="mb-4 flex justify-center">
                  <Users className="text-blue-600" size={48} />
                </div>
                <p className="text-gray-700 mb-2">You don't have any active mentees yet.</p>
                <p className="text-gray-500 text-sm">Accept mentorship requests to start mentoring students.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Student view (existing content)
        <div>
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {activeMentorships.length}
                  </p>
                  <p className="text-sm text-gray-600">Active Mentorships</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Award className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {potentialMentors.length}
                  </p>
                  <p className="text-sm text-gray-600">Available Mentors</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="text-purple-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {activeMentorships.length > 0
                      ? Math.round(
                          activeMentorships.reduce((sum, req) => sum + (req.matchScore || 0), 0) /
                            activeMentorships.length *
                            100
                        )
                      : 0}
                    %
                  </p>
                  <p className="text-sm text-gray-600">Avg Match Score</p>
                </div>
              </div>
            </div>
          </div>

      {activeMentorships.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">My Mentors</h2>
          <div className="space-y-4">
            {activeMentorships.map((mentorship) => {
              const mentor = mockProfiles.find((p) => p.id === mentorship.mentorId);
              if (!mentor) return null;

              return (
                <div
                  key={mentorship.id}
                  className="bg-white rounded-xl border border-gray-200 p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {mentor.avatarUrl ? (
                        <img
                          src={mentor.avatarUrl}
                          alt={`${mentor.firstName} ${mentor.lastName}`}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-semibold">
                          {mentor.firstName[0]}
                          {mentor.lastName[0]}
                        </div>
                      )}

                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {mentor.firstName} {mentor.lastName}
                          </h3>
                          <CheckCircle className="text-green-600" size={20} />
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {mentor.department} • {mentor.currentEmployer}
                        </p>
                        {mentorship.matchScore && (
                          <div className="flex items-center space-x-2 mb-3">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${mentorship.matchScore * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              {Math.round(mentorship.matchScore * 100)}% match
                            </span>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1">
                          {mentor.skills.slice(0, 4).map((skill) => (
                            <span
                              key={skill.id}
                              className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                            >
                              {skill.skillName}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                      <MessageSquare size={18} />
                      <span>Message</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recommended Mentors</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {potentialMentors.map((mentor) => (
            <div
              key={mentor.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-4 mb-4">
                {mentor.avatarUrl ? (
                  <img
                    src={mentor.avatarUrl}
                    alt={`${mentor.firstName} ${mentor.lastName}`}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-semibold">
                    {mentor.firstName[0]}
                    {mentor.lastName[0]}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {mentor.firstName} {mentor.lastName}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {mentor.department}
                    {mentor.currentEmployer && ` • ${mentor.currentEmployer}`}
                  </p>

                  <div className="flex items-center space-x-2 mb-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${mentor.matchScore * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {Math.round(mentor.matchScore * 100)}% match
                    </span>
                  </div>
                </div>
              </div>

              {mentor.bio && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{mentor.bio}</p>
              )}

              <div className="flex flex-wrap gap-1 mb-4">
                {mentor.skills.slice(0, 4).map((skill) => (
                  <span
                    key={skill.id}
                    className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                  >
                    {skill.skillName}
                  </span>
                ))}
              </div>

              <button
                onClick={() => setSelectedMentor(mentor.id)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Request Mentorship
              </button>
            </div>
          ))}
        </div>
      </div>
        </div>
      )}

      {!isMentor && selectedMentor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Request Mentorship</h3>
            <p className="text-sm text-gray-600 mb-4">
              Tell your potential mentor why you'd like them to guide you and what you hope to
              learn.
            </p>
            <textarea
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              placeholder="I would love to learn more about..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-4"
              rows={4}
            />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setSelectedMentor(null);
                  setRequestMessage('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestMentorship}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Assign New Task</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter task title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Describe the task requirements"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date (Optional)</label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowTaskModal(false);
                  setNewTask({ title: '', description: '', dueDate: '' });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTask}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Assign Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}