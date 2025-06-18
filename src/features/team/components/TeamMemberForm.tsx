import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { TeamMember, TeamMemberRole } from "@/types/team";
import { Textarea } from "@/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { UserCircle } from "lucide-react";

import { Avatar, AvatarImage, AvatarFallback } from "@/ui/avatar";

// Définition des rôles disponibles avec typage strict
const AVAILABLE_ROLES: {value: TeamMemberRole; label: string}[] = [
  { value: "architecte", label: "Architecte" },
  { value: "chef_de_projet", label: "Chef de projet" },
  { value: "ingenieur", label: "Ingénieur" },
  { value: "designer", label: "Designer" },
  { value: "entreprise", label: "Entreprise" },
  { value: "assistant", label: "Assistant(e)" },
  { value: "dessinateur", label: "Dessinateur" },
  { value: "autre", label: "Autre" }
];

// Avatars prédéfinis
const PREDEFINED_AVATARS = {
  homme: [
    "public/avatars/homme-1.svg",
    "/avatars/homme-2.png",
    "/avatars/homme-3.png",
  ],
  femme: [
    "public/avatars/femme-1.svg",
    "/avatars/femme-2.png",
    "/avatars/femme-3.png",
  ]
};

interface TeamMemberFormProps {
  isEdit?: boolean;
  member?: TeamMember;
  teamId?: string;
  onSubmit: (member: TeamMember) => Promise<boolean>;
  onCancel: () => void;
}

export const TeamMemberForm = ({ isEdit = false, member, teamId, onSubmit, onCancel }: TeamMemberFormProps) => {
  // Ajouter ce log pour déboguer
  console.log("TeamMemberForm - membre reçu:", member);

  // Initialiser role avec "autre" comme valeur par défaut valide au lieu de ""
  const [formData, setFormData] = useState<Partial<TeamMember>>({
    id: member?.id || "",
    name: member?.name || "",
    role: member?.role || "autre", // Valeur par défaut valide
    email: member?.email || "",
    phone: member?.phone || "",
    avatar: member?.avatar || "",
    activity: member?.activity || "",
    status: member?.status || "active"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);

  // Ajouter un effet pour s'assurer que les données sont mises à jour si member change
  useEffect(() => {
    if (member) {
      console.log("Mise à jour du formulaire avec:", member);
      setFormData({
        id: member.id || "",
        name: member.name || "",
        role: member.role || "autre",
        email: member.email || "",
        phone: member.phone || "",
        avatar: member.avatar || "",
        activity: member.activity || "",
        status: member.status || "active",
        team_id: member.team_id || teamId || "default",
        user_id: member.user_id || member.email || ""
      });
    }
  }, [member, teamId]);

  // Déterminer si le formulaire est pour une entreprise
  const isEnterprise = formData.role === "entreprise";

  // Gestion de l'upload d'avatar personnalisé
  const handleAvatarUpload = (url: string) => {
    setFormData(prev => ({ ...prev, avatar: url }));
    toast.success("Photo de profil téléchargée avec succès");
  };

  // Sélection d'un avatar prédéfini
  const selectPredefinedAvatar = (url: string) => {
    setFormData(prev => ({ ...prev, avatar: url }));
    setShowAvatarSelector(false);
    toast.success("Avatar sélectionné");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name) {
      toast.error("Le nom est obligatoire");
      return;
    }

    if (!formData.role) {
      toast.error("Le rôle est obligatoire");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Préparer l'objet complet pour la soumission
      const memberToSubmit = {
        ...formData,
        id: formData.id || `member_${Date.now()}`,
        team_id: formData.team_id || teamId || "default",
        user_id: formData.user_id || formData.email || `user_${Date.now()}`,
        status: formData.status || "active"
      } as TeamMember;
      
      const success = await onSubmit(memberToSubmit);
      
      if (success) {
        toast.success(`Membre ${isEdit ? 'mis à jour' : 'ajouté'} avec succès`);
        onCancel();
      }
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      toast.error(`Erreur lors de ${isEdit ? 'la mise à jour' : "l'ajout"} du membre`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Utiliser un cast explicite pour s'assurer que la valeur est du type TeamMemberRole
  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      role: value as TeamMemberRole 
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-5 py-6">
        {/* Section Avatar */}
        <div className="flex flex-col items-center space-y-3 mb-6">
          <Avatar className="h-24 w-24">
            {formData.avatar ? (
              <AvatarImage src={formData.avatar} alt={formData.name || "Avatar"} />
            ) : (
              <AvatarFallback>
                <UserCircle className="h-12 w-12" />
              </AvatarFallback>
            )}
          </Avatar>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              type="button"
              onClick={() => setShowAvatarSelector(!showAvatarSelector)}
              size="sm"
            >
              Choisir un avatar
            </Button>
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => document.getElementById('avatar-upload')?.click()}
              size="sm"
            >
              Télécharger une photo
            </Button>
          </div>
          
          {/* Sélecteur d'avatars prédéfinis */}
          {showAvatarSelector && (
            <div className="bg-muted p-4 rounded-md w-full">
              <div className="mb-3">
                <h4 className="text-sm font-medium mb-2">Avatars homme</h4>
                <div className="flex flex-wrap gap-2">
                  {PREDEFINED_AVATARS.homme.map((avatar, index) => (
                    <Avatar 
                      key={`homme-${index}`} 
                      className="h-12 w-12 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                      onClick={() => selectPredefinedAvatar(avatar)}
                    >
                      <AvatarImage src={avatar} alt={`Avatar homme ${index + 1}`} />
                    </Avatar>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Avatars femme</h4>
                <div className="flex flex-wrap gap-2">
                  {PREDEFINED_AVATARS.femme.map((avatar, index) => (
                    <Avatar 
                      key={`femme-${index}`} 
                      className="h-12 w-12 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                      onClick={() => selectPredefinedAvatar(avatar)}
                    >
                      <AvatarImage src={avatar} alt={`Avatar femme ${index + 1}`} />
                    </Avatar>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Hidden file input for avatar upload */}
          <input
            type="file"
            id="avatar-upload"
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                // Ici, vous pourriez utiliser votre service d'upload existant
                // Pour l'instant, on simule avec URL.createObjectURL
                const imageUrl = URL.createObjectURL(file);
                handleAvatarUpload(imageUrl);
              }
            }}
          />
        </div>

        {/* Section Informations personnelles */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nom complet *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nom du membre"
              className="mt-1"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="role">Rôle/Fonction *</Label>
            <Select 
              value={formData.role || 'autre'} 
              onValueChange={handleRoleChange}
            >
              <SelectTrigger id="role" className="mt-1">
                <SelectValue placeholder="Sélectionner un rôle" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_ROLES.map(role => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Champ activité uniquement pour les entreprises */}
          {isEnterprise && (
            <div>
              <Label htmlFor="activity">Activité de l'entreprise *</Label>
              <Input
                id="activity"
                value={formData.activity || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, activity: e.target.value }))}
                placeholder="Ex: Plomberie, Électricité, Menuiserie..."
                className="mt-1"
                required
              />
            </div>
          )}
          
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="email@exemple.com"
              className="mt-1"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+33 6 12 34 56 78"
              className="mt-1"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} 
          disabled={isSubmitting}
        >
          Annuler
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 
            (isEdit ? "Mise à jour..." : "Création...") : 
            (isEdit ? "Mettre à jour" : "Créer")
          }
        </Button>
      </div>
    </form>
  );
};
