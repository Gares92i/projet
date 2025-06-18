import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Progress } from "@/ui/progress";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Edit2, Home, Square, DoorOpen } from "lucide-react"; // Ajout des icônes
import { createPortal } from "react-dom";

interface ProjectStats {
  budgetTotal: number;
  budgetUsed: number;
  timelineProgress: number;
  tasksCompleted: number;
  tasksInProgress: number;
  tasksTodo: number;
  documentsCount: number;
  commentsCount: number;
  meetingsCount: number;
  projectType?: string;     // Nouveau champ
  projectArea?: number;     // Nouveau champ
  roomCount?: number;       // Nouveau champ
}

interface ProjectBudgetCardProps {
  stats: ProjectStats;
  onUpdateBudget?: (updatedBudget: { budgetTotal: number; budgetUsed: number }) => void;
}

export const ProjectBudgetCard = ({ stats, onUpdateBudget }: ProjectBudgetCardProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [budgetTotal, setBudgetTotal] = useState(stats.budgetTotal);
  const [budgetUsed, setBudgetUsed] = useState(stats.budgetUsed);

  useEffect(() => {
    setBudgetTotal(stats.budgetTotal);
    setBudgetUsed(stats.budgetUsed);
  }, [stats.budgetTotal, stats.budgetUsed]);

  const handleSave = () => {
    if (onUpdateBudget) {
      onUpdateBudget({
        budgetTotal,
        budgetUsed
      });
    }
    setIsDialogOpen(false);
  };

  // Réinitialiser les valeurs quand la boîte de dialogue s'ouvre
  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (open) {
      setBudgetTotal(stats.budgetTotal);
      setBudgetUsed(stats.budgetUsed);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Budget</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setIsDialogOpen(true)}>
            <Edit2 className="h-4 w-4" />
            <span className="sr-only">Modifier le budget</span>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Section du budget (inchangée) */}
            <div>
              <div className="flex justify-between mb-1">
                <p className="text-sm text-muted-foreground">Budget utilisé</p>
                <p className="text-sm font-medium">
                  {Math.round((stats.budgetUsed / stats.budgetTotal) * 100)}%
                </p>
              </div>
              <Progress
                value={Math.round((stats.budgetUsed / stats.budgetTotal) * 100)}
                className="h-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="font-medium text-lg">
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  }).format(stats.budgetTotal)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dépensé</p>
                <p className="font-medium text-lg">
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  }).format(stats.budgetUsed)}
                </p>
              </div>
            </div>
            {/* Section des infos sur le projet */}
            <div className="space-y-2 mb-3 pb-3 border-b border-muted">
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-muted-foreground" />
                <div className="flex justify-between w-full">
                  <span className="text-sm text-muted-foreground">Type:</span>
                  <span className="text-sm font-medium">
                    {stats.projectType || "Non spécifié"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Square className="h-4 w-4 text-muted-foreground" />
                <div className="flex justify-between w-full">
                  <span className="text-sm text-muted-foreground">
                    Surface:
                  </span>
                  <span className="text-sm font-medium">
                    {stats.projectArea
                      ? `${stats.projectArea} m²`
                      : "Non spécifiée"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DoorOpen className="h-4 w-4 text-muted-foreground" />
                <div className="flex justify-between w-full">
                  <span className="text-sm text-muted-foreground">Pièces:</span>
                  <span className="text-sm font-medium">
                    {stats.roomCount !== undefined
                      ? stats.roomCount
                      : "Non spécifié"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogue d'édition du budget - inchangé */}
      {isDialogOpen &&
        createPortal(
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-[10000]">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-lg font-semibold mb-4">
                Modifier le budget du projet
              </h2>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="budgetTotal" className="text-right">
                    Budget total
                  </Label>
                  <div className="col-span-3 relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2">
                      €
                    </span>
                    <Input
                      id="budgetTotal"
                      type="number"
                      className="pl-6"
                      value={budgetTotal}
                      onChange={(e) => setBudgetTotal(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="budgetUsed" className="text-right">
                    Dépensé
                  </Label>
                  <div className="col-span-3 relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2">
                      €
                    </span>
                    <Input
                      id="budgetUsed"
                      type="number"
                      className="pl-6"
                      value={budgetUsed}
                      onChange={(e) => setBudgetUsed(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleSave}>Enregistrer</Button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
