import { supabase } from '@/integrations/supabase/client';
// Importer depuis /types pour centraliser
import { TeamMember, normalizeTeamMember } from '@/types/team';
import { SupabaseTeamMember } from '@/types/team';
import { createApiClient } from "./apiClient";

// DÉPLACER CETTE FONCTION ICI, AU DÉBUT DU FICHIER
// UUID valide de secours (format UUID v4)
const FALLBACK_UUID = "00000000-0000-4000-a000-000000000000";


// Fonction pour générer un UUID v4 valide
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Remplacer COMPLÈTEMENT la fonction ensureValidUUID
const ensureValidUUID = (id: string | undefined | null): string => {
  // Si pas d'identifiant fourni, générer un nouveau
  if (!id) return generateUUID();

  // Vérifier si c'est un UUID valide
  const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  // Si ce n'est pas un UUID valide, générer un nouveau
  if (!isValidUUID) {
    console.warn("Format UUID invalide détecté:", id);
    return generateUUID();  // Toujours générer un UUID valide pour les cas invalides
  }

  return id;
};

// En haut du fichier, modifier cette ligne:
let USE_LOCAL_MODE = false; // Passez à false maintenant que RLS est désactivé

// Ajouter cette fonction pour permettre la modification externe
export const setUseLocalMode = (value: boolean) => {
  USE_LOCAL_MODE = value;
  console.log(`Mode local ${value ? 'activé' : 'désactivé'}`);
};

// Renommer la première fonction pour éviter le conflit
export const migrateLocalDataToSupabase = async () => {
  try {
    console.log("Démarrage de la migration des données...");

    // 1. Migrer les membres du localStorage vers Supabase
    const localMembers = localStorage.getItem('teamMembersData');
    if (localMembers) {
      const members = JSON.parse(localMembers);
      console.log(`Migration de ${members.length} membres vers Supabase...`);

      // Migrer chaque membre
      for (const member of members) {
        try {
          // Vérifier si le membre existe déjà
          const { data: existingMembers } = await supabase
            .from('team_members')
            .select('id')
            .eq('id', member.id)
            .limit(1);

          if (!existingMembers || existingMembers.length === 0) {
            // Insérer le membre s'il n'existe pas
            await supabase.from('team_members').insert({
              // ATTENTION: Corriger l'objet pour inclure user_id
              name: member.name,
              email: member.email || '',
              phone: member.phone || '',
              role: member.role || 'autre',
              status: member.status || 'active',
              team_id: member.team_id || 'default',
              avatar: member.avatar || '',
              user_id: member.user_id || `user_${Date.now()}`  // Ajouter ce champ obligatoire
            });
            console.log(`Membre migré: ${member.name}`);
          }
        } catch (e) {
          console.error(`Erreur lors de la migration du membre ${member.name}:`, e);
        }
      }
    }
    
    // 2. Synchroniser les rapports de visite
    // ... Code similaire pour les rapports ...
    
    console.log("Synchronisation des données terminée");
  } catch (error) {
    console.error("Erreur lors de la synchronisation:", error);
    throw error;
  }
};


// Fonction pour valider les rôles (utilisée plusieurs fois)
export const validateRole = (role: string): TeamMemberRole => {
  // Utiliser cette liste explicite plutôt que de faire référence à un objet
  const validRoles: TeamMemberRole[] = [
    'architecte', 'chef_de_projet', 'ingenieur', 'designer',
    'entreprise', 'assistant', 'dessinateur', 'autre'
  ];

  // Conversion sécurisée
  return validRoles.includes(role as TeamMemberRole)
    ? (role as TeamMemberRole)
    : 'autre';
};
export const validateStatus = (status: string | null | undefined): 'active' | 'inactive' => {
  return status === 'inactive' ? 'inactive' : 'active';
};

