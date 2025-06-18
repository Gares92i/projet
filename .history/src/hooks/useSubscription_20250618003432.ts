import { useState, useEffect } from 'react';
import { useAuth } from '@features/auth/services/authService';

export type SubscriptionPlan = 'Basique' | 'Professionnel' | 'Entreprise' | 'Gratuit';

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: SubscriptionPlan;
  status: 'active' | 'trialing' | 'canceled' | 'expired';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) {
        setSubscription(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // TODO: Remplacer par un appel à l'API réelle lorsque Railway sera mis en place
        // Simuler un chargement pour le moment
        setTimeout(() => {
          // Données fictives pour le développement
          const mockSubscription: Subscription = {
            id: 'sub_123456',
            user_id: user.id,
            plan_type: 'Professionnel',
            status: 'active',
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            cancel_at_period_end: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          setSubscription(mockSubscription);
          setIsLoading(false);
        }, 500);
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  const getPlanType = (): string => {
    if (!subscription) return 'Gratuit';
    return subscription.plan_type;
  };

  const getPlanFeatures = (): string[] => {
    switch (getPlanType()) {
      case 'Basique':
        return [
          'Jusqu'à 5 projets',
          'Jusqu'à 10 utilisateurs',
          'Stockage 5 Go',
          'Support par email'
        ];
      case 'Professionnel':
        return [
          'Projets illimités',
          'Jusqu'à 50 utilisateurs',
          'Stockage 50 Go',
          'Support prioritaire',
          'Rapports avancés'
        ];
      case 'Entreprise':
        return [
          'Projets illimités',
          'Utilisateurs illimités',
          'Stockage 500 Go',
          'Support dédié 24/7',
          'API personnalisée',
          'Single Sign-On (SSO)'
        ];
      default:
        return [
          'Jusqu'à 1 projet',
          'Jusqu'à 3 utilisateurs',
          'Stockage 1 Go',
          'Fonctionnalités de base'
        ];
    }
  };

  return {
    subscription,
    isLoading,
    error,
    getPlanType,
    getPlanFeatures
  };
};