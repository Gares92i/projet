import {
    useUser,
    useAuth as useClerkAuth
  } from "@clerk/clerk-react";
  import { UserProfile, UserRole } from "@/feattypes/auth";
  import { useAuth as useAuthContext } from '@/features/auth/contexts/AuthContext';

  // Adapter les fonctions d'authentification de Clerk pour notre application
  export const useAuth = () => {
    const { isSignedIn, user, isLoaded } = useUser();
    const { signOut, getToken } = useClerkAuth();

    // Convertir les données utilisateur de Clerk en UserProfile
    const mapToUserProfile = (): UserProfile | null => {
      if (!user) return null;

      return {
        id: user.id,
        first_name: user.firstName || "",
        last_name: user.lastName || "",
        email: user.primaryEmailAddress?.emailAddress || "",
        avatar_url: user.imageUrl || "",
        title: user.publicMetadata?.title as string || "",
        company: user.publicMetadata?.company as string || "",
        created_at: user.createdAt || new Date().toISOString(),
        updated_at: user.updatedAt || new Date().toISOString()
      };
    };

    // Déterminer les rôles à partir des métadonnées Clerk
    const getRoles = (): UserRole[] => {
      if (!user) return ["guest"];
      
      const roles = user.publicMetadata?.roles as string[] || [];
      return roles.length > 0 ? roles as UserRole[] : ["user"];
    };
    
    // Méthode pour mettre à jour le profil utilisateur
    const updateProfile = async (data: Partial<UserProfile>): Promise<void> => {
      if (!user) throw new Error("Utilisateur non authentifié");

      await user.update({
        firstName: data.first_name || undefined,
        lastName: data.last_name || undefined,
        publicMetadata: {
          ...user.publicMetadata,
          title: data.title,
          company: data.company
        }
      });
    };

    return {
      user: isSignedIn ? user : null,
      profile: mapToUserProfile(),
      roles: getRoles(),
      isLoading: !isLoaded,
      isAuthenticated: isSignedIn,
      signOut,
      updateProfile,
      getToken
    };
  };

  // Réexporter useAuth depuis le contexte pour simplifier les imports
  export const useAuth = useAuthContext;

  // Fonctions auxiliaires pour l'authentification
  export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  export const isValidPassword = (password: string): boolean => {
    return password.length >= 8;
  };