// Version simplifiée pour ajouter un membre
export const addTeamMember = async (member: Partial<TeamMember>): Promise<boolean> => {
  try {
    console.log("Ajout membre:", member.name);

    // MODE DE SECOURS: Utiliser localStorage si Supabase échoue
    if (USE_LOCAL_MODE) {
      // Générer un ID unique
      const newMember: TeamMember = {
        id: `local-${Date.now()}`,
        name: member.name || '',
        role: validateRole(member.role || 'autre'),
        email: member.email || '',
        phone: member.phone || '',
        avatar: member.avatar || '',
        status: 'active',
        team_id: 'local-team',
        user_id: `user_${Date.now()}`
      };
      
      // Récupérer les membres existants
      let existingMembers: TeamMember[] = [];
      try {
        const storedData = localStorage.getItem('teamMembersData');
        if (storedData) {
          existingMembers = JSON.parse(storedData);
        }
      } catch (e) {
        console.error("Erreur de lecture localStorage:", e);
      }
      
      // Ajouter et sauvegarder
      existingMembers.push(newMember);
      localStorage.setItem('teamMembersData', JSON.stringify(existingMembers));

      // AJOUTER CETTE LIGNE - appeler la synchronisation directement
      syncLocalMembersWithReports();
      
      console.log("Membre ajouté en mode local");
      return true;
    }

    // Créer ou récupérer une équipe VALIDE
    let teamId;
    try {
      teamId = await getOrCreateDefaultTeam();
      console.log("ID d'équipe valide récupéré:", teamId);
    } catch (teamError) {
      console.error("Impossible d'obtenir une équipe valide:", teamError);
      return false; // Échec précoce si pas d'équipe valide
    }

    const { error } = await supabase
      .from('team_members')
      .insert({
        name: member.name || '',
        role: validateRole(member.role || 'autre'),
        email: member.email || '',
        phone: member.phone || '',
        avatar: member.avatar || '',
        status: member.status || 'active',
        team_id: teamId,                    // Utiliser directement l'ID d'équipe valide
        user_id: generateUUID()             // Toujours générer un UUID valide pour user_id
      });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Erreur d'ajout:", error);
    return false;
  }
};

// Récupérer tous les membres
export const getAllTeamMembers = async (): Promise<TeamMember[]> => {
  console.log("Récupération des membres depuis Supabase...");
  
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('*');
      
    if (error) throw error;
    
    console.log(`${data.length} membres récupérés avec succès`);
    return data.map(convertToAppFormat);
  } catch (error) {
    console.error("Erreur lors de la récupération des membres:", error);
    return [];
  }
};

// Supprimer un membre
export const deleteTeamMember = async (memberId: string): Promise<boolean> => {
  console.log("Suppression du membre:", memberId);
  
  try {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId);
      
    if (error) throw error;
    
    console.log("Membre supprimé avec succès");
    return true;
    
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    return false;
  }
};

// Remplacer la fonction getOrCreateDefaultTeam par celle-ci
export const getOrCreateDefaultTeam = async (): Promise<string> => {
  try {
    // 1. D'abord, vérifier si des équipes existent déjà
    const { data: existingTeams } = await supabase
      .from('teams')
      .select('id')
      .limit(10);
      
    if (existingTeams && existingTeams.length > 0) {
      // Utiliser la première équipe trouvée
      const teamId = existingTeams[0].id;
      console.log("Équipe existante trouvée:", teamId);
      return teamId;
    }
    
    // 2. Si aucune équipe n'existe, en créer une nouvelle avec un owner_id valide
    console.log("Aucune équipe trouvée, création d'une nouvelle équipe...");
    
    // Générer un UUID valide pour le propriétaire
    const ownerId = generateUUID();
    
    const { data, error } = await supabase
      .from('teams')
      .insert({
        name: 'Équipe par défaut',
        // Utiliser un UUID valide pour owner_id
        owner_id: ownerId
      })
      .select('id')
      .single();
      
    if (error) {
      console.error("Erreur lors de la création de l'équipe:", error);
      throw error;
    }
    
    console.log("Nouvelle équipe créée avec succès:", data.id);
    return data.id;
  } catch (error) {
    console.error("Erreur dans getOrCreateDefaultTeam:", error);
    throw error;
  }
};

// Fonction pour convertir le format Supabase vers votre format d'app
const convertToAppFormat = (member: SupabaseTeamMember): TeamMember => {
  return {
    id: member.id,
    name: member.name || '',
    role: validateRole(member.role), 
    email: member.email || '',
    phone: member.phone || '',
    avatar: member.avatar || '',
    status: validateStatus(member.status),
    team_id: member.team_id,
    user_id: member.user_id
  };
};

// Ajouter cette fonction qui est utilisée mais non définie
export const updateTeamMember = async (member: TeamMember): Promise<TeamMember | null> => {
  try {
    console.log("Mise à jour du membre:", member.name);
    
    const { data, error } = await supabase
      .from('team_members')
      .update({
        name: member.name,
        role: validateRole(member.role),
        email: member.email,
        phone: member.phone || '',
        avatar: member.avatar || '',
        status: member.status
      })
      .eq('id', member.id)
      .select()
      .single();
    
    if (error) throw error;
    
    console.log("Membre mis à jour avec succès");
    return convertToAppFormat(data);
  } catch (error) {
    console.error("Erreur lors de la mise à jour:", error);
    return null;
  }
};

