import { SiteVisitReport, Observation, Recommendation, ArchitectInfo, Reserve, TaskProgress } from "@/app/styles";
import { createApiClient } from "@/features/common/services/apiClient";
import { updateProject } from "./projectService";

// Fonctions utilitaires pour la compression d'images
const compressBase64Image = (base64: string): string => {
  // Version simplifiée - dans un cas réel, utilisez une bibliothèque comme pica.js
  const parts = base64.split(',');
  const header = parts[0];
  // Réduire la qualité en tronquant les données
  const data = parts[1].substring(0, Math.floor(parts[1].length * 0.7));
  return `${header},${data}`;
};

const createThumbnail = (base64: string): string => {
  // Version simplifiée - en réalité, créez une vraie miniature
  return base64.split(',')[0] + ',/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQICAQECAQEBAgICAgICAgICAQICAgICAgICAgL/2wBDAQEBAQEBAQEBAQECAQEBAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgL/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD+/iiiigD/2Q==';
};

// Fonction pour stocker les images
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

// Fonction pour générer un numéro de rapport
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

// Service principal pour les rapports
export const reportService = {
  // Récupérer tous les rapports d'un projet
  getAllReportsByProjectId: async (projectId: string): Promise<SiteVisitReport[]> => {
    const api = createApiClient();
    
    try {
      return await api.get<SiteVisitReport[]>(`/projects/${projectId}/reports`);
    } catch (error) {
      console.error(`Erreur lors de la récupération des rapports du projet ${projectId}:`, error);
      
      // Fallback sur localStorage
      try {
        const reportsJSON = localStorage.getItem('siteVisitReports');
        const allReports = reportsJSON ? JSON.parse(reportsJSON) : [];
        const projectIdString = String(projectId);
        const projectReports = allReports.filter(report => String(report.projectId) === projectIdString);
        return projectReports;
      } catch (localError) {
        console.error("Erreur lors de la récupération locale des rapports:", localError);
        return [];
      }
    }
  },
  
  // Récupérer un rapport par son ID
  getReportById: async (reportId: string): Promise<SiteVisitReport | null> => {
    const api = createApiClient();
    
    try {
      return await api.get<SiteVisitReport>(`/reports/${reportId}`);
    } catch (error) {
      console.error(`Erreur lors de la récupération du rapport ${reportId}:`, error);
      
      // Fallback sur localStorage
      try {
        const reportsData = localStorage.getItem('siteVisitReports');
        if (!reportsData) return null;
        
        const reports = JSON.parse(reportsData);
        const report = reports.find((r: SiteVisitReport) => r.id === reportId);
        
        if (!report) return null;
        
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
        
        return report;
      } catch (localError) {
        console.error("Erreur lors de la récupération locale du rapport:", localError);
        return null;
      }
    }
  },
  
  // Ajouter un nouveau rapport
  addReport: async (report: Partial<SiteVisitReport>): Promise<SiteVisitReport> => {
    const api = createApiClient();
    
    try {
      // Traiter les photos si nécessaires
      let processedPhotos = report.photos || [];
      if (processedPhotos.some(photo => photo.startsWith('data:'))) {
        // Récupérer directement l'API pour éviter les limitations de taille
        const { Authorization } = await api.getAuthHeaders();
        const uploadEndpoint = `${import.meta.env.VITE_API_URL}/upload`;
        
        // Upload des photos une par une
        const uploadPromises = processedPhotos.map(async (photo, index) => {
          if (photo.startsWith('data:')) {
            try {
              // Créer un blob à partir des données base64
              const res = await fetch(photo);
              const blob = await res.blob();
              
              // Créer un FormData pour l'upload
              const formData = new FormData();
              formData.append("file", blob, `report_photo_${index}.jpg`);
              formData.append("path", `reports/${report.projectId}`);
              
              // Effectuer l'upload
              const response = await fetch(uploadEndpoint, {
                method: 'POST',
                headers: { Authorization },
                body: formData
              });
              
              if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
              
              const data = await response.json();
              return data.url;
            } catch (uploadError) {
              console.error(`Erreur lors de l'upload de la photo ${index}:`, uploadError);
              return photo; // Conserver le base64 en cas d'erreur
            }
          }
          return photo; // Retourner l'URL inchangée si ce n'est pas du base64
        });
        
        // Attendre que tous les uploads soient terminés
        processedPhotos = await Promise.all(uploadPromises);
      }
      
      // Récupérer le nom du projet pour la numérotation
      let projectName = "PRJ";
      try {
        const projectResponse = await api.get(`/projects/${report.projectId}`);
        projectName = projectResponse.name || "PRJ";
      } catch (projectError) {
        console.error("Erreur lors de la récupération du nom du projet:", projectError);
      }
      
      // Récupérer les rapports existants pour la numérotation
      const existingReports = await reportService.getAllReportsByProjectId(report.projectId as string);
      const reportNumber = generateReportNumber(projectName, existingReports);
      
      // Créer le rapport avec les photos traitées
      const newReport = await api.post<SiteVisitReport>('/reports', {
        ...report,
        photos: processedPhotos,
        reportNumber,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      return newReport;
    } catch (error) {
      console.error("Erreur lors de l'ajout du rapport:", error);
      
      // Fallback: création locale
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
            }
          }
        } catch (projectError) {
          console.error("Erreur lors de la récupération du nom du projet:", projectError);
        }
        
        // Récupérer les rapports existants pour ce projet pour la numérotation
        const existingReports = await reportService.getAllReportsByProjectId(report.projectId);
        
        // Générer le numéro de rapport avec le format CR-XXX-NNN
        const reportNumber = generateReportNumber(projectName, existingReports);
        
        // Traitement des photos pour le stockage local
        const processedPhotos = report.photos ? storeImagesExternally(report.photos, id) : [];
        
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
          photos: processedPhotos,
          reserves: report.reserves || [],
          attachments: report.attachments || [],
          descriptif: report.descriptif || [],
          templateId: report.templateId || "standard",
          signatures: report.signatures || {},
        };
        
        // Sauvegarder dans localStorage
        const reportsJSON = localStorage.getItem('siteVisitReports');
        const allReports = reportsJSON ? JSON.parse(reportsJSON) : [];
        allReports.push(newReport);
        localStorage.setItem('siteVisitReports', JSON.stringify(allReports));
        
        // Ajouter une référence au projet
        updateProjectReferences(newReport.projectId, id);
        
        return newReport;
      } catch (localError) {
        console.error("Erreur lors de la sauvegarde locale du rapport:", localError);
        throw error; // Re-lancer l'erreur originale
      }
    }
  },
  
  // Mise à jour d'un rapport existant
  updateReport: async (reportId: string, updates: Partial<SiteVisitReport>): Promise<SiteVisitReport> => {
    const api = createApiClient();
    
    try {
      // Récupérer d'abord le rapport existant pour préserver le descriptif
      const existingReport = await reportService.getReportById(reportId);
      if (!existingReport) {
        throw new Error(`Rapport ${reportId} non trouvé`);
      }
      
      // Préserver explicitement le descriptif s'il n'est pas fourni
      let finalDescriptif = updates.descriptif;
      if (!finalDescriptif || (Array.isArray(finalDescriptif) && finalDescriptif.length === 0)) {
        finalDescriptif = existingReport.descriptif;
      }
      
      // Mettre à jour le rapport
      return await api.put<SiteVisitReport>(`/reports/${reportId}`, {
        ...updates,
        descriptif: finalDescriptif,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du rapport ${reportId}:`, error);
      
      // Fallback: mise à jour locale
      try {
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
        let finalDescriptif = null;
        
        // 1. Vérifier les données de mise à jour
        if (updates.descriptif && Array.isArray(updates.descriptif) && updates.descriptif.length > 0) {
          finalDescriptif = updates.descriptif;
        } 
        // 2. Vérifier le rapport existant
        else if (existingReport.descriptif && Array.isArray(existingReport.descriptif) && existingReport.descriptif.length > 0) {
          finalDescriptif = existingReport.descriptif;
        } 
        // 3. Vérifier le stockage local spécifique au projet
        else {
          const projectId = existingReport.projectId || updates.projectId;
          if (projectId) {
            const storageKey = `descriptif-data-${projectId}`;
            const descriptifJSON = localStorage.getItem(storageKey);
            if (descriptifJSON) {
              try {
                const storedDescriptif = JSON.parse(descriptifJSON);
                if (Array.isArray(storedDescriptif) && storedDescriptif.length > 0) {
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
          finalDescriptif = [];
        }
        
        // Construire le rapport mis à jour
        const updatedReport = {
          ...existingReport,           // Base: rapport existant
          ...updates,                  // Appliquer les nouvelles données
          id: reportId,                // Préserver l'ID
          reportNumber: existingReport.reportNumber, // Préserver le numéro
          descriptif: finalDescriptif, // Utiliser le descriptif déterminé
          updatedAt: new Date().toISOString() // Mettre à jour l'horodatage
        };
        
        // Mettre à jour le rapport
        reports[reportIndex] = updatedReport;
        localStorage.setItem('siteVisitReports', JSON.stringify(reports));
        
        return updatedReport;
      } catch (localError) {
        console.error("Erreur lors de la mise à jour locale du rapport:", localError);
        throw error; // Re-lancer l'erreur originale
      }
    }
  },
  
  // Suppression d'un rapport
  deleteReport: async (reportId: string): Promise<boolean> => {
    const api = createApiClient();
    
    try {
      await api.delete(`/reports/${reportId}`);
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression du rapport ${reportId}:`, error);
      
      // Fallback: suppression locale
      try {
        const reportsJSON = localStorage.getItem('siteVisitReports');
        if (!reportsJSON) return false;
        
        const reports = JSON.parse(reportsJSON);
        const reportIndex = reports.findIndex((r: SiteVisitReport) => r.id === reportId);
        
        if (reportIndex === -1) return false;
        
        // Récupérer le rapport pour obtenir le projectId
        const reportToDelete = reports[reportIndex];
        const projectId = reportToDelete.projectId;
        
        // Supprimer de la liste générale
        reports.splice(reportIndex, 1);
        localStorage.setItem('siteVisitReports', JSON.stringify(reports));
        
        // Supprimer également les références dans le projet
        if (projectId) {
          removeProjectReference(projectId, reportId);
        }
        
        // Supprimer également les images associées
        clearReportImages(reportId);
        
        return true;
      } catch (localError) {
        console.error("Erreur lors de la suppression locale du rapport:", localError);
        return false;
      }
    }
  },
  
  // Ajout d'une pièce jointe
  addAttachment: async (reportId: string, file: File): Promise<SiteVisitReport | null> => {
    const api = createApiClient();
    
    try {
      // Créer un FormData pour l'upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("path", `reports/${reportId}/attachments`);
      
      // Obtenir les headers d'authentification
      const { Authorization } = await api.getAuthHeaders();
      
      // Effectuer l'upload
      const response = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
        method: 'POST',
        headers: { Authorization },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }
      
      const data = await response.json();
      const fileUrl = data.url;
      
      // Récupérer le rapport existant
      const report = await reportService.getReportById(reportId);
      if (!report) return null;
      
      // Ajouter la pièce jointe au rapport
      const attachments = report.attachments || [];
      return await reportService.updateReport(reportId, {
        attachments: [...attachments, fileUrl]
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout de la pièce jointe:", error);
      
      // Fallback: ajout local
      try {
        const fileUrl = await uploadFile(file);
        const report = await reportService.getReportById(reportId);
        
        if (!report) return null;
        
        const attachments = report.attachments || [];
        return await reportService.updateReport(reportId, {
          attachments: [...attachments, fileUrl]
        });
      } catch (localError) {
        console.error("Erreur lors de l'ajout local de la pièce jointe:", localError);
        return null;
      }
    }
  },
  
  // Récupérer et sauvegarder les informations d'architecte
  getArchitectInfo: async (): Promise<ArchitectInfo | null> => {
    const api = createApiClient();
    
    try {
      return await api.get<ArchitectInfo>('/architect-info');
    } catch (error) {
      console.error("Erreur lors de la récupération des informations d'architecte:", error);
      
      // Fallback: récupération locale
      try {
        const data = localStorage.getItem('architectInfo');
        if (!data) return null;
        
        return JSON.parse(data) as ArchitectInfo;
      } catch (localError) {
        console.error("Erreur lors de la récupération locale des informations d'architecte:", localError);
        return null;
      }
    }
  },
  
  saveArchitectInfo: async (info: ArchitectInfo): Promise<boolean> => {
    const api = createApiClient();
    
    try {
      await api.put('/architect-info', info);
      return true;
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des informations d'architecte:", error);
      
      // Fallback: sauvegarde locale
      try {
        localStorage.setItem('architectInfo', JSON.stringify(info));
        return true;
      } catch (localError) {
        console.error("Erreur lors de la sauvegarde locale des informations d'architecte:", localError);
        return false;
      }
    }
  },
  
  // Charger un rapport avec ses images
  loadReportWithImages: async (reportId: string): Promise<SiteVisitReport | null> => {
    const report = await reportService.getReportById(reportId);
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
  }
};

// Fonctions utilitaires pour le fallback local

// Upload simulé de fichier pour le fallback local
export const uploadFile = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          resolve(result);
        };
        reader.readAsDataURL(file);
      } else {
        // URL factice pour les fichiers non-image
        resolve("/placeholder.svg");
      }
    }, 1000);
  });
};

