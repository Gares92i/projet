// Si vous n'utilisez pas la librairie 'sonner', commentez la ligne suivante :
// import { toast } from 'sonner';

// Taille maximale approximative en Mo
const MAX_SIZE_MB = 4;

/**
 * Vérifie et nettoie le localStorage si nécessaire
 */
export const manageLocalStorageQuota = (key: string, data: any): boolean => {
    try {
        // Estimer la taille des données
        const jsonStr = JSON.stringify(data);
        const sizeInBytes = new Blob([jsonStr]).size;
        const sizeInMB = sizeInBytes / (1024 * 1024);

        console.log(`Taille approximative de ${key}: ${sizeInMB.toFixed(2)} MB`);

        // Si la taille dépasse le seuil, essayer de compresser
        if (sizeInMB > MAX_SIZE_MB) {
            console.warn(`${key} est trop volumineux (${sizeInMB.toFixed(2)} MB)`);

            // Pour les projets, limiter les données volumineuses
            if (key === 'projectsData' && Array.isArray(data)) {
                const trimmedData = data.map((item) => {
                    const { description, imageUrl, notes, ...essentials } = item;
                    return {
                        ...essentials,
                        description: description ? description.substring(0, 100) + '...' : '',
                        imageUrl: imageUrl && !imageUrl.startsWith('http') ? '' : imageUrl,
                    };
                });

                return safeSetItem(key, trimmedData);
            }

            // Nettoyer d'autres éléments pour faire de la place
            for (let i = 0; i < localStorage.length; i++) {
                const oldKey = localStorage.key(i);
                if (oldKey && oldKey !== key && (
                    oldKey.includes('temp') ||
                    oldKey.includes('cache') ||
                    oldKey.includes('draft')
                )) {
                    localStorage.removeItem(oldKey);
                }
            }
        }

        localStorage.setItem(key, jsonStr);
        return true;
    } catch (error) {
        console.error("Erreur lors de la gestion du quota de stockage:", error);
        return false;
    }
};

/**
 * Sauvegarde en toute sécurité dans localStorage
 */
export const safeSetItem = (key: string, data: any): boolean => {
    try {
        // Vérifier et gérer le quota
        return manageLocalStorageQuota(key, data);
    } catch (error) {
        console.error(`Erreur lors de la sauvegarde dans localStorage (${key}):`, error);
        // Remplacez toast.error(...) par console.error(...) si 'sonner' n'est pas utilé.
        return false;
    }
};

/**
 * Récupère des données depuis localStorage
 */
export const safeGetItem = <T>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Erreur lors de la récupération depuis localStorage (${key}):`, error);
        return defaultValue;
    }
};