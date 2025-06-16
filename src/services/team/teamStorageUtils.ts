import { TeamMember, LegacyTeamMember, TeamMemberStatus, TeamMemberRole } from "@/types/team";

// Fonction de conversion entre TeamMember et LegacyTeamMember
export const adaptLegacyToModern = (legacy: LegacyTeamMember): TeamMember => {
  return {
    ...legacy,
    // Ajout de valeurs par défaut pour les champs potentiellement manquants
    team_id: legacy.team_id || 'default',
    user_id: legacy.user_id || legacy.email || '',
    // Utiliser des chaînes vides au lieu de null et cast des enum
    phone: legacy.phone || '',
    avatar: legacy.avatar || '',
    // Cast explicite pour s'assurer que status est du bon type
    status: (legacy.status as TeamMemberStatus) || 'active',
    // Cast explicite pour s'assurer que role est du bon type
    role: (legacy.role as TeamMemberRole) || 'autre'
  };
};

export const adaptModernToLegacy = (modern: TeamMember): LegacyTeamMember => {
  return {
    id: modern.id,
    name: modern.name || '',
    email: modern.email || '',
    phone: modern.phone || '',
    role: modern.role,
    avatar: modern.avatar || '',
    status: modern.status,
    activity: modern.activity || '',
    projects: modern.projects || [],
    team_id: modern.team_id || '',
    user_id: modern.user_id || '',
    created_at: modern.created_at
  };
};

// Charger les membres d'équipe depuis le stockage local
export const loadTeamMembersFromStorage = (teamId?: string): TeamMember[] => {
  try {
    // Essayer d'abord avec l'ID d'équipe si fourni
    let members = [];

    if (teamId) {
      const data = localStorage.getItem(`team_members_${teamId}`);
      if (data) members = JSON.parse(data);
    }

    // Si aucun membre trouvé, essayer avec la clé générique
    if (!members || members.length === 0) {
      const data = localStorage.getItem('teamMembersData');
      if (data) members = JSON.parse(data);
    }

    // Si toujours rien, utiliser les données par défaut
    if (!members || members.length === 0) {
      // Utiliser adaptLegacyToModern pour garantir la conversion correcte des types
      return getDefaultTeamMembers().map(member => adaptLegacyToModern(member));
    }

    // S'assurer que tous les membres respectent le format attendu
    return members.map((member: any) => ({
      id: member.id || `member_${Date.now()}`,
      name: member.name || '',
      email: member.email || '',
      phone: member.phone || '', // Chaîne vide au lieu de null
      role: (member.role as TeamMemberRole) || 'autre', // Cast explicite
      avatar: member.avatar || '', // Chaîne vide au lieu de null
      status: (member.status as TeamMemberStatus) || 'active', // Cast explicite
      team_id: member.team_id || 'default',
      user_id: member.user_id || '',
      activity: member.activity || '',
      projects: member.projects || []
    }));
  } catch (error) {
    console.error("Erreur lors du chargement des membres:", error);
    // Données par défaut en cas d'erreur
    return getDefaultTeamMembers().map(member => adaptLegacyToModern(member));
  }
};

// Sauvegarder les membres d'équipe dans le stockage local
export const saveTeamMembersToStorage = (members: TeamMember[], teamId?: string): void => {
  try {
    // Convertir vers LegacyTeamMember pour la compatibilité
    const legacyMembers = members.map(adaptModernToLegacy);

    // Sauvegarder avec l'ID d'équipe s'il est fourni
    if (teamId) {
      localStorage.setItem(`team_members_${teamId}`, JSON.stringify(legacyMembers));
    }
    
    // Toujours sauvegarder dans la clé générique pour la compatibilité
    localStorage.setItem('teamMembersData', JSON.stringify(legacyMembers));
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des membres dans localStorage:", error);
  }
};

// S'assurer que cette fonction retourne bien des données par défaut
export const getDefaultTeamMembers = (): LegacyTeamMember[] => {
  return [
    {
      id: "1",
      name: "Jean Dupont",
      email: "jean.dupont@exemple.com",
      phone: "0612345678",
      role: "architecte", // Ces valeurs doivent correspondre à TeamMemberRole
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      status: "active", // Ces valeurs doivent correspondre à TeamMemberStatus
      activity: "Conception",
      projects: ["1"],
      team_id: "default",
      user_id: "user1",
      created_at: new Date().toISOString()
    },
    {
      id: "2",
      name: "Marie Martin",
      email: "marie.martin@exemple.com",
      phone: "0687654321",
      role: "ingenieur",
      avatar: "https://randomuser.me/api/portraits/women/2.jpg",
      status: "active",
      activity: "Calculs structurels",
      projects: ["1", "2"],
      team_id: "default",
      user_id: "user2",
      created_at: new Date().toISOString()
    },
    {
      id: "3",
      name: "Paul Bernard",
      email: "paul.bernard@exemple.com",
      phone: "0611223344",
      role: "dessinateur",
      avatar: "https://randomuser.me/api/portraits/men/3.jpg",
      status: "active",
      activity: "Plans d'exécution",
      projects: ["2"],
      team_id: "default",
      user_id: "user3",
      created_at: new Date().toISOString()
    },
    {
      id: "4",
      name: "Sophie Petit",
      email: "sophie.petit@exemple.com",
      phone: "0699887766",
      role: "assistant",
      avatar: "https://randomuser.me/api/portraits/women/4.jpg",
      status: "inactive",
      activity: "Administration",
      team_id: "default",
      user_id: "user4",
      created_at: new Date().toISOString()
    }
  ];
};