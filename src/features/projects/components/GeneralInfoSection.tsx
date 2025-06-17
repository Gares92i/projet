import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { calculateAverageProgress } from "@/utils/progressUtils";
import { Slider } from "@/components/ui/slider";

// Créer un type dédié pour le formulaire
interface SiteVisitFormValues {
  visitDate?: Date;
  contractor?: string;
  inCharge?: string;
  progress?: number;
  additionalDetails?: string;
  participants?: Array<{
    contact: string;
    email: string;
    phone?: string;
    role?: string;
  }>;
  taskProgress?: Array<{
    taskId: string;
    taskName: string;
    progress: number;
  }>;
  photos?: Array<{
    url: string;
    caption?: string;
  }>;
  // Ajoutez tous les autres champs possibles avec leurs types précis
}

interface GeneralInfoSectionProps {
  // Utiliser le type dédié
  form: UseFormReturn<SiteVisitFormValues>;
  taskProgress?: Array<{ progress: number; taskId?: string; taskName?: string }>;
}

export const GeneralInfoSection = ({ form, taskProgress }: GeneralInfoSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations générales</CardTitle>
        <CardDescription>Informations générales sur la visite de chantier</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="visitDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date de visite</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: fr })
                        ) : (
                          <span>Choisir une date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("2020-01-01")
                      }
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contractor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Entreprise</FormLabel>
                <FormControl>
                  <Input placeholder="Nom de l'entreprise" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="inCharge"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Responsable</FormLabel>
                <FormControl>
                  <Input placeholder="Nom du responsable" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="progress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Progression (%)</FormLabel>
                
                {taskProgress && taskProgress.length > 0 ? (
                  <>
                    <div className="flex justify-between items-center">
                      <FormLabel className="text-muted-foreground">
                        Progression calculée automatiquement
                      </FormLabel>
                      <span className="text-sm font-medium">
                        {calculateAverageProgress(taskProgress)}%
                      </span>
                    </div>
                    <Slider
                      disabled
                      value={[calculateAverageProgress(taskProgress)]}
                      max={100}
                      step={1}
                    />
                    <FormDescription className="text-amber-500">
                      La progression est calculée à partir de la moyenne des {taskProgress.length} lot(s)
                    </FormDescription>
                  </>
                ) : (
                  <>
                    <FormControl>
                      <Slider
                        {...field}
                        value={[field.value || 0]}
                        max={100}
                        step={1}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                    <div className="flex justify-between">
                      <FormDescription>
                        Définissez la progression globale du projet
                      </FormDescription>
                      <span className="text-sm font-medium">{field.value || 0}%</span>
                    </div>
                  </>
                )}
                
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};
