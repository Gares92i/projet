import type { Database } from '@/integrations/supabase/types';

// Définition des rôles en utilisant les mêmes valeurs que dans les filtres
export type TeamMemberRole =
  | 'architecte'
  | 'chef_de_projet'
  | 'ingenieur'
  | 'designer'
  | 'entreprise'
  | 'assistant'
  | 'dessinateur'
  | 'autre';
   // Valeur par défaut

// Pour les onglets UI (en anglais)
// Pour les onglets UI (en anglais) - COMPLÉTER AVEC TOUS LES RÔLES
export const roleToTabMapping = {
  'architecte': 'architects',
  'chef_de_projet': 'project_managers',
  'ingenieur': 'engineers',
  'designer': 'designers',
  'entreprise': 'contractors',
  'assistant': 'assistants',
  'dessinateur': 'draftsmen',
  'autre': 'others'
};

// Pour l'affichage (en français) - COMPLÉTER AVEC TOUS LES RÔLES
export const roleLabels = {
  'architecte': 'Architecte',
  'chef_de_projet': 'Chef de projet',
  'ingenieur': 'Ingénieur',
  'designer': 'Designer',
  'entreprise': 'Entreprise',
  'assistant': 'Assistant(e)',
  'dessinateur': 'Dessinateur',
  'autre': 'Autre'
};
// Interface commune pour tous les membres d'équipe (rendre les champs optionnels pour éviter les erreurs)
export interface TeamMemberProfile {
  first_name?: string;
  last_name?: string;
  email?: string;
  avatar_url?: string;
  title?: string;
  company?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: TeamMemberRole;
  email: string;
  phone: string;
  avatar: string;
  status: 'active' | 'inactive';
  team_id: string;
  user_id: string;
  activity?: string;
  created_at?: string;   // Ajouter ces propriétés
  profile?: TeamMemberProfile;        // pour résoudre les erreurs
  projects?: string[];   // dans normalizeTeamMember
}

// Type pour l'ajout d'un nouveau membre
export type TeamMemberInsert = Omit<TeamMember, 'id' | 'created_at'>;

// Pour compatibilité avec le code existant (à utiliser uniquement pour transition)
export interface LegacyTeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string; // Plus permissif (string au lieu de TeamMemberRole)
  avatar?: string;
  status?: string;
  activity?: string;
  projects?: string[];
  team_id: string;
  user_id: string;
  created_at?: string;
}

// Types pour la table teams
export type Team = Database['public']['Tables']['teams']['Row'];
export type TeamInsert = Database['public']['Tables']['teams']['Insert'];
export type TeamMemberStatus = 'active' | 'inactive';
// Fonctions utilitaires
export function getInitials(name: string | undefined): string {
  if (!name) return "??";
  return name
    .split(' ')
    .filter(part => part && part.length > 0)
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

// Normalisation des données TeamMember (valeurs par défaut pour éviter les null)
export function normalizeTeamMember(member: any): TeamMember {
  return {
    id: member.id || "",
    name: member.name || "",
    email: member.email || "",
    phone: member.phone || "",
    role: (member.role as TeamMemberRole) || "autre",
    activity: member.activity || "",
    avatar: member.avatar || "",
    status: (member.status as TeamMemberStatus) || "active",
    team_id: member.team_id || "",
    user_id: member.user_id || "",
    created_at: member.created_at || new Date().toISOString(),
    profile: member.profile || member.profiles || undefined,
    projects: member.projects || []
  };
}

// Convertisseurs entre formats
export function convertToLegacyMember(member: TeamMember): LegacyTeamMember {
  return {
    id: member.id,
    name: member.name,
    email: member.email,
    phone: member.phone,
    role: member.role,
    activity: member.activity,
    projects: member.projects,
    avatar: member.avatar,
    status: member.status,
    team_id: member.team_id,
    user_id: member.user_id,
    created_at: member.created_at
  };
}

// Supabase team member interface for handling database types
export interface SupabaseTeamMember {
  id: string;
  user_id: string;
  team_id: string;
  role: string;
  created_at: string;
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  status?: string;
}
