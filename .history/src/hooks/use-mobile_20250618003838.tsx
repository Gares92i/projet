import { useState, useEffect } from 'react';

/**
 * Hook qui détecte si l'appareil est un mobile en fonction de la largeur de l'écran
 * @param breakpoint Largeur en pixels à partir de laquelle on considère l'écran comme mobile (défaut: 768px)
 * @returns Booléen indiquant si l'écran est considéré comme mobile
 */
export const useIsMobile = (breakpoint = 768) => {
  // Vérifier si window est défini (pour SSR)
  const isBrowser = typeof window !== 'undefined';
  
  // État initial (false par défaut pour éviter les problèmes de rendu côté serveur)
  const [isMobile, setIsMobile] = useState(() => {
    if (isBrowser) {
      return window.innerWidth < breakpoint;
    }
    return false;
  });

  useEffect(() => {
    if (!isBrowser) return;

    // Fonction qui met à jour l'état selon la taille de l'écran
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Vérifier initialement
    checkIsMobile();

    // S'abonner aux changements de taille d'écran
    window.addEventListener('resize', checkIsMobile);
    
    // Nettoyer l'event listener lors du démontage
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, [breakpoint, isBrowser]);

  return isMobile;
};