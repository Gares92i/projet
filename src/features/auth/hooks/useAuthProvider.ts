// Ce hook n'est plus utilisé. Toute l'authentification est désormais gérée par Clerk.
export const useAuthProvider = () => {
  throw new Error('useAuthProvider n\'est plus utilisé. Utilisez AuthProvider basé sur Clerk.');
};
