/**
 * Traite les rectangles blancs générés dynamiquement sans supprimer les éléments essentiels
 * Cette version est plus prudente et ne supprime pas les éléments, mais les masque
 */
export const removeUnwantedElements = () => {
  // Configuration pour identifier quels éléments traiter
  const config = {
    // Classes CSS des éléments à masquer (mais pas supprimer)
    overflowClasses: ['rct-item-overflow'],

    // Classes qui ne doivent jamais être modifiées
    protectedClasses: ['rct-item-content', 'custom-resize-handle', 'timeline-task-item', 'timeline-lot-item'],

    // Attributs à vérifier pour les rectangles blancs
    whiteRectAttributes: [
      { property: 'backgroundColor', values: ['rgb(255, 255, 255)', '#ffffff', 'white'] },
      { property: 'zIndex', values: ['90', '91', '92', '99'] } // Les z-index souvent utilisés pour les overlays
    ]
  };

  // Fonction pour vérifier si un élément est protégé
  const isProtectedElement = (element) => {
    if (!element || !element.classList) return false;

    return config.protectedClasses.some(cls =>
      element.classList.contains(cls) ||
      element.closest(`.${cls}`)
    );
  };

  // Fonction pour vérifier si un élément est un rectangle blanc indésirable
  const isUnwantedWhiteRectangle = (element) => {
    if (!element || !element.parentElement) return false;
    if (isProtectedElement(element)) return false;

    // Ajouter cette condition pour éviter de supprimer nos barres de progression
    if (element.classList.contains('progress-bar') || 
        element.classList.contains('visible-progress-bar') ||
        element.parentElement.classList.contains('timeline-item-border')) {
      return false; // Ne pas supprimer ces éléments
    }

    // Vérifier si c'est un enfant direct d'un rct-item mais pas un contenu essentiel
    if (element.parentElement.classList.contains('rct-item')) {
      const style = window.getComputedStyle(element);

      // Vérifier le style pour les critères de rectangle blanc
      return config.whiteRectAttributes.some(attr =>
        attr.values.includes(style[attr.property])
      );
    }

    return false;
  };

  // Observer les changements dans le DOM
  const observer = new MutationObserver((mutations) => {
    let needsCleanup = false;

    mutations.forEach(mutation => {
      if (mutation.addedNodes && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // Élément DOM
            // Traiter les éléments overflow spécifiques
            if (node.classList && config.overflowClasses.some(cls => node.classList.contains(cls))) {
              node.style.opacity = '0';
              node.style.visibility = 'hidden';
              needsCleanup = true;
            }

            // Pour les rectangles blancs, utiliser notre fonction de détection
            if (isUnwantedWhiteRectangle(node)) {
              node.style.opacity = '0';
              node.style.visibility = 'hidden';
              needsCleanup = true;
            }
          }
        });
      }
    });

    // Exécuter un nettoyage complet seulement si nécessaire
    if (needsCleanup) {
      cleanupOverflowElements();
    }
  });

  // Fonction pour masquer (pas supprimer) les éléments overflow
  const cleanupOverflowElements = () => {
    // Pour les classes spécifiques d'overflow
    config.overflowClasses.forEach(cls => {
      document.querySelectorAll(`.${cls}`).forEach(element => {
        if (!isProtectedElement(element)) {
          element.style.opacity = '0';
          element.style.visibility = 'hidden';
          // Ne pas supprimer : element.remove()
        }
      });
    });

    // Pour les rectangles blancs dans les éléments de timeline
    document.querySelectorAll('.rct-item > *').forEach(element => {
      if (isUnwantedWhiteRectangle(element) && !isProtectedElement(element)) {
        element.style.opacity = '0';
        element.style.visibility = 'hidden';
        element.style.pointerEvents = 'none';
      }
    });
  };

  // Observer la timeline avec des options plus précises
  const timelineContainer = document.querySelector('.react-calendar-timeline');
  if (timelineContainer) {
    observer.observe(timelineContainer, {
      childList: true,
      subtree: true,
      attributes: false // Ne pas observer les changements d'attributs
    });

    // Nettoyage initial
    cleanupOverflowElements();
  }

  // Intervalle moins fréquent pour réduire l'impact sur les performances
  const interval = setInterval(cleanupOverflowElements, 1000);

  // Fonction de nettoyage lors du démontage du composant
  return () => {
    observer.disconnect();
    clearInterval(interval);
  };
};