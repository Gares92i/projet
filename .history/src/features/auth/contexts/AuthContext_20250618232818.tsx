import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Type pour l'utilisateur
interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

// Type pour le contexte d'authentification
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Création du contexte avec une valeur par défaut
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook pour utiliser le contexte d'authentification
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé avec un AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Provider du contexte d'authentification
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Vérification de l'authentification au chargement
  useEffect(() => {
    // Simuler une vérification d'authentification
    const checkAuth = async () => {
      try {
        // Pour le développement, nous simulons un utilisateur connecté
        // Dans une vraie application, vous vérifieriez le token ou la session
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Fonction de connexion
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simuler une requête API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Utilisateur factice pour le développement
      const mockUser = {
        id: '1',
        email,
        firstName: 'Utilisateur',
        lastName: 'Test'
      };
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction d'inscription
  const signup = async (email: string, password: string, firstName: string, lastName: string) => {
    setIsLoading(true);
    try {
      // Simuler une requête API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Utilisateur factice pour le développement
      const mockUser = {
        id: '1',
        email,
        firstName,
        lastName
      };
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    setIsLoading(true);
    try {
      // Simuler une requête API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUser(null);
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    login,
    signup,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}