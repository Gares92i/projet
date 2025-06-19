import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { useReportForm, AnnotationReserve } from "@/hooks/use-report-form";
import { useIsMobile } from "@/hooks/use-mobile";
import { ReportTemplateSelector } from "@/components/project/ReportTemplateSelector";
import ReportHeader from "@/components/project/ReportHeader";
import { GeneralInfoSection } from "@/components/project/GeneralInfoSection";
import { PhotosSection } from "@/components/project/PhotosSection";
import { ObservationsSection } from "@/components/project/ObservationsSection";
import { RecommendationsSection } from "@/components/project/RecommendationsSection";
import { useStorageUpload } from "@/hooks/use-storage-upload";
import { AdditionalDetailsSection } from "@/components/project/AdditionalDetailsSection";
import { ParticipantsSection } from "@/components/project/ParticipantsSection";
import { ReportAnnotationsSection } from "@/components/project/ReportAnnotationsSection";
import { TaskProgressSelector } from "@/components/project/TaskProgressSelector";
import { TaskProgressDisplay } from "@/components/project/TaskProgressDisplay";
import { syncReportParticipantsWithTeamMembers } from "@/services/team/teamMembersService";
import { calculateAverageProgress } from "@/utils/progressUtils";

// import { getOrCreateDefaultTeam } from "@/services/teamService"; // Removed import
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { SiteVisitReport, TaskProgress } from "@/types";
import { addReport, updateReport } from "@/services/reportService";

// Fonction pour récupérer les données d'une table spécifique
const getTableData = (projectId: string, tableName: string) => {
  try {
    const storageKey = `${tableName}-data-${projectId}`;
    const jsonData = localStorage.getItem(storageKey);
    return jsonData ? JSON.parse(jsonData) : null;
  } catch (error) {
    console.error(`Erreur lors de la récupération des données ${tableName}:`, error);
    return null;
  }
};

