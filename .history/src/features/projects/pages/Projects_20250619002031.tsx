import { useState, useEffect, useCallback } from "react";
import {
  Building,
  Filter,
  Plus,
  Search,
  ImageIcon,
  Calendar,
  Clock,
  Home,
  Square, 
  DoorOpen
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import ProjectCard, {
  ProjectCardProps,
  normalizeTeamMembers,
  TeamMemberInfo,
} from "@/features/projects/components/ProjectCard";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/ui/popover";
import { Checkbox } from "@/ui/checkbox";
import { Label } from "@/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "@/ui/avatar";
import { toast } from "sonner";
import {
  getAllProjects,
  addProject,
  addProjectToMember,
} from "@/features/projects/services/projectService";
import { TeamMember } from "@/features/team/types/team";
import { getAllTeamMembers } from "@/features/team/selegacyTeamService";
import { getAllClients, ClientData } from "@/components/services/clientService";
import { SiteVisitReportUploader } from "@/features/projects/components/SiteVisitReportUploader";
import { safeSetItem } from "@/features/storage/localStorageService";
import { getMilestonesByProjectId } from "@/components/services/milestonesService";

const Projects = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [projectsData, setProjectsData] = useState<ProjectCardProps[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectCardProps[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [isNewProjectSheetOpen, setIsNewProjectSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);

  // État du formulaire pour un nouveau projet
  const [newProject, setNewProject] = useState<Omit<ProjectCardProps, "id">>({
    name: "",
    client: "",
    clientId: "",
    location: "",
    startDate: "",
    endDate: "",
    status: "planning",
    progress: 0, // Ajouté pour la compatibilité avec la vue liste
    teamSize: 0,
    teamMembers: [],
    imageUrl: undefined,
    projectType: "",
    projectArea: undefined,
    roomCount: undefined
  });
  
  // Simplifier pour éviter la duplication - utiliser une seule fonction
  const loadProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      const [projectsData, members, clientsData] = await Promise.all([
        getAllProjects(),
        getAllTeamMembers(),
        getAllClients()
      ]);
      
      const normalizedProjects = projectsData.map(project => ({
        ...project,
        startDate: project.startDate || undefined,
        endDate: project.endDate || undefined,
        teamMembers: Array.isArray(project.teamMembers) 
          ? (typeof project.teamMembers[0] === 'string' 
              ? project.teamMembers.map(id => ({ id, name: "Membre", role: "non spécifié" })) 
              : project.teamMembers)
          : [],
        milestones: project.milestones || []
      }));
      
      console.log("Projets chargés:", normalizedProjects.length);
      setProjectsData(normalizedProjects);
      setFilteredProjects(normalizedProjects);
      
      // Ne mettre à jour ces états que lors du chargement initial
      if (members) setTeamMembers(members);
      if (clientsData) setClients(clientsData);
    } catch (error) {
      console.error("Erreur lors du chargement des projets:", error);
      toast.error("Impossible de charger les données");
    } finally {
      setIsLoading(false);
    }
  }, []); // Garder les dépendances vides

  // Appeler loadProjects au chargement initial uniquement
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);
  
  const filterProjects = (status: string) => {
    if (selectedStatuses.includes(status)) {
      setSelectedStatuses(selectedStatuses.filter((s) => s !== status));
    } else {
      setSelectedStatuses([...selectedStatuses, status]);
    }
  };

  const clearFilters = () => {
    setSelectedStatuses([]);
    setSearchQuery("");
    setFilteredProjects(projectsData);
  };
  
  const applyFilters = () => {
    let results = projectsData;
    
    if (searchQuery) {
      results = results.filter(
        (project) =>
          project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedStatuses.length > 0) {
      results = results.filter((project) => selectedStatuses.includes(project.status));
    }
    
    setFilteredProjects(results);
  };

  // Gérer la sélection des membres d'équipe - code simplifié
  const handleSelectTeamMember = (memberId: string) => {
    const isSelected = selectedTeamMembers.includes(memberId);
    const updatedMembers = isSelected 
      ? selectedTeamMembers.filter(id => id !== memberId)
      : [...selectedTeamMembers, memberId];
    
    setSelectedTeamMembers(updatedMembers);
    
    // Créer des objets TeamMemberInfo à partir des IDs
    const memberObjects: TeamMemberInfo[] = updatedMembers.map(id => {
      const member = teamMembers.find(m => m.id === id);
      return {
        id,
        name: member?.name || "Membre",
        role: member?.role || "non spécifié",
        avatar: member?.avatar
      };
    });
    
    setNewProject({
      ...newProject,
      teamMembers: memberObjects,
      teamSize: updatedMembers.length
    });
  };

  // handleCreateProject amélioré avec vérification de type
  const handleCreateProject = async () => {
    // Validation des champs
    if (!newProject.name || !newProject.clientId || !newProject.location) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    // Valider les dates
    try {
      if (newProject.startDate) {
        const startDate = new Date(newProject.startDate);
        if (isNaN(startDate.getTime())) {
          toast.error("La date de début est invalide");
          return;
        }
      }
      
      if (newProject.endDate) {
        const endDate = new Date(newProject.endDate);
        if (isNaN(endDate.getTime())) {
          toast.error("La date de fin est invalide");
          return;
        }
      }
    } catch (e) {
      toast.error("Format de date invalide");
      return;
    }
    
    try {
      setIsSaving(true);

      // Créer une copie propre pour l'API
      const projectToCreate = {
        ...newProject,
        // S'assurer que les membres sont au format attendu par l'API
        teamMembers: selectedTeamMembers,
        teamSize: selectedTeamMembers.length
      };
      
      const newProjectId = await addProject(projectToCreate);
      
      if (newProjectId && selectedTeamMembers.length > 0) {
        // Ajouter le projet à chaque membre
        await Promise.allSettled(
          selectedTeamMembers.map(memberId => 
            addProjectToMember(memberId, newProjectId.id)
          )
        );
      }
      
      toast.success("Projet créé avec succès");
      
      // Réinitialiser le formulaire et recharger les projets
      setNewProject({
        name: "",
        client: "",
        clientId: "",
        location: "",
        startDate: "",
        endDate: "",
        status: "planning",
        progress: 0,
        teamSize: 0,
        teamMembers: [],
        imageUrl: undefined,
        projectType: "",
        projectArea: undefined,
        roomCount: undefined
      });
      
      setSelectedTeamMembers([]);
      setIsNewProjectSheetOpen(false);
      
      await loadProjects();
    } catch (error) {
      console.error("Erreur lors de la création du projet :", error);
      toast.error("Impossible de créer le projet");
    } finally {
      setIsSaving(false);
    }
  };

  const handleProjectPhotoUploaded = (url: string) => {
    setNewProject({
      ...newProject,
      imageUrl: url
    });
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold mb-1">Projets</h1>
            <p className="text-muted-foreground">
              Gérez tous vos projets architecturaux en un seul endroit
            </p>
          </div>
          <Button onClick={() => setIsNewProjectSheetOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau projet
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un projet..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyUp={(e) => e.key === "Enter" && applyFilters()}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtres
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <h4 className="font-medium">Filtrer par statut</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="planning" 
                      checked={selectedStatuses.includes("planning")}
                      onCheckedChange={() => filterProjects("planning")}
                    />
                    <Label htmlFor="planning">Planification</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="design" 
                      checked={selectedStatuses.includes("design")}
                      onCheckedChange={() => filterProjects("design")}
                    />
                    <Label htmlFor="design">Conception</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="construction" 
                      checked={selectedStatuses.includes("construction")}
                      onCheckedChange={() => filterProjects("construction")}
                    />
                    <Label htmlFor="construction">Construction</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="completed" 
                      checked={selectedStatuses.includes("completed")}
                      onCheckedChange={() => filterProjects("completed")}
                    />
                    <Label htmlFor="completed">Terminé</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="on-hold" 
                      checked={selectedStatuses.includes("on-hold")}
                      onCheckedChange={() => filterProjects("on-hold")}
                    />
                    <Label htmlFor="on-hold">En pause</Label>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 pt-2">
                  <Button variant="ghost" onClick={clearFilters} size="sm">
                    Réinitialiser
                  </Button>
                  <Button onClick={applyFilters} size="sm">
                    Appliquer
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Select defaultValue="recent">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="recent">Plus récents</SelectItem>
                <SelectItem value="progress-high">Progression (élevée)</SelectItem>
                <SelectItem value="progress-low">Progression (faible)</SelectItem>
                <SelectItem value="alphabetical">Alphabétique</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="grid">
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            {filteredProjects.length} projet{filteredProjects.length !== 1 ? "s" : ""} trouvé{filteredProjects.length !== 1 ? "s" : ""}
          </p>
          <TabsList>
            <TabsTrigger value="grid">Grille</TabsTrigger>
            <TabsTrigger value="list">Liste</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="grid">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <p>Chargement des projets...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} {...project} />
              ))}
              {filteredProjects.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Building className="h-12 w-12 mb-4 text-muted-foreground/50" />
                  <p className="text-lg mb-2">Aucun projet trouvé</p>
                  <p>Essayez d'ajuster vos filtres ou créez un nouveau projet</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="list">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <p>Chargement des projets...</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 font-medium">Nom</th>
                    <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Client</th>
                    <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">Location</th>
                    <th className="text-left py-3 px-4 font-medium">Statut</th>
                    {/* Ajouter la colonne pour les jalons */}
                    <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">Jalon actuel</th>
                    <th className="text-left py-3 px-4 font-medium hidden sm:table-cell">Progression</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project) => {
                    const statusConfig = {
                      "planning": { label: "Planification", color: "bg-blue-500" },
                      "design": { label: "Conception", color: "bg-purple-500" },
                      "construction": { label: "Construction", color: "bg-yellow-500" },
                      "completed": { label: "Terminé", color: "bg-green-500" },
                      "on-hold": { label: "En pause", color: "bg-gray-500" },
                    };
                    
                    // Ajouter cette ligne pour gérer les statuts inconnus
                    const statusInfo = statusConfig[project.status] || { label: "Non défini", color: "bg-gray-400" };
                    
                    // Trouver le jalon en cours
                    const currentMilestone = project.milestones?.find(m => m.inProgress);
                    // Trouver le prochain jalon non terminé si aucun n'est en cours
                    const nextMilestone = project.milestones?.find(m => !m.completed && !m.inProgress);
                    
                    return (
                      <tr key={project.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 font-medium">{project.name}</td>
                        <td className="py-3 px-4 hidden md:table-cell text-muted-foreground">{project.client}</td>
                        <td className="py-3 px-4 hidden lg:table-cell text-muted-foreground">{project.location}</td>
                        <td className="py-3 px-4">
                          {/* Remplacer cette ligne */}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        {/* Ajouter la cellule pour afficher le jalon en cours */}
                        <td className="py-3 px-4 hidden lg:table-cell text-muted-foreground">
                          {currentMilestone ? (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-orange-500" />
                              <span className="text-orange-700 font-medium">{currentMilestone.title}</span>
                            </span>
                          ) : nextMilestone ? (
                            <span className="flex items-center gap-1 text-gray-500">
                              <Calendar className="h-3 w-3" /> À venir: {nextMilestone.title}
                            </span>
                          ) : (
                            "Non démarré"
                          )}
                        </td>
                        <td className="py-3 px-4 hidden sm:table-cell">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-muted rounded-full h-2 overflow-hidden">
                              <div 
                                className="bg-primary h-full rounded-full"
                                style={{ width: `${project.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-muted-foreground">{project.progress}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredProjects.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-muted-foreground">
                        <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                        <p className="text-lg mb-2">Aucun projet trouvé</p>
                        <p>Essayez d'ajuster vos filtres ou créez un nouveau projet</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Sheet open={isNewProjectSheetOpen} onOpenChange={setIsNewProjectSheetOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Nouveau projet</SheetTitle>
            <SheetDescription>
              Créez un nouveau projet architectural. Remplissez les détails ci-dessous.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label>Photo du projet</Label>
              <SiteVisitReportUploader
                onFileUploaded={handleProjectPhotoUploaded}
                type="image"
                displayPreview={true}
                accept="image/*"
              />
              <p className="text-xs text-muted-foreground">
                Ajoutez une photo pour représenter ce projet
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-name">Nom du projet</Label>
              <Input 
                id="project-name" 
                placeholder="Entrez le nom du projet" 
                value={newProject.name}
                onChange={(e) => setNewProject({...newProject, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="project-client">Client</Label>
              <Select 
                value={newProject.clientId}
                onValueChange={(value) => {
                  const selectedClient = clients.find(c => c.id === value);
                  if (selectedClient) {
                    setNewProject({
                      ...newProject, 
                      clientId: value,
                      client: selectedClient.name
                    });
                  }
                }}
              >
                <SelectTrigger id="project-client">
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} {client.company ? `(${client.company})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="project-location">Emplacement</Label>
              <Input 
                id="project-location" 
                placeholder="Ville, Pays" 
                value={newProject.location}
                onChange={(e) => setNewProject({...newProject, location: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Date de début</Label>
                <Input 
                  id="start-date" 
                  type="date" 
                  value={newProject.startDate}
                  onChange={(e) => setNewProject({...newProject, startDate: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">Date de fin prévue</Label>
                <Input 
                  id="end-date" 
                  type="date" 
                  value={newProject.endDate}
                  onChange={(e) => setNewProject({...newProject, endDate: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-status">Statut</Label>
              <Select 
                value={newProject.status}
                onValueChange={(value: "planning" | "design" | "construction" | "completed" | "on-hold") => 
                  setNewProject({...newProject, status: value})
                }
              >
                <SelectTrigger id="project-status">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planification</SelectItem>
                  <SelectItem value="design">Conception</SelectItem>
                  <SelectItem value="construction">Construction</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                  <SelectItem value="on-hold">En pause</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-type">Type de projet</Label>
              <Input 
                id="project-type" 
                placeholder="Appartement, maison, bureau..." 
                value={newProject.projectType || ""}
                onChange={(e) => setNewProject({...newProject, projectType: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project-area">Surface (m²)</Label>
                <Input 
                  id="project-area" 
                  type="number" 
                  placeholder="100" 
                  value={newProject.projectArea || ""}
                  onChange={(e) => setNewProject({...newProject, projectArea: Number(e.target.value) || undefined})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="room-count">Nombre de pièces</Label>
                <Input 
                  id="room-count" 
                  type="number" 
                  placeholder="4" 
                  value={newProject.roomCount || ""}
                  onChange={(e) => setNewProject({...newProject, roomCount: Number(e.target.value) || undefined})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Équipe du projet</Label>
              <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
                {teamMembers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun membre d'équipe disponible</p>
                ) : (
                  <div className="space-y-2">
                    {teamMembers.map(member => (
                      <div key={member.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`team-member-${member.id}`} 
                          checked={selectedTeamMembers.includes(member.id)}
                          onCheckedChange={() => handleSelectTeamMember(member.id)}
                        />
                        <Label htmlFor={`team-member-${member.id}`} className="cursor-pointer flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.avatar} alt={member.name} />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.role}</p>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedTeamMembers.length} membre{selectedTeamMembers.length !== 1 ? "s" : ""} sélectionné{selectedTeamMembers.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <SheetFooter className="mt-6">
            <Button 
              variant="outline" 
              onClick={() => setIsNewProjectSheetOpen(false)}
              disabled={isSaving}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleCreateProject}
              disabled={isSaving}
            >
              {isSaving ? "Création en cours..." : "Créer le projet"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </MainLayout>
  );
};

export default Projects;