// Modifier la fonction syncLocalMembersWithReports pour toujours sauvegarder les données
export const syncLocalMembersWithReports = () => {
  try {
    console.log("Début de la synchronisation globale...");
    
    // 1. Récupération de toutes les sources de données
    const membersData = localStorage.getItem('teamMembersData') || '[]';
    const reportsData = localStorage.getItem('siteVisitReports') || '[]';
    
    const members = JSON.parse(membersData);
    const reports = JSON.parse(reportsData);
    
    // 2. Construction d'une collection unifiée de tous les membres
    const allMembers = new Map();
    
    // Ajouter d'abord les membres de l'équipe
    members.forEach(member => {
      allMembers.set(member.id, member);
    });
    
    // 3. Extraire tous les participants des rapports
    reports.forEach(report => {
      if (report.participants && Array.isArray(report.participants)) {
        report.participants.forEach(participant => {
          if (participant.id && !allMembers.has(participant.id)) {
            // Convertir le participant en membre s'il n'existe pas déjà
            allMembers.set(participant.id, {
              id: participant.id,
              name: participant.contact || "",
              email: participant.email || "",
              phone: participant.phone || "",
              role: participant.role || "autre",
              status: "active",
              team_id: "default",
              user_id: `user_${participant.id}`
            });
          }
        });
      }
    });
    
    // 4. Sauvegarder la liste unifiée dans les deux emplacements
    const unifiedMembers = Array.from(allMembers.values());
    localStorage.setItem('teamMembersData', JSON.stringify(unifiedMembers));
    localStorage.setItem('teamMembersForReports', JSON.stringify(unifiedMembers));
    
    console.log(`Synchronisation terminée: ${unifiedMembers.length} membres unifiés`);
  } catch (error) {
    console.error("Erreur de synchronisation:", error);
  }
};

// Fonction à ajouter dans teamService.ts
export const getAllAvailableMembers = async (): Promise<TeamMember[]> => {
  const members: TeamMember[] = await getAllTeamMembers();
  
  // Ajouter les membres spécifiques aux rapports s'ils ne sont pas déjà inclus
  try {
    const reportMembersData = localStorage.getItem('teamMembersForReports');
    if (reportMembersData) {
      const reportMembers = JSON.parse(reportMembersData);
      
      // Ajouter seulement les membres qui n'existent pas déjà
      for (const reportMember of reportMembers) {
        if (!members.some(m => m.id === reportMember.id)) {
          members.push(reportMember);
        }
      }
    }
  } catch (e) {
    console.error("Erreur lors de la fusion des membres:", e);
  }
  
  return members;
};

// Ajouter une fonction pour effectuer la synchronisation au démarrage
export const initializeDataSync = () => {
  // Appeler la fonction de migration au démarrage
  migrateLocalDataToSupabase().catch(err => 
    console.error("Erreur lors de la migration initiale:", err)
  );
  
  // Configurer la synchronisation périodique
  syncLocalMembersWithReports();

  // Programmer une synchronisation toutes les 30 secondes
  setInterval(syncLocalMembersWithReports, 30000);
};

// Nouvelle fonction pour inspecter le schéma des tables
const inspectSchema = async () => {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .limit(1);
      
    if (error) {
      console.error("Erreur lors de l'inspection:", error);
    } else {
      console.log("Structure d'un membre:", data[0] ? Object.keys(data[0]) : "Table vide");
    }
    
    // Également inspecter teams
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .limit(1);
      
    if (!teamsError) {
      console.log("Structure d'une équipe:", teams[0] ? Object.keys(teams[0]) : "Table vide");
    }
  } catch (e) {
    console.error("Erreur d'inspection:", e);
  }
};

// Appeler dans initializeDataSync
inspectSchema();

