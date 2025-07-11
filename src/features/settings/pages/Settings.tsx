import { useState, useEffect, useRef } from "react";
import MainLayout from "@/features/layout/components/MainLayout";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { Switch } from "@/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Separator } from "@/ui/separator";
import { Upload, Building, Bell, Lock, UserCog, Globe, Palette, Database, FilePenLine, Trash2 } from "lucide-react";
import { Textarea } from "@/ui/textarea";
import { Progress } from "@/ui/progress";
import { HeaderFooterEditor } from "@/features/settings/components/HeaderFooterEditor";
import { ColorPicker } from "@/features/settings/components/ColorPicker";
import { ThemeSelector } from "@/features/team/components/ThemeSelector";
import { toast } from "sonner";
import { saveArchitectInfo, getArchitectInfo } from "@/features/reports/services/reportService";
import { getAllAgencyMembers, deleteAgencyMember, addAgencyMember } from "@/features/agency/services/agencyMembersService";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/ui/sheet";

const Settings = () => {
  const [selectedTab, setSelectedTab] = useState("account");
  const [headerLogo, setHeaderLogo] = useState("https://i.pravatar.cc/150?u=4");
  const [companyLogo, setCompanyLogo] = useState("https://i.pravatar.cc/150?company");
  const [agencyMembers, setAgencyMembers] = useState([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isAddMemberSheetOpen, setIsAddMemberSheetOpen] = useState(false);
  const [addForm, setAddForm] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatar: string;
    designation: 'member' | 'admin';
    role: string;
  }>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    avatar: "",
    designation: "member",
    role: "architecte"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [companyInfo, setCompanyInfo] = useState({
    name: "ArchiHub Studio",
    address: "45 rue de l'Architecture",
    city: "Paris",
    zipCode: "75001",
    country: "France",
    phone: "+33 1 23 45 67 89",
    email: "contact@archihub.fr",
    website: "https://www.archihub.fr",
    taxId: "123 456 789 00012",
    logo: companyLogo
  });

  // Référence pour l'input file caché
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Charger les données au démarrage
  useEffect(() => {
    const loadArchitectInfo = async () => {
      try {
        const info = await getArchitectInfo();
        if (info) {
          // Mettre à jour le logo
          setCompanyLogo(info.logo || companyLogo);
          
          // Analyser l'adresse complète
          let address = info.address || "";
          let city = "";
          let zipCode = "";
          let country = "France";
          
          // Tenter de décomposer l'adresse
          if (address.includes(',')) {
            const parts = address.split(',').map(p => p.trim());
            address = parts[0] || "";
            
            if (parts.length > 1) {
              const cityParts = parts[1].trim().split(' ');
              zipCode = cityParts[0] || "";
              city = cityParts.slice(1).join(' ') || "";
            }
            
            if (parts.length > 2) {
              country = parts[2] || "France";
            }
          }
          
          // Mettre à jour l'état avec toutes les informations
          setCompanyInfo({
            name: info.name || companyInfo.name,
            address: address,
            city: city,
            zipCode: zipCode,
            country: country,
            phone: info.phone || companyInfo.phone,
            email: info.email || companyInfo.email,
            website: companyInfo.website, // Préserver la valeur existante
            taxId: companyInfo.taxId, // Préserver la valeur existante
            logo: info.logo || companyLogo
          });
          
          console.log("Informations d'entreprise chargées:", info);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des informations:", error);
      }
    };

    loadArchitectInfo();
  }, []);

  // Charger les membres d'agence
  useEffect(() => {
    const loadAgencyMembers = async () => {
      try {
        setIsLoadingMembers(true);
        const members = await getAllAgencyMembers();
        setAgencyMembers(members);
      } catch (error) {
        console.error("Erreur lors du chargement des membres d'agence:", error);
        toast.error("Impossible de charger les membres d'agence");
      } finally {
        setIsLoadingMembers(false);
      }
    };

    loadAgencyMembers();
  }, []);

  const handleCompanyInfoChange = (field, value) => {
    setCompanyInfo({
      ...companyInfo,
      [field]: value
    });
  };

  const handleSaveCompanySettings = async () => {
    try {
      // Formater l'adresse complète proprement
      const fullAddress = [
        companyInfo.address,
        `${companyInfo.zipCode} ${companyInfo.city}`,
        companyInfo.country
      ].filter(Boolean).join(', ');

      // Créer l'objet ArchitectInfo
      const architectInfo = {
        name: companyInfo.name,
        address: fullAddress,
        phone: companyInfo.phone,
        email: companyInfo.email,
        logo: companyInfo.logo
      };

      console.log("Sauvegarde des informations:", architectInfo);

      // Sauvegarder via le service
      const success = await saveArchitectInfo(architectInfo);

      if (success) {
        toast.success("Informations d'entreprise sauvegardées avec succès");
        
        // Sauvegarder également une copie en localStorage pour plus de sécurité
        localStorage.setItem('architectInfo_backup', JSON.stringify(architectInfo));
      } else {
        toast.error("Erreur lors de la sauvegarde des informations");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Une erreur est survenue");
    }
  };

  const handleSaveSettings = () => {
    toast.success("Paramètres enregistrés avec succès");
  };

  // Fonction pour gérer le téléchargement du logo
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setCompanyLogo(base64);
      setCompanyInfo(prev => ({
        ...prev,
        logo: base64
      }));
    };
    reader.readAsDataURL(file);
  };

  // Déclencher le dialogue de sélection de fichier
  const triggerLogoUpload = () => {
    if (logoInputRef.current) {
      logoInputRef.current.click();
    }
  };

  // Gérer la suppression d'un membre d'agence
  const handleDeleteAgencyMember = async (memberId) => {
    try {
      await deleteAgencyMember(memberId);
      toast.success("Membre supprimé avec succès");
      // Recharger les membres
      const members = await getAllAgencyMembers();
      setAgencyMembers(members);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Impossible de supprimer le membre");
    }
  };

  const handleAddFormChange = (field: keyof typeof addForm, value: string) => {
    if (field === 'designation') {
      setAddForm({ ...addForm, designation: value as 'member' | 'admin' });
    } else {
      setAddForm({ ...addForm, [field]: value });
    }
  };

  // Liste des rôles TeamMemberRole sans 'entreprise'
  const TEAM_MEMBER_ROLES = [
    { value: "architecte", label: "Architecte" },
    { value: "chef_de_projet", label: "Chef de projet" },
    { value: "ingenieur", label: "Ingénieur" },
    { value: "designer", label: "Designer" },
    { value: "assistant", label: "Assistant(e)" },
    { value: "dessinateur", label: "Dessinateur" },
    { value: "autre", label: "Autre" }
  ];

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!addForm.firstName || !addForm.lastName || !addForm.email) {
      toast.error("Tous les champs sont obligatoires");
      return;
    }
    try {
      setIsSubmitting(true);
      await addAgencyMember({
        userId: addForm.email,
        role: addForm.designation,
        status: "pending",
        user: {
          id: addForm.email,
          firstName: addForm.firstName,
          lastName: addForm.lastName,
          email: addForm.email,
          profileImageUrl: addForm.avatar,
          phone: addForm.phone
        } as any
      });
      toast.success("Membre ajouté avec succès");
      setIsAddMemberSheetOpen(false);
      setAddForm({ firstName: "", lastName: "", email: "", phone: "", avatar: "", designation: "member", role: "architecte" });
      // Recharger la liste
      const members = await getAllAgencyMembers();
      setAgencyMembers(members);
    } catch (error) {
      toast.error("Erreur lors de l'ajout du membre");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-1">Paramètres</h1>
        <p className="text-muted-foreground">
          Gérez les paramètres de votre compte et de l'application
        </p>
      </div>

      {/* Ajoutez cet input caché */}
      <input 
        type="file" 
        ref={logoInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleLogoUpload} 
      />

      <Tabs
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="space-y-8">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 h-auto">
          <TabsTrigger value="account" className="flex-col py-2 h-auto">
            <UserCog className="h-4 w-4 mb-1" />
            <span>Compte</span>
          </TabsTrigger>
          <TabsTrigger value="company" className="flex-col py-2 h-auto">
            <Building className="h-4 w-4 mb-1" />
            <span>Entreprise</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex-col py-2 h-auto">
            <Bell className="h-4 w-4 mb-1" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex-col py-2 h-auto">
            <Palette className="h-4 w-4 mb-1" />
            <span>Apparence</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex-col py-2 h-auto">
            <Lock className="h-4 w-4 mb-1" />
            <span>Sécurité</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="flex-col py-2 h-auto">
            <Database className="h-4 w-4 mb-1" />
            <span>Données</span>
          </TabsTrigger>
        </TabsList>

        {/* Account Settings */}
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>
                Mettez à jour vos informations personnelles et de contact
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center gap-6 pb-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={headerLogo} alt="Jean Moreau" />
                  <AvatarFallback>JM</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <h3 className="font-medium">Photo de profil</h3>
                  <p className="text-sm text-muted-foreground">
                    Cette photo sera visible par tous les membres de l'équipe
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Télécharger
                    </Button>
                    <Button size="sm" variant="outline">
                      Supprimer
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      placeholder="Votre prénom"
                      defaultValue="Jean"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      placeholder="Votre nom"
                      defaultValue="Moreau"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Adresse e-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Votre adresse e-mail"
                    defaultValue="jean.moreau@archihub.fr"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    placeholder="Votre numéro de téléphone"
                    defaultValue="+33 6 45 67 89 01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Fonction</Label>
                  <Input
                    id="title"
                    placeholder="Votre titre"
                    defaultValue="Chef de projet"
                  />
                </div>
              </div>

              <Button onClick={handleSaveSettings}>
                Enregistrer les modifications
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gestion des membres d'agence</CardTitle>
              <CardDescription>
                Gérez les membres de votre agence
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingMembers ? (
                <div className="flex justify-center py-4">
                  <p>Chargement des membres...</p>
                </div>
              ) : agencyMembers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Aucun membre d'agence trouvé</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {agencyMembers.map((member) => (
                    <div key={member.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={member.user?.profileImageUrl} alt={member.user?.firstName} />
                          <AvatarFallback>
                            {member.user?.firstName?.[0]}{member.user?.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">
                            {member.user?.firstName} {member.user?.lastName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {member.user?.email} • {member.role}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                          {member.status}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive"
                          onClick={() => handleDeleteAgencyMember(member.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-4">
                <Button variant="outline" onClick={() => setIsAddMemberSheetOpen(true)}>+ Ajouter un membre</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Company Settings */}
        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informations de l'entreprise</CardTitle>
              <CardDescription>
                Mettez à jour les informations de votre entreprise
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center gap-6 pb-6">
                <div className="w-24 h-24 flex items-center justify-center border rounded-lg bg-muted">
                  {companyLogo ? (
                    <img
                      src={companyLogo}
                      alt="Logo entreprise"
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <Building className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Logo de l'entreprise</h3>
                  <p className="text-sm text-muted-foreground">
                    Ce logo sera affiché dans les documents et rapports
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={triggerLogoUpload}>
                      <Upload className="h-4 w-4 mr-2" />
                      Télécharger
                    </Button>
                    <Button size="sm" variant="outline">
                      Supprimer
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nom de l'entreprise</Label>
                  <Input
                    id="companyName"
                    placeholder="Nom de l'entreprise"
                    value={companyInfo.name}
                    onChange={(e) => handleCompanyInfoChange("name", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    placeholder="Adresse"
                    defaultValue={companyInfo.address}
                    onChange={(e) =>
                      handleCompanyInfoChange("address", e.target.value)
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Ville</Label>
                    <Input
                      id="city"
                      placeholder="Ville"
                      defaultValue={companyInfo.city}
                      onChange={(e) =>
                        handleCompanyInfoChange("city", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Code postal</Label>
                    <Input
                      id="zipCode"
                      placeholder="Code postal"
                      defaultValue={companyInfo.zipCode}
                      onChange={(e) =>
                        handleCompanyInfoChange("zipCode", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Pays</Label>
                    <Input
                      id="country"
                      placeholder="Pays"
                      defaultValue={companyInfo.country}
                      onChange={(e) =>
                        handleCompanyInfoChange("country", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxId">Numéro SIRET</Label>
                  <Input
                    id="taxId"
                    placeholder="Numéro SIRET"
                    defaultValue={companyInfo.taxId}
                    onChange={(e) =>
                      handleCompanyInfoChange("taxId", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Email de l'entreprise</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    placeholder="Email de l'entreprise"
                    defaultValue={companyInfo.email}
                    onChange={(e) =>
                      handleCompanyInfoChange("email", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyPhone">
                    Téléphone de l'entreprise
                  </Label>
                  <Input
                    id="companyPhone"
                    placeholder="Téléphone de l'entreprise"
                    defaultValue={companyInfo.phone}
                    onChange={(e) =>
                      handleCompanyInfoChange("phone", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Site web</Label>
                  <Input
                    id="website"
                    placeholder="Site web"
                    defaultValue={companyInfo.website}
                    onChange={(e) =>
                      handleCompanyInfoChange("website", e.target.value)
                    }
                  />
                </div>
              </div>

              <Button onClick={handleSaveCompanySettings}>
                Enregistrer les modifications
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Préférences de notifications</CardTitle>
              <CardDescription>
                Configurez vos préférences de notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  Notifications par e-mail
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Mises à jour des projets</p>
                      <p className="text-sm text-muted-foreground">
                        Recevoir des notifications pour les mises à jour des
                        projets
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Échéances à venir</p>
                      <p className="text-sm text-muted-foreground">
                        Recevoir des rappels pour les échéances à venir
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Nouveaux commentaires</p>
                      <p className="text-sm text-muted-foreground">
                        Recevoir des notifications pour les nouveaux
                        commentaires
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Nouvelles tâches assignées</p>
                      <p className="text-sm text-muted-foreground">
                        Recevoir des notifications pour les nouvelles tâches
                        assignées
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Nouveaux messages</p>
                      <p className="text-sm text-muted-foreground">
                        Recevoir des notifications pour les nouveaux messages
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  Notifications dans l'application
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Mises à jour des projets</p>
                      <p className="text-sm text-muted-foreground">
                        Afficher les notifications pour les mises à jour des
                        projets
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Échéances à venir</p>
                      <p className="text-sm text-muted-foreground">
                        Afficher les notifications pour les échéances à venir
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Nouveaux messages</p>
                      <p className="text-sm text-muted-foreground">
                        Afficher les notifications pour les nouveaux messages
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Mentions</p>
                      <p className="text-sm text-muted-foreground">
                        Recevoir des notifications quand vous êtes mentionné
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Nouvelles observations</p>
                      <p className="text-sm text-muted-foreground">
                        Recevoir des notifications pour les nouvelles
                        observations
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveSettings}>
                Enregistrer les préférences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-4">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Thème Visuel</CardTitle>
              <CardDescription>
                Personnalisez l'apparence de l'application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ThemeSelector />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Apparence des documents</CardTitle>
              <CardDescription>
                Personnalisez l'apparence de vos modèles et documents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <HeaderFooterEditor />
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Thème de couleurs</h3>
                <ColorPicker />
              </div>
              <Separator />

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Modèles de documents</h3>
                  <Button variant="outline" size="sm">
                    + Créer un nouveau modèle
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="overflow-hidden border-2 border-primary">
                    <CardHeader className="p-4 pb-0">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-md">
                          Compte rendu standard
                        </CardTitle>
                        <Badge>Défaut</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="h-36 bg-muted rounded-md flex items-center justify-center relative overflow-hidden">
                        <img
                          src="/templates/template-report.png"
                          alt="Aperçu du modèle"
                          className="absolute inset-0 w-full h-full object-cover opacity-50"
                        />
                        <FilePenLine className="h-12 w-12 text-muted-foreground/40 relative z-10" />
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        Modifier
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        Prévisualiser
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card className="overflow-hidden">
                    <CardHeader className="p-4 pb-0">
                      <CardTitle className="text-md">
                        Rapport détaillé
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="h-36 bg-muted rounded-md flex items-center justify-center relative overflow-hidden">
                        <img
                          src="/templates/template-detailed.png"
                          alt="Aperçu du modèle"
                          className="absolute inset-0 w-full h-full object-cover opacity-50"
                        />
                        <FilePenLine className="h-12 w-12 text-muted-foreground/40 relative z-10" />
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        Modifier
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        Prévisualiser
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card className="overflow-hidden">
                    <CardHeader className="p-4 pb-0">
                      <CardTitle className="text-md">
                        Descriptif travaux
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="h-36 bg-muted rounded-md flex items-center justify-center relative overflow-hidden">
                        <img
                          src="/templates/template-work.png"
                          alt="Aperçu du modèle"
                          className="absolute inset-0 w-full h-full object-cover opacity-50"
                        />
                        <FilePenLine className="h-12 w-12 text-muted-foreground/40 relative z-10" />
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        Modifier
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        Prévisualiser
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveSettings}>
                  Enregistrer les modifications
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sécurité du compte</CardTitle>
              <CardDescription>
                Gérez vos paramètres de sécurité et authentification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Mot de passe</h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirmation du mot de passe
                    </Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                </div>
                <Button variant="outline">Changer le mot de passe</Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Sécurité du compte</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        Authentification à deux facteurs
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Ajouter une couche de sécurité supplémentaire à votre
                        compte
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Sessions actives</p>
                      <p className="text-sm text-muted-foreground">
                        Gérer les appareils connectés à votre compte
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Gérer
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Settings */}
        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des données</CardTitle>
              <CardDescription>
                Gérez vos données et exportations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Stockage</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Espace utilisé</span>
                    <span>2.4 GB / 10 GB</span>
                  </div>
                  <Progress value={24} />
                  <p className="text-sm text-muted-foreground">
                    24% de votre espace de stockage est utilisé
                  </p>
                </div>
                <Button variant="outline">Gérer le stockage</Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Exportation de données</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        Exporter les données de projets
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Télécharger toutes les données liées à vos projets
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Exporter
                    </Button>
                  </div>

                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Exporter les rapports</p>
                      <p className="text-sm text-muted-foreground">
                        Télécharger tous les rapports générés
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Exporter
                    </Button>
                  </div>

                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        Exporter les données clients
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Télécharger toutes les informations clients
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Exporter
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Sheet open={isAddMemberSheetOpen} onOpenChange={setIsAddMemberSheetOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Ajouter un membre d'agence</SheetTitle>
            <SheetDescription>Invitez un nouveau membre dans votre agence.</SheetDescription>
          </SheetHeader>
          <form onSubmit={handleAddMember} className="py-4 space-y-4">
            <div>
              <Label>Prénom</Label>
              <Input
                value={addForm.firstName}
                onChange={e => handleAddFormChange("firstName", e.target.value)}
                placeholder="Prénom"
                required
              />
            </div>
            <div>
              <Label>Nom</Label>
              <Input
                value={addForm.lastName}
                onChange={e => handleAddFormChange("lastName", e.target.value)}
                placeholder="Nom"
                required
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={addForm.email}
                onChange={e => handleAddFormChange("email", e.target.value)}
                placeholder="Email"
                required
              />
            </div>
            <div>
              <Label>Numéro de téléphone</Label>
              <Input
                type="tel"
                value={addForm.phone}
                onChange={e => handleAddFormChange("phone", e.target.value)}
                placeholder="Téléphone"
              />
            </div>
            <div>
              <Label>Avatar / Image</Label>
              <Input
                type="url"
                value={addForm.avatar}
                onChange={e => handleAddFormChange("avatar", e.target.value)}
                placeholder="URL de l’avatar ou image"
              />
            </div>
            <div>
              <Label>Désignation</Label>
              <select
                className="w-full border rounded-md p-2"
                value={addForm.designation}
                onChange={e => handleAddFormChange("designation", e.target.value)}
              >
                <option value="member">Membre</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <Label>Rôle</Label>
              <select
                className="w-full border rounded-md p-2"
                value={addForm.role}
                onChange={e => handleAddFormChange("role", e.target.value)}
              >
                {TEAM_MEMBER_ROLES.map(role => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddMemberSheetOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Ajout..." : "Ajouter"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </MainLayout>
  );
};

export default Settings;
