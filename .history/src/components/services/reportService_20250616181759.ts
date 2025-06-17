import { SiteVisitReport,  TaskProgress,Observation, Recommendation, ArchitectInfo } from "@/types";
import { updateProject } from "./projectService";

// Corriger les données de démonstration en ajoutant la propriété descriptif manquante

// Mock data
const reports: SiteVisitReport[] = [
  {
    id: "1",
    projectId: "1",
    visitDate: "2023-06-15",
    contractor: "Entreprise Martin",
    inCharge: "Jean Dupont",
    progress: 35,
    observations: [
      // observations existantes
    ],
    recommendations: [
      // recommendations existantes
    ],
    photos: ["/placeholder.svg", "/placeholder.svg"],
    signatures: {
      inCharge: "signature1.png",
      engineer: "signature2.png"
    },
    reportNumber: "SVR-2023-001",
    templateId: "standard",
    createdAt: "2023-06-15T14:30:00",
    updatedAt: "2023-06-15T14:30:00",
    descriptif: [] // Ajouter cette ligne pour résoudre l'erreur TypeScript
  },
  {
    id: "2",
    projectId: "1",
    visitDate: "2023-06-22",
    contractor: "Entreprise Martin",
    inCharge: "Jean Dupont",
    progress: 42,
    observations: [
      // observations existantes
    ],
    recommendations: [
      // recommendations existantes
    ],
    photos: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    signatures: {
      inCharge: "signature1.png",
      engineer: "signature2.png",
      visitor: "signature3.png"
    },
    reportNumber: "SVR-2023-002",
    templateId: "detailed",
    createdAt: "2023-06-22T15:15:00",
    updatedAt: "2023-06-22T15:15:00",
    descriptif: [] // Ajouter cette ligne pour résoudre l'erreur TypeScript
  }
];

export const saveArchitectInfo = async (info: ArchitectInfo): Promise<boolean> => {
  try {
    localStorage.setItem('architectInfo', JSON.stringify(info));
    console.log("Informations d'entreprise sauvegardées:", info);
    return true;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des informations d'entreprise:", error);
    return false;
  }
};

export const getArchitectInfo = async (): Promise<ArchitectInfo | null> => {
  try {
    const data = localStorage.getItem('architectInfo');
    if (!data) return null;

    const info = JSON.parse(data) as ArchitectInfo;
    console.log("Informations d'entreprise récupérées:", info);
    return info;
  } catch (error) {
    console.error("Erreur lors de la récupération des informations d'entreprise:", error);
    return null;
  }
};
// Dans reportService.ts - Vérifiez cette fonction
export const generateReportNumber = (projectName: string, projectReports: SiteVisitReport[]): string => {
  // Extraire les 3 premières lettres du nom du projet (en majuscules)
  const projectPrefix = projectName.substring(0, 3).toUpperCase();

  // Trouver le dernier numéro utilisé pour ce projet
  let lastNumber = 0;

  if (projectReports && Array.isArray(projectReports)) {
    projectReports.forEach(report => {
      if (report.reportNumber && report.reportNumber.startsWith(`CR-${projectPrefix}-`)) {
        const numberPart = report.reportNumber.split('-')[2];
        if (numberPart) {
          const reportNumber = parseInt(numberPart, 10);
          if (!isNaN(reportNumber) && reportNumber > lastNumber) {
            lastNumber = reportNumber;
          }
        }
      }
    });
  }

  // Générer le nouveau numéro (incrémenté de 1)
  const nextNumber = lastNumber + 1;
  const formattedNumber = nextNumber.toString().padStart(3, '0');

  return `CR-${projectPrefix}-${formattedNumber}`;
};
// Modifiez la fonction getAllReportsByProjectId
export const getAllReportsByProjectId = async (projectId: string): Promise<SiteVisitReport[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        // Récupérer tous les rapports
        const reportsJSON = localStorage.getItem('siteVisitReports');
        const allReports = reportsJSON ? JSON.parse(reportsJSON) : [];

        console.log("Tous les rapports:", allReports);

        // Conversion des types pour assurer la cohérence
        const projectIdString = String(projectId);

        // Filtrer par projectId en comparant des strings
        const projectReports = allReports.filter(report => String(report.projectId) === projectIdString);

        console.log(`Trouvé ${projectReports.length} rapports pour le projet ${projectId}`);
        console.log("Rapports filtrés:", projectReports);

        resolve(projectReports);
      } catch (error) {
        console.error("Erreur lors de la récupération des rapports:", error);
        resolve([]);
      }
    }, 500);
  });
};

