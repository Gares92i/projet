import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../services/authService';

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="loading">Chargement...</div>;
  }

  if (!isAuthenticated) {
    // Rediriger vers la page de connexion avec le retour prévu
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
