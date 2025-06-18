import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "@/features/auth/services/authService";

interface GuestGuardProps {
  children: ReactNode;
}

export function GuestGuard({ children }: GuestGuardProps) {
  const { user, isLoading } = useAuth();

  // Pendant le chargement, afficher un écran de chargement
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  // Si l'utilisateur est connecté, rediriger vers la dashboard
  if (user) {
    return <Navigate to="/" replace />;
  }

  // Si l'utilisateur n'est pas connecté, afficher les enfants
  return <>{children}</>;
}
