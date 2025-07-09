import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { TeamMember, TeamMemberRole } from "@/features/team/types/team";
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
    "/avatars/homme-1.svg",
    "/avatars/homme-2.png",
    "/avatars/homme-3.png",
  ],
  femme: [
    "/avatars/femme-1.svg",
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
      toast.error(`