// Mise à jour des références de rapports dans un projet
const updateProjectReferences = (projectId: string, reportId: string) => {
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
    
    // Trouver le projet en utilisant une comparaison string
    const projectIndex = projects.findIndex(p => String(p.id) === projectIdString);
    if (projectIndex === -1) {
      console.error(`Projet ${projectId} non trouvé`);
      return;
    }
    
    // Initialiser la liste des rapports si nécessaire
    if (!projects[projectIndex].reports) {
      projects[projectIndex].reports = [];
    }
    
    // Ajouter le rapport s'il n'existe pas déjà
    if (!projects[projectIndex].reports.includes(reportId)) {
      projects[projectIndex].reports.push(reportId);
    }
    
    // Sauvegarder
    localStorage.setItem('projectsData', JSON.stringify(projects));
  } catch (error) {
    console.error("Erreur lors de la mise à jour des rapports du projet:", error);
  }
};

// Suppression d'une référence de rapport dans un projet
const removeProjectReference = (projectId: string, reportId: string) => {
  try {
    // Mettre à jour les références dans le projet
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
  } catch (error) {
    console.error("Erreur lors de la suppression de la référence du projet:", error);
  }
};

// Nettoyage des images d'un rapport
const clearReportImages = (reportId: string) => {
  try {
    // Trouver et supprimer les clés d'image qui commencent par `report_image_${reportId}`
    const imagePrefix = `report_image_${reportId}_`;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(imagePrefix)) {
        localStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.error("Erreur lors de la suppression des images:", error);
  }
};

// Exporter les fonctions individuelles pour la compatibilité avec le code existant
export const getAllReportsByProjectId = reportService.getAllReportsByProjectId;
export const getReportById = reportService.getReportById;
export const addReport = reportService.addReport;
export const updateReport = reportService.updateReport;
export const deleteReport = reportService.deleteReport;
export const addAttachment = reportService.addAttachment;
export const getArchitectInfo = reportService.getArchitectInfo;
export const saveArchitectInfo = reportService.saveArchitectInfo;
export const loadReportWithImages = reportService.loadReportWithImages;