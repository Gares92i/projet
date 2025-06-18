import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/ui/button";
import { ArrowLeft, Save, Check } from "lucide-react";
import { DescriptifDetailTab } from "@/features/projects/components/tabs/DescriptifDetailTab";
import { LotTravaux, ExtendedLotTravaux as ProjectExtendedLotTravaux } from "@/fea/types/project";
import {
  ExtendedTask,
  ComponentExtendedLotTravaux,
} from "@/features/descriptif/components/DescriptifDetailTab";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useToast } from "@/ui/use-toast";
import { DataPersistenceProvider } from "@/contexts/DataPersistenceContext";

// Fonction pour convertir LotTravaux[] en ProjectExtendedLotTravaux[]
const convertToExtendedFormat = (lots: LotTravaux[]): ProjectExtendedLotTravaux[] => {
  return lots.map(lot => ({
    id: lot.id,
    name: lot.name,
    numero: lot.id.substring(0, 5), // Obligatoire pour ProjectExtendedLotTravaux
    nom: lot.name,                  // Obligatoire pour ProjectExtendedLotTravaux
    travaux: (lot.tasks || []).map((task, index) => ({  // Utiliser 'travaux' au lieu de 'tasks'
      id: task.id,
      nom: task.name,               // Utiliser 'nom' au lieu de 'name'
      description: task.name,
      quantite: task.quantite || 1,
      unite: task.unite || 'ens',
      prixUnitaire: task.pu || 0,   // Utiliser 'prixUnitaire' au lieu de 'pu'
      prixTotal: (task.quantite || 1) * (task.pu || 0)
    })),
    count: lot.tasks?.length || 0,
    sortOrder: parseInt(lot.id.split('-').pop() || '0') || 0,
    isExpanded: false
  }));
};

const ProjectDescriptif = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Charger les données depuis localStorage
  const [localDescriptifData, setLocalDescriptifData] = useLocalStorage<LotTravaux[]>(
    `descriptif-data-${id}`,
    []
  );

  // État temporaire pour les modifications en cours
  const [currentData, setCurrentData] = useState<LotTravaux[]>(localDescriptifData);

  // État pour suivre si des modifications non enregistrées existent
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // État pour montrer une animation lors de l'enregistrement
  const [isSaving, setIsSaving] = useState(false);

  // Synchroniser l'état temporaire quand localDescriptifData change
  useEffect(() => {
    setCurrentData(localDescriptifData);
  }, [localDescriptifData]);

  const handleBack = () => {
    if (hasUnsavedChanges) {
      if (window.confirm("Des modifications n'ont pas été enregistrées. Voulez-vous quitter sans les sauvegarder?")) {
        navigate(`/projects/${id}`);
      }
    } else {
      navigate(`/projects/${id}`);
    }
  };

  // Modifiez la fonction handleDataUpdate pour gérer les propriétés manquantes
  const handleDataUpdate = (updatedData: ProjectExtendedLotTravaux[]) => {
    // Convertir ProjectExtendedLotTravaux[] vers LotTravaux[] pour la sauvegarde locale
    const simplifiedData: LotTravaux[] = updatedData.map((lot) => ({
      id: lot.id,
      name: lot.nom || lot.name,
      tasks: (lot.travaux || []).map((task) => {
        // Interface pour les propriétés optionnelles
        interface ExtendedTaskWithOptionals {
          id: string;
          nom?: string;
          description?: string;
          quantite?: number;
          unite?: string;
          prixUnitaire?: number;
          prixTotal?: number;
          startDate?: string;
          endDate?: string;
          tva?: number;
        }

        // Utiliser un type casting pour accéder aux propriétés sans erreurs TypeScript
        const taskWithExtras = task as unknown as ExtendedTaskWithOptionals;

        // Créer un objet de base avec les propriétés que nous savons exister
        const baseTask = {
          id: task.id,
          name: task.nom || task.description || "",
          quantite: task.quantite,
          unite: task.unite,
          pu: task.prixUnitaire,
          tva: taskWithExtras.tva || 10
        };

        // Accéder aux propriétés optionnelles de manière typesafe
        const startDate = taskWithExtras.startDate;
        const endDate = taskWithExtras.endDate;
        
        // Retourner l'objet complet
        return {
          ...baseTask,
          ...(startDate && { startDate }),
          ...(endDate && { endDate })
        };
      }),
    }));

    // Le reste de la fonction reste inchangé
    const currentJSON = JSON.stringify(currentData);
    const updatedJSON = JSON.stringify(simplifiedData);
    
    if (currentJSON !== updatedJSON) {
      setCurrentData(simplifiedData);
      setHasUnsavedChanges(true);
    }
  };

  // Fonction pour enregistrer explicitement les modifications
  const handleSaveChanges = () => {
    setIsSaving(true);

    // Exécution immédiate sans setTimeout artificiel
    try {
      // Stocker explicitement dans localStorage
      window.localStorage.setItem(`descriptif-data-${id}`, JSON.stringify(currentData));
      
      // Mettre à jour l'état après avoir sauvegardé
      setLocalDescriptifData(currentData);
      setHasUnsavedChanges(false);
      setIsSaving(false);

      toast({
        title: "Descriptif enregistré",
        description: "Les modifications ont été enregistrées avec succès",
        duration: 3000,
      });
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      toast({
        variant: "destructive",
        title: "Erreur d'enregistrement",
        description: "Une erreur est survenue lors de l'enregistrement du descriptif",
      });
      setIsSaving(false);
    }
  };

  return (
    <DataPersistenceProvider>
      <div className="container py-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="ghost" 
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au projet
          </Button>
          
          {/* Bouton d'enregistrement explicite */}
          <Button
            onClick={handleSaveChanges}
            disabled={!hasUnsavedChanges || isSaving}
            className="flex items-center gap-2"
            variant={hasUnsavedChanges ? "default" : "outline"}
          >
            {isSaving ? (
              <>
                <span className="animate-spin">⌛</span>
                Enregistrement...
              </>
            ) : hasUnsavedChanges ? (
              <>
                <Save className="h-4 w-4" />
                Enregistrer les modifications
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Enregistré
              </>
            )}
          </Button>
        </div>
        
        {/* Indicateur de modifications non enregistrées */}
        {hasUnsavedChanges && (
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-amber-700">
                  Vous avez des modifications non enregistrées. N'oubliez pas de cliquer sur "Enregistrer les modifications" avant de quitter.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow">
          <DescriptifDetailTab 
            projectId={id || ""} 
            onDataUpdate={handleDataUpdate}
            initialData={convertToExtendedFormat(currentData)}
          />
        </div>
      </div>
    </DataPersistenceProvider>
  );
};

export default ProjectDescriptif;