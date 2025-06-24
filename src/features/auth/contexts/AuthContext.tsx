import React, { createContext, useContext, useState, useEffect } from "react";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  useUser,
  useAuth as useClerkAuth,
} from "@clerk/clerk-react";
import { AuthContextType, UserProfile, UserRole } from "@/features/auth/types/auth";

// Créer le contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider personnalisé qui utilise Clerk
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>(["guest"]);
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { isSignedIn, user } = useUser();
  const { signOut } = useClerkAuth();

  // Charger les données utilisateur depuis Clerk
  useEffect(() => {
    if (!isSignedIn || !user) {
      setProfile({
        id: 'default',
        first_name: 'Utilisateur',
        last_name: '',
        email: 'user@example.com',
        avatar_url: '',
        title: '',
        company: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setRoles(["user"]);
      setSubscription({
        id: 'sub_default',
        user_id: 'default',
        stripe_customer_id: null,
        stripe_subscription_id: null,
        plan_type: 'Basique',
        status: 'active',
        seats: 1,
        current_period_start: null,
        current_period_end: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setIsLoading(false);
      return;
    }

    // Convertir les données Clerk en format UserProfile
    const userProfile: UserProfile = {
      id: user.id,
      first_name: user.firstName || "",
      last_name: user.lastName || "",
      email: user.primaryEmailAddress?.emailAddress || "",
      avatar_url: user.imageUrl || "",
      title: (user.publicMetadata?.title as string) || "",
      company: (user.publicMetadata?.company as string) || "",
      created_at: user.createdAt || new Date().toISOString(),
      updated_at: user.updatedAt || new Date().toISOString(),
    };

    // Récupérer les rôles depuis les métadonnées
    const userRoles = (user.publicMetadata?.roles as string[]) || ["user"];

    setProfile(userProfile);
    setRoles(userRoles as UserRole[]);
    setSubscription({
      id: 'sub_' + user.id,
      user_id: user.id,
      stripe_customer_id: null,
      stripe_subscription_id: null,
      plan_type: 'Basique',
      status: 'active',
      seats: 1,
      current_period_start: null,
      current_period_end: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    setIsLoading(false);

    // TODO: Récupérer les informations d'abonnement si nécessaire
  }, [isSignedIn, user]);

  // Méthode pour mettre à jour le profil utilisateur
  const updateProfile = async (data: Partial<UserProfile>): Promise<void> => {
    if (!isSignedIn || !user) {
      throw new Error("Utilisateur non authentifié");
    }

    try {
      await user.update({
        firstName: data.first_name || undefined,
        lastName: data.last_name || undefined,
        publicMetadata: {
          ...user.publicMetadata,
          title: data.title,
          company: data.company,
        },
      });

      // Mettre à jour l'état local
      setProfile(
        (prev) =>
          ({
            ...prev!,
            ...data,
          } as UserProfile)
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      throw error;
    }
  };

  // Ces méthodes ne sont plus nécessaires avec Clerk mais gardées pour compatibilité
  const signIn = async (email: string, password: string): Promise<void> => {
    console.warn(
      "La méthode signIn est obsolète avec Clerk. Utilisez <SignIn /> à la place."
    );
    throw new Error("Non implémenté. Utilisez les composants Clerk.");
  };

  const signUp = async (
    email: string,
    password: string,
    metadata: { first_name: string; last_name: string }
  ): Promise<void> => {
    console.warn(
      "La méthode signUp est obsolète avec Clerk. Utilisez <SignUp /> à la place."
    );
    throw new Error("Non implémenté. Utilisez les composants Clerk.");
  };

  const value: AuthContextType = {
    user: isSignedIn ? user : null,
    session: null, // Clerk gère les sessions différemment
    profile,
    roles,
    subscription,
    isLoading,
    isAuthenticated: isSignedIn,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook pour utiliser le contexte d'authentification
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error(
      "useAuth doit être utilisé à l'intérieur d'un AuthProvider"
    );
  }
  return context;
};

// Composant racine avec Clerk Provider
export const ClerkAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  if (!clerkPubKey) {
    console.error(
      "VITE_CLERK_PUBLISHABLE_KEY est manquante dans les variables d'environnement"
    );
    return <div>Erreur de configuration d'authentification</div>;
  }

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <AuthProvider>{children}</AuthProvider>
    </ClerkProvider>
  );
};

// Composant pour protéger les routes
export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};
