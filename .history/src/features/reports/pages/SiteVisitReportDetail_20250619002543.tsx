import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/ui/button";

import { TaskProgressDisplay } from "@/features/projects/components/TaskProgressDisplay";

import { getProjectAnnotations } from "@/features/annotations/services/annotationService";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/ui/card";
import { Badge } from "@/ui/badge";
import {
  ChevronLeft,
  Calendar,
  User,
  Building,
  FileText,
  Printer,
  Mail,
  Edit,
  Download,
  FileUp,
  Eye,
  FilePlus,
  Paperclip,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/ui/table";
import { Separator } from "@/ui/separator";
import { Progress } from "@/ui/progress";
import { toast } from "sonner";
import {
  getReportById,
  addAttachment,
} from "@/features/reports/services/reportService";
import { getProjectById } from "@/features/projects/services/projectService";
import { SiteVisitReport } from "@/app/styles";
import { ProjectCardProps } from "@/features/projects/components/ProjectCard";
import ReportHeader from "@/features/r/components/ReportHeader";
import ReportFooter from "@/features/projects/components/ReportFooter";
import { SiteVisitReportUploader } from "@/features/projects/components/SiteVisitReportUploader";

import { TaskProgress, Participant } from "@/app/styles";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/ui/dialog";
import { reportTemplates } from "@/features/projects/components/ReportTemplateSelector";
import { Annotation } from "@/app/styles";
import { AnnotationReserve } from "@/hooks/use-report-form";
import { AnnotationReserveItem } from "@/features/projects/components/AnnotationReserveItem";
import { AnnotationsTable } from "@/features/projects/components/AnnotationsTable";
// Ajout de l'import pour AsyncImage
import { AsyncImage } from "@/ui/AsyncImage";
import { generateAnnotatedImage } from "@/utils/annotationUtils";
import { calculateAverageProgress } from "@/utils/progressUtils";
import { ArchitectInfo } from "@/app/styles";
import { getArchitectInfo } from "@/features/reportService";

const SiteVisitReportDetail = () => {
  const { projectId, reportId } = useParams<{
    projectId: string;
    reportId: string;
  }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<SiteVisitReport | null>(null);
  const [project, setProject] = useState<ProjectCardProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingAttachment, setAddingAttachment] = useState(false);
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const [taskProgress, setTaskProgress] = useState<TaskProgress[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [projectAnnotations, setProjectAnnotations] = useState<Annotation[]>(
    []
  );
  const [annotatedImageUrls, setAnnotatedImageUrls] = useState<
    Record<string, string>
  >({});
  const [architectInfo, setArchitectInfo] = useState<ArchitectInfo | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!reportId || !projectId) return;

      try {
        setLoading(true);
        // Fetch report data
        const reportData = await getReportById(reportId);

        if (!reportData) {
          toast.error("Rapport introuvable");
          navigate(`/projects/${projectId}`);
          return;
        }

        setReport(reportData);

        // Fetch project data
        const projectData = await getProjectById(projectId);
        if (projectData) {
          setProject(projectData);
        }

        // Récupérer les annotations du projet
        const projectAnnotationsData = await getProjectAnnotations(projectId);
        if (projectAnnotationsData) {
          setProjectAnnotations(projectAnnotationsData);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        toast.error("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [reportId, projectId, navigate]);

  // Dans le useEffect qui charge les données du rapport
  useEffect(() => {
    const loadReport = async () => {
      if (!reportId || !projectId) return;

      try {
        setLoading(true);
        // Fetch report data
        const reportData = await getReportById(reportId);

        if (!reportData) {
          toast.error("Rapport introuvable");
          navigate(`/projects/${projectId}`);
          return;
        }

        setReport(reportData);

        // Fetch project data
        const projectData = await getProjectById(projectId);
        if (projectData) {
          setProject(projectData);
        }

        // Récupérer les annotations du projet
        const projectAnnotationsData = await getProjectAnnotations(projectId);
        if (projectAnnotationsData) {
          setProjectAnnotations(projectAnnotationsData);
        }

        if (reportData?.participants?.length > 0) {
          // Ajouter cette ligne pour synchroniser les participants avec l'équipe
          import('@/services/teamService').then(({ syncLocalMembersWithReports }) => {
            // D'abord sauvegarder les participants comme membres potentiels
            try {
              const participantsAsMembers = reportData.participants.map(p => ({
                id: p.id,
                name: p.contact || "",
                email: p.email || "",
                phone: p.phone || "",
                role: p.role || "autre",
                status: "active",
                team_id: "local-team",
                user_id: `user_${p.id}`
              }));

              // Récupérer les membres existants
              const storedData = localStorage.getItem('teamMembersData');
              const existingMembers = storedData ? JSON.parse(storedData) : [];

              // Fusionner sans dupliquer
              let updated = false;
              for (const member of participantsAsMembers) {
                if (!existingMembers.some(m => m.id === member.id)) {
                  existingMembers.push(member);
                  updated = true;
                }
              }

              if (updated) {
                localStorage.setItem('teamMembersData', JSON.stringify(existingMembers));
                console.log("Participants du rapport synchronisés avec l'équipe");
              }

              syncLocalMembersWithReports();
            } catch (error) {
              console.error("Erreur lors de la synchronisation du rapport:", error);
            }
          });
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        toast.error("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [reportId, projectId, navigate]);

  useEffect(() => {
    const fetchArchitectInfo = async () => {
      try {
        const info = await getArchitectInfo();
        setArchitectInfo(info);
      } catch (error) {
        console.error("Erreur lors du chargement des informations de l'architecte:", error);
      }
    };

    fetchArchitectInfo();
  }, []);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const getStatusBadge = (status: string | undefined) => {
    if (!status) return <Badge variant="outline">Non défini</Badge>;

    const statusLower = status.toLowerCase();

    switch (statusLower) {
      case "pending":
        return <Badge variant="outline">En attente</Badge>;
      case "in-progress":
        return <Badge className="bg-yellow-500">En cours</Badge>;
      case "completed":
        return <Badge className="bg-green-500">Terminé</Badge>;
      case "on-hold":
        return <Badge className="bg-gray-500">En pause</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  const getProgressColor = (progress: number): string => {
    if (progress < 30) return "#ef4444"; // rouge
    if (progress < 70) return "#f97316"; // orange
    return "#22c55e"; // vert
  };
  const handleAddAttachment = async (fileUrl: string) => {
    if (!reportId) return;
    setAddingAttachment(true);

    try {
      toast.success("Document joint avec succès");
      if (report) {
        const attachments = report.attachments || [];
        setReport({
          ...report,
          attachments: [...attachments, fileUrl],
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout du document:", error);
      toast.error("Erreur lors de l'ajout du document");
    } finally {
      setAddingAttachment(false);
    }
  };

  const annotationsByDocument = React.useMemo(() => {
    const grouped: Record<
      string,
      {
        documentName: string;
        documentId: string;
        documentUrl?: string;
        capturedImageUrl?: string; // Ajoutez cette propriété au type
        annotations: Annotation[];
      }
    > = {};

    if (!projectAnnotations?.length) return grouped;

    // IMPORTANT: Ne pas trier les annotations, conserver l'ordre original
    // pour correspondre à l'affichage dans ImageViewer
    projectAnnotations.forEach((annotation) => {
      if (!annotation?.documentId || !annotation?.documentName) return;

      const documentId = annotation.documentId;
      const documentName = annotation.documentName;

      // Si ce groupe de document n'existe pas encore, le créer
      if (!grouped[documentId]) {
        grouped[documentId] = {
          documentName,
          documentId,
          documentUrl: annotation.documentUrl,
          capturedImageUrl: annotation.capturedImageUrl, // Ajoutez cette propriété
          annotations: [],
        };
      }

      // Ajouter l'annotation au groupe
      grouped[documentId].annotations.push({
        ...annotation,
        annotatedImageUrl: annotation.annotatedImageUrl,
        imageWithAnnotations: annotation.imageWithAnnotations,
        documentWithAnnotations: annotation.documentWithAnnotations,
      });
    });
    return grouped;
  }, [projectAnnotations]);

  // Fonction pour rendre les images avec gestion d'erreur
  const renderSafeImage = (
    imageUrl: string | undefined,
    alt: string,
    className: string = "w-full h-full object-cover"
  ) => {
    if (!imageUrl) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <p className="text-xs text-gray-500">Image non disponible</p>
        </div>
      );
    }

    return (
      <AsyncImage
        src={imageUrl}
        alt={alt}
        projectId={projectId || ""}
        className={className}
        fallback={
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <p className="text-xs text-gray-500">Chargement...</p>
          </div>
        }
        onError={() => (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <p className="text-xs text-gray-500">Image non disponible</p>
          </div>
        )}
      />
    );
  };

  // Regroupement des réserves par document
  const reservesByDocument = React.useMemo(() => {
    const grouped: Record<
      string,
      {
        document: string;
        reserves: typeof report extends null
          ? undefined
          : typeof report.reserves;
      }
    > = {};

    if (report?.reserves) {
      report.reserves.forEach((reserve) => {
        if (!reserve) return;

        const documentName =
          (reserve.annotationId && projectAnnotations?.length
            ? projectAnnotations.find((a) => a?.id === reserve.annotationId)
                ?.documentName
            : null) ||
          reserve.documentName ||
          "Réserves sans plan";

        if (!grouped[documentName]) {
          grouped[documentName] = {
            document: documentName,
            reserves: [],
          };
        }

        grouped[documentName].reserves = grouped[documentName].reserves || [];
        grouped[documentName].reserves.push(reserve);
      });
    }

    return grouped;
  }, [report?.reserves, projectAnnotations]);

  useEffect(() => {
    if (pdfPreviewOpen && Object.keys(annotationsByDocument).length > 0) {
      const generateImages = async () => {
        const urls: Record<string, string> = {};

        for (const [docId, doc] of Object.entries(annotationsByDocument)) {
          if (doc.annotations.length > 0 && doc.documentUrl) {
            try {
              // Générer l'image annotée
              const annotatedUrl = await generateAnnotatedImage(
                doc.documentUrl,
                doc.annotations,
                docId,
                projectId || ""
              );

              urls[docId] = annotatedUrl;
            } catch (err) {
              console.error(`Erreur pour le document ${docId}:`, err);
            }
          }
        }

        setAnnotatedImageUrls(urls);
      };

      generateImages();
    }
  }, [pdfPreviewOpen, annotationsByDocument, projectId]);

  const generatePdfPreview = () => {
    setPdfPreviewOpen(true);
    setTimeout(() => {
      console.log("Génération du PDF en cours...");
    }, 500);
  };

  const shouldShowSection = (sectionName: string): boolean => {
    // Ajoutez des logs pour déboguer
    console.log("Vérification de la section:", sectionName);
    console.log("Modèle utilisé:", report?.templateId);
    console.log(
      "Sections disponibles:",
      reportTemplates.find((t) => t.id === report?.templateId)?.fields
    );

    if (!report?.templateId) return true;
    const template = reportTemplates.find((t) => t.id === report.templateId);
    if (!template?.fields) return true;
    return template.fields.includes(sectionName);
  };

  const printSectionRef = useRef<HTMLDivElement>(null);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <p>Chargement...</p>
        </div>
      </MainLayout>
    );
  }

  if (!report || !project) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <p>Rapport ou projet introuvable</p>
        </div>
      </MainLayout>
    );
  }

  const handlePrint = () => {
    if (!printSectionRef.current) return;

    const printContent = printSectionRef.current.innerHTML;
    const originalContent = document.body.innerHTML;

    const printStyles = `
      body { font-family: Arial, sans-serif; margin: 30px; }
      .print-header { margin-bottom: 20px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f2f2f2; }
      .participants-bar { background-color: #fff; padding: 15px; margin-bottom: 10px; }
      .status { display: flex; align-items: center; margin-right: 10px; }
      .letter { display: inline-block; width: 24px; height: 24px; border-radius: 50%; text-align: center; margin-right: 5px; border: 2px solid; }
      @page { margin: 2cm; }
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Compte-rendu de visite - ${report.reportNumber || ""}</title>
          <style>${printStyles}</style>
        </head>
        <body>
          ${printContent}
        </body>
        </html>
      `);
      printWindow.document.close();

      printWindow.addEventListener(
        "load",
        () => {
          printWindow.print();
          printWindow.close();
        },
        true
      );
    } else {
      document.body.innerHTML = printContent;
      document.head.innerHTML = `<style>${printStyles}</style>`;
      window.print();
      document.body.innerHTML = originalContent;
    }
  };
  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/projects/${projectId}`)}
            className="mr-4">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Compte Rendu de Visite</h1>
            <p className="text-muted-foreground">
              Projet: {project.name} - Visite du {formatDate(report.visitDate)}
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimer
          </Button>
          <Button variant="outline" onClick={generatePdfPreview}>
            <Eye className="h-4 w-4 mr-2" />
            Visualiser PDF
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.success("Rapport envoyé par email")}>
            <Mail className="h-4 w-4 mr-2" />
            Envoyer
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FileUp className="h-4 w-4 mr-2" />
                Joindre
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Joindre un document</DialogTitle>
                <DialogDescription>
                  Sélectionnez un document à joindre à ce rapport.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4">
                <SiteVisitReportUploader
                  onFileUploaded={handleAddAttachment}
                  accept="application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                  type="document"
                />
              </div>
            </DialogContent>
          </Dialog>
          <Button
            onClick={() =>
              navigate(`/projects/${projectId}/report/${reportId}/edit`)
            }>
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
        </div>
      </div>
      <div className="print:mt-10" ref={printSectionRef}>
        <ReportHeader
          projectId={projectId || ""}
          reportNumber={report.reportNumber || ""}
          visitDate={report.visitDate}
        />

        <Card className="mb-6 print:shadow-none print:border-none">
          <CardHeader className="border-b">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl">Résumé de la visite</CardTitle>
                <CardDescription>
                  <div className="flex items-center mt-1">
                    <User className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span className="mr-2">
                      Responsable: {report.inCharge || "Non défini"}
                    </span>
                    <Building className="h-4 w-4 mr-1 ml-2 text-muted-foreground" />
                    <span>
                      Entreprise: {report.contractor || "Non définie"}
                    </span>
                  </div>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Progression du projet
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Progression:</span>
                    <span className="font-medium">
                      {report.taskProgress && report.taskProgress.length > 0
                        ? calculateAverageProgress(report.taskProgress)
                        : report.progress || 0}
                      %
                    </span>
                  </div>
                  <Progress
                    value={
                      report.taskProgress && report.taskProgress.length > 0
                        ? calculateAverageProgress(report.taskProgress)
                        : report.progress || 0
                    }
                    className="h-2"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    {report.taskProgress && report.taskProgress.length > 0
                      ? `Progression automatiquement calculée à partir de ${report.taskProgress.length} lot(s)`
                      : "La progression est définie manuellement"}
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <div
                  className="border rounded-t-lg overflow-hidden"
                  style={{ borderBottomWidth: "0" }}>
                  <div className="flex justify-between items-center p-4 bg-white">
                    <span className="font-medium text-blue-600">
                      Participants
                    </span>
                    <div className="flex gap-3">
                      <span className="flex items-center">
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full border border-green-500 text-green-600 font-medium text-xs mr-2">
                          P
                        </span>
                        <span className="text-sm font-medium text-green-600">
                          Présent
                        </span>
                      </span>
                      <span className="flex items-center">
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full border border-orange-500 text-orange-600 font-medium text-xs mr-2">
                          R
                        </span>
                        <span className="text-sm font-medium text-orange-600">
                          Retard
                        </span>
                      </span>
                      <span className="flex items-center">
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full border border-red-500 text-red-600 font-medium text-xs mr-2">
                          A
                        </span>
                        <span className="text-sm font-medium text-red-600">
                          Absent
                        </span>
                      </span>
                      <span className="flex items-center">
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full border border-blue-500 text-blue-600 font-medium text-xs mr-2">
                          E
                        </span>
                        <span className="text-sm font-medium text-blue-600">
                          Excusé
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <Card className="rounded-t-none border-t-0">
                  <CardContent className="p-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Rôle</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Adresse</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Téléphone</TableHead>
                          <TableHead className="text-center">
                            Présence
                          </TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {Array.isArray(report.participants) &&
                        report.participants.length > 0 ? (
                          report.participants.map((participant, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                {participant.role || "Non défini"}
                              </TableCell>
                              <TableCell>
                                {participant.contact || "Non défini"}
                              </TableCell>
                              <TableCell>
                                {participant.address || "Non défini"}
                              </TableCell>
                              <TableCell>
                                {participant.email || "Non défini"}
                              </TableCell>
                              <TableCell>
                                {participant.phone || "Non défini"}
                              </TableCell>
                              <TableCell className="text-center">
                                <span
                                  className={`inline-block border rounded-full w-5 h-5 text-center ${
                                    participant.presence === "P"
                                      ? "border-green-600 text-green-600"
                                      : participant.presence === "R"
                                      ? "border-orange-600 text-orange-600"
                                      : participant.presence === "A"
                                      ? "border-red-600 text-red-600"
                                      : "border-blue-600 text-blue-600"
                                  }`}>
                                  {participant.presence || "N/A"}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={6}
                              className="text-center text-muted-foreground">
                              Aucun participant enregistré
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>

              {/* Afficher l'avancement des lots s'il existe dans le rapport */}
              {report.taskProgress && report.taskProgress.length > 0 && (
                <div className="mb-6">
                  <TaskProgressDisplay taskProgress={report.taskProgress} />
                </div>
              )}

              {shouldShowSection("reserves") &&
                report.reserves &&
                report.reserves.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">
                      Réserves et annotations
                    </h3>
                    <div className="overflow-x-auto">
                      {Object.entries(reservesByDocument).map(
                        ([documentId, group]) => (
                          <div key={documentId} className="mb-6">
                            <h4 className="font-medium text-blue-600 bg-white-100 p-3 rounded-t-lg border ">
                              {group.document}
                            </h4>
                            <div className="border rounded-b-lg overflow-hidden">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-gray-50">
                                    <TableHead className="w-12 text-center">
                                      N°
                                    </TableHead>
                                    <TableHead>Localisation</TableHead>
                                    <TableHead>Lot</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Levée le</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {group.reserves?.map((reserve, index) => (
                                    <TableRow key={reserve.id || index}>
                                      <TableCell className="text-center">
                                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-orange-100 text-orange-800 border border-orange-500 font-medium text-xs">
                                          {index + 1}
                                        </span>
                                      </TableCell>
                                      <TableCell className="align-top">
                                        {reserve.location || "Non définie"}
                                      </TableCell>
                                      <TableCell className="align-top">
                                        {reserve.lot || "Non défini"}
                                      </TableCell>
                                      <TableCell className="align-top description-cell min-w-[200px]">
                                        <div className="flex flex-col gap-4">
                                          {reserve.description ||
                                            "Aucune description"}
                                          {reserve.photos &&
                                            reserve.photos.length > 0 && (
                                              <div className="flex flex-wrap gap-2 mt-1">
                                                {reserve.photos.map(
                                                  (photo, photoIndex) => (
                                                    <div
                                                      key={photoIndex}
                                                      className="relative w-16 h-16 rounded overflow-hidden">
                                                      <img
                                                        src={photo}
                                                        alt={`Photo ${
                                                          photoIndex + 1
                                                        }`}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                          e.currentTarget.src =
                                                            "/placeholder.svg";
                                                          e.currentTarget.alt =
                                                            "Image non disponible";
                                                        }}
                                                      />
                                                    </div>
                                                  )
                                                )}
                                              </div>
                                            )}
                                        </div>
                                      </TableCell>
                                      <TableCell className="align-top">
                                        {formatDate(reserve.createdAt || "")}
                                      </TableCell>
                                      <TableCell className="align-top">
                                        {reserve.resolvedAt
                                          ? formatDate(reserve.resolvedAt)
                                          : "Non levée"}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {shouldShowSection("documentsWithAnnotations") &&
                Object.keys(annotationsByDocument).length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-2">Plans avec annotations</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(annotationsByDocument)
                        .slice(0, 4)
                        .map(([docId, doc]) => {
                          // Utiliser directement l'image capturée si elle existe
                          // Sinon, utiliser l'image source
                          const imageToShow = doc.capturedImageUrl || doc.documentUrl;

                          return (
                            <div key={docId} className="border relative">
                              <div className="relative aspect-[1/1]">
                                {/* Afficher simplement l'image capturée qui inclut déjà les annotations */}
                                {doc.capturedImageUrl ? (
                                  // Si on a une image capturée, l'afficher directement
                                  <img
                                    src={doc.capturedImageUrl}
                                    alt={doc.documentName || "Document"}
                                    className="absolute inset-0 w-full h-full object-contain"
                                  />
                                ) : (
                                  // Sinon, afficher l'image originale avec des annotations SVG
                                  <>
                                    <img
                                      src={doc.documentUrl}
                                      alt={doc.documentName || "Document"}
                                      className="absolute inset-0 w-full h-full object-contain"
                                    />
                                    {doc.annotations && doc.annotations.length > 0 && (
                                      <svg
                                        className="absolute inset-0 w-full h-full pointer-events-none"
                                        viewBox="0 0 100 100"
                                        preserveAspectRatio="xMidYMid meet">
                                        {doc.annotations
                                          .filter((a) => {
                                            const hasPos = a.position && typeof a.position.x === "number" && typeof a.position.y === "number";
                                            const hasCoords = typeof a.x === "number" && typeof a.y === "number";
                                            return hasPos || hasCoords;
                                          })
                                          .map((annotation, index) => {
                                            const x = annotation.position?.x ?? annotation.x ?? 0;
                                            const y = annotation.position?.y ?? annotation.y ?? 0;
                                            
                                            return (
                                              <g key={annotation.id}>
                                                <circle
                                                  cx={x}
                                                  cy={y}
                                                  r="3"
                                                  fill={annotation.resolved || annotation.isResolved ? "#22c55e" : "#f97316"}
                                                  stroke="white"
                                                  strokeWidth="0.5"
                                                />
                                                <text
                                                  x={x}
                                                  y={y}
                                                  textAnchor="middle"
                                                  dominantBaseline="central"
                                                  fill="white"
                                                  fontSize="2.5"
                                                  fontWeight="bold">
                                                  {index + 1}
                                                </text>
                                              </g>
                                            );
                                          })}
                                      </svg>
                                    )}
                                  </>
                                )}
                              </div>
                              <div className="p-2 bg-gray-50">
                                <p className="text-xs font-medium truncate">
                                  {doc.documentName || "Document sans nom"}
                                </p>
                                <p className="text-xs">
                                  {doc.annotations?.length || 0} annotation(s)
                                </p>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              {shouldShowSection("photos") && report.photos?.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-bold mb-2 border-b pb-1">
                    Photos du site
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {report.photos.slice(0, 4).map((photo, index) => (
                      <div key={index} className="border overflow-hidden">
                        <div className="aspect-video bg-gray-100">
                          <img
                            src={photo}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg";
                              e.currentTarget.alt = "Image non disponible";
                            }}
                          />
                        </div>
                        <p className="text-xs p-1 bg-gray-50">
                          Photo {index + 1}
                        </p>
                      </div>
                    ))}
                  </div>
                  {report.photos.length > 4 && (
                    <p className="text-center text-xs mt-2">
                      +{report.photos.length - 4} autres photos
                    </p>
                  )}
                </div>
              )}
              {shouldShowSection("observations") &&
                report.observations?.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-bold mb-2 border-b pb-1">
                      Observations
                    </h4>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="bg-gray-50 border-b">
                            <th className="p-2 text-center border-r w-10">
                              N°
                            </th>
                            <th className="p-2 text-left border-r">
                              Observation
                            </th>
                            <th className="p-2 text-left border-r">
                              Description
                            </th>
                            <th className="p-2 text-center w-20">Photo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {report.observations.map((obs, index) => (
                            <tr
                              key={index}
                              className="border-b last:border-b-0">
                              <td className="p-2 text-center border-r">
                                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 border border-blue-500 font-medium text-xs">
                                  {obs.item}
                                </span>
                              </td>
                              <td className="p-2 border-r">
                                {obs.observation || "Non spécifiée"}
                              </td>
                              <td className="p-2 border-r">
                                {obs.description || "Non spécifiée"}
                              </td>
                              <td className="p-2 text-center">
                                {obs.photoUrl ? (
                                  <div className="w-10 h-10 mx-auto">
                                    <img
                                      src={obs.photoUrl}
                                      alt={`Photo ${obs.item}`}
                                      className="w-full h-full object-cover rounded"
                                      onError={(e) => {
                                        e.currentTarget.src =
                                          "/placeholder.svg";
                                        e.currentTarget.alt =
                                          "Image non disponible";
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-500">
                                    Aucune
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              {/* Recommandations */}
              {shouldShowSection("recommendations") &&
                report.recommendations?.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-bold mb-2 border-b pb-1">
                      Recommandations
                    </h4>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="bg-gray-50 border-b">
                            <th className="p-2 text-center border-r w-10">
                              N°
                            </th>
                            <th className="p-2 text-left border-r">
                              Observation
                            </th>
                            <th className="p-2 text-left border-r">Action</th>
                            <th className="p-2 text-left border-r">
                              Responsable
                            </th>
                            <th className="p-2 text-left border-r">Statut</th>
                            <th className="p-2 text-center w-20">Photo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {report.recommendations.map((rec, index) => (
                            <tr
                              key={index}
                              className="border-b last:border-b-0">
                              <td className="p-2 text-center border-r">
                                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-800 border border-green-500 font-medium text-xs">
                                  {rec.item}
                                </span>
                              </td>
                              <td className="p-2 border-r">
                                {rec.observation || "Non spécifiée"}
                              </td>
                              <td className="p-2 border-r">
                                {rec.action || "Non spécifiée"}
                              </td>
                              <td className="p-2 border-r">
                                {rec.responsible || "Non spécifié"}
                              </td>
                              <td className="p-2 border-r">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium
                    ${
                      rec.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : rec.status === "in-progress"
                        ? "bg-yellow-100 text-yellow-800"
                        : rec.status === "pending"
                        ? "bg-gray-100 text-gray-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                                  {rec.status === "completed"
                                    ? "Terminé"
                                    : rec.status === "in-progress"
                                    ? "En cours"
                                    : rec.status === "pending"
                                    ? "En attente"
                                    : "En pause"}
                                </span>
                              </td>
                              <td className="p-2 text-center">
                                {rec.photoUrl ? (
                                  <div className="w-10 h-10 mx-auto">
                                    <img
                                      src={rec.photoUrl}
                                      alt={`Photo ${rec.item}`}
                                      className="w-full h-full object-cover rounded"
                                      onError={(e) => {
                                        e.currentTarget.src =
                                          "/placeholder.svg";
                                        e.currentTarget.alt =
                                          "Image non disponible";
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-500">
                                    Aucune
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              {/* Informations supplémentaires */}
              {shouldShowSection("additionalDetails") &&
                report.additionalDetails && (
                  <div className="mb-6">
                    <h3 className="font-bold mb-2 border-b pb-1">
                      Informations supplémentaires
                    </h3>
                    <div className="border rounded-lg overflow-hidden">
                      <div className="p-4 bg-gray-50">
                        <p className="whitespace-pre-line">
                          {report.additionalDetails}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              {/* Documents joints */}
              {shouldShowSection("documents") &&
                report.attachments?.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-bold mb-2 border-b pb-1">
                      Documents joints
                    </h3>
                    <div className="space-y-2">
                      {report.attachments.map((attachment, index) => (
                        <div
                          key={index}
                          className="flex items-center p-2 border rounded-md">
                          <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
                          <span className="flex-1">Document {index + 1}</span>
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={attachment}
                              target="_blank"
                              rel="noreferrer">
                              <Download className="h-4 w-4 mr-1" />
                              Télécharger
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              {shouldShowSection("signatures") && (
                <div className="mb-6">
                  <h3 className="font-bold mb-2 border-b pb-1">Signatures</h3>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="border rounded-lg p-4 text-center">
                      <p className="font-medium mb-2">Architecte</p>
                      <div className="h-20 border-b mb-2"></div>
                      <p className="text-xs">
                        {architectInfo?.name || "Cabinet d'Architecture"}
                      </p>
                    </div>
                    <div className="border rounded-lg p-4 text-center">
                      <p className="font-medium mb-2">Maître d'ouvrage</p>
                      <div className="h-20 border-b mb-2"></div>
                      <p className="text-xs">{project?.client || "Client"}</p>
                    </div>
                    <div className="border rounded-lg p-4 text-center">
                      <p className="font-medium mb-2">Entreprise</p>
                      <div className="h-20 border-b mb-2"></div>
                      <p className="text-xs">
                        {report.contractor || "Entreprise"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <ReportFooter />
      </div>

      {/* Visuel PDF */}

      <Dialog open={pdfPreviewOpen} onOpenChange={setPdfPreviewOpen}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Aperçu PDF du rapport</DialogTitle>
            <DialogDescription>
              Aperçu du rapport au format PDF
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto border rounded-md p-4 h-full">
            <div className="bg-white p-6 min-h-[600px]">
              {/* En-tête du rapport */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center">
                  <div className="mr-4">
                    <img
                      src={project?.imageUrl || "/placeholder.svg"}
                      alt="Logo"
                      className="h-16 w-16 object-contain"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">
                      {architectInfo?.name || "Cabinet d'Architecture"}
                    </h2>
                    <p className="text-sm">
                      {architectInfo?.address || "Adresse non spécifiée"}
                    </p>
                    <p className="text-sm">
                      {architectInfo?.phone || "Téléphone non spécifié"}
                    </p>
                    <p className="text-sm">
                      {architectInfo?.email || "Email non spécifié"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-lg">COMPTE RENDU DE VISITE</h3>
                  <p className="text-sm">
                    Réf: {report.reportNumber || "Non spécifié"}
                  </p>
                  <p className="text-sm">
                    Date de visite: {formatDate(report.visitDate)}
                  </p>
                </div>
              </div>

              <hr className="mb-4" />

              {/* Informations sur le projet */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="font-medium">Projet</h4>
                  <p>{project.name}</p>
                  <p className="text-sm">
                    {project.location || "Emplacement non défini"}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Client</h4>
                  <p>{project.client || "Client non défini"}</p>
                  <p className="text-sm">
                    Période: {formatDate(project.startDate)} -{" "}
                    {formatDate(project.endDate)}
                  </p>
                </div>
              </div>

              {/* Résumé de la visite */}
              <div className="mb-6">
                <h4 className="font-medium">Résumé de la visite</h4>
                <p className="text-sm">
                  Responsable: {report.inCharge || "Non défini"}
                </p>
                <p className="text-sm">
                  Entreprise: {report.contractor || "Non définie"}
                </p>
                <div className="mt-2">
                  <div className="flex justify-between text-sm">
                    <span>Progression:</span>
                    <span>
                      {report.taskProgress && report.taskProgress.length > 0
                        ? calculateAverageProgress(report.taskProgress)
                        : report.progress || 0}
                      %
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${
                          report.taskProgress && report.taskProgress.length > 0
                            ? calculateAverageProgress(report.taskProgress)
                            : report.progress || 0
                        }%`,
                        backgroundColor: getProgressColor(
                          report.taskProgress && report.taskProgress.length > 0
                            ? calculateAverageProgress(report.taskProgress)
                            : report.progress || 0
                        ),
                      }}></div>
                  </div>
                </div>
              </div>

              {/* Section participants */}
              <div className="mb-6">
                <div className="bg-white p-3 mb-2 flex justify-between items-center border rounded-t-lg">
                  <h4 className="font-medium text-blue-600">PARTICIPANTS</h4>
                  <div className="flex gap-3 text-xs">
                    <span className="font-medium text-green-600">
                      ✓ Présent
                    </span>
                    <span className="font-medium text-orange-500">
                      ⟳ Retard
                    </span>
                    <span className="font-medium text-red-600">✗ Absent</span>
                    <span className="font-medium text-blue-600">! Excusé</span>
                  </div>
                </div>
                <div className="border rounded-b-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="text-left p-2 border-r">Nom</th>
                        <th className="text-left p-2 border-r">Rôle</th>
                        <th className="text-left p-2 border-r">Phone</th>
                        <th className="text-left p-2">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.participants &&
                        report.participants.map((participant, index) => (
                          <tr
                            key={index}
                            className={`${
                              index % 2 === 0 ? "bg-gray-50" : ""
                            } border-b last:border-b-0`}>
                            <td className="p-2 border-r">
                              {participant.contact || "Non spécifié"}
                            </td>
                            <td className="p-2 border-r">
                              {participant.role || "Non spécifié"}
                            </td>
                            <td className="p-2 border-r">
                              {participant.phone || "Non spécifiée"}
                            </td>
                            <td className="p-2">
                              <span
                                className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-medium
                  ${
                    participant.presence === "P"
                      ? "bg-green-100 text-green-800 border border-green-500"
                      : participant.presence === "R"
                      ? "bg-orange-100 text-orange-800 border border-orange-500"
                      : participant.presence === "A"
                      ? "bg-red-100 text-red-800 border border-red-500"
                      : "bg-blue-100 text-blue-800 border border-blue-500"
                  }`}>
                                {participant.presence || "N/A"}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Avancement des lots */}
              {report.taskProgress && report.taskProgress.length > 0 && (
                <div className="mb-6 page-break-inside-avoid">
                  <h3 className="font-bold mb-2 border-b pb-1">
                    Avancement des lots
                  </h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b">
                          <th className="p-2 text-center border-r w-12">N°</th>
                          <th className="p-2 text-left border-r">Lot</th>
                          <th className="p-2 text-left">Progression</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.taskProgress.map((task, index) => (
                          <tr key={index} className="border-b last:border-b-0">
                            <td className="p-2 text-center border-r">
                              <span
                                className="inline-flex items-center justify-center h-6 w-6 rounded-full font-medium text-xs"
                                style={{
                                  backgroundColor: task.color + "33",
                                  color: task.color,
                                  border: `1px solid ${task.color}`,
                                }}>
                                {task.number || index + 1}
                              </span>
                            </td>
                            <td className="p-2 border-r">
                              <div className="flex items-center">
                                <span
                                  className="inline-block w-4 h-4 rounded-full mr-2"
                                  style={{
                                    backgroundColor: task.color,
                                  }}></span>
                                <span>{task.title}</span>
                              </div>
                            </td>
                            <td className="p-2">
                              <div className="flex items-center">
                                <div className="w-full bg-gray-200 h-2 rounded-full mr-2">
                                  <div
                                    className="h-2 rounded-full"
                                    style={{
                                      width: `${task.progress}%`,
                                      backgroundColor: task.color,
                                    }}></div>
                                </div>
                                <span>{task.progress}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SECTION: Réserves et annotations - EXACTEMENT COMME DANS LE RAPPORT */}
              {shouldShowSection("reserves") &&
                report.reserves &&
                report.reserves.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-bold mb-2 border-b pb-1">
                      Réserves et annotations
                    </h3>
                    <div>
                      {Object.entries(reservesByDocument).map(
                        ([documentId, group]) => (
                          <div key={documentId} className="mb-6">
                            <h4 className="font-medium text-blue-600 bg-gray-100 p-3 rounded-t-lg">
                              {group.document}
                            </h4>
                            <div className="border rounded-b-lg overflow-hidden">
                              <table className="w-full text-sm border-collapse">
                                <thead>
                                  <tr className="bg-gray-50 border-b">
                                    <th className="p-2 text-center border-r w-12">
                                      N°
                                    </th>
                                    <th className="p-2 text-left border-r">
                                      Localisation
                                    </th>
                                    <th className="p-2 text-left border-r">
                                      Lot
                                    </th>
                                    <th className="p-2 text-left border-r">
                                      Description
                                    </th>
                                    <th className="p-2 text-left border-r">
                                      Date
                                    </th>
                                    <th className="p-2 text-left">Levée le</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {group.reserves?.map((reserve, index) => (
                                    <TableRow key={reserve.id || index}>
                                      <td className="p-2 text-center border-r">
                                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-orange-100 text-orange-800 border border-orange-500 font-medium text-xs">
                                          {index + 1}
                                        </span>
                                      </td>
                                      <td className="p-2 border-r align-top">
                                        {reserve.location || "Non définie"}
                                      </td>
                                      <td className="p-2 border-r align-top">
                                        {reserve.lot || "Non défini"}
                                      </td>
                                      <td className="p-2 border-r align-top">
                                        <div className="flex flex-col gap-4">
                                          {reserve.description ||
                                            "Aucune description"}
                                          {reserve.photos &&
                                            reserve.photos.length > 0 && (
                                              <div className="flex flex-wrap gap-2 mt-1">
                                                {reserve.photos
                                                  .slice(0, 2)
                                                  .map((photo, photoIndex) => (
                                                    <div
                                                      key={photoIndex}
                                                      className="relative w-16 h-16 rounded overflow-hidden">
                                                      <img
                                                        src={photo}
                                                        alt={`Photo ${
                                                          photoIndex + 1
                                                        }`}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                          e.currentTarget.src =
                                                            "/placeholder.svg";
                                                          e.currentTarget.alt =
                                                            "Image non disponible";
                                                        }}
                                                      />
                                                    </div>
                                                  ))}
                                              </div>
                                            )}
                                        </div>
                                      </td>
                                      <td className="p-2 border-r align-top">
                                        {formatDate(reserve.createdAt || "")}
                                      </td>
                                      <td className="p-2 align-top">
                                        {reserve.resolvedAt
                                          ? formatDate(reserve.resolvedAt)
                                          : "Non levée"}
                                      </td>
                                    </TableRow>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* SECTION: Plans avec annotations - EXACTEMENT COMME DANS LE RAPPORT */}
              {shouldShowSection("documentsWithAnnotations") &&
                Object.keys(annotationsByDocument).length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-2">Plans avec annotations</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(annotationsByDocument)
                        .slice(0, 4)
                        .map(([docId, doc]) => {
                          // Utiliser directement l'image capturée si elle existe
                          // Sinon, utiliser l'image source
                          const imageToShow = doc.capturedImageUrl || doc.documentUrl;
                          
                          return (
                            <div key={docId} className="border relative">
                              <div className="relative aspect-[1/1]">
                                {/* Afficher simplement l'image capturée qui inclut déjà les annotations */}
                                {doc.capturedImageUrl ? (
                                  // Si on a une image capturée, l'afficher directement
                                  <img
                                    src={doc.capturedImageUrl}
                                    alt={doc.documentName || "Document"}
                                    className="absolute inset-0 w-full h-full object-contain"
                                  />
                                ) : (
                                  // Sinon, afficher l'image originale avec des annotations SVG
                                  <>
                                    <img
                                      src={doc.documentUrl}
                                      alt={doc.documentName || "Document"}
                                      className="absolute inset-0 w-full h-full object-contain"
                                    />
                                    {doc.annotations && doc.annotations.length > 0 && (
                                      <svg
                                        className="absolute inset-0 w-full h-full pointer-events-none"
                                        viewBox="0 0 100 100"
                                        preserveAspectRatio="xMidYMid meet">
                                        {doc.annotations
                                          .filter((a) => {
                                            const hasPos = a.position && typeof a.position.x === "number" && typeof a.position.y === "number";
                                            const hasCoords = typeof a.x === "number" && typeof a.y === "number";
                                            return hasPos || hasCoords;
                                          })
                                          .map((annotation, index) => {
                                            const x = annotation.position?.x ?? annotation.x ?? 0;
                                            const y = annotation.position?.y ?? annotation.y ?? 0;
                                            
                                            return (
                                              <g key={annotation.id}>
                                                <circle
                                                  cx={x}
                                                  cy={y}
                                                  r="3"
                                                  fill={annotation.resolved || annotation.isResolved ? "#22c55e" : "#f97316"}
                                                  stroke="white"
                                                  strokeWidth="0.5"
                                                />
                                                <text
                                                  x={x}
                                                  y={y}
                                                  textAnchor="middle"
                                                  dominantBaseline="central"
                                                  fill="white"
                                                  fontSize="2.5"
                                                  fontWeight="bold">
                                                  {index + 1}
                                                </text>
                                              </g>
                                            );
                                          })}
                                      </svg>
                                    )}
                                  </>
                                )}
                              </div>
                              <div className="p-2 bg-gray-50">
                                <p className="text-xs font-medium truncate">
                                  {doc.documentName || "Document sans nom"}
                                </p>
                                <p className="text-xs">
                                  {doc.annotations?.length || 0} annotation(s)
                                </p>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              {shouldShowSection("photos") && report.photos?.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-bold mb-2 border-b pb-1">
                    Photos du site
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {report.photos.slice(0, 4).map((photo, index) => (
                      <div key={index} className="border overflow-hidden">
                        <div className="aspect-video bg-gray-100">
                          <img
                            src={photo}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg";
                              e.currentTarget.alt = "Image non disponible";
                            }}
                          />
                        </div>
                        <p className="text-xs p-1 bg-gray-50">
                          Photo {index + 1}
                        </p>
                      </div>
                    ))}
                  </div>
                  {report.photos.length > 4 && (
                    <p className="text-center text-xs mt-2">
                      +{report.photos.length - 4} autres photos
                    </p>
                  )}
                </div>
              )}
              {shouldShowSection("observations") &&
                report.observations?.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-bold mb-2 border-b pb-1">
                      Observations
                    </h4>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="bg-gray-50 border-b">
                            <th className="p-2 text-center border-r w-10">
                              N°
                            </th>
                            <th className="p-2 text-left border-r">
                              Observation
                            </th>
                            <th className="p-2 text-left border-r">
                              Description
                            </th>
                            <th className="p-2 text-center w-20">Photo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {report.observations.map((obs, index) => (
                            <tr
                              key={index}
                              className="border-b last:border-b-0">
                              <td className="p-2 text-center border-r">
                                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 border border-blue-500 font-medium text-xs">
                                  {obs.item}
                                </span>
                              </td>
                              <td className="p-2 border-r">
                                {obs.observation || "Non spécifiée"}
                              </td>
                              <td className="p-2 border-r">
                                {obs.description || "Non spécifiée"}
                              </td>
                              <td className="p-2 text-center">
                                {obs.photoUrl ? (
                                  <div className="w-10 h-10 mx-auto">
                                    <img
                                      src={obs.photoUrl}
                                      alt={`Photo ${obs.item}`}
                                      className="w-full h-full object-cover rounded"
                                      onError={(e) => {
                                        e.currentTarget.src =
                                          "/placeholder.svg";
                                        e.currentTarget.alt =
                                          "Image non disponible";
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-500">
                                    Aucune
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              {/* Recommandations */}
              {shouldShowSection("recommendations") &&
                report.recommendations?.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-bold mb-2 border-b pb-1">
                      Recommandations
                    </h4>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="bg-gray-50 border-b">
                            <th className="p-2 text-center border-r w-10">
                              N°
                            </th>
                            <th className="p-2 text-left border-r">
                              Observation
                            </th>
                            <th className="p-2 text-left border-r">Action</th>
                            <th className="p-2 text-left border-r">
                              Responsable
                            </th>
                            <th className="p-2 text-left border-r">Statut</th>
                            <th className="p-2 text-center w-20">Photo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {report.recommendations.map((rec, index) => (
                            <tr
                              key={index}
                              className="border-b last:border-b-0">
                              <td className="p-2 text-center border-r">
                                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-800 border border-green-500 font-medium text-xs">
                                  {rec.item}
                                </span>
                              </td>
                              <td className="p-2 border-r">
                                {rec.observation || "Non spécifiée"}
                              </td>
                              <td className="p-2 border-r">
                                {rec.action || "Non spécifiée"}
                              </td>
                              <td className="p-2 border-r">
                                {rec.responsible || "Non spécifié"}
                              </td>
                              <td className="p-2 border-r">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium
                    ${
                      rec.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : rec.status === "in-progress"
                        ? "bg-yellow-100 text-yellow-800"
                        : rec.status === "pending"
                        ? "bg-gray-100 text-gray-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                                  {rec.status === "completed"
                                    ? "Terminé"
                                    : rec.status === "in-progress"
                                    ? "En cours"
                                    : rec.status === "pending"
                                    ? "En attente"
                                    : "En pause"}
                                </span>
                              </td>
                              <td className="p-2 text-center">
                                {rec.photoUrl ? (
                                  <div className="w-10 h-10 mx-auto">
                                    <img
                                      src={rec.photoUrl}
                                      alt={`Photo ${rec.item}`}
                                      className="w-full h-full object-cover rounded"
                                      onError={(e) => {
                                        e.currentTarget.src =
                                          "/placeholder.svg";
                                        e.currentTarget.alt =
                                          "Image non disponible";
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-500">
                                    Aucune
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              {/* Informations supplémentaires */}
              {shouldShowSection("additionalDetails") &&
                report.additionalDetails && (
                  <div className="mb-6">
                    <h3 className="font-bold mb-2 border-b pb-1">
                      Informations supplémentaires
                    </h3>
                    <div className="border rounded-lg overflow-hidden">
                      <div className="p-4 bg-gray-50">
                        <p className="whitespace-pre-line">
                          {report.additionalDetails}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              {/* Documents joints */}
              {shouldShowSection("documents") &&
                report.attachments?.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-bold mb-2 border-b pb-1">
                      Documents joints
                    </h3>
                    <div className="space-y-2">
                      {report.attachments.map((attachment, index) => (
                        <div
                          key={index}
                          className="flex items-center p-2 border rounded-md">
                          <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
                          <span className="flex-1">Document {index + 1}</span>
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={attachment}
                              target="_blank"
                              rel="noreferrer">
                              <Download className="h-4 w-4 mr-1" />
                              Télécharger
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              {shouldShowSection("signatures") && (
                <div className="mb-6">
                  <h3 className="font-bold mb-2 border-b pb-1">Signatures</h3>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="border rounded-lg p-4 text-center">
                      <p className="font-medium mb-2">Architecte</p>
                      <div className="h-20 border-b mb-2"></div>
                      <p className="text-xs">
                        {architectInfo?.name || "Cabinet d'Architecture"}
                      </p>
                    </div>
                    <div className="border rounded-lg p-4 text-center">
                      <p className="font-medium mb-2">Maître d'ouvrage</p>
                      <div className="h-20 border-b mb-2"></div>
                      <p className="text-xs">{project?.client || "Client"}</p>
                    </div>
                    <div className="border rounded-lg p-4 text-center">
                      <p className="font-medium mb-2">Entreprise</p>
                      <div className="h-20 border-b mb-2"></div>
                      <p className="text-xs">
                        {report.contractor || "Entreprise"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPdfPreviewOpen(false)}>
              Fermer
            </Button>
            <Button
              onClick={() => {
                toast.success("PDF téléchargé");
                setPdfPreviewOpen(false);
              }}>
              <Download className="h-4 w-4 mr-2" />
              Télécharger PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default SiteVisitReportDetail;
