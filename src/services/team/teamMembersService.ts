import { supabase } from '@/integrations/supabase/client';
import { TeamMember, normalizeTeamMember ,TeamMemberRole} from '@/types/team';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
interface ReportParticipant {
  contact: string;
  email: string;
  phone?: string;
  role?: string;
  id?: string;
}
// Correction de la requête Supabase pour récupérer les données de profil
export const getTeamMembers = async (teamId: string): Promise<TeamMember[]> => {
  try {
    if (!teamId) {
      console.warn("getTeamMembers: teamId manquant");
      return [];
    }

    // Requête correcte - joindre la table profiles
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        *,
        profiles:profiles(*)
      `)
      .eq('team_id', teamId);

    if (error) {
      console.error('Erreur lors de la récupération des membres:', error);

      // Utilisation du cache local
      const cachedMembers = localStorage.getItem(`team_members_${teamId}`);
      if (cachedMembers) {
        console.log("Utilisation des données en cache");
        try {
          return JSON.parse(cachedMembers).map(normalizeTeamMember);
        } catch (parseError) {
          console.error("Erreur de parsing du cache:", parseError);
        }
      }

      return []; // Renvoyer un tableau vide en cas d'erreur
    }

    // Mise à jour du cache
    try {
      localStorage.setItem(`team_members_${teamId}`, JSON.stringify(data));
    } catch (storageError) {
      console.warn("Impossible de mettre à jour le cache local:", storageError);
    }
    
    // Normaliser les données avant de les renvoyer
    return (data || []).map(normalizeTeamMember);
  } catch (error) {
    console.error('Erreur lors de la récupération des membres:', error);
    return [];
  }
};

// Correction de la fonction createTeamMember pour validation des données
export const createTeamMember = async (member: Partial<TeamMember>): Promise<TeamMember | null> => {
  try {
    if (!member.team_id) {
      toast.error("Équipe non spécifiée");
      return null;
    }
    
    // Validation des champs obligatoires
    if (!member.name) {
      toast.error("Le nom est obligatoire");
      return null;
    }
    
    if (!member.email) {
      toast.error("L'email est obligatoire");
      return null;
    }
    
    if (!member.role) {
      toast.error("Le rôle est obligatoire");
      return null;
    }
    
    // Préparation des données avec valeurs par défaut sécurisées
    const teamMemberData = {
      id: member.id || uuidv4(),
      name: member.name,
      email: member.email,
      phone: member.phone || null,
      role: member.role,
      avatar: member.avatar || null,
      status: member.status || 'active',
      team_id: member.team_id,
      user_id: member.user_id || uuidv4()
    };
    
    // Enregistrement dans Supabase avec gestion d'erreur améliorée
    const { data, error } = await supabase
      .from('team_members')
      .insert([teamMemberData])
      .select()
      .single();
    
    if (error) {
      console.error('Erreur lors de la création du membre:', error);
      toast.error("Impossible de créer le membre: " + (error.message || "erreur inconnue"));
      return null;
    }

    // Mise à jour du cache local avec gestion d'erreur
    try {
      await updateLocalStorage(member.team_id);
    } catch (cacheError) {
      console.warn("Erreur de mise à jour du cache:", cacheError);
    }
    
    toast.success("Membre ajouté avec succès");
    return normalizeTeamMember(data);
  } catch (error) {
    console.error('Erreur lors de la création du membre:', error);
    toast.error("Erreur inattendue lors de la création du membre");
    return null;
  }
};

// Mettre à jour un membre existant
export const updateTeamMember = async (member: TeamMember): Promise<TeamMember | null> => {
  try {
    if (!member.id || !member.team_id) {
      toast.error("Données de membre incomplètes");
      return null;
    }
    
    const { data, error } = await supabase
      .from('team_members')
      .update({
        name: member.name,
        email: member.email,
        phone: member.phone || null,
        role: member.role,
        avatar: member.avatar || null,
        status: member.status || 'active',
      })
      .eq('id', member.id)
      .select()
      .single();
    
    if (error) {
      console.error('Erreur lors de la mise à jour du membre:', error);
      toast.error("Impossible de mettre à jour le membre");
      throw error;
    }

    // Mise à jour du cache local
    updateLocalStorage(member.team_id);
    
    toast.success("Membre mis à jour avec succès");
    return normalizeTeamMember(data);
  } catch (error) {
    console.error('Erreur:', error);
    return null;
  }
};

// Supprimer un membre
export const deleteTeamMember = async (memberId: string, teamId: string): Promise<boolean> => {
  try {
    if (!memberId || !teamId) {
      toast.error("Identifiant de membre ou d'équipe manquant");
      return false;
    }
    
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId);
    
    if (error) {
      console.error('Erreur lors de la suppression du membre:', error);
      toast.error("Impossible de supprimer le membre");
      throw error;
    }

    // Mise à jour du cache local
    updateLocalStorage(teamId);
    
    toast.success("Membre supprimé avec succès");
    return true;
  } catch (error) {
    console.error('Erreur:', error);
    return false;
  }
};

// Fonction auxiliaire pour mettre à jour le stockage local
const updateLocalStorage = async (teamId: string) => {
  try {
    if (!teamId) return;
    
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', teamId);
    
    if (error) {
      console.error('Erreur lors de la mise à jour du cache:', error);
    }

    if (data) {
      localStorage.setItem(`team_members_${teamId}`, JSON.stringify(data));
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du cache:', error);
  }
};

// Obtenir un membre par son ID
export const getTeamMemberById = async (memberId: string): Promise<TeamMember | null> => {
  try {
    if (!memberId) return null;
    
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('id', memberId)
      .single();
    
    if (error) {
      console.error('Erreur lors de la récupération du membre:', error);
      throw error;
    }
    
    return normalizeTeamMember(data);
  } catch (error) {
    console.error('Erreur:', error);
    return null;
  }
};

// Ajouter cette fonction de validation pour convertir les chaînes en TeamMemberRole valide
const validateTeamMemberRole = (role?: string): TeamMemberRole => {
  // Les valeurs acceptées pour TeamMemberRole (ajustez selon votre type exact)
  const validRoles: TeamMemberRole[] = [
    'architecte', 
    'chef_de_projet', 
    'ingenieur', 
    'designer',
    'entreprise', 
    'assistant', 
    'dessinateur', 
    'autre'
  ];

  // Si le rôle est défini et valide, le retourner - sinon retourner 'autre'
  if (role && validRoles.includes(role as TeamMemberRole)) {
    return role as TeamMemberRole;
  }
  return 'autre';
};

// Modifier la fonction syncReportParticipantsWithTeamMembers
export const syncReportParticipantsWithTeamMembers = async (
  participants: ReportParticipant[], 
  teamId: string
): Promise<void> => {
  try {
    if (!participants || !teamId) return;
    
    // Pour chaque participant du rapport
    for (const participant of participants) {
      // Vérifier si un membre avec le même email existe déjà
      const { data: existingMembers } = await supabase
        .from('team_members')
        .select('id')
        .eq('email', participant.email)
        .limit(1);
        
      // Si le membre n'existe pas, le créer
      if (!existingMembers || existingMembers.length === 0) {
        await createTeamMember({
          name: participant.contact,
          email: participant.email,
          phone: participant.phone,
          // Utiliser la fonction de validation ici
          role: validateTeamMemberRole(participant.role),
          team_id: teamId
        });
        console.log(`Participant ${participant.contact} ajouté comme membre d'équipe`);
      }
    }
    
    // Mettre à jour le cache local
    await updateLocalStorage(teamId);
    
  } catch (error) {
    console.error('Erreur lors de la synchronisation des participants:', error);
  }
};
