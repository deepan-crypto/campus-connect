export type UserRole = 'student' | 'alumni' | 'faculty' | 'admin';

export type ProfileVisibility = 'public' | 'connections' | 'private';

export type ConnectionStatus = 'pending' | 'accepted' | 'rejected';

export type MentorshipStatus = 'pending' | 'matched' | 'active' | 'completed' | 'rejected';

export type EventType = 'career' | 'workshop' | 'cultural' | 'sports' | 'academic' | 'social';

export type RsvpStatus = 'going' | 'interested' | 'not_going';

export type PostType = 'announcement' | 'update' | 'event';

export type NotificationType = 'connection' | 'mentorship' | 'event' | 'post';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';

export type ProjectStatus = 'planning' | 'in_progress' | 'completed' | 'on_hold';

export type DoubtStatus = 'open' | 'resolved' | 'in_progress';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: string;
}

export interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  bio?: string;
  department?: string;
  graduationYear?: number;
  currentEmployer?: string;
  profileVisibility: ProfileVisibility;
  avatarUrl?: string;
  skills: Skill[];
  interests: string[];
}

export interface Skill {
  id: string;
  skillName: string;
  endorsements: number;
}

export interface Connection {
  id: string;
  requesterId: string;
  receiverId: string;
  status: ConnectionStatus;
  requester?: Profile;
  receiver?: Profile;
  createdAt: string;
}

export interface MentorAvailability {
  id: string;
  userId: string;
  available: boolean;
  maxMentees: number;
  currentMentees: number;
}

export interface MentorshipRequest {
  id: string;
  studentId: string;
  mentorId?: string;
  status: MentorshipStatus;
  matchScore?: number;
  message?: string;
  student?: Profile;
  mentor?: Profile;
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  eventType: EventType;
  location: string;
  startDate: string;
  endDate?: string;
  capacity?: number;
  bannerUrl?: string;
  createdBy: string;
  creator?: Profile;
  tags: string[];
  rsvpCount: {
    going: number;
    interested: number;
  };
  userRsvp?: RsvpStatus;
  averageRating?: number;
}

export interface EventRsvp {
  id: string;
  eventId: string;
  userId: string;
  status: RsvpStatus;
}

export interface EventFeedback {
  id: string;
  eventId: string;
  userId: string;
  rating: number;
  feedbackText?: string;
}

export interface Post {
  id: string;
  authorId: string;
  author?: Profile;
  content: string;
  postType: PostType;
  likesCount: number;
  commentsCount: number;
  userLiked: boolean;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  user?: Profile;
  content: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface MentorshipTask {
  id: string;
  mentorshipId: string;
  mentorId: string;
  studentId: string;
  title: string;
  description: string;
  status: TaskStatus;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MentorshipProject {
  id: string;
  mentorshipId: string;
  mentorId: string;
  studentId: string;
  title: string;
  description: string;
  status: ProjectStatus;
  progress: number; // 0-100
  milestones: ProjectMilestone[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMilestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate?: string;
}

export interface MentorshipDoubt {
  id: string;
  mentorshipId: string;
  studentId: string;
  mentorId: string;
  question: string;
  answer?: string;
  status: DoubtStatus;
  createdAt: string;
  answeredAt?: string;
}

export interface MentorshipFeedback {
  id: string;
  mentorshipId: string;
  studentId: string;
  mentorId: string;
  rating: number; // 1-5
  feedbackText: string;
  createdAt: string;
}

export interface DailyProgress {
  id: string;
  mentorshipId: string;
  studentId: string;
  date: string;
  summary: string;
  hoursWorked: number;
  tasksCompleted: string[];
  challenges?: string;
  createdAt: string;
}

export interface ProjectUpdate {
  id: string;
  projectId: string;
  studentId: string;
  title: string;
  description: string;
  attachments?: string[];
  createdAt: string;
}
