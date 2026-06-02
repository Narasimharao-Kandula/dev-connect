export interface User {
  id: string;
  email: string;
  name: string;
  country: string | null;
  timezone: string | null;
  avatar: string | null;
  availability: 'Available' | 'Busy' | 'LookingForTeam';
  role: 'User' | 'Admin';
  emailVerified: boolean;
  onboardingCompleted: boolean;
  lastActive: string;
  responseRate: number;
  createdAt: string;
  profile: Profile | null;
  skills: UserSkill[];
  ownedProjects?: ProjectSummary[];
}

export interface Profile {
  id: string;
  userId: string;
  bio: string | null;
  experience: number | null;
  githubUrl: string | null;
  portfolio: string | null;
  remoteOnly: boolean;
  openToCollab: boolean;
}

export interface Skill {
  id: string;
  name: string;
}

export interface UserSkill {
  userId: string;
  skillId: string;
  skill: Skill;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  owner: { id: string; name: string; email?: string; avatar?: string | null };
  status: 'Planning' | 'InProgress' | 'Completed' | 'Archived';
  createdAt: string;
  skills: ProjectSkill[];
  team: Team | null;
}

export interface Review {
  id: string;
  reviewerId: string;
  reviewer: { id: string; name: string; avatar: string | null };
  reviewedId: string;
  rating: number;
  comment: string | null;
  projectId: string | null;
  project: { id: string; name: string } | null;
  createdAt: string;
}

export interface ReviewResponse {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  categoryAverages?: {
    communication: number | null;
    technicalSkill: number | null;
    reliability: number | null;
    teamwork: number | null;
  };
}

export interface ProjectSummary {
  id: string;
  name: string;
  status: string;
}

export interface ProjectSkill {
  projectId: string;
  skillId: string;
  skill: Skill;
}

export interface CollaborationRequest {
  id: string;
  senderId: string;
  sender: { id: string; name: string; avatar: string | null; country?: string | null };
  receiverId: string;
  receiver: { id: string; name: string; avatar: string | null; country?: string | null };
  message: string | null;
  status: 'Pending' | 'Accepted' | 'Rejected';
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  metadata: any;
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  createdAt: string;
  updatedAt: string;
  participants: ConversationParticipant[];
  messages: Message[];
}

export interface ConversationParticipant {
  userId: string;
  user: { id: string; name: string; avatar: string | null };
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: { id: string; name: string; avatar: string | null };
  content: string;
  attachmentUrl: string | null;
  read: boolean;
  createdAt: string;
}

export interface Team {
  id: string;
  projectId: string;
  project?: { id: string; name: string };
  members: TeamMember[];
  messages?: GroupMessage[];
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  user: { id: string; name: string; avatar: string | null };
  role: string;
}

export interface GroupMessage {
  id: string;
  teamId: string;
  senderId: string;
  sender: { id: string; name: string; avatar: string | null };
  content: string;
  createdAt: string;
}

export interface PlatformStats {
  totalUsers: number;
  totalCountries: number;
  totalProjects: number;
  totalTeams: number;
  activeThisWeek: number;
}

export interface DeletionStatus {
  scheduled: boolean;
  permanentDeletionDate?: string;
  daysLeft?: number;
  canCancel?: boolean;
  message?: string;
}