export const getReportById = async (reportId: string): Promise<SiteVisitReport | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const reportsData = localStorage.getItem('siteVisitReports');
      if (!reportsData) {
        resolve(null);
        return;
      }

      const reports = JSON.parse(reportsData);
      const report = reports.find((r: SiteVisitReport) => r.id === reportId);
      
      if (!report) {
        resolve(null);
        return;
      }

      // Charger les images référencées si nécessaire
      if (report.photos) {
        report.photos = report.photos.map((photoRef: string) => {
          if (photoRef.startsWith('report_image_')) {
            // C'est une référence, récupérer l'image
            const imageData = localStorage.getItem(photoRef);
            return imageData || photoRef;
          }
          return photoRef;
        });
      }

      resolve(report);
    }, 500);
  });
};

export const addReport = async (report: Partial<SiteVisitReport>): Promise<SiteVisitReport> => {
  return new Promise((resolve) => {
    setTimeout(async () => {
      try {
        // Générer un ID unique pour le rapport
        const id = `report_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

        if (!report.projectId) {
          throw new Error("projectId est obligatoire pour créer un rapport");
        }
        
        // Récupérer les informations du projet pour obtenir le nom
        let projectName = "PRJ"; // Valeur par défaut
        try {
          const projectsJSON = localStorage.getItem('projectsData');
          if (projectsJSON) {
            const projects = JSON.parse(projectsJSON);
            const project = projects.find(p => String(p.id) === String(report.projectId));
            if (project) {
              projectName = project.name || "PRJ";
              console.log(`Nom du projet trouvé: ${projectName}`);
            }
          }
        } catch (error) {
          console.error("Erreur lors de la récupération du nom du projet:", error);
        }

        // Récupérer les rapports existants pour ce projet pour la numérotation
        const existingReports = await getAllReportsByProjectId(report.projectId);
        
        // Générer le numéro de rapport avec le format CR-XXX-NNN
        const reportNumber = generateReportNumber(projectName, existingReports);
        console.log(`Numéro de rapport généré: ${reportNumber}`);

        // Créer le nouveau rapport
        const newReport: SiteVisitReport = {
          id,
          projectId: report.projectId,
          reportNumber,
          visitDate: report.visitDate || new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          contractor: report.contractor || "",
          inCharge: report.inCharge || "",
          progress: report.progress || 0,
          observations: report.observations || [],
          recommendations: report.recommendations || [],
          participants: report.participants || [],
          taskProgress: report.taskProgress || [],
          photos: report.photos || [],
          reserves: report.reserves || [],
          attachments: report.attachments || [],
          descriptif: report.descriptif || [],
          templateId: report.templateId || "standard",
          signatures: report.signatures || {},
        };
        
        // PARTIE CRITIQUE - Sauvegarde du rapport dans localStorage
        try {
          // Récupérer les rapports existants
          const reportsJSON = localStorage.getItem('siteVisitReports');
          const allReports = reportsJSON ? JSON.parse(reportsJSON) : [];
          
          // Ajouter le nouveau rapport
          allReports.push(newReport);
          
          // Sauvegarder dans localStorage
          localStorage.setItem('siteVisitReports', JSON.stringify(allReports));
          console.log("Rapport sauvegardé avec succès dans localStorage", newReport);
          
          // Ajouter une référence au projet
          updateProjectReports(newReport.projectId, id);
        } catch (storageError) {
          console.error("Erreur de stockage:", storageError);
          throw new Error("Échec de la sauvegarde du rapport dans localStorage");
        }
        
        resolve(newReport as SiteVisitReport);
      } catch (error) {
        console.error("Erreur lors de la sauvegarde du rapport:", error);
        throw error;
      }
    }, 500);
  });
};

// Optimisez storeImagesExternally pour compresser les images base64
const storeImagesExternally = (images: string[], reportId: string): string[] => {
  return images.map((imageData, index) => {
    // Vérifier si c'est une URL ou des données base64
    if (imageData.startsWith('data:')) {
      try {
        // Compresser l'image base64 si elle est trop grande (plus de 500Ko)
        if (imageData.length > 500000) {
          imageData = compressBase64Image(imageData);
        }
        
        // Générer une clé unique pour cette image
        const imageKey = `report_image_${reportId}_${index}`;
        
        try {
          // Sauvegarder l'image compressée
          localStorage.setItem(imageKey, imageData);
          return imageKey; // Retourner la clé comme référence
        } catch (error) {
          // Si l'erreur persiste, utiliser une approche plus radicale
          const smallerImage = createThumbnail(imageData);
          localStorage.setItem(imageKey, smallerImage);
          return imageKey;
        }
      } catch (error) {
        console.error("Erreur lors du stockage de l'image:", error);
        // Retourner une référence à une image d'erreur
        return "/placeholder.svg";
      }
    } else {
      // C'est déjà une URL, la conserver telle quelle
      return imageData;
    }
  });
};

// Fonction pour compresser une image base64 (réduction de qualité)
const compressBase64Image = (base64: string): string => {
  // Version simplifiée - dans un cas réel, utilisez une bibliothèque comme pica.js
  const parts = base64.split(',');
  const header = parts[0];
  // Réduire la qualité en tronquant les données
  const data = parts[1].substring(0, Math.floor(parts[1].length * 0.7));
  return `${header},${data}`;
};

// Créer une miniature d'une image base64
const createThumbnail = (base64: string): string => {
  // Version très simplifiée - en réalité, créez une vraie miniature
  return base64.split(',')[0] + ',/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQICAQECAQEBAgICAgICAgICAQICAgICAgICAgL/2wBDAQEBAQEBAQEBAQECAQEBAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgL/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD+/iiiigD/2Q==';
};

// Ajouter une fonction pour récupérer les images lors du chargement des rapports
export const loadReportWithImages = async (reportId: string): Promise<SiteVisitReport | null> => {
  const report = await getReportById(reportId);
  if (!report) return null;
  
  // Charger les images si nécessaire
  if (report.photos) {
    report.photos = report.photos.map(photoRef => {
      if (photoRef.startsWith('report_image_')) {
        // C'est une référence, récupérer l'image
        const imageData = localStorage.getItem(photoRef);
        return imageData || photoRef;
      }
      return photoRef;
    });
  }
  
  return report;
};

// Améliorez la fonction updateProjectReports
const updateProjectReports = (projectId: string, reportId: string) => {
  try {
    if (!projectId) {
      console.error("ID du projet non défini");
      return;
    }
    
    // Normaliser le projectId en string
    const projectIdString = String(projectId);
    
    // Récupérer les projets
    const projectsJSON = localStorage.getItem('projectsData');
    if (!projectsJSON) {
      console.error("Aucune donnée de projets trouvée");
      return;
    }
    
    const projects = JSON.parse(projectsJSON);
    
    console.log("Recherche du projet", projectIdString, "parmi", projects.length, "projets");
    
    // Trouver le projet en utilisant une comparaison string
    const projectIndex = projects.findIndex(p => String(p.id) === projectIdString);
    if (projectIndex === -1) {
      console.error(`Projet ${projectId} non trouvé, IDs disponibles:`, projects.map(p => p.id));
      return;
    }
    
    console.log("Projet trouvé:", projects[projectIndex].name);
    
    // Initialiser la liste des rapports si nécessaire
    if (!projects[projectIndex].reports) {
      projects[projectIndex].reports = [];
    }
    
    // Ajouter le rapport s'il n'existe pas déjà
    if (!projects[projectIndex].reports.includes(reportId)) {
      projects[projectIndex].reports.push(reportId);
      console.log(`Rapport ${reportId} ajouté à la liste des rapports du projet`);
    } else {
      console.log(`Le rapport ${reportId} existe déjà dans la liste des rapports du projet`);
    }
    
    // Sauvegarder
    localStorage.setItem('projectsData', JSON.stringify(projects));
    
    console.log(`Rapport ${reportId} associé au projet ${projectId}, qui a maintenant ${projects[projectIndex].reports.length} rapports`);
  } catch (error) {
    console.error("Erreur lors de la mise à jour des rapports du projet:", error);
  }
};

// Modification de la fonction updateReport pour garantir la conservation du descriptif

export const updateReport = async (reportId: string, reportData: Partial<SiteVisitReport>): Promise<SiteVisitReport> => {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        console.log("Mise à jour du rapport:", reportId);
        
        // Récupérer tous les rapports
        const reportsJSON = localStorage.getItem('siteVisitReports');
        if (!reportsJSON) {
          throw new Error("Aucun rapport trouvé");
        }
        
        const reports = JSON.parse(reportsJSON);
        const reportIndex = reports.findIndex((r: SiteVisitReport) => r.id === reportId);
        
        if (reportIndex === -1) {
          throw new Error(`Rapport avec ID ${reportId} non trouvé`);
        }
        
        // Récupérer le rapport existant
        const existingReport = reports[reportIndex];
        
        // Récupérer explicitement le descriptif depuis toutes les sources possibles
        // 1. Descriptif dans les données de mise à jour
        // 2. Descriptif dans le rapport existant
        // 3. Descriptif stocké séparément dans localStorage
        let finalDescriptif = null;
        
        // 1. Vérifier les données de mise à jour
        if (reportData.descriptif && Array.isArray(reportData.descriptif) && reportData.descriptif.length > 0) {
          console.log("Utilisation du descriptif fourni dans les données de mise à jour");
          finalDescriptif = reportData.descriptif;
        } 
        // 2. Vérifier le rapport existant
        else if (existingReport.descriptif && Array.isArray(existingReport.descriptif) && existingReport.descriptif.length > 0) {
          console.log("Utilisation du descriptif existant dans le rapport");
          finalDescriptif = existingReport.descriptif;
        } 
        // 3. Vérifier le stockage local spécifique au projet
        else {
          const projectId = existingReport.projectId || reportData.projectId;
          if (projectId) {
            const storageKey = `descriptif-data-${projectId}`;
            const descriptifJSON = localStorage.getItem(storageKey);
            if (descriptifJSON) {
              try {
                const storedDescriptif = JSON.parse(descriptifJSON);
                if (Array.isArray(storedDescriptif) && storedDescriptif.length > 0) {
                  console.log("Utilisation du descriptif trouvé dans le stockage local");
                  finalDescriptif = storedDescriptif;
                }
              } catch (e) {
                console.error("Erreur lors de l'analyse du descriptif stocké", e);
              }
            }
          }
        }
        
        // Si aucun descriptif n'a été trouvé, utiliser un tableau vide
        if (!finalDescriptif) {
          console.log("Aucun descriptif trouvé, utilisation d'un tableau vide");
          finalDescriptif = [];
        }
        
        // Construire le rapport mis à jour
        const updatedReport = {
          ...existingReport,           // Base: rapport existant
          ...reportData,               // Appliquer les nouvelles données
          id: reportId,                // Préserver l'ID
          reportNumber: existingReport.reportNumber, // Préserver le numéro
          descriptif: finalDescriptif, // Utiliser le descriptif déterminé
          updatedAt: new Date().toISOString()
           // Mettre à jour l'horodatage
        };
        
        console.log(`Descriptif final (${finalDescriptif.length} éléments) ajouté au rapport`);
        console.log(`[DEBUG] Rapport ${reportId} mis à jour. Source du descriptif:`, 
          reportData.descriptif ? "données de mise à jour" : 
          (existingReport.descriptif ? "rapport existant" : "localStorage"));
        console.log(`[DEBUG] Taille du descriptif: ${finalDescriptif.length} lots`);
        
        // Mettre à jour le rapport
        reports[reportIndex] = updatedReport;
        localStorage.setItem('siteVisitReports', JSON.stringify(reports));
        
        // Si le descriptif vient du stockage local, le sauvegarder également directement dans le rapport
        // pour éviter toute perte ultérieure
        if (updatedReport.projectId && finalDescriptif.length > 0) {
          localStorage.setItem(`descriptif-data-${updatedReport.projectId}`, JSON.stringify(finalDescriptif));
        }
        
        console.log("Rapport mis à jour avec succès");
        resolve(updatedReport);
        
      } catch (error) {
        console.error("Erreur lors de la mise à jour du rapport:", error);
        reject(error);
      }
    }, 500);
  });
};

// Ajoutez cette fonction pour supprimer un rapport
export const deleteReport = async (reportId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        // Récupérer tous les rapports avec la bonne clé 'siteVisitReports'
        const reportsJSON = localStorage.getItem('siteVisitReports');
        if (!reportsJSON) {
          throw new Error("Aucun rapport trouvé");
        }

        const reports = JSON.parse(reportsJSON);
        const reportIndex = reports.findIndex((r: SiteVisitReport) => r.id === reportId);
        
        if (reportIndex === -1) {
          throw new Error(`Rapport avec ID ${reportId} non trouvé`);
        }

        // Récupérer le rapport pour obtenir le projectId
        const reportToDelete = reports[reportIndex];
        const projectId = reportToDelete.projectId;

        // Supprimer de la liste générale
        reports.splice(reportIndex, 1);
        localStorage.setItem('siteVisitReports', JSON.stringify(reports));

        // Supprimer également les références dans le projet
        if (projectId) {
          // Mettre à jour les références dans le projet
          try {
            const projectsJSON = localStorage.getItem('projectsData');
            if (projectsJSON) {
              const projects = JSON.parse(projectsJSON);
              const projectIndex = projects.findIndex(p => String(p.id) === String(projectId));
              
              if (projectIndex !== -1 && projects[projectIndex].reports) {
                // Filtrer ce rapport de la liste des rapports du projet
                projects[projectIndex].reports = projects[projectIndex].reports
                  .filter((rId: string) => rId !== reportId);
                
                // Sauvegarder les projets mis à jour
                localStorage.setItem('projectsData', JSON.stringify(projects));
              }
            }
          } catch (projectError) {
            console.error("Erreur lors de la mise à jour des références du projet:", projectError);
            // Continue la suppression même si cette partie échoue
          }
        }

        // Supprimer également les images associées
        try {
          // Trouver et supprimer les clés d'image qui commencent par `report_image_${reportId}`
          const imagePrefix = `report_image_${reportId}_`;
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(imagePrefix)) {
              localStorage.removeItem(key);
            }
          }
        } catch (imageError) {
          console.error("Erreur lors de la suppression des images:", imageError);
        }

        console.log("Rapport supprimé avec succès");
        resolve();
        
      } catch (error) {
        console.error("Erreur lors de la suppression du rapport:", error);
        reject(error);
      }
    }, 500);
  });
};

// Simulated file upload
export const uploadFile = async (file: File): Promise<string> => {
  // In a real app, this would upload to cloud storage
  return new Promise((resolve) => {
    setTimeout(() => {
      // Create a temporary URL for the file to preview it
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          resolve(result);
        };
        reader.readAsDataURL(file);
      } else {
        // Return a fake URL for non-image files
        resolve("/placeholder.svg");
      }
    }, 1000);
  });
};

// Add a document attachment to a report
export const addAttachment = async (reportId: string, file: File): Promise<SiteVisitReport | null> => {
  try {
    const fileUrl = await uploadFile(file);
    const report = await getReportById(reportId);
    
    if (!report) return null;
    
    const attachments = report.attachments || [];
    const updatedReport = await updateReport(reportId, {
      attachments: [...attachments, fileUrl]
    });
    
    return updatedReport;
  } catch (error) {
    console.error("Error adding attachment:", error);
    return null;
  }
};