const SiteVisitReportForm = ({
  projectId: propProjectId,
  initialData,
  onSubmit,
}: {
  projectId?: string;
  initialData?: Partial<SiteVisitReport>;
  onSubmit?: (
    data: Partial<SiteVisitReport>
  ) => Promise<SiteVisitReport | string>;
}) => {
  const { projectId: urlProjectId, reportId } = useParams();
  const projectId = propProjectId || urlProjectId;

  console.log("ID du projet utilisé:", projectId);
  console.log("ID du rapport (depuis URL):", reportId);
  console.log("initialData fourni:", initialData);

  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Définir explicitement si nous sommes en mode édition en fonction de reportId ou initialData.id
  const isEditingMode = Boolean(reportId || initialData?.id);
  console.log("Mode édition détecté:", isEditingMode);

  const {
    form,
    participants,
    setParticipants,
    observations,
    setObservations,
    recommendations,
    setRecommendations,
    photos,
    setPhotos,
    project,
    isLoading,
    isEditing, // Cette valeur vient du hook, mais nous utilisons notre propre détection plus fiable
    selectedTemplate,
    setSelectedTemplate,
    shouldShowSection,
    formSchema,
    reserves,
    setReserves,
    projectAnnotations,
  } = useReportForm();

  const {
    isUploading,
    processReservesImages,
    processAnnotationImages,
    uploadImage,
    processDocumentAnnotations,
  } = useStorageUpload();

  const [taskProgress, setTaskProgress] = useState<TaskProgress[]>([]);
  const [defaultTeamId, setDefaultTeamId] = useState<string>("");

  useEffect(() => {
    const fetchDefaultTeamId = async () => {
      let teamId = localStorage.getItem('defaultTeamId');
      if (!teamId) {
        console.warn("No defaultTeamId in localStorage for features/reports/pages/SiteVisitReportForm. Generating a fallback.");
        teamId = `generated-default-${Date.now()}`; // Ensure unique fallback if multiple forms load simultaneously
        localStorage.setItem('defaultTeamId', teamId);
        toast.info("ID d'équipe par défaut généré (features).", { description: "Aucun ID existant trouvé." });
      }
      setDefaultTeamId(teamId);
      console.log("ID d'équipe par défaut utilisé (features):", teamId);
    };
    
    fetchDefaultTeamId();
  }, []);

  useEffect(() => {
    if (initialData) {
      console.log("InitialData reçu dans SiteVisitReportForm:", initialData);

      // S'assurer que form est correctement initialisé
      form.reset({
        visitDate: new Date(initialData.visitDate || new Date().toISOString()),
        contractor: initialData.contractor || "",
        inCharge: initialData.inCharge || "",
        progress: initialData.progress || 0,
        additionalDetails: initialData.additionalDetails || "",
      });

      // Initialiser les participants directement dans le hook, pas dans l'état local
      if (initialData.participants && Array.isArray(initialData.participants)) {
        console.log(
          "Initialisation des participants:",
          initialData.participants.length
        );
        setParticipants(initialData.participants);
      }

      // Initialiser les tâches si elles existent
      if (initialData.taskProgress) {
        setTaskProgress(initialData.taskProgress);
      }

      // Autres initialisations...
      if (initialData.observations) setObservations(initialData.observations);
      if (initialData.recommendations)
        setRecommendations(initialData.recommendations);
      if (initialData.photos) setPhotos(initialData.photos);

      // Convertir les réserves en AnnotationReserve
      if (initialData.reserves && Array.isArray(initialData.reserves)) {
        // Fonction typée pour convertir une réserve
        const convertReserve = <T extends { resolvedAt?: string }>(
          reserve: T
        ) => {
          return {
            ...reserve,
            status: reserve.resolvedAt
              ? ("resolved" as const)
              : ("pending" as const),
          };
        };

        const convertedReserves = initialData.reserves.map(convertReserve);
        setReserves(convertedReserves as AnnotationReserve[]);
      }
    }
  }, [
    initialData,
    form,
    setParticipants,
    setObservations,
    setRecommendations,
    setPhotos,
    setReserves,
  ]);

  // Dans la fonction handleSubmit, ajouter la préservation du descriptif
  const handleSubmit = async (data) => {
    try {
      // Vérification du projectId
      if (!projectId) {
        toast.error("ID du projet non défini");
        console.error(
          "projectId est undefined lors de la soumission du formulaire"
        );
        return;
      }

      // Traiter les photos comme dans votre ancien code
      const processedPhotos = [];
      for (const photo of photos) {
        if (photo.startsWith("data:")) {
          const url = await uploadImage(photo, projectId);
          processedPhotos.push(url);
        } else {
          processedPhotos.push(photo);
        }
      }

      // Traiter les réserves et annotations
      const processedReserves = await processReservesImages(
        reserves,
        projectId
      );
      const processedAnnotations = await processDocumentAnnotations(
        projectAnnotations,
        projectId
      );

      // TRÈS IMPORTANT: L'ID du rapport à mettre à jour doit être déterminé correctement
      // Utilisons reportId de l'URL ou initialData.id s'il est disponible
      const existingReportId = reportId || initialData?.id;

      console.log("ID du rapport existant à mettre à jour:", existingReportId);
      console.log("Mode édition détecté:", isEditingMode);

      // Récupérer les données descriptif existantes pour les préserver
      const existingDescriptif = getTableData(projectId, "descriptif");
      
      // Préserver explicitement le descriptif existant
      let descriptifToUse = [];
    
      // 1. Vérifier si nous avons déjà un descriptif dans le formulaire
      if (data.descriptif && Array.isArray(data.descriptif) && data.descriptif.length > 0) {
        descriptifToUse = data.descriptif;
      } 
      // 2. Si on est en mode édition, récupérer le descriptif du rapport existant
      else if (isEditingMode && initialData && initialData.descriptif) {
        descriptifToUse = initialData.descriptif;
      } 
      // 3. Essayer de récupérer depuis le localStorage du projet
      else {
        const projectDescriptif = getTableData(projectId, "descriptif");
        if (projectDescriptif && Array.isArray(projectDescriptif)) {
          descriptifToUse = projectDescriptif;
        }
      }
    
      // Créer les données finales
      const finalData = {
        ...data,
        photos: processedPhotos,
        reserves: processedReserves,
        annotations: processedAnnotations,
        participants: participants,
        taskProgress: taskProgress,

        // Calculer automatiquement la progression si des lots sont définis
        progress: taskProgress && taskProgress.length > 0
          ? calculateAverageProgress(taskProgress)
          : data.progress || 0,
        projectId: projectId,
        // Préserver les données du descriptif s'il existe
        descriptif: descriptifToUse,
        // Conserver l'ID et le numéro de rapport lors de l'édition
        ...(isEditingMode &&
          initialData && {
            id: existingReportId,
            reportNumber: initialData.reportNumber,
          }),
        // Ne mettre à jour la date de création que pour les nouveaux rapports
        ...(isEditingMode ? {} : { createdAt: new Date().toISOString() }),
        // Ajouter une date de mise à jour
        updatedAt: new Date().toISOString(),
      };

      console.log("Données finales à soumettre:", finalData);

      // Soumettre les données
      if (typeof onSubmit === "function") {
        await onSubmit(finalData);
        toast.success(
          `Rapport ${isEditingMode ? "mis à jour" : "créé"} avec succès`
        );
      } else {
        console.log(
          `${isEditingMode ? "Mise à jour" : "Sauvegarde"} locale du rapport`
        );

        try {
          let savedReport;

          // Solution d'urgence: libérer de l'espace dans localStorage
          try {
            // Tentative de libération d'espace
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              // Éviter de supprimer des données critiques
              if (
                key &&
                !key.includes("siteVisit") &&
                !key.includes("user") &&
                !key.includes("auth") &&
                !key.includes("project")
              ) {
                keysToRemove.push(key);
              }
            }
            // Supprimer les données non critiques
            keysToRemove.forEach((key) => localStorage.removeItem(key));
            console.log(`Espace libéré: ${keysToRemove.length} éléments supprimés`);
          } catch (e) {
            console.warn("Échec de libération d'espace:", e);
          }

          // Dans la fonction handleSubmit, avant d'appeler updateReport, ajoutez ce code:
          const finalReportData = {
            ...finalData,
            observations: observations,
            recommendations: recommendations,
            // Préserver explicitement le descriptif
            descriptif:
              getTableData(projectId, "descriptif") ||
              initialData?.descriptif ||
              [],
          };

          // Vérifier si les données du formulaire contiennent un descriptif vide
          if (finalReportData.descriptif && Array.isArray(finalReportData.descriptif) && finalReportData.descriptif.length === 0) {
            // Supprimer cette propriété pour éviter qu'elle n'écrase le descriptif existant
            delete finalReportData.descriptif;
            console.log("Suppression du descriptif vide pour préserver l'existant");
          }

          if (isEditingMode && existingReportId) {
            console.log("Mise à jour du rapport ID:", existingReportId);
            // Mise à jour d'un rapport existant
            savedReport = await updateReport(existingReportId, finalReportData);
            toast.success("Rapport mis à jour avec succès");
          } else {
            // Création d'un nouveau rapport
            console.log("Création d'un nouveau rapport");
            savedReport = await addReport(finalReportData);
            toast.success("Rapport créé avec succès");
          }

          // Redirection après sauvegarde avec l'ID généré/existant
          navigate(`/projects/${projectId}/report/${savedReport.id}`);

          // Après avoir sauvegardé le rapport
          await syncReportParticipantsWithTeamMembers(
            savedReport.participants,
            defaultTeamId
          );
        } catch (error) {
          console.error("Erreur lors de la sauvegarde du rapport:", error);
          toast.error(
            `Erreur lors de la ${
              isEditingMode ? "mise à jour" : "création"
            } du rapport`
          );
        }
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error(
        `Erreur lors de la ${
          isEditingMode ? "mise à jour" : "création"
        } du rapport`
      );
    }
  };

  return (
    <MainLayout>
      <div className="flex items-center mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/projects/${projectId}`)}
          className="mr-4">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Retour
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditingMode ? "Modifier le" : "Nouveau"} Compte Rendu de Visite
          </h1>
          <p className="text-muted-foreground">
            Projet: {project?.name || "Chargement..."}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Modèle de rapport</h2>
        <ReportTemplateSelector
          selectedTemplate={selectedTemplate}
          onSelectTemplate={setSelectedTemplate}
        />
      </div>

      {projectId && (
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-2">Aperçu de l'en-tête</h2>
          <ReportHeader
            projectId={projectId}
            reportNumber={
              isEditingMode && initialData?.reportNumber
                ? initialData.reportNumber
                : `CR-${
                    project?.name?.substring(0, 3).toUpperCase() || "XXX"
                  }-???`
            }
            visitDate={form.getValues("visitDate").toISOString()}
          />
          {!isEditingMode && (
            <p className="text-xs text-muted-foreground mt-1">
              * Le numéro définitif sera attribué lors de la création du rapport
            </p>
          )}
        </div>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <GeneralInfoSection form={form} taskProgress={taskProgress} />
          <ParticipantsSection
            projectId={projectId}
            initialParticipants={participants}
            onChange={setParticipants}
          />
          <TaskProgressSelector
            projectId={projectId}
            initialProgress={taskProgress}
            onChange={setTaskProgress}
          />

          {shouldShowSection("reserves") && (
            <ReportAnnotationsSection
              reserves={reserves}
              setReserves={setReserves}
              annotations={projectAnnotations}
              projectId={projectId || ""}
            />
          )}

          {shouldShowSection("photos") && (
            <PhotosSection photos={photos} setPhotos={setPhotos} />
          )}

          {shouldShowSection("observations") && (
            <ObservationsSection
              observations={observations}
              setObservations={setObservations}
              isMobile={isMobile}
            />
          )}

          {shouldShowSection("recommendations") && (
            <RecommendationsSection
              recommendations={recommendations}
              setRecommendations={setRecommendations}
              isMobile={isMobile}
            />
          )}

          {shouldShowSection("additionalDetails") && (
            <AdditionalDetailsSection
              form={form}
              showSignatures={shouldShowSection("signatures")}
              formSchema={formSchema}
            />
          )}

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/projects/${projectId}`)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? isEditingMode
                  ? "Mise à jour en cours..."
                  : "Création en cours..."
                : isEditingMode
                ? "Mettre à jour"
                : "Créer le compte rendu"}
            </Button>
          </div>
        </form>
      </Form>
    </MainLayout>
  );
};

export default SiteVisitReportForm;
