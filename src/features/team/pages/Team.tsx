import { useState, useEffect, useCallback } from "react";
import MainLayout from "@/features/layout/components/MainLayout";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Plus, Search, Edit, Trash2, Users } from "lucide-react";
import {
  getAllTeamMembers,
  addTeamMember,
  updateTeamMember,
  deleteTeamMember,
} from "@/features/team/services/teamService";
import { TeamMember, TeamMemberRole } from "@/features/team/types/team";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { FormField } from "@/ui/form-field";
import { ImageUpload } from "@/ui/image-upload";

const Team = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("name-asc");
  const [filterRole, setFilterRole] = useState("all");

  // État pour le formulaire de membre d'équipe
  const [memberForm, setMemberForm] = useState<
    Omit<TeamMember, "id" | "created_at">
  >({
    name: "",
    email: "",
    phone: "",
    role: "autre" as TeamMemberRole,
    avatar: "",
    status: "active",
    team_id: "",
    user_id: "",
  });

  // État pour le formulaire de modification
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  // États pour les erreurs de validation
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Charger les membres d'équipe
  const loadTeamMembers = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getAllTeamMembers();
      setTeamMembers(data);
      setFilteredMembers(data);
    } catch (error) {
      console.error("Erreur lors du chargement des membres:", error);
      toast.error("Impossible de charger les membres d'équipe");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeamMembers();
  }, [loadTeamMembers]);

  // Filtrer et trier les membres
  const handleFilterAndSort = () => {
    let filtered = teamMembers;

    // Filtrage par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (member) =>
          member.name.toLowerCase().includes(query) ||
          member.email.toLowerCase().includes(query) ||
          member.role.toLowerCase().includes(query)
      );
    }

    // Filtrage par rôle
    if (filterRole !== "all") {
      filtered = filtered.filter((member) => member.role === filterRole);
    }

    // Tri
    switch (sortOption) {
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "role-asc":
        filtered.sort((a, b) => a.role.localeCompare(b.role));
        break;
      case "role-desc":
        filtered.sort((a, b) => b.role.localeCompare(a.role));
        break;
      default:
        break;
    }

    setFilteredMembers(filtered);
  };

  useEffect(() => {
    handleFilterAndSort();
  }, [teamMembers, searchQuery, sortOption, filterRole]);

  // Réinitialiser le formulaire
  const resetForm = () => {
    setMemberForm({
      name: "",
      email: "",
      phone: "",
      role: "autre" as TeamMemberRole,
      avatar: "",
      status: "active",
      team_id: "",
      user_id: "",
    });
    setFormErrors({});
  };

  // Validation du formulaire
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!memberForm.name.trim()) {
      errors.name = "Le nom du membre est obligatoire";
    }

    if (!memberForm.role.trim()) {
      errors.role = "Le rôle est obligatoire";
    }

    if (memberForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(memberForm.email)) {
      errors.email = "Veuillez entrer une adresse email valide";
    }

    if (memberForm.phone && !/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/.test(memberForm.phone.replace(/\s/g, ''))) {
      errors.phone = "Veuillez entrer un numéro de téléphone français valide";
    }



    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Gérer la création d'un membre
  const handleCreateMember = async () => {
    if (!validateForm()) {
      toast.error("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    try {
      await addTeamMember({
        ...memberForm,
        created_at: new Date().toISOString(),
      });

      resetForm();
      loadTeamMembers();
    } catch (error) {
      console.error("Erreur lors de la création du membre:", error);
      toast.error("Impossible de créer le membre d'équipe");
    }
  };

  // Gérer la mise à jour d'un membre
  const handleUpdateMember = async () => {
    if (!editingMember || !editingMember.id) return;

    // Validation pour l'édition
    const errors: Record<string, string> = {};
    if (!editingMember.name.trim()) {
      errors.name = "Le nom du membre est obligatoire";
    }

    if (!editingMember.role.trim()) {
      errors.role = "Le rôle est obligatoire";
    }

    if (editingMember.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editingMember.email)) {
      errors.email = "Veuillez entrer une adresse email valide";
    }

    if (editingMember.phone && !/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/.test(editingMember.phone.replace(/\s/g, ''))) {
      errors.phone = "Veuillez entrer un numéro de téléphone français valide";
    }

    if (Object.keys(errors).length > 0) {
      toast.error("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    try {
      await updateTeamMember(editingMember.id, {
        name: editingMember.name,
        email: editingMember.email,
        phone: editingMember.phone,
        role: editingMember.role,
        avatar: editingMember.avatar,
        status: editingMember.status,
      });

      setEditingMember(null);
      loadTeamMembers();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du membre:", error);
      toast.error("Impossible de mettre à jour le membre d'équipe");
    }
  };

  // Gérer la suppression d'un membre
  const handleDeleteMember = async (id: string) => {
    try {
      await deleteTeamMember(id);
      loadTeamMembers();
    } catch (error) {
      console.error("Erreur lors de la suppression du membre:", error);
      toast.error("Impossible de supprimer le membre d'équipe");
    }
  };

  const roles: TeamMemberRole[] = [
    "architecte",
    "chef_de_projet",
    "dessinateur",
    "ingenieur",
    "designer",
    "entreprise",
    "assistant",
    "autre",
  ];

  return (
    <MainLayout>
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold mb-1">Équipe</h1>
            <p className="text-muted-foreground">
              Gérez votre équipe et vos collaborateurs
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau membre
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Nouveau membre d'équipe</DialogTitle>
                <DialogDescription>
                  Ajoutez un nouveau membre à votre équipe.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <FormField
                  label="Nom"
                  name="name"
                  type="text"
                  value={memberForm.name}
                  onChange={(value) => setMemberForm({ ...memberForm, name: value })}
                  placeholder="Nom du membre"
                  required
                  error={formErrors.name}
                  validation={{ type: "name" }}
                />

                                 <div className="space-y-2">
                   <label className="text-sm font-medium">Rôle</label>
                   <Select value={memberForm.role} onValueChange={(value) => setMemberForm({ ...memberForm, role: value as TeamMemberRole })}>
                     <SelectTrigger>
                       <SelectValue placeholder="Sélectionner un rôle" />
                     </SelectTrigger>
                     <SelectContent>
                       {roles.map((role) => (
                         <SelectItem key={role} value={role}>
                           {role}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                   {formErrors.role && (
                     <p className="text-sm text-red-500">{formErrors.role}</p>
                   )}
                 </div>

                                 <FormField
                   label="Email"
                   name="email"
                   type="email"
                   value={memberForm.email}
                   onChange={(value) => setMemberForm({ ...memberForm, email: value })}
                   placeholder="email@exemple.com"
                   error={formErrors.email}
                   validation={{ type: "email" }}
                 />

                 <FormField
                   label="Téléphone"
                   name="phone"
                   type="tel"
                   value={memberForm.phone}
                   onChange={(value) => setMemberForm({ ...memberForm, phone: value })}
                   placeholder="01 23 45 67 89"
                   error={formErrors.phone}
                   validation={{ type: "phone" }}
                 />

                 <div className="space-y-4">
                   <label className="text-sm font-medium">Avatar</label>
                   <ImageUpload
                     value={memberForm.avatar}
                     onChange={(value) => setMemberForm({ ...memberForm, avatar: value })}
                     placeholder="Télécharger un avatar"
                     className="w-24 h-24"
                   />
                 </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" onClick={resetForm}>Annuler</Button>
                </DialogClose>
                <Button onClick={handleCreateMember}>Créer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un membre..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrer par rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les rôles</SelectItem>
            {roles.map((role) => (
              <SelectItem key={role} value={role}>
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortOption} onValueChange={setSortOption}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Trier par" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">Nom (A-Z)</SelectItem>
            <SelectItem value="name-desc">Nom (Z-A)</SelectItem>
            <SelectItem value="role-asc">Rôle (A-Z)</SelectItem>
            <SelectItem value="role-desc">Rôle (Z-A)</SelectItem>
            <SelectItem value="company-asc">Société (A-Z)</SelectItem>
            <SelectItem value="company-desc">Société (Z-A)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="list">
        <TabsList className="mb-4">
          <TabsTrigger value="list">Liste</TabsTrigger>
          <TabsTrigger value="cards">Cartes</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <p>Chargement des membres...</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                                         <TableHead>Membre</TableHead>
                     <TableHead>Rôle</TableHead>
                     <TableHead className="hidden md:table-cell">Email</TableHead>
                     <TableHead className="hidden lg:table-cell">Téléphone</TableHead>
                     <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            {member.avatar ? (
                              <img
                                src={member.avatar}
                                alt={member.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <Users className="h-4 w-4" />
                            )}
                          </div>
                                                     <div>
                             <div className="font-medium">{member.name}</div>
                           </div>
                        </div>
                      </TableCell>
                                             <TableCell>{member.role}</TableCell>
                       <TableCell className="hidden md:table-cell">
                         {member.email}
                       </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {member.phone}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingMember(member)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>Modifier le membre</DialogTitle>
                                <DialogDescription>
                                  Modifiez les informations du membre d'équipe.
                                </DialogDescription>
                              </DialogHeader>
                              {editingMember && (
                                <div className="space-y-4 py-4">
                                  <FormField
                                    label="Nom"
                                    name="edit-name"
                                    type="text"
                                    value={editingMember.name}
                                    onChange={(value) =>
                                      setEditingMember({
                                        ...editingMember,
                                        name: value,
                                      })
                                    }
                                    required
                                    validation={{ type: "name" }}
                                  />

                                                                     <div className="space-y-2">
                                     <label className="text-sm font-medium">Rôle</label>
                                     <Select value={editingMember.role} onValueChange={(value) => setEditingMember({ ...editingMember, role: value as TeamMemberRole })}>
                                       <SelectTrigger>
                                         <SelectValue placeholder="Sélectionner un rôle" />
                                       </SelectTrigger>
                                       <SelectContent>
                                         {roles.map((role) => (
                                           <SelectItem key={role} value={role}>
                                             {role}
                                           </SelectItem>
                                         ))}
                                       </SelectContent>
                                     </Select>
                                   </div>

                                                                     <FormField
                                     label="Email"
                                     name="edit-email"
                                     type="email"
                                     value={editingMember.email}
                                     onChange={(value) =>
                                       setEditingMember({
                                         ...editingMember,
                                         email: value,
                                       })
                                     }
                                     validation={{ type: "email" }}
                                   />

                                   <FormField
                                     label="Téléphone"
                                     name="edit-phone"
                                     type="tel"
                                     value={editingMember.phone}
                                     onChange={(value) =>
                                       setEditingMember({
                                         ...editingMember,
                                         phone: value,
                                       })
                                     }
                                     validation={{ type: "phone" }}
                                   />

                                   <div className="space-y-4">
                                     <label className="text-sm font-medium">Avatar</label>
                                     <ImageUpload
                                       value={editingMember.avatar}
                                       onChange={(value) =>
                                         setEditingMember({
                                           ...editingMember,
                                           avatar: value,
                                         })
                                       }
                                       placeholder="Télécharger un avatar"
                                       className="w-24 h-24"
                                     />
                                   </div>
                                </div>
                              )}
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button variant="outline">Annuler</Button>
                                </DialogClose>
                                <Button onClick={handleUpdateMember}>
                                  Enregistrer
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Êtes-vous sûr ?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Cette action supprimera définitivement le membre{" "}
                                  <strong>{member.name}</strong> de l'équipe.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteMember(member.id)}
                                  className="bg-red-500 hover:bg-red-600">
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="cards">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <p>Chargement des membres...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMembers.map((member) => (
                <Card key={member.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        {member.avatar ? (
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <Users className="h-6 w-6" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{member.name}</CardTitle>
                        <CardDescription>{member.role}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                                         <div className="space-y-2 text-sm">
                       {member.email && (
                         <div className="flex items-center">
                           <span className="font-medium min-w-20">Email:</span>
                           <span className="text-muted-foreground">
                             {member.email}
                           </span>
                         </div>
                       )}
                       {member.phone && (
                         <div className="flex items-center">
                           <span className="font-medium min-w-20">Téléphone:</span>
                           <span className="text-muted-foreground">
                             {member.phone}
                           </span>
                         </div>
                       )}
                     </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingMember(member)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Modifier le membre</DialogTitle>
                            <DialogDescription>
                              Modifiez les informations du membre d'équipe.
                            </DialogDescription>
                          </DialogHeader>
                          {editingMember && (
                            <div className="space-y-4 py-4">
                              <FormField
                                label="Nom"
                                name="edit-name-card"
                                type="text"
                                value={editingMember.name}
                                onChange={(value) =>
                                  setEditingMember({
                                    ...editingMember,
                                    name: value,
                                  })
                                }
                                required
                                validation={{ type: "name" }}
                              />

                                                             <div className="space-y-2">
                                 <label className="text-sm font-medium">Rôle</label>
                                 <Select value={editingMember.role} onValueChange={(value) => setEditingMember({ ...editingMember, role: value as TeamMemberRole })}>
                                   <SelectTrigger>
                                     <SelectValue placeholder="Sélectionner un rôle" />
                                   </SelectTrigger>
                                   <SelectContent>
                                     {roles.map((role) => (
                                       <SelectItem key={role} value={role}>
                                         {role}
                                       </SelectItem>
                                     ))}
                                   </SelectContent>
                                 </Select>
                               </div>

                                                             <FormField
                                 label="Email"
                                 name="edit-email-card"
                                 type="email"
                                 value={editingMember.email}
                                 onChange={(value) =>
                                   setEditingMember({
                                     ...editingMember,
                                     email: value,
                                   })
                                 }
                                 validation={{ type: "email" }}
                               />

                               <FormField
                                 label="Téléphone"
                                 name="edit-phone-card"
                                 type="tel"
                                 value={editingMember.phone}
                                 onChange={(value) =>
                                   setEditingMember({
                                     ...editingMember,
                                     phone: value,
                                   })
                                 }
                                 validation={{ type: "phone" }}
                               />

                               <div className="space-y-4">
                                 <label className="text-sm font-medium">Avatar</label>
                                 <ImageUpload
                                   value={editingMember.avatar}
                                   onChange={(value) =>
                                     setEditingMember({
                                       ...editingMember,
                                       avatar: value,
                                     })
                                   }
                                   placeholder="Télécharger un avatar"
                                   className="w-24 h-24"
                                 />
                               </div>
                            </div>
                          )}
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Annuler</Button>
                            </DialogClose>
                            <Button onClick={handleUpdateMember}>
                              Enregistrer
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Êtes-vous sûr ?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action supprimera définitivement le membre{" "}
                              <strong>{member.name}</strong> de l'équipe.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteMember(member.id)}
                              className="bg-red-500 hover:bg-red-600">
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default Team;
