import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ResourceForm } from "@/components/resources/ResourceForm";
import { ResourceSearchBar } from "@/components/resources/ResourceSearchBar";
import { ResourceCategories } from "@/components/resources/ResourceCategories";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { resources } from "@/components/resources/data";
import { Input } from "@/components/ui/input";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { MoreHorizontal } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import LotManager from "@/components/resources/LotManager";

const Resources = () => {
  const [isResourceSheetOpen, setIsResourceSheetOpen] = useState(false);
  const [isLotDialogOpen, setIsLotDialogOpen] = useState(false); // Ajout de l'état manquant
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("resources");

  const handleAddResource = () => {
    toast({
      title: "Ressource ajoutée",
      description: "La nouvelle ressource a été ajoutée avec succès"
    });
    setIsResourceSheetOpen(false);
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold mb-1">Ressources</h1>
            <p className="text-muted-foreground">
              Consultez et téléchargez les ressources partagées
            </p>
          </div>
          {activeTab === "resources" && (
            <Button onClick={() => setIsResourceSheetOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une ressource
            </Button>
          )}
          {activeTab === "library" && (
            <Button onClick={() => setIsLotDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un lot
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="resources" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="resources">Ressources</TabsTrigger>
          <TabsTrigger value="library">Bibliothèque</TabsTrigger>
        </TabsList>
        
        <TabsContent value="resources">
          <ResourceSearchBar />
          <ResourceCategories resources={resources} />
        </TabsContent>
        
        <TabsContent value="library">
          <LotManager isLotDialogOpen={isLotDialogOpen} setIsLotDialogOpen={setIsLotDialogOpen} />
        </TabsContent>
      </Tabs>

      <ResourceForm 
        isOpen={isResourceSheetOpen} 
        onOpenChange={setIsResourceSheetOpen} 
        onAddResource={handleAddResource} 
      />
    </MainLayout>
  );
};

export default Resources;