// Fonction de débogage pour tester l'insertion
export const debugInsertTeamMember = async (member: Partial<TeamMember>): Promise<boolean> => {
  try {
    console.log("Debug - Tentative d'insertion avec:", {
      name: member.name || '',
      email: member.email || '',
      role: validateRole(member.role || 'autre'),
      team_id: "00000000-0000-4000-a000-000000000000", // UUID fixe pour tester
      user_id: "10000000-0000-4000-a000-000000000000"  // UUID fixe pour tester
    });
    
    const { data, error } = await supabase
      .from('team_members')
      .insert({
        name: member.name || '',
        email: member.email || '',
        role: validateRole(member.role || 'autre'),
        team_id: "00000000-0000-4000-a000-000000000000",
        user_id: "10000000-0000-4000-a000-000000000000"
      })
      .select();
    
    if (error) {
      console.error("Debug - Erreur d'insertion:", error);
      return false;
    }
    
    console.log("Debug - Insertion réussie:", data);
    return true;
  } catch (e) {
    console.error("Debug - Exception:", e);
    return false;
  }
};

// Service pour gérer les membres d'équipe avec l'API Railway
export const teamService = {
  // Récupérer tous les membres d'équipe
  getAllTeamMembers: async (): Promise<TeamMember[]> => {
    const api = createApiClient();
    
    try {
      const members = await api.get<TeamMember[]>("/team-members");
      return members.map(normalizeTeamMember);
    } catch (error) {
      console.error("Erreur lors de la récupération des membres:", error);
      
      // Fallback sur localStorage
      const stored = localStorage.getItem("teamMembersData");
      const members = stored ? JSON.parse(stored) : [];
      return members.map(normalizeTeamMember);
    }
  },
  
  // Récupérer un membre par son ID
  getTeamMemberById: async (id: string): Promise<TeamMember | null> => {
    const api = createApiClient();
    
    try {
      const member = await api.get<TeamMember>(`/team-members/${id}`);
      return normalizeTeamMember(member);
    } catch (error) {
      console.error(`Erreur lors de la récupération du membre ${id}:`, error);
      
      // Fallback sur localStorage
      const stored = localStorage.getItem("teamMembersData");
      if (!stored) return null;
      
      const members = JSON.parse(stored);
      const member = members.find((m: any) => m.id === id);
      return member ? normalizeTeamMember(member) : null;
    }
  },
  
  // Ajouter un nouveau membre
  addTeamMember: async (member: Omit<TeamMember, "id">): Promise<TeamMember> => {
    const api = createApiClient();
    
    try {
      const newMember = await api.post<TeamMember>("/team-members", member);
      return normalizeTeamMember(newMember);
    } catch (error) {
      console.error("Erreur lors de l'ajout du membre:", error);
      
      // Fallback: création locale temporaire
      const newMember = {
        ...member,
        id: `local-${Date.now()}`,
        created_at: new Date().toISOString()
      };
      
      // Stocker localement
      const stored = localStorage.getItem("teamMembersData");
      const members = stored ? JSON.parse(stored) : [];
      members.push(newMember);
      localStorage.setItem("teamMembersData", JSON.stringify(members));
      
      return normalizeTeamMember(newMember);
    }
  },
  
  // Mettre à jour un membre existant
  updateTeamMember: async (id: string, updates: Partial<TeamMember>): Promise<TeamMember | null> => {
    const api = createApiClient();
    
    try {
      const updatedMember = await api.put<TeamMember>(`/team-members/${id}`, updates);
      return normalizeTeamMember(updatedMember);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du membre ${id}:`, error);
      
      // Fallback: mise à jour locale
      const stored = localStorage.getItem("teamMembersData");
      if (!stored) return null;
      
      const members = JSON.parse(stored);
      const index = members.findIndex((m: any) => m.id === id);
      
      if (index === -1) return null;
      
      members[index] = {
        ...members[index],
        ...updates
      };
      
      localStorage.setItem("teamMembersData", JSON.stringify(members));
      return normalizeTeamMember(members[index]);
    }
  },
  
  // Supprimer un membre
  deleteTeamMember: async (id: string): Promise<boolean> => {
    const api = createApiClient();
    
    try {
      await api.delete(`/team-members/${id}`);
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression du membre ${id}:`, error);
      
      // Fallback: suppression locale
      const stored = localStorage.getItem("teamMembersData");
      if (!stored) return false;
      
      const members = JSON.parse(stored);
      const newMembers = members.filter((m: any) => m.id !== id);
      
      localStorage.setItem("teamMembersData", JSON.stringify(newMembers));
      return true;
    }
  }
};

// Exporter les fonctions individuelles pour la compatibilité avec le code existant
export const getAllTeamMembers = teamService.getAllTeamMembers;
export const getTeamMemberById = teamService.getTeamMemberById;
export const addTeamMember = teamService.addTeamMember;
export const updateTeamMember = teamService.updateTeamMember;
export const deleteTeamMember = teamService.deleteTeamMember;