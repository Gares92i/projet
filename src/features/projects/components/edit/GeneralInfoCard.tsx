import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { 
  Select,
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/ui/select";
import { ProjectCardProps } from "@/features/projects/components/ProjectCard";
import { ClientData } from "@/features/clients/types/client";
import { Home, Square, DoorOpen } from "lucide-react"; // Ajouter cet import pour les icônes

interface GeneralInfoCardProps {
  project: ProjectCardProps;
  clients: ClientData[];
  onInputChange: (field: keyof ProjectCardProps, value: any) => void;
}

export const GeneralInfoCard = ({ project, clients, onInputChange }: GeneralInfoCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations générales</CardTitle>
        <CardDescription>Modifiez les détails principaux du projet</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="project-name">Nom du projet</Label>
          <Input
            id="project-name" 
            value={project?.name}
            onChange={(e) => onInputChange("name", e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="project-client">Client</Label>
          <Select 
            value={project?.clientId}
            onValueChange={(value) => {
              const selectedClient = clients.find(c => c.id === value);
              if (selectedClient) {
                onInputChange("clientId", value);
                onInputChange("client", selectedClient.name);
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
            value={project?.location}
            onChange={(e) => onInputChange("location", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start-date">Date de début</Label>
            <Input 
              id="start-date" 
              type="date" 
              value={project?.startDate}
              onChange={(e) => onInputChange("startDate", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-date">Date de fin prévue</Label>
            <Input 
              id="end-date" 
              type="date" 
              value={project?.endDate}
              onChange={(e) => onInputChange("endDate", e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="project-status">Statut</Label>
          <Select 
            value={project?.status}
            onValueChange={(value) => onInputChange("status", value)}
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
        
        {/* SUPPRIMÉ: Champ de progression
        <div className="space-y-2">
          <Label htmlFor="project-progress">Progression (%)</Label>
          <Input 
            id="project-progress" 
            type="number" 
            min="0" 
            max="100" 
            value={project?.progress}
            onChange={(e) => onInputChange("progress", parseInt(e.target.value) || 0)}
          />
        </div>
        */}
        
        {/* AJOUTÉ: Type de projet avec icône */}
        <div className="space-y-2">
          <Label htmlFor="project-type">Type de projet</Label>
          <div className="flex items-center gap-2 border rounded-md focus-within:ring-1 focus-within:ring-ring">
            <Home className="ml-3 h-4 w-4 text-muted-foreground" />
            <Input 
              id="project-type" 
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Appartement, maison, bureau..." 
              value={project?.projectType || ""}
              onChange={(e) => onInputChange("projectType", e.target.value)}
            />
          </div>
        </div>
        
        {/* AJOUTÉ: Surface et Nombre de pièces */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="project-area">Surface (m²)</Label>
            <div className="flex items-center gap-2 border rounded-md focus-within:ring-1 focus-within:ring-ring">
              <Square className="ml-3 h-4 w-4 text-muted-foreground" />
              <Input 
                id="project-area" 
                type="number"
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="100" 
                value={project?.projectArea || ""}
                onChange={(e) => onInputChange("projectArea", e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="room-count">Nombre de pièces</Label>
            <div className="flex items-center gap-2 border rounded-md focus-within:ring-1 focus-within:ring-ring">
              <DoorOpen className="ml-3 h-4 w-4 text-muted-foreground" />
              <Input 
                id="room-count" 
                type="number" 
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="4" 
                value={project?.roomCount || ""}
                onChange={(e) => onInputChange("roomCount", e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};