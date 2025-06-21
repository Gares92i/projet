// Types pour l'authentification
export type UserRole = 'admin' | 'user' | 'guest' | 'architect' | 'project-manager';

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
  title?: string;
  company?: string;
  created_at: string;
  updated_at: string;
  roles?: UserRole[];
}

// Types pour les projets
export interface ProjectCardProps {
  id: string;
  name: string;
  client: string;
  clientId: string;
  location: string;
  startDate?: string;
  endDate?: string;
  status: 'planning' | 'design' | 'construction' | 'completed' | 'on-hold';
  progress: number;
  teamSize: number;
  teamMembers: TeamMemberInfo[];
  imageUrl?: string;
  projectType?: string;
  projectArea?: number;
  roomCount?: number;
  milestones?: Milestone[];
}

// Types pour les membres d'équipe
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  avatar?: string;
  projects?: string[];
}

export interface TeamMemberInfo {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

// Types pour les clients
export interface ClientData {
  id: string;
  name: string;
  contact?: string;
  email?: string;
  phone?: string;
  address?: string;
  projects?: string[];
}

// Types pour les jalons de projet
export interface Milestone {
  id: string;
  title: string;
  date: string;
  completed: boolean;
  description?: string;
}

// Types pour les tâches
export interface TaskProgress {
  id: string;
  number: string;
  title: string;
  progress: number;
  color?: string;
}

// Types pour les rapports
export interface ReportData {
  id: string;
  title: string;
  projectId: string;
  date: string;
  author: string;
  status: 'draft' | 'submitted' | 'approved';
  sections: ReportSection[];
}

export interface ReportSection {
  id: string;
  title: string;
  content: string;
  images?: string[];
  progress?: number;
}

// Types pour les annotations
export interface Annotation {
  id: string;
  imageId: string;
  x: number;
  y: number;
  text: string;
  color: string;
  author: string;
  timestamp: string;
}