import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Définition centralisée du type UserProfile
export interface UserProfile {
  id?: string;
  email?: string; // Optionnel ici pour permettre les données de Supabase
  name?: string;
  avatar?: string;
  avatar_url?: string; // Ajout pour supporter les données de Supabase
  role?: string;
  team_id?: string;
  first_name?: string;
  last_name?: string;
  created_at?: string;
  updated_at?: string; // Ajout pour supporter les données de Supabase
  title?: string;
  company?: string; // Ajout pour supporter les données de Supabase
}

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        // Essayer d'abord de récupérer depuis Supabase
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Si connecté à Supabase, récupérer le profil complet
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (data && !error) {
            // Adapter les données de Supabase à notre format UserProfile
            const adaptedProfile: UserProfile = {
              ...data,
              // S'assurer que les champs nécessaires sont présents
              id: data.id,
              email: user.email, // Prendre l'email de l'utilisateur auth
              name: `${data.first_name || ''} ${data.last_name || ''}`.trim(), // Créer un nom à partir de first_name et last_name
              avatar: data.avatar_url, // Mapper avatar_url à avatar pour compatibilité
              team_id: data.team_id || 'default'
            };
            setProfile(adaptedProfile);
            return;
          }
        }
        
        // Fallback: récupérer depuis localStorage
        const localProfile = localStorage.getItem('userProfile');
        if (localProfile) {
          setProfile(JSON.parse(localProfile));
        } else {
          // Profil par défaut avec team_id
          const defaultProfile: UserProfile = {
            id: 'default',
            name: 'Utilisateur',
            team_id: 'default'
          };
          setProfile(defaultProfile);
          localStorage.setItem('userProfile', JSON.stringify(defaultProfile));
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);
  
  const getUserFullName = () => {
    if (!profile) return '';
    return `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.name || '';
  };
  
  const getInitials = () => {
    if (!profile) return '';
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    return profile.name?.substring(0, 2).toUpperCase() || '';
  };
  
  return {
    profile,
    loading,
    getUserFullName,
    getInitials
  };
};
