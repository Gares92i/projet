import { useState, useEffect, useCallback } from "react";
import MainLayout from "@/features/layout/components/MainLayout";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Plus, Search, Edit, Trash2, Building } from "lucide-react";
import {
  getAllClients,
  addClient,
  updateClient,
  deleteClient,
} from "@/features/clients/services/clientService";
import { ClientData } from "@/features/clients/types/client";
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
import { Label } from "@/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { FormField } from "@/ui/form-field";

const Clients = () => {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [filteredClients, setFilteredClients] = useState<ClientData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("name-asc");

  // État pour le formulaire de client
  const [clientForm, setClientForm] = useState<
    Omit<ClientData, "id" | "projectIds">
  >({
    name: "",
    email: "",
    phone: "",
    address: "",
    company: "",
  });

  // État pour le formulaire de modification
  const [editingClient, setEditingClient] = useState<ClientData | null>(null);

  // États pour les erreurs de validation
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Charger les clients
  const loadClients = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getAllClients();
      setClients(data);
      setFilteredClients(data);
    } catch (error) {
      console.error("Erreur lors du chargement des clients:", error);
      toast.error("Impossible de charger les clients");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  // Filtrer les clients en fonction de la recherche
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredClients(clients);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = clients.filter(
      (client) =>
        client.name.toLowerCase().includes(query) ||
        client.company.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query)
    );

    setFilteredClients(filtered);
  };

  // Trier les clients
  const handleSort = (option: string) => {
    setSortOption(option);
    let sorted = [...filteredClients];

    switch (option) {
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "company-asc":
        sorted.sort((a, b) => a.company.localeCompare(b.company));
        break;
      case "company-desc":
        sorted.sort((a, b) => b.company.localeCompare(a.company));
        break;
      default:
        break;
    }

    setFilteredClients(sorted);
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setClientForm({
      name: "",
      email: "",
      phone: "",
      address: "",
      company: "",
    });
    setFormErrors({});
  };

  // Validation du formulaire
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!clientForm.name.trim()) {
      errors.name = "Le nom du client est obligatoire";
    }

    if (clientForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientForm.email)) {
      errors.email = "Veuillez entrer une adresse email valide";
    }

    if (clientForm.phone && !/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/.test(clientForm.phone.replace(/\s/g, ''))) {
      errors.phone = "Veuillez entrer un numéro de téléphone français valide";
    }

    if (clientForm.address && clientForm.address.trim().length < 10) {
      errors.address = "L'adresse doit contenir au moins 10 caractères";
    }

    if (clientForm.company && clientForm.company.trim().length < 2) {
      errors.company = "Le nom de la société doit contenir au moins 2 caractères";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Gérer la création d'un client
  const handleCreateClient = async () => {
    if (!validateForm()) {
      toast.error("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    try {
      await addClient({
        ...clientForm,
        projectIds: [],
      });

      resetForm();
      loadClients();
    } catch (error) {
      console.error("Erreur lors de la création du client:", error);
      toast.error("Impossible de créer le client");
    }
  };

  // Gérer la mise à jour d'un client
  const handleUpdateClient = async () => {
    if (!editingClient || !editingClient.id) return;

    // Validation pour l'édition
    const errors: Record<string, string> = {};
    if (!editingClient.name.trim()) {
      errors.name = "Le nom du client est obligatoire";
    }

    if (editingClient.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editingClient.email)) {
      errors.email = "Veuillez entrer une adresse email valide";
    }

    if (editingClient.phone && !/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/.test(editingClient.phone.replace(/\s/g, ''))) {
      errors.phone = "Veuillez entrer un numéro de téléphone français valide";
    }

    if (Object.keys(errors).length > 0) {
      toast.error("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    try {
      await updateClient(editingClient.id, {
        name: editingClient.name,
        email: editingClient.email,
        phone: editingClient.phone,
        address: editingClient.address,
        company: editingClient.company,
      });

      setEditingClient(null);
      loadClients();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du client:", error);
      toast.error("Impossible de mettre à jour le client");
    }
  };

  // Gérer la suppression d'un client
  const handleDeleteClient = async (id: string) => {
    try {
      await deleteClient(id);
      loadClients();
    } catch (error) {
      console.error("Erreur lors de la suppression du client:", error);
      toast.error("Impossible de supprimer le client");
    }
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold mb-1">Clients</h1>
            <p className="text-muted-foreground">
              Gérez tous vos clients en un seul endroit
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau client
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Nouveau client</DialogTitle>
                <DialogDescription>
                  Ajoutez un nouveau client à votre liste de contacts.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <FormField
                  label="Nom"
                  name="name"
                  type="text"
                  value={clientForm.name}
                  onChange={(value) => setClientForm({ ...clientForm, name: value })}
                  placeholder="Nom du client"
                  required
                  error={formErrors.name}
                  validation={{ type: "name" }}
                />
                
                <FormField
                  label="Société"
                  name="company"
                  type="text"
                  value={clientForm.company}
                  onChange={(value) => setClientForm({ ...clientForm, company: value })}
                  placeholder="Nom de l'entreprise"
                  error={formErrors.company}
                  validation={{ type: "company" }}
                />
                
                <FormField
                  label="Email"
                  name="email"
                  type="email"
                  value={clientForm.email}
                  onChange={(value) => setClientForm({ ...clientForm, email: value })}
                  placeholder="email@exemple.com"
                  error={formErrors.email}
                  validation={{ type: "email" }}
                />
                
                <FormField
                  label="Téléphone"
                  name="phone"
                  type="tel"
                  value={clientForm.phone}
                  onChange={(value) => setClientForm({ ...clientForm, phone: value })}
                  placeholder="01 23 45 67 89"
                  error={formErrors.phone}
                  validation={{ type: "phone" }}
                />
                
                <FormField
                  label="Adresse"
                  name="address"
                  type="textarea"
                  value={clientForm.address}
                  onChange={(value) => setClientForm({ ...clientForm, address: value })}
                  placeholder="Adresse complète"
                  error={formErrors.address}
                  validation={{ type: "address" }}
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" onClick={resetForm}>Annuler</Button>
                </DialogClose>
                <Button onClick={handleCreateClient}>Créer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un client..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyUp={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Select value={sortOption} onValueChange={handleSort}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Trier par" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">Nom (A-Z)</SelectItem>
            <SelectItem value="name-desc">Nom (Z-A)</SelectItem>
            <SelectItem value="company-asc">Société (A-Z)</SelectItem>
            <SelectItem value="company-desc">Société (Z-A)</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={handleSearch}>
          Filtrer
        </Button>
      </div>

      <Tabs defaultValue="list">
        <TabsList className="mb-4">
          <TabsTrigger value="list">Liste</TabsTrigger>
          <TabsTrigger value="cards">Cartes</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <p>Chargement des clients...</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Société</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Email
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Téléphone
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.company}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {client.email}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {client.phone}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingClient(client)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>Modifier le client</DialogTitle>
                                <DialogDescription>
                                  Modifiez les informations du client.
                                </DialogDescription>
                              </DialogHeader>
                              {editingClient && (
                                <div className="space-y-4 py-4">
                                  <FormField
                                    label="Nom"
                                    name="edit-name"
                                    type="text"
                                    value={editingClient.name}
                                    onChange={(value) =>
                                      setEditingClient({
                                        ...editingClient,
                                        name: value,
                                      })
                                    }
                                    required
                                    validation={{ type: "name" }}
                                  />
                                  
                                  <FormField
                                    label="Société"
                                    name="edit-company"
                                    type="text"
                                    value={editingClient.company}
                                    onChange={(value) =>
                                      setEditingClient({
                                        ...editingClient,
                                        company: value,
                                      })
                                    }
                                    validation={{ type: "company" }}
                                  />
                                  
                                  <FormField
                                    label="Email"
                                    name="edit-email"
                                    type="email"
                                    value={editingClient.email}
                                    onChange={(value) =>
                                      setEditingClient({
                                        ...editingClient,
                                        email: value,
                                      })
                                    }
                                    validation={{ type: "email" }}
                                  />
                                  
                                  <FormField
                                    label="Téléphone"
                                    name="edit-phone"
                                    type="tel"
                                    value={editingClient.phone}
                                    onChange={(value) =>
                                      setEditingClient({
                                        ...editingClient,
                                        phone: value,
                                      })
                                    }
                                    validation={{ type: "phone" }}
                                  />
                                  
                                  <FormField
                                    label="Adresse"
                                    name="edit-address"
                                    type="textarea"
                                    value={editingClient.address}
                                    onChange={(value) =>
                                      setEditingClient({
                                        ...editingClient,
                                        address: value,
                                      })
                                    }
                                    validation={{ type: "address" }}
                                  />
                                </div>
                              )}
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button variant="outline">Annuler</Button>
                                </DialogClose>
                                <Button onClick={handleUpdateClient}>
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
                                  Cette action supprimera définitivement le client{" "}
                                  <strong>{client.name}</strong> et toutes ses
                                  données associées.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteClient(client.id)}
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
              <p>Chargement des clients...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClients.map((client) => (
                <Card key={client.id}>
                  <CardHeader className="pb-2">
                    <CardTitle>{client.name}</CardTitle>
                    <CardDescription>{client.company}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {client.email && (
                        <div className="flex items-center">
                          <span className="font-medium min-w-24">Email:</span>
                          <span className="text-muted-foreground">
                            {client.email}
                          </span>
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center">
                          <span className="font-medium min-w-24">
                            Téléphone:
                          </span>
                          <span className="text-muted-foreground">
                            {client.phone}
                          </span>
                        </div>
                      )}
                      {client.address && (
                        <div className="flex items-center">
                          <span className="font-medium min-w-24">
                            Adresse:
                          </span>
                          <span className="text-muted-foreground">
                            {client.address}
                          </span>
                        </div>
                      )}
                      {client.projectIds && client.projectIds.length > 0 && (
                        <div className="flex items-start">
                          <span className="font-medium min-w-24">
                            Projets:
                          </span>
                          <span className="text-muted-foreground">
                            {client.projectIds.length} projet(s)
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
                            onClick={() => setEditingClient(client)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Modifier le client</DialogTitle>
                            <DialogDescription>
                              Modifiez les informations du client.
                            </DialogDescription>
                          </DialogHeader>
                          {editingClient && (
                            <div className="space-y-4 py-4">
                              <FormField
                                label="Nom"
                                name="edit-name-card"
                                type="text"
                                value={editingClient.name}
                                onChange={(value) =>
                                  setEditingClient({
                                    ...editingClient,
                                    name: value,
                                  })
                                }
                                required
                                validation={{ type: "name" }}
                              />
                              
                              <FormField
                                label="Société"
                                name="edit-company-card"
                                type="text"
                                value={editingClient.company}
                                onChange={(value) =>
                                  setEditingClient({
                                    ...editingClient,
                                    company: value,
                                  })
                                }
                                validation={{ type: "company" }}
                              />
                              
                              <FormField
                                label="Email"
                                name="edit-email-card"
                                type="email"
                                value={editingClient.email}
                                onChange={(value) =>
                                  setEditingClient({
                                    ...editingClient,
                                    email: value,
                                  })
                                }
                                validation={{ type: "email" }}
                              />
                              
                              <FormField
                                label="Téléphone"
                                name="edit-phone-card"
                                type="tel"
                                value={editingClient.phone}
                                onChange={(value) =>
                                  setEditingClient({
                                    ...editingClient,
                                    phone: value,
                                  })
                                }
                                validation={{ type: "phone" }}
                              />
                              
                              <FormField
                                label="Adresse"
                                name="edit-address-card"
                                type="textarea"
                                value={editingClient.address}
                                onChange={(value) =>
                                  setEditingClient({
                                    ...editingClient,
                                    address: value,
                                  })
                                }
                                validation={{ type: "address" }}
                              />
                            </div>
                          )}
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Annuler</Button>
                            </DialogClose>
                            <Button onClick={handleUpdateClient}>
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
                              Cette action supprimera définitivement le client{" "}
                              <strong>{client.name}</strong> et toutes ses
                              données associées.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteClient(client.id)}
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

export default Clients;
